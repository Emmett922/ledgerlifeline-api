const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Accept user creation request
router.route("/accept/").patch(adminController.acceptUserRequest);

// Deny user creation request
router.route("/deny/:username").get(adminController.denyUserRequest);

module.exports = router;
