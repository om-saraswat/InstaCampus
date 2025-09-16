const express = require("express");
const { vendorauth } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
router.get("/orders", vendorauth, async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Get all products for this vendor
    const vendorProducts = await Product.find({ vendorid: vendorId }, "_id");
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // Get all orders
    const orders = await Order.find()
      .populate({
        path: "items.productId",
        select: "name price category vendorid",
      })
      .populate("userId", "name email");

    // Filter orders: only those with at least one item from this vendor
    const filteredOrders = orders
      .map(order => {
        // Only keep items belonging to this vendor
        const vendorItems = order.items.filter(
          item => item.productId && vendorProductIds.includes(item.productId._id.toString())
        );
        if (vendorItems.length > 0) {
          return {
            ...order.toObject(),
            items: vendorItems
          };
        }
        return null;
      })
      .filter(order => order !== null);

    res.status(200).json({ orders: filteredOrders });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/recent/orders", vendorauth, async (req, res) => {
  try {
    const vendorId = req.user._id;
    const validStatuses = ["pending", "confirmed", "preparing", "ready"];

    // Get all products for this vendor
    const vendorProducts = await Product.find({ vendorid: vendorId }, "_id");
    const vendorProductIds = vendorProducts.map(p => p._id.toString());

    // Get all orders
    const orders = await Order.find()
      .populate({
        path: "items.productId",
        select: "name price category vendorid",
      })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Filter orders: only those with at least one item from this vendor and valid status
    const filteredOrders = orders
      .filter(order => validStatuses.includes(order.orderStatus))
      .map(order => {
        const vendorItems = order.items.filter(
          item => item.productId && vendorProductIds.includes(item.productId._id.toString())
        );
        if (vendorItems.length > 0) {
          return {
            ...order.toObject(),
            items: vendorItems
          };
        }
        return null;
      })
      .filter(order => order !== null);

    res.status(200).json({ orders: filteredOrders });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/order/:status/:id", vendorauth, async (req, res) => {
  try {
    const orderId = req.params.id;
    const  status = req.params.status;

    // Validate status
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    // Find and update the order


    // Find and update the order
const order = await Order.findById(orderId).populate("items.productId");
if (!order) {
  return res.status(404).json({ error: "Order not found" });
}

// Check if the vendor is allowed to update this order
const vendorCategory = req.user.role.replace("-vendor", ""); // e.g. "stationary" or "canteen"
const unauthorizedItem = order.items.some(item => item.productId.category !== vendorCategory);

if (unauthorizedItem) {
  return res.status(403).json({ error: "You are not authorized to update this order" });
}

    order.orderStatus = status;
    await order.save();

    res.status(200).json({ order, message: "Order status updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;