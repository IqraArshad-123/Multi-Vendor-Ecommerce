const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('../model/product');
const Coupon = require('../model/coupounCode');
const Order = require('../model/order');
const Checkout = require('../model/checkout');
const ErrorHandler = require('./ErrorHandler');
const Stripe = require('stripe');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const fail = message => { throw new ErrorHandler(message, 400); };
const cents = amount => Math.round(Number(amount) * 100);

async function quote(body) {
  if (!Array.isArray(body.cart) || !body.cart.length || body.cart.length > 100) fail('Your cart must contain between 1 and 100 products');
  const quantities = new Map();
  for (const item of body.cart) {
    if (!mongoose.isValidObjectId(item._id) || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 1000) fail('Invalid product or quantity');
    quantities.set(String(item._id), (quantities.get(String(item._id)) || 0) + item.qty);
  }
  const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
  if (products.length !== quantities.size) fail('A product in your cart is no longer available');
  const cart = products.map(product => {
    const qty = quantities.get(String(product._id));
    if (qty > product.stock) fail(`${product.name} does not have enough stock`);
    if (!Number.isFinite(product.discountPrice) || product.discountPrice <= 0) fail('A product price is invalid');
    return { _id: String(product._id), name: product.name, images: product.images, shopId: product.shopId, shop: { _id: product.shopId, name: product.shop?.name, avatar: product.shop?.avatar }, discountPrice: cents(product.discountPrice) / 100, qty };
  });
  let coupon;
  if (body.couponCode) {
    coupon = await Coupon.findOne({ name: String(body.couponCode).trim() });
    if (!coupon || coupon.value <= 0 || coupon.value > 100) fail('Coupon is invalid');
  }
  const groups = [];
  for (const shopId of [...new Set(cart.map(item => item.shopId))]) {
    const items = cart.filter(item => item.shopId === shopId);
    const subtotal = items.reduce((sum, item) => sum + cents(item.discountPrice) * item.qty, 0);
    const shipping = Math.round(subtotal * 0.1);
    let discount = 0;
    if (coupon && String(coupon.shop) === shopId) {
      const eligible = items.filter(item => !coupon.selectedProducts || [item._id, item.name].includes(coupon.selectedProducts));
      const eligibleTotal = eligible.reduce((sum, item) => sum + cents(item.discountPrice) * item.qty, 0);
      if (!eligibleTotal || (coupon.minAmount && subtotal < cents(coupon.minAmount)) || (coupon.maxAmount && subtotal > cents(coupon.maxAmount))) fail('This cart does not meet the coupon requirements');
      discount = Math.round(eligibleTotal * coupon.value / 100);
    }
    groups.push({ shopId, cart: items, subtotal, shipping, discount, total: subtotal + shipping - discount });
  }
  if (coupon && !groups.some(group => group.discount > 0)) fail('Coupon does not apply to these products');
  return { cart, groups, subTotalPrice: groups.reduce((s,g)=>s+g.subtotal,0)/100, shipping: groups.reduce((s,g)=>s+g.shipping,0)/100, discountPrice: groups.reduce((s,g)=>s+g.discount,0)/100, totalPrice: groups.reduce((s,g)=>s+g.total,0)/100 };
}

function addressOf(body) {
  const source = body.shippingAddress || {};
  const address = {};
  for (const key of ['address1','country','city','zipCode']) {
    if (!String(source[key] || '').trim() || String(source[key]).length > 200) fail('Please provide a complete delivery address');
    address[key] = String(source[key]).trim();
  }
  address.address2 = String(source.address2 || '').trim().slice(0,200);
  return address;
}
function requestKey(body) {
  if (typeof body.idempotencyKey !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(body.idempotencyKey)) fail('Please restart checkout');
  return body.idempotencyKey;
}
function fingerprint(q, address, userId) {
  return crypto.createHash('sha256').update(JSON.stringify({cart:q.cart.map(i=>[i._id,i.qty,i.discountPrice]).sort(),total:q.totalPrice,address,userId:String(userId)})).digest('hex');
}
async function createOrders(body, user) {
  const key = requestKey(body);
  const existing = await Order.find({ checkoutKey: `${user._id}:${key}` });
  if (existing.length) return existing;
  let address = addressOf(body);
  let q;
  const type = body.paymentInfo?.type;
  if (!['Cash On Delivery','Credit Card'].includes(type)) fail('Choose cash on delivery or card');
  let intent;
  if (type === 'Credit Card') {
    if (!stripe || !body.paymentInfo.id) fail('Card payment is not available');
    try { intent = await stripe.paymentIntents.retrieve(body.paymentInfo.id); } catch { fail('Unable to verify card payment'); }
    const saved = await Checkout.findOne({userId:String(user._id),key,paymentIntentId:intent.id});
    if(!saved) fail('Payment checkout could not be found');
    if(saved.refunded) fail('This payment has been refunded. Please start a new checkout.');
    q=saved.quote;address=saved.address;
    if (intent.status !== 'succeeded' || intent.currency !== 'usd' || intent.amount_received !== cents(q.totalPrice) || intent.metadata.userId !== String(user._id) || intent.metadata.checkoutKey !== key || intent.metadata.fingerprint !== fingerprint(q,address,user._id)) fail('Payment does not match this checkout');
    if (await Order.exists({'paymentInfo.id':intent.id})) fail('This payment has already been used');
  } else q = await quote(body);
  const session = await mongoose.startSession();
  let orders;
  try {
    await session.withTransaction(async () => {
      const previous = await Order.find({ checkoutKey: `${user._id}:${key}` }).session(session);
      if (previous.length) { orders = previous; return; }
      for (const item of q.cart) {
        const updated = await Product.updateOne({_id:item._id,stock:{$gte:item.qty}},{$inc:{stock:-item.qty,sold_out:item.qty}},{session});
        if (!updated.modifiedCount) { const error = new ErrorHandler(`${item.name} is out of stock`,400);error.outOfStock=true;throw error; }
      }
      orders = await Order.create(q.groups.map(group=>({checkoutKey:`${user._id}:${key}`,shopId:group.shopId,inventoryReserved:true,cart:group.cart,shippingAddress:address,user:{_id:String(user._id),name:user.name,email:user.email,phoneNumber:user.phoneNumber},totalPrice:group.total/100,shipping:group.shipping/100,discount:group.discount/100,paymentInfo:{type,id:intent?.id,status:intent?'Succeeded':'Not Paid'},paidAt:intent?new Date():undefined})),{session});
    });
  } catch(error) {
    if (error.code === 11000) { orders = await Order.find({checkoutKey:`${user._id}:${key}`}); if (orders.length) return orders; }
    if(error.outOfStock && intent) {
      await stripe.refunds.create({payment_intent:intent.id},{idempotencyKey:`stock-refund:${intent.id}`});
      await Checkout.updateOne({paymentIntentId:intent.id},{$set:{refunded:true}});
      throw new ErrorHandler('Stock ran out before the order completed. A full card refund has been requested. Start a new checkout.',409);
    }
    throw error;
  } finally { await session.endSession(); }
  return orders;
}
module.exports = {quote,addressOf,requestKey,fingerprint,createOrders,stripe,cents};
