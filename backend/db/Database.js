const mongoose = require("mongoose");

const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URL || "mongodb://127.0.0.1:27017/e-shop")

    .then((data) => {
      console.log(`MongoDB connected with server: ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
