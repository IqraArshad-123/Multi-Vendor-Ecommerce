const router=require('express').Router();
const Conversation=require('../model/conversation');
const Shop=require('../model/shop');
const {isAuthenticated,isSeller}=require('../middleware/auth');
const participant=require('../middleware/participant');
const catchAsync=require('../middleware/catchAsyncErrors');
const ErrorHandler=require('../utils/ErrorHandler');
router.post('/create-new-conversation',isAuthenticated,catchAsync(async(req,res)=>{
  if(String(req.body.userId)!==String(req.user._id)) throw new ErrorHandler('Invalid conversation user',403);
  if(!await Shop.exists({_id:req.body.sellerId})) throw new ErrorHandler('Shop not found',404);
  const members=[String(req.user._id),String(req.body.sellerId)];
  let conversation=await Conversation.findOne({members:{$all:members}});
  if(!conversation) conversation=await Conversation.create({members,groupTitle:members.join(':')});
  res.status(201).json({success:true,conversation});
}));
router.get('/get-all-conversation-seller/:id',isSeller,catchAsync(async(req,res)=>{
  if(req.params.id!==String(req.seller._id)) throw new ErrorHandler('This inbox is private',403);
  res.json({success:true,conversations:await Conversation.find({members:req.params.id}).sort({updatedAt:-1})});
}));
router.get('/get-all-conversation-user/:id',isAuthenticated,catchAsync(async(req,res)=>{
  if(req.params.id!==String(req.user._id)) throw new ErrorHandler('This inbox is private',403);
  res.json({success:true,conversations:await Conversation.find({members:req.params.id}).sort({updatedAt:-1})});
}));
router.put('/update-last-message/:id',participant.authenticate,catchAsync(async(req,res)=>{
  const conversation=await participant.conversation(req,req.params.id);
  // The message creation endpoint updates this atomically with a trusted sender.
  res.json({success:true,conversation});
}));
module.exports=router;
