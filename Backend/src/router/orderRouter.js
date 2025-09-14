const express = require("express");
const { userAuth, vendorauth } = require("../middleware/auth");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const product = require("../models/Product");
// POST /cart/add/:category
router.post("/cart/add/:category", userAuth, async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category; // from URL
    const { productId, quantity } = req.body;

    // Find cart for this user and category
    let cart = await Cart.findOne({ userId, category });

    if (!cart) {
        cart = new Cart({ userId, category, items: [{ productId, quantity }] });
    } else {
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
    }

    await cart.save();
    res.status(200).json(cart);
});


// GET /cart/:category
router.get("/cart/:category", userAuth, async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    const cart = await Cart.findOne({ userId, category })
        .populate("items.productId", "name price imgUrl");

    if (!cart) return res.status(404).json({ error: "Cart is empty" });

    res.json(cart);
});
router.post("/cart/clear/:category", userAuth, async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    const cart = await Cart.findOne({ userId, category });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = [];
    await cart.save();

    res.json({ message: `${category} cart cleared` });
});
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

router.patch("/:id/:status",vendorauth, async (req, res) => {
    try{
        const order = await Order.findById(req.params.id);
        if(!order){
            throw new Error("Order not found");
        }
        const {status} = req.body;
        order.orderStatus = status;
        await order.save();
        res.status(200).json({order,message : "Order status updated"});
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
    
});




module.exports = router;