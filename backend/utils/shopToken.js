const sendShopToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const isProduction = process.env.NODE_ENV === "PRODUCTION";

  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  };

  res
    .status(statusCode)
    .cookie("seller_token", token, options)
    .json({
      success: true,
      user,
    });
};

module.exports = sendShopToken;
