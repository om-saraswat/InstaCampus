const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {userAuth} = require("../middleware/auth")

router.get("/" ,userAuth, async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        if(!user){
            throw new Error("User not found");
        }
        res.status(200).json({user});
    }
    catch(Err){
        res.status(400).json({message: Err.message})
    }
})
router.get("/vendor/:role",userAuth,async(req,res) =>{
    try{
        const user = await User.find({}).select("-password");
        const role = req.params.role
         if(!user){
            throw new Error("User not found");
        }
        const filteruser = user.filter(u => u.role===role);
        res.json({filteruser})

    }
    catch(err){
        res.status(400).send("error occured" + err);
    }
})
router.patch("/",userAuth, async(req,res) =>{
    const user = req.user;
    try{
       const {name , password} = req.body;
       user.name = name;
       user.password = password;
       await user.save();
       res.clearCookie("token")
       res.json({user,message : "Profile Updated"})
    }
    catch(err){
        res.status(400).send("Error occured" + err);
    }
})

module.exports = router;
