const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const {vendorauth, userAuth}= require("../middleware/auth");
const mongoose = require("mongoose"); 
const Inventory = require("../models/Inventory");
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post("/", vendorauth, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, price, lowStockThreshold } = req.body;

    // Role-based category validation
    if (req.user.role === "canteen-vendor" && category !== "canteen") {
      throw new Error("Canteen vendor can only add Food and Drinks category products");
    }
    if (req.user.role === "stationary-vendor" && category !== "stationary") {
      throw new Error("Stationary vendor can only add stationary category products");
    }

    // Prepare image data - store as base64 string
    let imageBase64 = null;
    let imageContentType = null;
    
    if (req.file) {
      imageBase64 = req.file.buffer.toString('base64');
      imageContentType = req.file.mimetype;
    }

    // Create Product
    const product = new Product({
      name,
      category,
      description,
      price,
      imageBase64,
      imageContentType,
      lowStockThreshold,
      vendorid: req.user._id,
    });
    await product.save();

    // Create Inventory entry with quantity = 0
    const inventory = new Inventory({
      productId: product._id,
      quantityAvailable: 0,
    });
    await inventory.save();

    // ✅ FIXED: Return product WITH base64 image data
    const productResponse = {
      _id: product._id,
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      lowStockThreshold: product.lowStockThreshold,
      vendorid: product.vendorid,
      imageBase64: product.imageBase64,        // ✅ Added
      imageContentType: product.imageContentType, // ✅ Added
      hasImage: !!imageBase64,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };

    res.status(201).json({
      product: productResponse,
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

        // ✅ Get all products with full image data
        const products = await Product.find({ vendorid: vendorid });

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found for this vendor" });
        }

        // ✅ Products already include imageBase64 and imageContentType
        res.status(200).json({ 
            products, 
            message: "Products retrieved successfully"
        });
        
    } catch(err) {
        console.error("Error in finding products:", err);
        res.status(500).json({ error: "Internal server error: " + err.message });
    }
});

router.get("/:id", userAuth, async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            throw new Error("Product not found");
        }
        // ✅ Product already includes full image data
        res.status(200).json({product});
    }
    catch(err){
        res.status(400).send("Error Occured" + err);
    }
});

router.patch("/:id", vendorauth, upload.single('image'), async(req,res) => {
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            throw new Error("Product not found");
        }
        if(req.user._id.toString() !== product.vendorid.toString()){
            throw new Error("You are not authorized to update this product");
        }
        const {name, category, description, price, lowStockThreshold} = req.body;
        
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
        product.lowStockThreshold = lowStockThreshold;

        // Update image if new one is uploaded
        if (req.file) {
            product.imageBase64 = req.file.buffer.toString('base64');
            product.imageContentType = req.file.mimetype;
        }

        await product.save();
        
        // ✅ FIXED: Return product WITH base64 image data
        const productResponse = {
            _id: product._id,
            name: product.name,
            category: product.category,
            description: product.description,
            price: product.price,
            lowStockThreshold: product.lowStockThreshold,
            vendorid: product.vendorid,
            imageBase64: product.imageBase64,        // ✅ Added
            imageContentType: product.imageContentType, // ✅ Added
            hasImage: !!product.imageBase64,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };
        
        res.status(200).json({product: productResponse, message: "Product updated successfully"});
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
});

router.get("/category/:category", userAuth, async(req,res) => {
    try{
        const category = req.params.category;
        // ✅ Products already include full image data
        const products = await Product.find({category});
        res.status(200).json({products});
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
});

router.delete("/:id", vendorauth, async(req,res) => {
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