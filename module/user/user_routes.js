const express = require("express");
const router = express.Router();
const userController = require("./user_controller.js");
const verifyToken = require("../../middleware/authMiddleware");

// Login user
router.post("/login", userController.login);

// Register user
router.post("/register", verifyToken, userController.register);

// User modification route (protected with verifyToken)
router.put("/modifyUser/:userId", verifyToken, userController.modifyUser);

// User list route
router.get("/allUsers", verifyToken, userController.getUserList);

// Change password route
router.put(
  "/changePassword/:username",
  verifyToken,
  userController.changePassword
);

// Change password route
router.put(
  "/agentchangePassword/:username",
  userController.agentChangePassword
);

// Edit user details route
router.put(
  "/editUserDetails/:userId",
  verifyToken,
  userController.editUserDetails
);

module.exports = router;
