require("dotenv").config();
const express = require("express");
const app = express();
const connectdb = require("./configs/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");

// CORS configuration - MUST be before routes
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://insta-campus-lac.vercel.app/',
      'https://insta-campus-blush.vercel.app' // Replace with your actual frontend URL // Add all your frontend URLs
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This is CRITICAL - allows cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Route definitions
const authRouter = require("./router/authRouter");
app.use("/auth", authRouter);

const userRouter = require("./router/userRoute");
app.use("/user", userRouter);

const productRouter = require("./router/productRoute");
app.use("/product", productRouter);

const orderRouter = require("./router/orderRouter");
app.use("/order", orderRouter);

const cartRouter = require("./router/cartRouter");
app.use("/cart", cartRouter);

const vendorRouter = require("./router/vendorRouter");
app.use("/vendor", vendorRouter);

const inventoryRouter = require("./router/inventoryrouter");
app.use("/inventory", inventoryRouter);

const PORT = process.env.PORT || 5000;

connectdb()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
  })
  .catch((err) => console.log("❌ Database error:", err));
