const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    checkoutKey: String,
    shopId: String,
    inventoryReserved: { type: Boolean, default: false },
    shipping: Number,
    discount: Number,
    balanceCredited: { type: Boolean, default: false },
    refundId: String,
    cart: {
        type: Array,
        required: true,
    },
    shippingAddress: {
        type: Object,
        required: true,
    },
    user: {
        type: Object,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: "Processing",
    },
    paymentInfo: {
        id: {
            type: String,
        },
        status: {
            type: String,
            default: "Not Paid", 
        },
        type: {
            type: String,
            required: true, 
        },
    },
    paidAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now, 
    },
});
orderSchema.index({ checkoutKey: 1, shopId: 1 }, { unique: true, partialFilterExpression: { checkoutKey: { $type: 'string' } } });

module.exports = mongoose.model("Order", orderSchema);
