const User = require("../model/User");

const handleLogout = async (req, res) => {
  //this will handle the deletion of the token on the backend on logout, but
  //we need to delete the access token on the client side too

  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //this means its successfull and there is no content to send back
  const refreshToken = cookies.jwt;

  //Is refreshToken in db?

  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: "true",
      // maxAge: 24 * 60 * 60 * 1000, //maxAge and/or expiration props can be skipped when clearing a cookie
    });
    return res.sendStatus(204);
  }

  //Delete the refresh token in DB
  foundUser.refreshToken = "";
  const result = await foundUser.save();
  console.log(result);

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: "true",
    // maxAge: 24 * 60 * 60 * 1000, //maxAge and/or expiration props can be skipped when clearing a cookie
  });

  res.sendStatus(204);
};

module.exports = { handleLogout };
