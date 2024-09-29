// Imports
const User = require("../models/user");
const Password = require("../models/password");
const LoginAttempt = require("../models/loginAttempt");
const asyncHandler = require("express-async-handler");

// -- Controller Functions -- //

// @desc Get all users
// @route GET /event-log/loginAttmepts
const getAllLoginAttempts = asyncHandler(async (req, res) => {
  const loginAttempts = await LoginAttempt.find().lean();
  res.json(loginAttempts);
});
