const mongoose = require("mongoose")

const connectdb = async() =>{
    await mongoose.connect(process.env.MONGODB_URI);
}
module.exports = connectdb;
