const ROLES_LIST = require("../config/roles_list");
const User = require("../model/User");

const updateRolesOfAUser = async (req, res) => {
  if (!req?.params?.id && !req?.body?.roles && req?.body?.roles?.length > 0) {
    return res
      .status(400)
      .json({ message: "User id and Roles to be assigned are required." });
  }

  const user = await User.findOne({ _id: req.params.id }).exec();

  if (!user) {
    return res
      .status(204)
      .json({ message: `User with id ${req.params.id} not found.` });
  }

  const { roles } = req.body;
  const newRolesObj = { ...user.roles };
  roles.forEach((role) => {
    if (role in ROLES_LIST) {
      newRolesObj[role] = ROLES_LIST[role];
    }
  });

  user.roles = { ...newRolesObj };

  const result = await user.save();

  res.json(result);
};

const deleteRolesOfAUser = async (req, res) => {
  if (!req?.params?.id && !req?.body?.roles && req?.body?.roles?.length > 0) {
    return res
      .status(400)
      .json({ message: "User ID and Roles to be assigned are required." });
  }

  const user = await User.findOne({ _id: req.params.id }).exec();

  if (!user) {
    return res
      .status(204)
      .json({ message: `User with ID ${req.params.id} not found.` });
  }

  const { roles } = req.body;
  const newRolesObj = { ...user.roles };
  roles.forEach((role) => {
    if (role in ROLES_LIST) {
      delete newRolesObj[role];
    }
  });

  user.roles = { ...newRolesObj };
  const result = await user.save();

  res.json(result);
};

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) {
    return res.status(204).json({ message: "No users found." });
  }

  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "User ID required." });
  }
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User with ID ${req.body.id} not found.` });
  }
  const result = await User.deleteOne({ _id: req.body.id });
  res.json(result);
};

const getUserById = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "User ID required." });
  }

  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User with ID ${req.body.id} not found.` });
  }

  res.json(user);
};

module.exports = {
  updateRolesOfAUser,
  deleteRolesOfAUser,
  getAllUsers,
  deleteUser,
  getUserById,
};
