// Imports
const Password = require("../models/password");
const LoginAttempt = require("../models/loginAttempt");
const Account = require("../models/accounts");
const asyncHandler = require("express-async-handler");

// -- Controller Functions -- //

// @desc Get all users
// @route GET /event-log/loginAttmepts
const getAllLoginAttempts = asyncHandler(async (req, res) => {
  const loginAttempts = await LoginAttempt.find().lean();
  res.json(loginAttempts);
});

module.exports = {
  getAllLoginAttempts,
};
