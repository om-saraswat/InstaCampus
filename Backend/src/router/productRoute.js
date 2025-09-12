const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const {vendorauth}= require("../middleware/auth")

router.post("/",vendorauth,async(req,res) => {
    try{
        const {name,category,description,price,imgUrl,lowStockThreshold} = req.body;
        
    }
})
