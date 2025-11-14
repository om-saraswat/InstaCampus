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

const vendorauth = async(req, res, next) => {
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
        if (user.role === "student" || user.role === "admin") {
            throw new Error(`${user.role} can not access`);
        }
        req.user = user;
        next();
    }
    catch (Err) {
        res.status(400).send("Error Occured" + Err);
    }
}

const adminAuth = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // FIXED: Use decoded.id instead of decoded.userId (matches login token structure)
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
    userAuth,
    vendorauth,
    adminAuth
};