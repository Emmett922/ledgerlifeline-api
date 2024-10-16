// Imports
const LoginAttempt = require("../models/loginAttempt");
const AccountUpdate = require("../models/accountUpdate");
const UserUpdate = require("../models/userUpdate");
const asyncHandler = require("express-async-handler");

// -- Controller Functions -- //

// @desc Get all Login Attempts
// @route GET /event-log/login-attempts
// @access Private
const getAllLoginAttempts = asyncHandler(async (req, res) => {
  const loginAttempts = await LoginAttempt.find()
    .populate("user", "username")
    .lean();
  if (!loginAttempts?.length) {
    return res.status(400).json({ message: "No login attempts found!" });
  }
  res.json(loginAttempts);
});

// @desc Get all User Updates
// @route GET /event-log/user-updates
// @access Private
const getAllUserUpdates = asyncHandler(async (req, res) => {
  try {
    const userUpdates = await UserUpdate.find().lean();
    console.log("Fetched user updates:", userUpdates); // Log the result
    if (!userUpdates.length) {
      return res.status(404).json({ message: "No user updates found!" });
    }
    res.status(200).json(userUpdates);
  } catch (error) {
    console.error("Error retrieving user updates:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc Get all Account Updates
// @route GET /event-log/account-updates
// @access Private
const getAllAccountUpdates = asyncHandler(async (req, res) => {
  const accountUpdates = await AccountUpdate.find().lean();
  if (!accountUpdates?.length) {
    return res.status(400).json({ message: "No account updates found!" });
  }
  res.json(accountUpdates);
});

// @desc Get account updates by account id
// @route GET /event-log/account-updates-by-id
// @access Private
const getAccountUpdatesById = asyncHandler(async (req, res) => {
  const { id } = req.query;
  console.log("Received ID:", id);

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "An account id is required!" });
  }

  const accountUpdates = await AccountUpdate.find({ account: id }).exec();

  if (!accountUpdates || accountUpdates.length === 0) {
    return res.status(404).json({ message: "No account updates found for this account." });
  }

  res.json(accountUpdates);
});

module.exports = {
  getAllLoginAttempts,
  getAllUserUpdates,
  getAllAccountUpdates,
  getAccountUpdatesById
};
