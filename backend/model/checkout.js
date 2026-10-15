const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: String, required: true },
  key: { type: String, required: true },
  fingerprint: { type: String, required: true },
  quote: { type: Object, required: true },
  address: { type: Object, required: true },
  paymentIntentId: String,
  refunded: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({userId:1,key:1},{unique:true});
schema.index({paymentIntentId:1},{unique:true,partialFilterExpression:{paymentIntentId:{$type:'string'}}});
module.exports = mongoose.model('Checkout',schema);
