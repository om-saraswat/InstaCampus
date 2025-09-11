const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    category: {
      type: String,
      enum: {
        values: ["stationary", "Xeros", "Food and Drinks"],
        message: "{VALUE} is not a valid product type",
      },
      required: true,
    },
    description: {
      type: String,
      maxlength: 250,
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
    imgUrl :{
        type : String,
        required : true,
        validate(input){
            if(validator.isURL(input)){
                throw new Error("Image URL is not valid")
            }       
        }
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
