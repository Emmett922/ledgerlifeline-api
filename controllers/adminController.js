// Imports
const User = require("../models/user");
const Password = require("../models/password");
const UpdateUser = require("../models/userUpdate");
const asyncHandler = require("express-async-handler");
const path = require("path");
const { sendUserRequestResult } = require("./emailHandler");

// -- Controller Fuunctions -- //

// @desc Accept a user creation request
// @route PATCH /admin/accept
// @access Private
const acceptUserRequest = asyncHandler(async (req, res) => {
  const { username, role, adminUser } = req.body;

  if (!role || !["Admin", "Manager", "Accountant"].includes(role)) {
    return res.status(400).json({
      message:
        "Role is required and must be on of Admin, Manager, or Accountant",
    });
  }

  // Find the user
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Update user's role and mark as active
  user.role = role;
  user.active = true;
  user.createdBy = adminUser;

  console.log(adminUser);

  const updateUserDoc = await UpdateUser.create({
    user: user._id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    address: user.address,
    dob: user.dob,
    securityQuestion: user.securityQuestion,
    role: user.role,
    active: user.active,
    suspended: user.suspended,
    updatedBy: adminUser,
  });
  const currentDate = new Date();
  user.createdAt = currentDate;
  user.updatedAt = currentDate;
  user.userUpdates.push(updateUserDoc._id);
  await user.save();

  // Send email to the user notifying them of acceptance
  await sendUserRequestResult("accepted", user);

  res.json({ message: `User ${username} accepted and assigned role ${role}.` });
});

// @desc Deny a user creation request
// @route GET /admin/deny/:username
// @access Private
const denyUserRequest = asyncHandler(async (req, res) => {
  const { username } = req.params;

  console.log(`Denying user request for ${req.params.username}`);

  // Find the user and delete
  const user = await User.findOneAndDelete({ username });
  // Send email to the user notifying them of acceptance
  await sendUserRequestResult("denied", user);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.role !== "Employee") {
    return res.status(404).json({ message: "User request already handled" });
  }

  // Delete user password
  await Password.deleteMany({ user: user._id });

  // Render the success page
  res.sendFile(path.join(__dirname, "../views", "requestDenied.html"));
});

module.exports = {
  acceptUserRequest,
  denyUserRequest,
};
