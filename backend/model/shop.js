// const mongoose = require("mongoose");


// const shopSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, "Please enter your shop name!"],
//   },
//   email: {
//     type: String,
//     required: [true, "Please enter your shop email address!"],
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: [true, "Please enter your password"],
//     minLength: [4, "Password should be greater than 4 characters"],
//     select: false,
//   },
//   phoneNumber: {
//     type: Number,
//     required: true,
//   },
//   address: {
//     type: String,
//     required: true,

//   },
//   description: {
//     type: String,
//   },
//   role: {
//     type: String,
//     default: "Seller",
//   },
//   avatar: {
//     type: String,
//     required: true,
//   },
//   zipCode: {
//     type: Number,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now(),
//   },
//   resetPasswordToken: String,
//   resetPasswordTime: Date,
// });

// //  Hash password
// shopSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }

//   this.password = await bcrypt.hash(this.password, 10);
// });

// // jwt token
// shopSchema.methods.getJwtToken = function () {
//   return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
//     expiresIn: process.env.JWT_EXPIRES,
//   });
// };

// // compare password
// shopSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };


// module.exports = mongoose.model("Shop", shopSchema);


const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your shop name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: String,
  role: {
    type: String,
    default: "Seller",
  },
  avatar: {
    type: String,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// 🔐 Hash password
shopSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// 🔑 JWT token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// 🔁 Compare password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Shop", shopSchema);

