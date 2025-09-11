const mongoose = require("mongoose");

const loginventorySchema = new mongoose.Schema({
    productid :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required : true,
    },
    quantityChanged :{
        type :Number,
        required : true,
    },
    changeType : {
        type : String,
        required : true,
        enum : {
            values : ["restock","sale","return"],
            message : "{VALUE} is not valid change type"
        }
    },
    changedAt : {
        type : Date,
        default : Date.now,
    },
    previousQuantity :{
        type : Number,
        required : true,
        min : 0,
    },
    newQuantity :{
        type : Number,
        required : true,
        min : 0,
    },
},{timestamps:true});

module.exports = mongoose.model("LogInventory",loginventorySchema,{
    toJSON : {
        virtuals : true,    
    }
})
