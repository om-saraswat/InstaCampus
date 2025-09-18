const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const {vendorauth, userAuth}= require("../middleware/auth")
const mongoose = require("mongoose"); 
const Inventory = require("../models/Inventory");

router.post("/", vendorauth, async (req, res) => {
  try {
    const { name, category, description, price, imgUrl, lowStockThreshold } = req.body;

    // Role-based category validation
    if (req.user.role === "canteen-vendor" && category !== "canteen") {
      throw new Error("Canteen vendor can only add Food and Drinks category products");
    }
    if (req.user.role === "stationary-vendor" && category !== "stationary") {
      throw new Error("Stationary vendor can only add stationary category products");
    }

    // Create Product
    const product = new Product({
      name,
      category,
      description,
      price,
      imgUrl,
      lowStockThreshold,
      vendorid: req.user._id,
    });
    await product.save();

    // Create Inventory entry with quantity = 0
    const inventory = new Inventory({
      productId: product._id,
      quantityAvailable: 0, // default zero
    });
    await inventory.save();

    res.status(201).json({
      product,
      inventory,
      message: "Product and Inventory created successfully",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/vendor/:vendorid", userAuth, async(req, res) => {
    try {
        const { vendorid } = req.params;
        
        if (!vendorid) {
            return res.status(400).json({ error: "vendorid is required" });
        }

        const products = await Product.find({ vendorid: vendorid });

        if (!products) {
            return res.status(404).json({ message: "No products found for this vendor" });
        }

        res.status(200).json({ 
            products, message: "Products retrieved successfully"
        });
        
    } catch(err) {
        console.error("Error in finding products:", err);
        res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

router.get("/:id",userAuth,async(req,res) => {
    try{

        const product = await Product.findById(req.params.id);
        if(!product){
            throw new Error("Product not found");
        }
        res.status(200).json({product});
    }
    catch(err){
        res.status(400).send("Error Occured" + err);
    }
})

router.patch("/:id",vendorauth,async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            throw new Error("Product not found");
        }
        if(req.user._id.toString() !== product.vendorid.toString()){
            throw new Error("You are not authorized to update this product");
        }
        const {name,category,description,price,imgUrl,lowStockThreshold} = req.body;
        
        if(req.user.role === "canteen-vendor" && category !== "canteen"){
            throw new Error("Canteen vendor can only add Food and Drinks category products");
        }
        if(req.user.role === "stationary-vendor" && category !== "stationary"){
            throw new Error("Stationary vendor can only add stationary and Xeros category products");
        }

        product.name = name;
        product.category = category;
        product.description = description;
        product.price = price;
        product.imgUrl = imgUrl;
        product.lowStockThreshold = lowStockThreshold;

        await product.save();
        res.status(200).json({product,message : "Product updated successfully"});
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
});
router.get("/category/:category",userAuth,async(req,res) => {
    try{
        const category = req.params.category;
        const products = await Product.find({category});
        res.status(200).json({products});
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
});
router.delete("/:id",vendorauth,async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(req.user._id.toString() !== product.vendorid.toString()){
            throw new Error("You are not authorized to delete this product");
        }
        if(!product){
            throw new Error("Product not found");
        }
        await Inventory.deleteOne({ productId: req.params.id });
        await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Product deleted successfully" });
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
});
module.exports = router;

