const mongoose = require("mongoose");

let connectionPromise;
const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connectionPromise) {
    const uri = process.env.DB_URL || (!process.env.VERCEL && "mongodb://127.0.0.1:27017/e-shop");
    if (!uri) throw new Error("DB_URL is required");
    connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }
  return connectionPromise;
};

module.exports = connectDatabase;
