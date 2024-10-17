const express = require("express");
const router = express.Router();
const errorMessageController = require("../controllers/errorMessageController");

// router to get all errors and create new error messages
router
    .route("/")
    .get(errorMessageController.getAllErrors)
    .post(errorMessageController.createNewError);

module.exports = router;