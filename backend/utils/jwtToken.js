// const sendToken = (user, statusCode, res) => {
//   const token = user.getJwtToken();

//   const options = {
//     expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
//     httpOnly: true,
//   };

//   res.status(statusCode).cookie("token", token, options).json({
//     success: true,
//     user,
//     token,
//   });
// };

// module.exports = sendToken;

const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,

    sameSite: "lax",   // 🔥 REQUIRED for cross-origin (3000 ↔ 8000)
    secure: false,    // 🔥 localhost ke liye false
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
    });
};

module.exports = sendToken;
