const mongoose = require('mongoose');
const orderItemsSchema = require('./Orderitem');
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemsSchema],
    totalAmount: { type: Number, required: true, min: 1 },
    orderStatus: { type: String, enum: ["pending","confirmed","preparing","ready","delivered","cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending","completed","failed"], default: "pending" }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 