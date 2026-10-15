const checkout=require('../utils/checkout');
const Checkout=require('../model/checkout');
const User=require('../model/user');
const connectDatabase=require('../db/Database');
module.exports=async(req,res)=>{
  if(!checkout.stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({success:false});
  let event;
  try {event=checkout.stripe.webhooks.constructEvent(req.body,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET);}
  catch {return res.status(400).json({success:false,message:'Invalid webhook signature'});}
  if(event.type!=='payment_intent.succeeded') return res.json({received:true});
  try {
    await connectDatabase();
    const intent=event.data.object;
    const saved=await Checkout.findOne({paymentIntentId:intent.id});
    if(!saved) return res.json({received:true});
    if(saved.refunded) return res.json({received:true});
    const user=await User.findById(saved.userId);
    if(!user) throw new Error('Customer not found');
    await checkout.createOrders({idempotencyKey:saved.key,shippingAddress:saved.address,paymentInfo:{type:'Credit Card',id:intent.id}},user);
    return res.json({received:true});
  } catch(error) {
    if(error.statusCode===409 && /refund/.test(error.message)) return res.json({received:true});
    return res.status(500).json({success:false,message:'Order processing will be retried'});
  }
};
