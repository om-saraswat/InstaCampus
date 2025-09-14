const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { userAuth } = require("../middleware/auth");




router.post("/add/:category", userAuth, async (req, res) => {
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
router.get("/:category", userAuth, async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    const cart = await Cart.findOne({ userId, category })
        .populate("items.productId", "name price imgUrl");

    if (!cart) return res.status(404).json({ error: "Cart is empty" });

    res.json(cart);
});
router.post("/clear/:category", userAuth, async (req, res) => {
    const userId = req.user._id;
    const category = req.params.category;

    const cart = await Cart.findOne({ userId, category });
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    cart.items = [];
    await cart.save();

    res.json({ message: `${category} cart cleared` });
});

module.exports = router;