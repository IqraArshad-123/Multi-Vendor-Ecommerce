const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const upload = require("../multer");

const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const Event = require("../model/event");
const { isSeller } = require("../middleware/auth");
const cloudinary=require('../cloudinary');

// create event

router.post(
  "/create-event",
  isSeller,
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      if(String(shopId)!==String(req.seller._id)) return next(new ErrorHandler('You can only manage your own shop events',403));
      if(!req.files?.length) return next(new ErrorHandler('Upload at least one image',400));
      if(!req.body.start_Date || !req.body.Finish_Date || new Date(req.body.Finish_Date)<=new Date(req.body.start_Date)) return next(new ErrorHandler('Choose a valid event date range',400));
      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Shop Id is invalid", 400));
      } else {
        const files = req.files;
        const imageUrls=[];
        for(const file of files) {
          const result=await new Promise((resolve,reject)=>cloudinary.uploader.upload_stream({folder:'events'},(err,result)=>err?reject(err):resolve(result)).end(file.buffer));
          imageUrls.push(result.secure_url);
        }
        const eventData = Object.fromEntries(['name','description','category','tags','originalPrice','discountPrice','stock','shopId','start_Date','Finish_Date'].map(key=>[key,req.body[key]]));
        eventData.images = imageUrls;
        eventData.shop = {_id:shop._id,name:shop.name,avatar:shop.avatar,address:shop.address,description:shop.description};

        const product = await Event.create(eventData);

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

// get all events

router.get("/get-all-events", async (req, res, next) => {
  try {
    const events = await Event.find();
    res.status(201).json({
      success: true,
      events,
    });
  } catch (error) {
    return next(new ErrorHandler(error, 400));
  }
});

// get all events of a shop

router.get(
  "/get-all-events/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const events = await Event.find({ shopId: req.params.id });

      res.status(201).json({
        success: true,
        events,
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

// delete events of a shop

router.delete(
  "/delete-shop-event/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;

      const eventData = await Event.findById(productId);

      if(!eventData) return next(new ErrorHandler('Event not found',404));
      if(String(eventData.shopId)!==String(req.seller._id)) return next(new ErrorHandler('You can only delete your own events',403));
      for(const url of eventData.images) {
        if(url.includes('/events/')) await cloudinary.uploader.destroy('events/'+url.split('/').pop().split('.')[0]);
      }

      const event = await Event.findByIdAndDelete(productId);

      if (!event) {
        return next(new ErrorHandler("Event not found with this id!", 500));
      }

      res.status(201).json({
        success: true,
        message: "Event Deleted Successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error, 400));
    }
  }),
);

module.exports = router;
