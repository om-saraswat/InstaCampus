const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const {vendorauth, userAuth}= require("../middleware/auth")

router.post("/",vendorauth,async(req,res) => {
    try{
        const {name,category,description,price,imgUrl,lowStockThreshold} = req.body;
        
        if(req.user.role === "canteen-vendor" && category !== "Food and Drinks"){
            throw new Error("Canteen vendor can only add Food and Drinks category products");
        }
        if(req.user.role === "stationary-vendor" && category !== "stationary" && category !== "Xeros"){
            throw new Error("Stationary vendor can only add stationary and Xeros category products");
        }

        const product = new Product({
            name,
            category,
            description,
            price,
            imgUrl,
            lowStockThreshold
        });
        await product.save();
        res.status(201).json({product,message : "Product added successfully"});
    }
    catch(Err){
        res.status(400).send(Err);
    }
})
router.get("/",userAuth,async(req,res) => {
    try{
        const products = await Product.find({});
        res.status(200).json({products});
    }
    catch(err){
        res.status(400).send("Error Occured" + err);
    }
})
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
        const {name,category,description,price,imgUrl,lowStockThreshold} = req.body;
        
        if(req.user.role === "canteen-vendor" && category !== "Food and Drinks"){
            throw new Error("Canteen vendor can only add Food and Drinks category products");
        }
        if(req.user.role === "stationary-vendor" && category !== "stationary" && category !== "Xeros"){
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
        if(!product){
            throw new Error("Product not found");
        }
        await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Product deleted successfully" });
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
});
module.exports = router;

