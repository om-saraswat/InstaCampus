const mongoose = require("mongoose");
const Order = require("./Order");

const feedbackSchema = new mongoose.Schema({
    userid :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    productId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required : true,
    },
    OrderId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true,
    },
    rating : {
        type : Number,
        required : true,
        min : 1,
        max : 5,
    },
    comment : {
        type : String,
        required : false,
        trim : true,
        maxlength : 500,
    },
    createdAt : {
        type : Date,
        default : Date.now, 
    }
})

const feedbackmodel = mongoose.model("Feedback",feedbackSchema);

module.exports = feedbackmodel;