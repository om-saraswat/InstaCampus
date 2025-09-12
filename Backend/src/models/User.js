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
      required: function () {
        return this.role !== "student"; // Students (OAuth) don’t need password
      },
      validate: {
        validator: function (input) {
          if (this.role !== "student" && !validator.isStrongPassword(input)) {
            return false;
          }
          return true;
        },
        message: "Password is not strong enough",
      },
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ["student", "admin", "vendor"],
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
