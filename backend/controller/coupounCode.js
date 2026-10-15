const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { isSeller } = require("../middleware/auth");
const CoupounCode = require("../model/coupounCode");

// create coupoun code

router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if (String(req.body.shop)!==String(req.seller._id)) return next(new ErrorHandler('You can only manage your own shop coupons',403));
      if (!req.body.name?.trim() || !Number.isFinite(Number(req.body.value)) || Number(req.body.value)<=0 || Number(req.body.value)>100 || Number(req.body.minAmount || 0)<0 || Number(req.body.maxAmount || 0)<0 || (Number(req.body.maxAmount)>0 && Number(req.body.maxAmount)<Number(req.body.minAmount))) return next(new ErrorHandler('Enter a valid coupon name, percentage and amount range',400));
      const isCoupounCodeExist = await CoupounCode.find({
        name: req.body.name,
      });

      if (isCoupounCodeExist.length !== 0) {
        return next(new ErrorHandler("Coupoun code already exists!", 400));
      }

      const coupounCode = await CoupounCode.create(req.body);

      res.status(201).json({
        success: true,
        coupounCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

// Get all coupons of a shop

router.get(
  "/get-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      if(req.params.id!==String(req.seller._id)) return next(new ErrorHandler('You can only view your own shop coupons',403));
      const couponCodes = await CoupounCode.find({
        shop: req.params.id,
      });

      res.status(201).json({
        success: true,
        couponCodes,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

// delete coupoun code of a shop

router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existing=await CoupounCode.findById(req.params.id);
      if(existing && String(existing.shop)!==String(req.seller._id)) return next(new ErrorHandler('You can only delete your own shop coupons',403));
      const couponCode=await CoupounCode.findByIdAndDelete(req.params.id);

      if (!couponCode) {
        return next(new ErrorHandler("Coupon code dosen't exists!", 400));
      }
      res.status(201).json({
        success: true,
        message: "Coupon code deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

// get coupon code value by its name
router.get(
  "/get-coupon-value/:name",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const couponCode = await CoupounCode.findOne({ name: req.params.name });

      res.status(200).json({
        success: true,
        couponCode,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  })
);

module.exports = router;
