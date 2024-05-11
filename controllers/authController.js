const User = require("../model/User");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });

  const foundUser = await User.findOne({ username }).exec();
  if (!foundUser) return res.sendStatus(401); //unauthorized

  //evaluate password and authenticate the user
  const match = await bcrypt.compare(password, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    //create JWTs (both access and refresh tokens)
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles, //we are only sending the codes of roles and not the actual keyword so as to protect the information about roles from malicious users
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30 min",
      }
    );

    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    //saving refresh token with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      //when working with thunderclient, we need to comment this out else the cookie wont work and endpoint too
      // secure: "true", //this option works for dev env too (where we have http instead of https), not just for production
      maxAge: 24 * 60 * 60 * 1000, //maxAge and/or expiration props can be skipped when clearing a cookie
    }); //the cookie is always sent with every request, http cookies are not 100 percent secure, but its better than storing in local storage
    res.json({ accessToken }); //avoid storing this in cookies which can be accessed with js, and in local storage or session storage
  } else {
    res.sendStatus(401); //unauthorized
  }
};

module.exports = { handleLogin };
