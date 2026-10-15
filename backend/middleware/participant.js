const jwt = require('jsonwebtoken');
const User = require('../model/user');
const Shop = require('../model/shop');
const Conversation = require('../model/conversation');
const catchAsync = require('./catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
exports.authenticate = catchAsync(async(req,res,next)=>{
  const tokens = [[req.headers.authorization?.replace(/^Bearer /,'') || req.cookies.token,User],[req.headers['seller-token'] || req.cookies.seller_token,Shop]];
  req.identities=[];
  for(const [token,Model] of tokens) {
    if(!token) continue;
    try { const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);if(await Model.exists({_id:decoded.id})) req.identities.push(String(decoded.id)); } catch { /* Another valid signed identity can still be used. */ }
  }
  if(!req.identities.length) throw new ErrorHandler('Please login to continue',401);
  next();
});
exports.conversation = async(req,id)=>{
  const conversation=await Conversation.findById(id);
  if(!conversation) throw new ErrorHandler('Conversation not found',404);
  if(!conversation.members.some(id=>req.identities.includes(String(id)))) throw new ErrorHandler('This conversation is private',403);
  return conversation;
};
