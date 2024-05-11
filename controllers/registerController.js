const User = require("../model/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  if (!username || !password)
    return res
      .status(400) //bad request
      .json({ message: "Username and password are required." });

  //check for duplicate usernames in the db
  const duplicate = await User.findOne({ username }).exec();
  if (duplicate) return res.sendStatus(409); //this status code tells us that there was a conflict

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10); //10 represents the number of salting rounds to do

    //create and store the new user
    const result = await User.create({
      username: username,
      password: hashedPassword,
    });

    //result is the record that was created and we will log it out
    console.log(result);

    res.status(201).json({ success: `New user ${username} created!` }); //201 status code tells us that the resource was created
  } catch (error) {
    res.status(500).json({ message: error.message }); //500 tells us that there was a internal server error
  }
};

module.exports = { handleNewUser };
