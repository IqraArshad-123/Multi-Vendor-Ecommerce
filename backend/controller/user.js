const express = require("express");
const path = require("path");
const router = express.Router();
const { upload } = require("../multer");
const User = require("../model/user.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth.js");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
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

    const user = {
      name,
      email,
      password,
      avatar: fileUrl,
    };

    const activationToken = createActivationToken(user);

    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Activate Your Account",
        message: `Hello ${user.name},\n\nPlease click the link below to activate your account:\n${activationUrl}`,
      });
      return res.status(201).json({
        success: true,
        message: `Please check your email (${user.email}) to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (err) {
    return next(new ErrorHandler(err.message, 500));
  }
});

// ========== Create Activation Token ==========
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "15m",
  });
};
// ========== Activate User Route ==========
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET,
      );

      if (!newUser) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });

      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      user = await User.create({
        name,
        email,
        password,
        avatar,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//login API

router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("User does not exist", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400),
        );
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

//load user

router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// log out user

router.get(
  "/logout",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("token", null, {
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
  }),
);

//user info update
router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400),
        );
      }

      user.name = name;
      user.email = email;
      user.phoneNumber = phoneNumber;

      await user.save();

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// ==================== UPDATE USER AVATAR ====================
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const existsUser = await User.findById(req.user.id);

      if (!req.file) {
        return next(new ErrorHandler("Please upload an image", 400));
      }

      const existAvatarPath = `uploads/${existsUser.avatar}`;

      if (fs.existsSync(existAvatarPath)) {
        fs.unlinkSync(existAvatarPath);
      }

      const fileUrl = path.join(req.file.filename);

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: fileUrl },
        { new: true },
      );

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// ==================== UPDATE / ADD USER ADDRESSES ====================
router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        return next(new ErrorHandler("User authentication failed", 401));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const { country, city, address1, address2, zipCode, addressType, _id } =
        req.body;

      if (!addressType) {
        return next(new ErrorHandler("Address type is required", 400));
      }

      if (!_id) {
        const sameTypeAddress = user.addresses.find(
          (address) => address.addressType === addressType,
        );
        if (sameTypeAddress) {
          return next(
            new ErrorHandler(`${addressType} address already exists`, 400),
          );
        }
      }

      let updatedUser;

      if (_id) {
        updatedUser = await User.findOneAndUpdate(
          { _id: userId, "addresses._id": _id },
          {
            $set: {
              "addresses.$.country": country,
              "addresses.$.city": city,
              "addresses.$.address1": address1,
              "addresses.$.address2": address2,
              "addresses.$.zipCode": zipCode,
              "addresses.$.addressType": addressType,
            },
          },
          { new: true },
        );
      } else {
        const newAddress = {
          country,
          city,
          address1,
          address2,
          zipCode,
          addressType,
        };
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { $push: { addresses: newAddress } },
          { new: true, runValidators: true },
        );
      }

      return res.status(200).json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// ==================== DELETE USER ADDRESS (SAFE FIXED) ====================
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user?._id || req.user?.id;
      const addressId = req.params.id;

      if (!userId) {
        return next(new ErrorHandler("User authentication failed", 401));
      }

      if (!addressId || addressId === "undefined" || addressId === "null") {
        return next(new ErrorHandler("Invalid or Missing Address ID!", 400));
      }

      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } },
      );

      const user = await User.findById(userId);

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// ==================== UPDATE USER PASSWORD (DIRECT MONGO UPDATE) ====================
router.put("/update-user-password", async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields!",
      });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Your session expired. Please login again!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await User.findById(decoded.id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in database!",
      });
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect!",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match with each other!",
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password should be greater than 4 characters!",
      });
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      decoded.id,
      { $set: { password: hashedPassword } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;
