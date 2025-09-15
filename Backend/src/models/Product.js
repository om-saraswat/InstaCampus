const mongoose = require("mongoose");
const validator = require("validator");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
    },
    vendorid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: {
        values: ["stationary","canteen"],
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
    imgUrl: {
      type: String,
      required: true,
      validate(input) {
        if (
          !validator.isURL(input, {
            protocols: ["http", "https"],
            require_protocol: true,
            require_tld: false,
          })
        ) {
          throw new Error("Image URL is not valid");
        }
      },
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
