// Vercel's Express entry point. Railway/local development still uses backend/server.js.
const express = require("express");
const app = express();
app.use(require("./backend/app"));
module.exports = app;
