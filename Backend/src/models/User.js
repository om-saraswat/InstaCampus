const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (input) => validator.isEmail(input),
        message: "Email is not correct",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (input) {
          return validator.isStrongPassword(input, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 0,
            minNumbers: 0,
            minSymbols: 0
          });
        },
        message: "Password must be at least 6 characters long",
      },
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["student", "admin", "stationary-vendor", "canteen-vendor"],
        message: "{VALUE} is not valid role type",
      },
    },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;