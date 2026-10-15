const express = require("express");
const activation = require('../utils/activation');
const User = require("../model/user");
const router = express.Router();
const upload = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");
const cloudinary = require("../cloudinary");

// ========== Create User Route ==========
router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || typeof password !== 'string' || password.length < 4) return next(new ErrorHandler('Please provide a name, valid email and password of at least 4 characters',400));

    const userEmail = await User.findOne({ email });
    if (userEmail) return next(new ErrorHandler("User already exists", 400));

    let avatarUrl = "";

    if (req.file) {
      avatarUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_avatars" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          },
        );
        stream.end(req.file.buffer);
      });
    }

    const user = { name, email, password, avatar: avatarUrl };
    const activationToken = createActivationToken(user);
    const activationUrl = `${process.env.FRONTEND_URL}/activation/${activationToken}`;

    await sendMail({
      email: user.email,
      subject: "Activate Your Account",
      message: `Hello ${user.name},\n\nPlease click the link below to activate your account:\n${activationUrl}`,
    });

    res.status(201).json({
      success: true,
      message: `Please check your email (${user.email}) to activate your account!`,
    });
  } catch (err) {
    return next(new ErrorHandler(err.message, 500));
  }
});

const createActivationToken = user => activation.create(user, 'user');

// ========== Activate User Route ==========
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;

    let newUser;

    try {
      newUser = activation.read(activation_token, "user");
    } catch (err) {
      console.log("JWT ERROR:", err);

      return next(new ErrorHandler("Activation token invalid or expired", 400));
    }

    const { name, email, password, avatar } = newUser;

    let user = await User.findOne({ email });

    if (user) {
      return next(new ErrorHandler("Account already activated. Please log in.",400));
    }

    user = await User.create({
      name,
      email,
      password,
      avatar,
    });

    sendToken(user, 201, res);
  }),
);

// Login, Logout, and other routes remain same
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Please provide all fields!", 400));
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return next(new ErrorHandler("Invalid credentials", 400));
    sendToken(user, 201, res);
  }),
);

router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorHandler("User doesn't exist", 400));
    res.status(200).json({ success: true, user });
  }),
);

router.get(
  "/logout",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure:process.env.NODE_ENV?.toLowerCase()==='production',
      sameSite:process.env.NODE_ENV?.toLowerCase()==='production'?'none':'lax',
    });
    res.status(201).json({ success: true, message: "Log out successful" });
  }),
);

router.put(
  "/update-user-info",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const { email, password, phoneNumber, name } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return next(new ErrorHandler("Invalid credentials", 400));
    if (email !== user.email && await User.exists({email})) return next(new ErrorHandler('Email already in use',400));
    user.email=email;
    user.name=name;
    user.phoneNumber = phoneNumber;
    await user.save();
    res.status(201).json({ success: true, user: (()=>{const safe=user.toObject();delete safe.password;return safe;})() });
  }),
);

// ========== Update User Avatar ==========
router.put(
  "/update-avatar",
  isAuthenticated,
  upload.single("avatar"),
  catchAsyncErrors(async (req, res, next) => {
    if (!req.file)
      return next(new ErrorHandler("Please upload an image file", 400));
    const existsUser = await User.findById(req.user.id);

    const newAvatarUrl = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "user_avatars" }, (err, res) => {
          if (err) reject(err);
          else resolve(res.secure_url);
        })
        .end(req.file.buffer);
    });

    existsUser.avatar = newAvatarUrl;
    await existsUser.save();
    res.status(200).json({ success: true, user: existsUser });
  }),
);

router.put(
  "/update-user-addresses",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) => address.addressType === req.body.addressType && String(address._id) !== String(req.body._id),
      );
      if (sameTypeAddress) {
        return next(
          new ErrorHandler(`${req.body.addressType} address already exists`,400),
        );
      }

      const existsAddress = user.addresses.find(
        (address) => String(address._id) === String(req.body._id),
      );

      if (existsAddress) {
        Object.assign(existsAddress, req.body);
      } else {
        // add the new address to the array
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// delete user address
router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await User.updateOne(
        {
          _id: userId,
        },
        { $pull: { addresses: { _id: addressId } } },
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// update user password
router.put(
  "/update-user-password",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await user.comparePassword(
        req.body.oldPassword,
      );

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(
          new ErrorHandler("Password doesn't matched with each other!", 400),
        );
      }
      user.password = req.body.newPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

// find user infoormation with the userId
router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select("name avatar");

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }),
);

router.post('/forgot-password',catchAsyncErrors(async(req,res)=>{
  const email=String(req.body.email || '').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErrorHandler('Enter a valid email',400);
  const user=await User.findOne({email});
  if(user && (!user.resetPasswordTime || new Date(user.resetPasswordTime).getTime()<Date.now()+29*60000)) {
    const crypto=require('crypto');const token=crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken=crypto.createHash('sha256').update(token).digest('hex');user.resetPasswordTime=new Date(Date.now()+30*60000);await user.save();
    await sendMail({email:user.email,subject:'Reset your e-shop password',message:'Reset your password using this link within 30 minutes: '+process.env.FRONTEND_URL+'/reset-password/'+token});
  }
  res.json({success:true,message:'If this email has an account, a password reset link has been sent.'});
}));
router.post('/reset-password/:token',catchAsyncErrors(async(req,res)=>{
  const {password,confirmPassword}=req.body;
  if(typeof password!=='string'||password.length<6||password!==confirmPassword) throw new ErrorHandler('Use matching passwords of at least 6 characters',400);
  const hash=require('crypto').createHash('sha256').update(req.params.token).digest('hex');
  const user=await User.findOne({resetPasswordToken:hash,resetPasswordTime:{$gt:new Date()}});
  if(!user) throw new ErrorHandler('Reset link is invalid or expired',400);
  user.password=password;user.resetPasswordToken=undefined;user.resetPasswordTime=undefined;await user.save();res.json({success:true,message:'Password updated. Please log in.'});
}));
module.exports = router;
