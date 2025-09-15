const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { userAuth } = require("../middleware/auth");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose")


router.post("/add/:category", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const category = req.params.category; // from URL
        const { productId, quantity } = req.body;

        // Check if product exists in inventory
       const inventoryItem = await Inventory.findOne({ 
    productId: new mongoose.Types.ObjectId(productId) 
});
        if (!inventoryItem) {
            return res.status(404).json({ error: "Product not found in inventory" });
        }

        

        if (inventoryItem.quantityAvailable < quantity) {
            return res.status(400).json({ error: `Only ${inventoryItem.quantityAvailable} units available` });
        }


        let cart = await Cart.findOne({ userId, category });

        if (!cart) {
            cart = new Cart({ userId, category, items: [{ productId, quantity }] });
        } else {
            const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
            if (itemIndex > -1) {
                const newQuantity = cart.items[itemIndex].quantity + quantity;
                if (newQuantity > inventoryItem.quantityAvailable) {
                    return res.status(400).json({ error: `Only ${inventoryItem.quantityAvailable} units available` });
                }
                cart.items[itemIndex].quantity = newQuantity;
            } else {
                cart.items.push({ productId, quantity });
            }
        }

        await cart.save();
        res.status(200).json(cart);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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