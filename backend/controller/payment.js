const router = require('express').Router();
const catchAsync = require('../middleware/catchAsyncErrors');
const {isAuthenticated} = require('../middleware/auth');
const checkout = require('../utils/checkout');
const ErrorHandler = require('../utils/ErrorHandler');
const Checkout = require('../model/checkout');
router.post('/process', isAuthenticated, catchAsync(async(req,res)=>{
  if (!checkout.stripe) throw new ErrorHandler('Card payments are temporarily unavailable. Please use cash on delivery.',503);
  const key = checkout.requestKey(req.body);
  const address = checkout.addressOf(req.body);
  const quote = await checkout.quote(req.body);
  const fingerprint = checkout.fingerprint(quote,address,req.user._id);
  let saved = await Checkout.findOne({userId:String(req.user._id),key});
  if(saved && saved.fingerprint!==fingerprint) throw new ErrorHandler('Your cart changed. Please restart checkout.',409);
  if(!saved) {
    try { saved=await Checkout.create({userId:String(req.user._id),key,fingerprint,quote,address}); }
    catch(error) { if(error.code!==11000) throw error;saved=await Checkout.findOne({userId:String(req.user._id),key});if(saved.fingerprint!==fingerprint) throw new ErrorHandler('Please restart checkout',409); }
  }
  const intent = await checkout.stripe.paymentIntents.create({
    amount:checkout.cents(quote.totalPrice),currency:'usd',payment_method_types:['card'],
    metadata:{userId:String(req.user._id),checkoutKey:key,fingerprint},
  },{idempotencyKey:`checkout:${req.user._id}:${key}:${fingerprint}`});
  saved.paymentIntentId=intent.id;await saved.save();
  res.json({success:true,clientSecret:intent.client_secret,totalPrice:quote.totalPrice});
}));
router.get('/stripeapikey',(req,res)=>res.json({stripeApikey:process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_API_KEY || null}));
module.exports = router;
