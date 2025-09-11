const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    productid :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required : true,
    },
    quantityAvailable :{
        type :Number,
        required : true,
        min : 0,
    },
    lastRestockedAT : {
        type : Date,
        default : Date.now,
    }
},{timestamps:true});

module.exports = mongoose.model("Inventory",inventorySchema,{
    toJSON : {
        virtuals : true,    
    }
})