const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const Order = require("../model/order");
const Shop = require("../model/shop");
const Product = require("../model/product");

const checkout = require('../utils/checkout');
router.post('/quote', isAuthenticated, catchAsyncErrors(async (req,res) => res.json({success:true,...await checkout.quote(req.body)})));
router.post('/create-order', isAuthenticated, catchAsyncErrors(async (req,res) => res.status(201).json({success:true,orders:await checkout.createOrders(req.body,req.user)})));

// 2. Get all orders of user
router.get(
  "/get-all-orders/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (String(req.params.userId) !== String(req.user._id)) return next(new ErrorHandler('You can only view your own orders',403));
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  })
);

// 3. Get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (String(req.params.shopId) !== String(req.seller._id)) return next(new ErrorHandler('You can only view your own shop orders',403));
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  })
);


const mongoose = require('mongoose');
const statuses = ['Processing','Transferred to delivery partner','Shipping','Received','On the way','Delivered'];
async function ownedOrder(id, sellerId, session) {
  const order = await Order.findById(id).session(session || null);
  if (!order) throw new ErrorHandler('Order not found',404);
  if (!order.cart.length || order.cart.some(item=>String(item.shopId)!==String(sellerId))) throw new ErrorHandler('You can only manage your own shop orders',403);
  return order;
}
router.put('/update-order-status/:id',isSeller,catchAsyncErrors(async(req,res)=>{
  const session=await mongoose.startSession();let order;
  try { await session.withTransaction(async()=>{
    order=await ownedOrder(req.params.id,req.seller._id,session);
    const status=req.body.status;
    if (status===order.status) return;
    if (!statuses.includes(status) || !statuses.includes(order.status) || statuses.indexOf(status)<=statuses.indexOf(order.status)) throw new ErrorHandler('Invalid order status transition',400);
    if (!order.inventoryReserved) {
      for(const item of order.cart) {
        const result=await Product.updateOne({_id:item._id,stock:{$gte:item.qty}},{$inc:{stock:-item.qty,sold_out:item.qty}},{session});
        if (!result.modifiedCount) throw new ErrorHandler('Not enough stock to fulfil this order',400);
      }
      order.inventoryReserved=true;
    }
    order.status=status;
    if(status==='Delivered') {
      order.deliveredAt=new Date();order.paidAt=order.paidAt || new Date();order.paymentInfo.status='Succeeded';
      if(!order.balanceCredited) {await Shop.updateOne({_id:req.seller._id},{$inc:{availableBalance:Math.round(order.totalPrice*90)/100}},{session});order.balanceCredited=true;}
    }
    await order.save({session});
  }); } finally { await session.endSession(); }
  res.json({success:true,order});
}));
router.put('/order-refund/:id',isAuthenticated,catchAsyncErrors(async(req,res)=>{
  const order=await Order.findById(req.params.id);
  if(!order) throw new ErrorHandler('Order not found',404);
  if(String(order.user?._id)!==String(req.user._id)) throw new ErrorHandler('You can only refund your own orders',403);
  if(order.status==='Processing refund') return res.json({success:true,order});
  if(order.status!=='Delivered' || !order.deliveredAt || Date.now()-new Date(order.deliveredAt).getTime()>7*86400000) throw new ErrorHandler('Refunds can be requested within seven days of delivery',400);
  order.status='Processing refund';await order.save();res.json({success:true,order,message:'Refund request submitted'});
}));
router.put('/order-refund-success/:id',isSeller,catchAsyncErrors(async(req,res)=>{
  let order=await ownedOrder(req.params.id,req.seller._id);
  if(order.status==='Refund Success') return res.json({success:true,message:'Refund already completed'});
  if(order.status!=='Processing refund' || req.body.status!=='Refund Success') throw new ErrorHandler('No pending refund request',400);
  let refundId;
  if(order.paymentInfo.type==='Credit Card') {
    if(!checkout.stripe) throw new ErrorHandler('Card refunds are temporarily unavailable',503);
    const refund=await checkout.stripe.refunds.create({payment_intent:order.paymentInfo.id,amount:checkout.cents(order.totalPrice)},{idempotencyKey:'refund:'+order._id});
    if(refund.status!=='succeeded') throw new ErrorHandler('Refund is pending with the payment provider; retry after it completes',409);
    refundId=refund.id;
  }
  const session=await mongoose.startSession();
  try {await session.withTransaction(async()=>{
    order=await ownedOrder(req.params.id,req.seller._id,session);
    if(order.status==='Refund Success') return;
    if(order.status!=='Processing refund') throw new ErrorHandler('Refund state changed',409);
    if(order.inventoryReserved) for(const item of order.cart) await Product.updateOne({_id:item._id},{$inc:{stock:item.qty,sold_out:-item.qty}},{session});
    if(order.balanceCredited) await Shop.updateOne({_id:req.seller._id},{$inc:{availableBalance:-Math.round(order.totalPrice*90)/100}},{session});
    order.balanceCredited=false;order.inventoryReserved=false;order.refundId=refundId;order.status='Refund Success';order.paymentInfo.status='Refunded';await order.save({session});
  });} finally {await session.endSession();}
  res.json({success:true,order,message:'Refund recorded successfully'});
}));
module.exports=router;
