const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  // Fix: use `err`, not `error`
  if(process.env.NODE_ENV !== "production" && !err.statusCode) console.error(err.name || "Request error");

  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong MongoDB ObjectId error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    const message = `Duplicate key: ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

  // Invalid JWT
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    err = new ErrorHandler(message, 400);
  }

  // Expired JWT
  if (err.name === "TokenExpiredError") {
    const message = "Token has expired. Please log in again.";
    err = new ErrorHandler(message, 400);
  }

  if(err.name === 'ValidationError') err = new ErrorHandler(Object.values(err.errors).map(item=>item.message).join('; '),400);
  if(err.name === 'MulterError') err = new ErrorHandler('Upload too large. Please use smaller images.',400);
  // Final response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
