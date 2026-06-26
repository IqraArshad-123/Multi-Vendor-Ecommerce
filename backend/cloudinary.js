// Cloudinary wrapper.
// If the `cloudinary` package is not installed, we still want the server to boot
// (routes that use Cloudinary will throw a clear error).
let cloudinary;
try {
  cloudinary = require("cloudinary");
} catch (e) {
  console.warn(
    "[cloudinary] npm package 'cloudinary' is not installed. Cloudinary-dependent routes will fail until you install it: npm i cloudinary"
  );

  // Minimal stub with same shape used in controllers
  cloudinary = {
    uploader: {
      upload_stream: () => {
        throw new Error("Cloudinary package is not installed");
      },
      destroy: async () => {
        throw new Error("Cloudinary package is not installed");
      },
    },
    v2: {
      uploader: {
        upload_stream: () => {
          throw new Error("Cloudinary package is not installed");
        },
        destroy: async () => {
          throw new Error("Cloudinary package is not installed");
        },
      },
    },
  };
}

// Cloudinary config
if (
  cloudinary?.v2 &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (cloudinary?.v2) {
  console.warn(
    "[cloudinary] Missing CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in env. Cloudinary will not be configured."
  );
}

module.exports = cloudinary.v2 || cloudinary;


