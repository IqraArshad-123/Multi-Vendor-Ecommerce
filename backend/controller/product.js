const express = require("express");
const router = express.Router();
const Product = require("../model/product");
const { upload } = require("../multer");
const Shop = require("../model/shop");
const Order = require("../model/order");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller, isAuthenticated } = require("../middleware/auth");
const fs = require("fs");

// create product

router.post(
  "/create-product",
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid", 400));
      } else {
        const files = req.files;
        const imageUrls = files.map((file) => `${file.filename}`);
        const productData = req.body;
        productData.images = imageUrls;
        productData.shop = shop;

        const product = await Product.create(productData);

        res.status(201).json({
          success: true,
          product,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

// get all products of a shop

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
  }),
);

// delete product of a shop

router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const productData = await Product.findById(productId);

      productData.images.forEach((imageUrl) => {
        const filename = imageUrl;
        const filePath = `uploads/${filename}`;

        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      });

      const product = await Product.findByIdAndDelete(productId);

      console.log(product.images);
      if (!product) {
        return next(new ErrorHandler("Product not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Product Deleted Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

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
  }),
);

// review for a product
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
          rev && rev.user && String(rev.user._id) === String(req.user._id),
      );

      if (existingReviewIndex !== -1) {
        product.reviews[existingReviewIndex].rating = Number(rating);
        product.reviews[existingReviewIndex].comment = comment || "";
      } else {
        product.reviews.push(newReview);
      }

      const total = product.reviews.reduce(
        (sum, rev) => sum + Number(rev?.rating || 0),
        0,
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
        },
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
  }),
);
module.exports = router;
