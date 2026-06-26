const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const upload = require("../multer");

const Shop = require("../model/shop");
const Order = require("../model/order");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const fs = require("fs");
const cloudinary = require("../cloudinary");


// ============================================================
// 1. Create Product Route (Cloudinary Upload Stream)
// ============================================================
router.post(
  "/create-product",
  upload.array("images"), // multer array for multiple images
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);

      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid", 400));
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return next(new ErrorHandler("Please upload at least one product image", 400));
      }

      // Multiple images ko Cloudinary par upload krny ka loop
      const imagesLinks = [];
      for (const file of files) {
        try {
          const resultUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products" }, // Cloudinary par "products" ka folder banega
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            stream.end(file.buffer);
          });
          imagesLinks.push(resultUrl); // Har image ka link array mn add hoga
        } catch (uploadError) {
          console.error("Single product image upload failed:", uploadError);
          return next(new ErrorHandler("Failed to upload product images", 500));
        }
      }

      // Product ka saara data samait images links k save krien
      const productData = req.body;
      productData.images = imagesLinks; // DB mn online links save hon gy
      productData.shop = shop;

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      console.error("Create product error:", error);
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// ============================================================
// 2. Get All Products of a Shop
// ============================================================
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ============================================================
// 3. Delete Product Route (Cloudinary Destroy Integration)
// ============================================================
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const productData = await Product.findById(productId);

      if (!productData) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      // Cloudinary sy product ki saari images loop chala kr delete krien
      if (productData.images && productData.images.length > 0) {
        for (const imageUrl of productData.images) {
          try {
            // URL sy public_id extract krna (e.g., products/abc123xyz)
            const imageId = imageUrl.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`products/${imageId}`);
          } catch (delError) {
            console.error("Cloudinary product image deletion failed:", delError);
          }
        }
      }

      // Database sy product ko delete krien
      const product = await Product.findByIdAndDelete(productId);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Product Deleted Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// ============================================================
// 4. Get All Products (For Home / Search Page)
// ============================================================
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find();

      res.json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

// ============================================================
// 5. Review for a Product
// ============================================================
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { rating, comment, productId, orderId } = req.body;

      if (!productId || !orderId || typeof rating === "undefined") {
        return res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (!product.reviews) {
        product.reviews = [];
      }

      const reviewUser = {
        _id: req.user._id,
        name: req.user.name || "Anonymous",
        avatar: req.user.avatar?.url || req.user.avatar || "",
      };

      const newReview = {
        user: reviewUser,
        rating: Number(rating),
        comment: comment || "",
        productId,
      };

      const existingReviewIndex = product.reviews.findIndex(
        (rev) =>
          rev && rev.user && String(rev.user._id) === String(req.user._id)
      );

      if (existingReviewIndex !== -1) {
        product.reviews[existingReviewIndex].rating = Number(rating);
        product.reviews[existingReviewIndex].comment = comment || "";
      } else {
        product.reviews.push(newReview);
      }

      const total = product.reviews.reduce(
        (sum, rev) => sum + Number(rev?.rating || 0),
        0
      );
      product.ratings = product.reviews.length
        ? total / product.reviews.length
        : 0;
      product.numOfReviews = product.reviews.length;

      await product.save({ validateBeforeSave: false });

      await Order.updateOne(
        {
          _id: orderId,
          $or: [{ "cart._id": productId }, { "cart.productId": productId }],
        },
        { $set: { "cart.$[elem].isReviewed": true } },
        {
          arrayFilters: [
            {
              $or: [{ "elem._id": productId }, { "elem.productId": productId }],
            },
          ],
          upsert: false,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Reviewed successfully!",
        reviews: product.reviews,
      });
    } catch (error) {
      console.error("create-new-review error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error in review submission",
      });
    }
  })
);

module.exports = router;