const jwt = require("jsonwebtoken");
const User = require("../models/User");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error("Authentication token missing");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};
const vendorauth = async(req,res,next) =>{
    try{
        const token = req.cookies.token;
        if(!token){
            throw new Error("Authentication token missing");
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if(!user){
            throw new Error("User not found");
        }
        if(user.role === "student" || user.role === "admin"){
            throw new Error(`${user.role} can not access`);
        }
        req.user = user;
        next();
    }
    catch(Err){
        res.status(400).send("Error Occured" + Err);
    }
}

module.exports = {
    userAuth,
    vendorauth
};