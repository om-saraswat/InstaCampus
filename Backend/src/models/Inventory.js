const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
    productId :{
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
},{timestamps:true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }});

module.exports = mongoose.model("Inventory",inventorySchema)