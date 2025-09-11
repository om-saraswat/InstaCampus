const mongoose = require("mongoose")
const validator = require("validator")

const UserSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        minLength : 2,
    },
    emailid : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        validate(input){
            if(!validator.isEmail(input)){
                throw new Error("Email is not Correct");
            }
        }
    },
    password : {
        type : String,
        required : true,
        validate(input){
            if(!validator.isStrongPassword(input)){
                throw new Error("Password is not strong enough ")
            }
        }
    },
    role : {
        type : String,
        required : true,
        enum : {
            values: ["student","admin" ,"vendor"],
            message : "{VALUE} is not valid role type"
        }
    }

},{Timestamp:true});

const userModel = mongoose.model("user",UserSchema);

module.exports = userModel