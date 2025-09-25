const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {userAuth} = require("../middleware/auth");
const bcrypt = require("bcrypt");


router.post("/signup", async(req,res) => {
    const {name, email, password, role, studentId, department} = req.body;
    
    console.log("Received signup data:", { name, email, role, studentId, department }); // Debug log
    
    try{
        // Validate required fields
        if (!name || !email || !password || !role || !studentId || !department) {
            return res.status(400).json({
                message: "All fields are required: name, email, password, role, studentId, department"
            });
        }

        // Check if user already exists
        const userChecked = await User.findOne({email: email});
        if(userChecked){
            return res.status(400).json({message: "User already exists"});
        }

        // Create new user with all required fields
        const newUser = new User({
            email: email,
            name: name,
            password: password,
            role: role,
            studentId: studentId,
            department: department
        });
        
        await newUser.save();
        
        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            user: userResponse, 
            message: "User registered successfully"
        });
    }
    catch(err){
        console.error("Signup error:", err);
        res.status(400).json({message: err.message});
    }
});

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