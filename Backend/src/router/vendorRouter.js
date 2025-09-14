const express = require("express");
const { Trophy } = require("lucide-react");
const { vendorauth } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
router.get("/orders", vendorauth, async (req, res) => {
  try {
    const vendor = req.user;
    let category;
    if (vendor.role === "canteen-vendor") {
      category = "canteen";
    } else if (vendor.role === "stationary-vendor") {
      category = "stationary";
    } else {
      throw new Error("Invalid vendor role");
    }

    // Find all orders containing products in this category
    const orders = await Order.find()
      .populate({
        path: "items.productId",
        match: { category }, // filter products by category
        select: "name price category",
      })
      .populate("userId", "name email");

    // Keep only orders where at least one item matched
    const filteredOrders = orders.filter(order =>
      order.items.some(item => item.productId) // only keep if product populated
    );

    res.status(200).json({ orders: filteredOrders });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;