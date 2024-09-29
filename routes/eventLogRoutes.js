const express = require("express");
const router = express.Router();
const eventLogController = require("../controllers/eventLogController");

// Getting Login Attempts route
router.route("/login-attempts").get(eventLogController.getAllLoginAttempts);

// Getting user changes route

module.exports = router;
