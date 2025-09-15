const express = require("express");
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
router.get("/recent/orders",vendorauth,async(req,res)=>{
  try{
    const user = req.user;
    let category;
    if(user.role==="canteen-vendor"){
      category="canteen"
    }
    else if(user.role==="stationary-vendor"){
      category="stationary"
    }
    else{
      throw new Error("Invalid vendor role")
    }
    const orders = await Order.find()
    .populate({
      path: "items.productId",
      match: { category }, // filter products by category
      select: "name price category",
    })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })

    const validStatuses = ["pending","confirmed","preparing","ready"];

    const recentOrders = orders.filter(order => 
      validStatuses.includes(order.orderStatus)
    );
    // Keep only orders where at least one item matched
    const filteredOrders = orders.filter(order =>
      order.items.some(item => item.productId) // only keep if product populated
    );

    res.status(200).json({ orders: filteredOrders });
  }
  catch(err){
    res.status(400).json({error:err.message})
  }
});

router.patch("/order/status/:id", vendorauth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    // Find and update the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the vendor is allowed to update this order
    if (order.items.some(item => item.productId.category !== req.user.role.replace("-vendor", ""))) {
      return res.status(403).json({ error: "You are not authorized to update this order" });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ order, message: "Order status updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/inventory", vendorauth, async (req, res) => {
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

    // Find all products in this category
    const products = await Product.find({ category });

    res.status(200).json({ products });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.patch("/inventory/:id", vendorauth, async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, stock } = req.body;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if the vendor is allowed to update this product
    const vendor = req.user;
    let category;
    if (vendor.role === "canteen-vendor") {
      category = "canteen";
    } else if (vendor.role === "stationary-vendor") {
      category = "stationary";
    } else {
      throw new Error("Invalid vendor role");
    }
    if (product.category !== category) {
      return res.status(403).json({ error: "You are not authorized to update this product" });
    }

    // Update product fields if provided
    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;

    await product.save();

    res.status(200).json({ product, message: "Product updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
module.exports = router;