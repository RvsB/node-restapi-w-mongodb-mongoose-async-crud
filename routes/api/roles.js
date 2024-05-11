const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/:id")
  .put(verifyRoles(ROLES_LIST.Admin), usersController.updateRolesOfAUser)
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteRolesOfAUser);

module.exports = router;
