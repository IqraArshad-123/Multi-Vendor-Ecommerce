const app = require("./app");
const connectDatabase = require("./db/Database");

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down due to uncaught exception`);
});
// Cloudinary is optional during development; avoid crashing if the package/env is missing.
const cloudinary = (() => {
  try {
    return require("./cloudinary");
  } catch (e) {
    return null;
  }
})();

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "backend/config/.env",
  });
}

// Connect DB
connectDatabase();

// create server
const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT || 8000}`);
});

//unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the srever for ${err.message}`);
  console.log(`Shutting down due to unhandle promise rejection`);

  server.close(() => {
    process.exit(1);
  });
});
