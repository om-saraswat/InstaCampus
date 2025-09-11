require("dotenv").config();
const express = require("express")
const app = express();
const connectdb = require("./configs/database")


app.listen(7777,()=>{
    connectdb();
    console.log("I am listing brother")
})