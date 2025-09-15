const express = require("express");     
const router = express.Router();
const {vendorauth} = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");



router.get("/", vendorauth, async (req, res) => {
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
    const products = await Inventory.find({});

    res.status(200).json({ products });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.patch("/:id/restock",vendorauth,async(req,res) => {
    try{
        const inventoryItem = await Inventory.findById(req.params.id);
        if(!inventoryItem){
            throw new Error("Inventory item not found");
        }
        const {quantity} = req.body;
        inventoryItem.quantityAvailable += quantity;
        inventoryItem.lastRestockedAT = new Date();
        await inventoryItem.save();
        res.status(200).json({inventoryItem,message : "Inventory updated successfully"});
    }
    catch(err){
        res.status(400).json({error : err.message});
    }
});
router.patch("/:id/deduct",vendorauth,async(req,res) => {
    try{
        const inventoryItem = await Inventory.findById(req.params.id);
        if(!inventoryItem){
            throw new Error("Inventory item not found");
        }
        const {quantity} = req.body;
        if(inventoryItem.quantityAvailable < quantity){
            throw new Error("Insufficient stock to deduct the requested quantity");
        }
        inventoryItem.quantityAvailable -= quantity;
        inventoryItem.lastRestockedAT = new Date();
        await inventoryItem.save();
        res.status(200).json({inventoryItem,message : "Inventory updated successfully"});
    }
    catch(err){
        res.status(400).json({error : err.message});
    }
});
module.exports = router;