const express = require("express");
const { userAuth, vendorauth } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const product = require("../models/Product");

// POST /orders/from-cart/:category
router.post("/from-cart/:category", userAuth, async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    const cart = await Cart.findOne({ userId, category }).populate("items.productId", "price");
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: `${category} cart is empty` });
    }

    const items = cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
        userId,
        items,
        totalAmount,
        productType: category
    });

    await order.save();

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
});


router.get("/",userAuth, async (req, res) => {
    const orders = await Order.find({ userId: req.user._id })
        .populate("items.productId", "name price")
        .populate("userId", "name email");

    res.json(orders);

});

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
router.patch("/cancel/:id", userAuth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) throw new Error("Order not found");

        if (order.userId.toString() !== req.user._id.toString()) {
            throw new Error("You can only cancel your own orders");
        }

        if (order.orderStatus === "ready" || order.orderStatus === "completed") {
            throw new Error("Only orders with status 'ready and completed' can be cancelled");
        }

        order.orderStatus = "cancelled";
        await order.save();

        res.json({ order, message: "Order cancelled successfully" });
    } catch (Err) {
        res.status(400).send("Error Occurred: " + Err.message);
    }
});


module.exports = router;