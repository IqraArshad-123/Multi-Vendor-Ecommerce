const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
// Preserve legacy image URLs through Vercel's static CDN.
fs.cpSync(path.join(root, "uploads"), path.join(root, "public"), { recursive: true });
