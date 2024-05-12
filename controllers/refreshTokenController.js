const jwt = require("jsonwebtoken");
const User = require("../model/User");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);
  //need to check for the difference between using sendStatus and status
  console.log(cookies.jwt);
  const refreshToken = cookies.jwt;

  //clear the received cookie of refresh token as part of the Refresh token rotation process
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: "true",
  });

  //even though we changed the data type of refresh token in user model to be an array of strings, we dont need to change the way we query for the user with matching refresh token and mongodb and mongoose handle it internally
  const foundUser = await User.findOne({ refreshToken }).exec();

  //this will be a reuse detection situation
  //Detected refresh token reuse
  if (!foundUser) {
    //here we decode the refresh token to try find the associated user and if found we then delete all the current refresh tokens of the user
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403);
        console.log("attempted refresh token reuse!");
        const hackedUser = await User.findOne({
          username: decoded.username,
        }).exec();
        hackedUser.refreshToken = []; //the refresh token field was made an array to store tokens from logins across multiple machines/devices
        const result = await hackedUser.save();
        console.log(result);
      }
    );
    return res.sendStatus(403); //forbidden
  }

  const newRefreshTokenArray = foundUser.refreshToken.filter(
    (rt) => rt !== refreshToken
  );

  //evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        console.log("expired refresh token");
        foundUser.refreshToken = [...newRefreshTokenArray];
        const result = await foundUser.save();
        console.log(result);
      }
      if (err || foundUser.username !== decoded.username) {
        //the condition of foundUser.username !== decoded.username is not required as becuase if we have found the user corresponding to the refresh token then even we decoding the refresh token it will give the same users username and not something different
        return res.status(403).json({ message: "Invalid token." });
      }

      //Refresh token was still valid
      const roles = Object.values(foundUser.roles);
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: decoded.username,
            roles: roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "30 min",
        }
      );

      const newRefreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1d",
        }
      );

      //saving refresh token with current user
      foundUser.refreshToken = [...newRefreshToken, newRefreshToken];
      const result = await foundUser.save();

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    }
  );
};

module.exports = { handleRefreshToken };
