const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('./Order'); // Import Order model

const printingOrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    orderid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true,
    },
    fileUrl : {
        type : String,
        required : true,
        validate(input){
            if(!validator.isURL(input)){
                throw new Error("File URL is not valid")
            }       
        }
    },
    numberOfPages : { type : Number, required : true, min : 1 },
    color : { type : Boolean, default : false },
    copies : { type : Number, required : true, default : 1 },
    side : { type : String, enum : ["single", "double"], default : "single" },
    paperSize : { type : String, enum : ["A4", "A3"], required : true },
    binding : { type : String, enum : ["none", "spiral","stapled","hard","thermal"], default : "none" },
    instruction : { type : String, maxlength : 500 }
}, { timestamps:true });

const PrintingOrder = mongoose.model('PrintingOrder', printingOrderSchema);

module.exports = PrintingOrder;