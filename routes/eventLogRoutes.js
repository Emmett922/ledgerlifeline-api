const express = require("express");
const router = express.Router();
const eventLogs = require("../controllers/eventLogsController");

router.route("/login-attempts").get(eventLogs.getAllLoginAttempts);

router.route("/user-updates").get(eventLogs.getAllUserUpdates);

router.route("/account-updates").get(eventLogs.getAllAccountUpdates);

module.exports = router;