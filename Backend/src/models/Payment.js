const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderid :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true,
    },
    paymentMethod : {
        type : String,
        required : true,
        enum : {
            values : ["creditcard","debitcard","upi","netbanking","cod"],
            message : "{VALUE} is not a valid payment method"
        }
    },
    amount : {
        type : Number,
        required : true,
        validate(value){
            if(value < 1){
                throw new Error("Amount must be at least 1")
            }
        }
    },
    status : {
        type : String,
        required : true,
        enum : {
            values : ["pending","completed","failed","refunded"],
            message : "{VALUE} is not a valid payment status"
        }
    },
    transactionId : {
        type : String,
        required : true,
        unique : true,
    }
},{timestamps:true  });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;