require("dotenv").config();
const express = require("express");
const app = express();
const connectdb = require("./configs/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const axios = require("axios");

app.use(cookieParser());
app.use(express.json());




const authRouter = require("./router/authRouter");
app.use("/auth", authRouter);

const userRouter = require("./router/userRoute");
app.use("/user", userRouter);

const productRouter = require("./router/productRoute");
app.use("/product",productRouter);

const orderRouter = require("./router/orderRouter");
app.use("/order",orderRouter);
const PORT = process.env.PORT || 5000;

connectdb()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => console.log("🚀 Server running on port", PORT));
  })
  .catch((err) => console.log("❌ Database error:", err));
