const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Provide Name"],
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please Provide Email"],
      validate: {
        validator: validator.isEmail,
        message: "Please Provide a Valid Email",
      }, // custom validator
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Provide Password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const genSalt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, genSalt);
}); // hash the password before the user schema doc is saved to mongoDB

userSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
}; // comparing the user password with the password created by the user during registration when you want to Login

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
