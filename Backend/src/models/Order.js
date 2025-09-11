const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    productType : {
        type : String,
        enum : {
            values: ["stationary", "Xeros", "Food and Drinks"],
            message : "{VALUE} is not a valid product type"
        },
        required : true,
    },
    totalAmount:{
        type : Number,
        required : true,
        validate(value){
            if(value < 1){
                throw new Error("Total amount must be at least 1")
            }
        }
    },
    orderStatus : {
        type : String,
        enum : {
            values : ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"],
            message : "{VALUE} is not a valid order status"
       },
        default : "pending",
    },
    paymentStatus: {
        type : String,
        enum : {
            values : ["pending", "completed", "failed"],
            message : "{VALUE} is not a valid payment status"
        },
        default : "pending",
    },
}, {timestamps:true});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 