const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
                validate(value) {
                    if (value < 1) {
                        throw new Error("Price must be at least 1");
                    }
                },
            },
        }
    ],
    orderid :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Order",
        required : true,
    },
    quantity : {
        type : Number,
        required : true,
        min : 1,
    },
    price : {
        type : Number,
        required : true,
        validate(value){
            if(value < 1){
                throw new Error("Price must be at least 1")
            }
        }
    },
}, {timestamps:true});

const Orderitem = mongoose.model('Orderitem', orderSchema);

module.exports = Orderitem; 
