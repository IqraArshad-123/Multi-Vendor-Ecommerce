const router=require('express').Router();
const Messages=require('../model/messages');
const participant=require('../middleware/participant');
const catchAsync=require('../middleware/catchAsyncErrors');
const ErrorHandler=require('../utils/ErrorHandler');
const upload=require('../multer');
const cloudinary=require('../cloudinary');
router.use(participant.authenticate);
router.post('/create-new-message',upload.single('image'),catchAsync(async(req,res)=>{
  const conversation=await participant.conversation(req,req.body.conversationId);
  const sender=String(req.body.sender);
  if(!req.identities.includes(sender) || !conversation.members.includes(sender)) throw new ErrorHandler('Invalid message sender',403);
  const text=String(req.body.text || '').trim();
  if(text.length>4000) throw new ErrorHandler('Message is too long',400);
  let image=req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : req.body.images || req.body.image;
  let images;
  if(image) {
    if(typeof image!=='string' || !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image) || image.length>3000000) throw new ErrorHandler('Choose a PNG, JPEG, WebP or GIF smaller than 2 MB',400);
    const result=await cloudinary.uploader.upload(image,{folder:'messages'});
    images={public_id:result.public_id,url:result.secure_url};
  }
  if(!text && !images) throw new ErrorHandler('Enter a message or image',400);
  const message=await Messages.create({conversationId:String(conversation._id),sender,text,images});
  conversation.lastMessage=text || 'Photo';conversation.lastMessageId=sender;await conversation.save();
  res.status(201).json({success:true,message});
}));
router.get('/get-all-messages/:id',catchAsync(async(req,res)=>{
  await participant.conversation(req,req.params.id);
  const messages=await Messages.find({conversationId:req.params.id}).sort({createdAt:1}).limit(1000);
  res.json({success:true,messages});
}));
module.exports=router;
