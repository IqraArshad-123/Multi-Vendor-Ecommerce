// const ErrorHandler = require("../utils/ErrorHandler");
// const catchAsyncErrors = require("./catchAsyncErrors");
// const jwt = require("jsonwebtoken");
// const User = require("../model/user");
// const Shop = require("../model/shop");

// exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
//   const { token } = req.cookies;

//   if (!token) {
//     return next(new ErrorHandler("Please login to continue", 401));
//   }

//   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//   req.user = await User.findById(decoded.id);
//   next();
// });


// exports.isSeller = catchAsyncErrors(async (req, res, next) => {
//   const { seller_token } = req.cookies;

//   if (!seller_token) {
//     return next(new ErrorHandler("Please login to continue", 401));
//   }

//   const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

//   req.seller = await Shop.findById(decoded.id);
//   next();
// });


const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

// 1. User Authentication Middleware
exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new ErrorHandler("User not found", 404));
    }

    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// 2. Seller Authentication Middleware
exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  try {
    const { seller_token } = req.cookies;

    if (!seller_token) {
      return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

    // Fetch Seller data from database
    req.seller = await Shop.findById(decoded.id);

    if (!req.seller) {
      return next(new ErrorHandler("Seller profile not found with this token", 404));
    }

    // 💡 Safe Check: Agar backend mein kahin req.user call ho rha ho seller routes pr
    req.user = req.seller; 

    next();
  } catch (error) {
    // Agar catchAsyncErrors crash kare, toh direct explicit next return trigger hoga
    return next(new ErrorHandler(error.message, 500));
  }
});