const express = require("express");
const router = express.Router();
const emailHandler = require("../controllers/emailHandler");

// Custom email to single user
router.route("/send-custom-email").post(emailHandler.sendCustomEmailToUser);

// Custom email to all users
router
  .route("/send-email-to-all-users")
  .post(emailHandler.sendCustomEmailToAllUsers);

module.exports = router;
