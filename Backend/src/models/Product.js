const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Removed imgUrl field completely
  // Image stored as base64
  imageBase64: {
    type: String,
    required: false,
  },
  imageContentType: {
    type: String,
    required: false,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  vendorid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Product", productSchema);