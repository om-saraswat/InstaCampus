const express = require("express");
const { userAuth, vendorauth } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const product = require("../models/Product");
const Inventory = require("../models/Inventory");


// orders.js - CORRECTED LOGIC ✅
router.post("/from-cart/:category", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const category = req.params.category;

        const cart = await Cart.findOne({ userId, category }).populate("items.productId", "price name");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: `${category} cart is empty` });
        }

        // --- Step 1: Validate inventory for ALL items BEFORE making changes ---
        for (const item of cart.items) {
            const inventory = await Inventory.findOne({ productId: item.productId._id });
            if (!inventory || inventory.quantityAvailable < item.quantity) {
                return res.status(400).json({
                    error: `Not enough stock for ${item.productId.name}. Available: ${inventory?.quantityAvailable || 0}, Requested: ${item.quantity}`
                });
            }
        }

        // --- Step 2: If all checks pass, create the order ---
        const orderItems = cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price
        }));
        const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = new Order({
            userId,
            items: orderItems,
            totalAmount,
            productType: category
        });
        await order.save();

        // --- Step 3: Decrement inventory ---
        for (const item of orderItems) {
            await Inventory.updateOne(
                { productId: item.productId },
                { $inc: { quantityAvailable: -item.quantity } }
            );
        }

        // --- Step 4: Clear the cart ---
        cart.items = [];
        await cart.save();

        res.status(201).json(order);
    } catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/", userAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId", "name price")
      .populate("userId", "name email")
      .sort({ createdAt: -1 }); // Sort by creation date, newest first

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }});
router.get("/:id",userAuth, async (req, res) => {
    try{
        const order = await Order.findById(req.params.id)
        .populate("items.productId", "name price imgUrl")
        .populate("userId", "name email");
        if(!order){
            throw new Error("Order not found");
        }
        res.json(order);
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
    
});
// orders.js - CORRECTED LOGIC ✅
router.patch("/cancel/:id", userAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "You can only cancel your own orders" });
        }

        // ✅ Corrected Logic: Prevent cancellation for processed orders.
        const nonCancellableStatuses = ['completed', 'shipped', 'delivered', 'cancelled'];
        if (nonCancellableStatuses.includes(order.orderStatus)) {
            return res.status(400).json({ error: `Cannot cancel an order with status: '${order.orderStatus}'` });
        }

        // Restore inventory quantities for each item in the order
        for (const item of order.items) {
            await Inventory.updateOne(
                { productId: item.productId },
                { $inc: { quantityAvailable: item.quantity } }
            );
        }
        
        // Update order status
        order.orderStatus = "cancelled";
        await order.save();

        res.json({ message: "Order cancelled and inventory restored successfully", order });
    } catch (err) {
        res.status(400).send("Error Occurred: " + err.message);
    }
});


module.exports = router;