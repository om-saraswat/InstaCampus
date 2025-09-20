const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {userAuth} = require("../middleware/auth");
const bcrypt = require("bcrypt");
router.post("/signup", async(req,res) =>{
    const {name,email,password,role} = req.body;
    try{
        const userChecked = await User.findOne({email: email});
        if(userChecked){
            throw new Error("User already exists");
        }

        const newUser = new User({
            email : email,
            name : name,
            password : password,
            role : role
        });
        await newUser.save();
        res.status(201).json({user: newUser, message: "User registered successfully"});
    }
    catch(Err){
        res.status(400).json({message: Err.message});
    }
})

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        console.log("👉 Entered password:", password);
        console.log("👉 Stored password:", user.password);

        const valid = await bcrypt.compare(password, user.password);
        console.log("👉 Password valid?", valid);

        if (!valid) {
            throw new Error("Invalid Credentials hurrah");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        const userObj = user.toObject();
        delete userObj.password;

        // Fixed cookie configuration
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: "/"
        });

        console.log("🍪 Cookie set with token");
        console.log("Environment:", process.env.NODE_ENV);
        
        res.status(200).json({ userObj, message: "Login Successful" });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token").status(200).json({ message: "Logout Successful" });
})
module.exports = router;