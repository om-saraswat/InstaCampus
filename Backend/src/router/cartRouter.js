const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { userAuth } = require("../middleware/auth");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose")
const Product = require("../models/Product");


router.post("/add", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        // Find product (with vendor + category)
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check inventory
        const inventoryItem = await Inventory.findOne({ productId });
        if (!inventoryItem) {
            return res.status(404).json({ error: "Product not found in inventory" });
        }
        if (inventoryItem.quantityAvailable < quantity) {
            return res.status(400).json({ error: `Only ${inventoryItem.quantityAvailable} units available` });
        }

        // Find user's cart (now only one cart per category+vendor)
        let cart = await Cart.findOne({ userId, category: product.category });

        if (!cart) {
            cart = new Cart({
                userId,
                category: product.category,
                vendorId: product.vendorid,
                items: [{ productId, quantity }]
            });
        } else {
            if (cart.vendorId && !cart.vendorId.equals(product.vendorid)) {
                return res.status(400).json({
                    error: "Your cart contains items from another vendor. Clear the cart to add items from a different vendor."
                });
            }

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

            if (!cart.vendorId) {
                cart.vendorId = product.vendorid;
            }
        }

        await cart.save();
        res.status(200).json(cart);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/:category", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const category = req.params.category;
        if (!["canteen", "stationary"].includes(category)) {
            return res.status(400).json({ error: "Invalid category" });
        }
        const cart = await Cart.findOne({ userId, category })
            .sort({ updatedAt: -1 }) 
            .populate({
                path: "items.productId",
                select: "name price imgUrl vendorid category"
            })
            .populate("vendorId", "name email");

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ error: "Cart is empty" });
        }

        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/clear/:category", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const category = req.params.category;

        const cart = await Cart.findOne({ userId, category });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }
        cart.items = [];
        cart.vendorId = null; 
        await cart.save();

        res.json({ message: `${category} cart cleared` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/update-item", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity, category } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ error: "Quantity must be at least 1" });
        }
     
        const cart = await Cart.findOne({ userId, category });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));
        if (itemIndex === -1) {
            return res.status(404).json({ error: "Item not found in cart" });
        }

        // Check inventory
        const inventoryItem = await Inventory.findOne({ productId });
        if (!inventoryItem || inventoryItem.quantityAvailable < quantity) {
            return res.status(400).json({ error: `Only ${inventoryItem?.quantityAvailable || 0} units available` });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        // Populate and send back the updated cart
        const updatedCart = await Cart.findById(cart._id)
            .populate({ path: "items.productId", select: "name price imgUrl" })
            .populate("vendorId", "name");

        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: ROUTE TO REMOVE AN ITEM
router.delete("/remove-item", userAuth, async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, category } = req.body; // Get category from body
 
        let cart = await Cart.findOne({ userId, category });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }
        
        // Filter out the item to be removed
        cart.items = cart.items.filter(item => !item.productId.equals(productId));
        
        // If the cart becomes empty, clear the vendorId as well
        if (cart.items.length === 0) {
            cart.vendorId = null;
        }
        
        await cart.save();

        // Populate and send back the updated cart
        const updatedCart = await Cart.findById(cart._id)
            .populate({ path: "items.productId", select: "name price imgUrl" })
            .populate("vendorId", "name");

        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;