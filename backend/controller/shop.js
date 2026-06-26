const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const upload = require("../multer");

const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendShopToken = require("../utils/shopToken");
const { isSeller } = require("../middleware/auth");
const cloudinary = require("../cloudinary");


// ============================================================
// 1. Create Shop Route (Cloudinary Integration)
// ============================================================
router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      return next(new ErrorHandler("User already exists", 400));
    }

    if (!req.file) {
      return next(new ErrorHandler("Please upload a logo/avatar for your shop", 400));
    }

    // Logo image ko Cloudinary pr upload krien (Buffer Stream k zariye)
    let shopAvatarUrl = "";
    try {
      shopAvatarUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "shops" }, // Cloudinary pr "shops" ka folder banega
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(req.file.buffer);
      });
    } catch (cloudError) {
      console.error("Cloudinary shop register upload failed:", cloudError);
      return next(new ErrorHandler("Failed to upload shop avatar", 500));
    }

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: shopAvatarUrl, // Online Cloudinary URL save hoga
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      zipCode: req.body.zipCode,
    };

    const activationToken = createActivationToken(seller);
    const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate Your Shop",
        message: `Hello ${seller.name},\n\nPlease click the link below to activate your shop:\n${activationUrl}`,
      });
      return res.status(201).json({
        success: true,
        message: `Please check your email (${seller.email}) to activate your shop!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// ========== Create Activation Token ==========
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "15m",
  });
};

// ========== Activate User Route ==========
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar, zipCode, address, phoneNumber } =
        newSeller;

      let seller = await Shop.findOne({ email });

      if (seller) {
        return next(new ErrorHandler("User already exists", 400));
      }

      seller = await Shop.create({
        name,
        email,
        password,
        avatar,
        zipCode,
        address,
        phoneNumber,
      });

      sendShopToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ========== Login Shop ==========
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Shop.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Shop does not exist", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ========== Load Shop ==========
router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller.id);

      if (!seller) {
        return next(new ErrorHandler("Seller doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ========== Log Out From Shop ==========
router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });

      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ========== Get Shop Info ==========
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      res.status(201).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================================================
// 2. Update Shop Profile Pic (Cloudinary Integration)
// ============================================================
router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const sellerId = req.seller?._id || req.seller?.id;
      
      if (!sellerId) {
        return next(new ErrorHandler("Authentication failed. No seller ID found.", 400));
      }

      const existsUser = await Shop.findById(sellerId);

      if (!existsUser) {
        return next(new ErrorHandler("Seller not found in database", 404));
      }

      if (!req.file) {
        return next(new ErrorHandler("Please upload an image file", 400));
      }

      // 1. Agar shop ka pehle sy avatar hai to usay Cloudinary sy delete krien
      if (existsUser.avatar && existsUser.avatar.includes("cloudinary")) {
        try {
          const imageId = existsUser.avatar.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`shops/${imageId}`);
        } catch (delError) {
          console.log("Old shop avatar delete error (Ignored safely):", delError.message);
        }
      }

      // 2. Nayi image ko Cloudinary pr upload krien
      let newAvatarUrl = "";
      try {
        newAvatarUrl = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "shops" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(req.file.buffer);
        });
      } catch (cloudError) {
        console.error("Cloudinary shop avatar update failed:", cloudError);
        return next(new ErrorHandler("Failed to upload new avatar", 500));
      }

      // 3. DB mn URL update krien
      await Shop.findByIdAndUpdate(sellerId, {
        avatar: newAvatarUrl
      });

      const updatedSeller = await Shop.findById(sellerId);

      res.status(200).json({
        success: true,
        seller: updatedSeller,
      });
    } catch (error) {
      console.error("--- UPDATE AVATAR ERROR LOG ---", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// ========== Update Seller Info ==========
router.put(
  "/update-seller-info",
  isSeller,
  async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;
      const sellerId = req.seller?._id || req.seller?.id;

      if (!sellerId) {
        return next(new ErrorHandler("Authentication failed. No seller ID found.", 400));
      }

      const updatedShop = await Shop.findByIdAndUpdate(
        sellerId,
        {
          name,
          description,
          address,
          phoneNumber,
          zipCode,
        },
        { new: true, runValidators: true } 
      );

      if (!updatedShop) {
        return next(new ErrorHandler("Shop not found", 400));
      }

      res.status(201).json({
        success: true,
        shop: updatedShop,
      });
    } catch (error) {
      console.error("--- UPDATE SELLER INFO ERROR LOG ---", error);
      return next(new ErrorHandler(error.message, 500));
    }
  }

);

module.exports = router;