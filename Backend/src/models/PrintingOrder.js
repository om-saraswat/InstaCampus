const mongoose = require('mongoose');

const printingOrderSchema = new mongoose.Schema({
    orderid :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true,
    },
    fileUrl :{
        type : String,
        required : true,
        validate(input){
            if(!validator.isURL(input)){
                throw new Error("File URL is not valid")
            }       
        }
    },
    numberOfPages : { 
        type : Number,
        required : true,
        min : 1,
    },
    color : {
        type : Boolean,
        default : false,
    },
    copies : {
        type : Number,
        required : true,
        default : 1,
    },
    side : {
        type : String,
        enum : {
            values : ["single", "double"],
            message : "{VALUE} is not a valid side option"
        },
        default : "single", 
    },
    paperSize : {
        type : String,
        enum : {
            values : ["A4", "A3"],
            message : "{VALUE} is not a valid paper size"
        },
        required : true,
    },
    binding : {
        type : String,
        enum : {
            values : ["none", "spiral","stapled","hard","thermal"],
            message : "{VALUE} is not a valid binding option"
        },
        default : "none",   
    },
    instruction : {
        type : String,
        maxlength : 500,
    }
}, {timestamps:true});

const PrintingOrder = mongoose.model('PrintingOrder', printingOrderSchema);

module.exports = PrintingOrder;
