const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { upload } = require("../multer");
const sendMail = require("../utils/sendMail");
const sendToken = require("../utils/jwtToken");
const Shop = require("../model/shop");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

router.post("/create-shop", upload.single("file"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const sellerEmail = await Shop.findOne({ email });

    if (sellerEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("User already exists", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);

    const seller = {
      name: req.body.name,
      email: email,
      password: req.body.password,
      avatar: fileUrl,
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
    expiresIn: "15m", // 15 minutes for testing
  });
};

// ========== Activate User Route ==========
// router.post(
//   "/activation",
//   catchAsyncErrors(async (req, res, next) => {
//     try {
//       const { activation_token } = req.body;

//       const newSeller = jwt.verify(
//         activation_token,
//         process.env.ACTIVATION_SECRET
//       );

//       if (!newSeller) {
//         return next(new ErrorHandler("Invalid token", 400));
//       }
//       const { name, email, password, avatar, zipCode, address, phoneNumber } = newSeller;

//       let seller = await Shop.findOne({ email });

//       if (seller) {
//         return next(new ErrorHandler("User already exists", 400));
//       }

//       seller = await Shop.create({
//         name,
//         email,
//         password,
//         avatar,
//         zipCode,
//         address,
//         phoneNumber,
//       });

//       sendToken(seller, 201, res);
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   })
// );

router.post("/activation", catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;

    try {
        const newSeller = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

        const { name, email, password, avatar, zipCode, address, phoneNumber } = newSeller;

        let seller = await Shop.findOne({ email });
        if(seller) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        seller = await Shop.create({ name, email, password, avatar, zipCode, address, phoneNumber });

        sendToken(seller, 201, res);

    } catch (err) {
        if(err.name === "TokenExpiredError") {
            return res.status(400).json({ success: false, message: "Your token has expired!" });
        }
        return res.status(400).json({ success: false, message: err.message });
    }
}));


module.exports = router;
