// Imports
const User = require("../models/user");
const Password = require("../models/password");
const LoginAttempt = require("../models/loginAttempt");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { sendNewUserCreationEmail } = require("./emailHandler");

// -- Controller Functions -- //

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().populate("passwordHistory").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

// @desc Get single user by username
// @route GET /users/user-by-username
// @access Private
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username, type } = req.query;

  // Confirm data
  if (!username) {
    return res.status(400).json({ message: "A username is required" });
  }

  // Find user by username and populate the password field
  const user = await User.findOne({ username }).populate("password").exec();
  console.log("User:", user);
  console.log("Password:", user.password);

  if (!user && type === 0) {
    return res.status(400).json({ message: "Incorrect username or email!" });
  }
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Check if the password field is populated
  if (!user.password) {
    return res.status(400).json({ message: "Password not found" });
  }

  console.log("User password:", user.password); // Debugging log to check the password object

  if (type === 0) {
    res.json(user);
  } else {
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      role: user.role,
      active: user.active,
      question: user.securityQuestion.question,
      answer: user.securityQuestion.answer,
      password: {
        expiresAt: user.password.expiresAt, // This should now be populated
      },
    });
  }
});

// @desc Get single user by email
// @route GET /users/user-by-email
// @access Private
const getUserByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;

  // Confirm data
  if (!email) {
    return res.status(400).json({ message: "An email is required" });
  }

  // Find user by email
  const user = await User.findOne({ email }).exec();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

// @desc Get user password
// @route POST /users/login
// @access private
const userLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Confirm data
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and Password are required", success: false });
  }

  // Find user by username
  const user = await User.findOne({ username }).exec();

  // Track whether username exists
  const usernameExists = !!user;

  if (!usernameExists) {
    // Username does not exist
    return res.status(400).json({
      message: "Incorrect username or password!",
      success: false,
      type: 0,
    });
  }

  // Retrieve the current active password document
  const passwordDoc = await Password.findOne({
    user: user._id,
    isActive: true,
  }).exec();

  // Compare entered password with stored password
  const isPasswordMatch = passwordDoc
    ? await bcrypt.compare(String(password), String(passwordDoc.password))
    : false;

  if (!isPasswordMatch) {
    // Password does not match
    await newLoginAttempt({ username, successful: false });
    return res.status(400).json({
      message: "Incorrect username or password!",
      successful: false,
      type: 1,
    });
  }

  // Check if the password is expired
  const now = new Date();
  if (passwordDoc.expiresAt <= now) {
    return res
      .status(400)
      .json({
        message: "Password is expired! Please create a new password!",
        successful: false,
        type: 0,
      });
  }

  // Check if the user is active and has a valid role
  if (user.role === "Employee" && !user.active) {
    return res.status(403).json({
      message: "Innactive account, you do not have the required permissions.",
      success: false,
      type: 0,
    });
  }

  // Check if the user is suspended
  if (user.suspended.start_date && user.suspended.end_date) {
    return res.status(403).json({
      message:
        "Your account is suspended! You do not have permission to login.",
      success: false,
      type: 0,
    });
  }

  // Successful login
  await newLoginAttempt({ username, successful: true });
  return res.status(201).json({
    message: `Welcome, ${user.username}!`,
    success: true,
    user: {
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      role: user.role,
      active: user.active,
    },
  });
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const {
    password,
    first_name,
    last_name,
    email,
    address,
    dob,
    securityQuestion,
  } = req.body;

  // Confirm data
  if (
    !password ||
    !first_name ||
    !last_name ||
    !email ||
    !address.street ||
    !address.city ||
    !address.state ||
    !address.postal_code ||
    !dob ||
    !securityQuestion ||
    !securityQuestion.question ||
    !securityQuestion.answer
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Generating user's username
  const creationDate = new Date();
  const username = await generateUsername(first_name, last_name, creationDate);

  // Create and store new user
  const user = await User.create({
    username,
    first_name,
    last_name,
    email,
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
    },
    dob,
    securityQuestion: {
      question: securityQuestion.question,
      answer: securityQuestion.answer,
    },
    passwordHistory: [], // Initialize history with an empty array
    loginAttempts: [], // Initialize attemtps with an empty array
    userUpdates: [], // Initialize updates with an empty array
  });

  if (!user) {
    res.status(400).json({ message: "Invalid user data received" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // 10 salt rounds

  // Set password expiration
  const expiresAt = new Date();
  // Set expiration to 3 days from creation to test email update for password expiration
  expiresAt.setDate(expiresAt.getDate() + 90); // Adjust expiration time as needed

  // Create a new password document linked to user
  const passwordDoc = await Password.create({
    user: user._id, // Set user to created user ID
    password: hashedPwd,
    expiresAt: expiresAt,
    isActive: true,
  });

  // Update user document with reference to new password
  user.password = passwordDoc._id;
  await user.save();

  // Find admin's email
  const adminUsers = await User.find({ role: "Admin" }).lean().exec();
  if (!adminUsers || adminUsers.length === 0) {
    return res.status(500).json({ message: "Admin user not found" });
  }

  // Send email notification to each admin user
  for (const admin of adminUsers) {
    await sendNewUserCreationEmail(admin.email, user);
  }

  res.status(201).json({ message: `New user ${username} created` });
});

const generateUsername = async (firstName, lastName, creationDate) => {
  // Extract initial + last name + month + year
  const month = (creationDate.getMonth() + 1).toString().padStart(2, "0");
  const year = creationDate.getFullYear().toString().slice(-2); // Last 2 digits of the year
  let baseUsername = `${firstName[0].toLowerCase()}${lastName.toLowerCase()}${month}${year}`; // Ensure lastName is lowercase and the month is 2 digits

  let username = baseUsername;
  let suffix = 0; // Start incrementing suffix (represented by `00`)

  let duplicate = await User.exists({ username }); // Check for duplicate

  // Continue incrementing the suffix if a duplicate exists
  while (duplicate) {
    let suffixString = suffix.toString().padStart(2, "0"); // Ensures suffix is at least 2 digits
    username = baseUsername + suffixString; // Append the suffix to the username
    duplicate = await User.exists({ username }); // Check for duplicate again
    suffix++; // Increment the suffix for the next round
  }

  return username;
};

// @desc Edit user info
// @route PATCH /users/edit-user
// @access Private
const editUser = asyncHandler(async (req, res) => {
  const {
    username,
    first_name,
    last_name,
    address,
    email,
    dob,
    securityQuestion,
  } = req.body;

  // Find user by username
  const user = await User.findOne({ username }).exec();

  // Check any of the user's details have been changed, and change them if so
  if (user.first_name !== first_name) {
    user.first_name = first_name;
  }
  if (user.last_name !== last_name) {
    user.last_name = last_name;
  }
  if (user.last_name !== first_name || user.last_name !== last_name) {
    // username creation to match the newly changed user's name
    const now = new Date();
    const newUsername = await generateUsername(first_name, last_name, now);

    user.username = newUsername;
  }
  if (user.address.street !== address.street) {
    user.address.street = address.street;
  }
  if (user.address.city !== address.city) {
    user.address.city = address.city;
  }
  if (user.address.state !== address.state) {
    user.address.state = address.state;
  }
  if (user.address.postal_code !== address.postal_code) {
    user.address.postal_code = address.postal_code;
  }
  if (user.email !== email) {
    user.email = email;
  }
  if (user.dob !== dob) {
    user.dob = dob;
  }
  if (user.securityQuestion.question !== securityQuestion.question) {
    user.securityQuestion.question = securityQuestion.question;
  }
  if (user.securityQuestion.answer !== securityQuestion.answer) {
    user.securityQuestion.answer = securityQuestion.answer;
  }

  // Save the update
  const updatedUser = await user.save();

  res
    .status(201)
    .json({ message: `Updated user details for ${updatedUser.username}` });
});

// @desc Create new login attmept
// @route NO ROUTE! Called by userLogin() function
// @access Private
const newLoginAttempt = asyncHandler(async ({ username, successful }) => {
  // Find user by username
  const user = await User.findOne({ username }).exec();

  if (!user) {
    console.error(`User with username ${username} not found.`);
    return false;
  }

  // Create a new login attempt document
  const loginAttempt = await LoginAttempt.create({
    user: user._id,
    successful: successful,
  });

  if (!loginAttempt) {
    console.error("Failed to create and log login attempt");
    return false;
  }

  user.loginAttempts.push(loginAttempt._id);
  await user.save();

  // Respond with the created login attempt
  console.log("Login attempt logged");
});

// @desc Update a user's password
// @route PATCH /users/password
// @access Private
const updateUserPassword = asyncHandler(async (req, res) => {
  const { username, newPassword } = req.body;

  // Confirm data
  if (!username || !newPassword) {
    return res
      .status(400)
      .json({ meassage: "User ID and new password are required" });
  }

  // Find user by username
  const user = await User.findOne({ username }).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check if new password is the same as the current password
  const currentPasswordDoc = await Password.findById(user.password).exec();
  if (
    currentPasswordDoc &&
    bcrypt.compareSync(newPassword, currentPasswordDoc.password)
  ) {
    return res.status(400).json({
      message: "New password cannot be the same as the current password.",
    });
  }

  // Check if new password is in the user's password history
  const passwordHistory = user.passwordHistory;
  const isOldPassword = await Password.find({ _id: { $in: passwordHistory } });

  if (
    isOldPassword.some((pwd) => bcrypt.compareSync(newPassword, pwd.password))
  ) {
    return res.status(400).json({
      message: "New password cannot be the same as any previous password.",
    });
  }

  // Hash new password
  const hashedPwd = await bcrypt.hash(newPassword, 10); // 10 salt rounds

  // Set new password expiration
  const expiresAt = new Date();
  // Set expiration to 3 days from creation to test email update for password expiration
  expiresAt.setDate(expiresAt.getDate() + 90); // Adjust expiration time as needed

  // Create a new password document
  const newPasswordDoc = await Password.create({
    user: user._id, // Reference to user
    password: hashedPwd,
    expiresAt: expiresAt,
    isActive: true,
  });

  // Update old current password to inactive
  if (user.password) {
    // Fetch the old password document
    const oldPasswordDoc = await Password.findById(user.password).exec();
    if (oldPasswordDoc) {
      // Check if the current date is before the old password's expiresAt
      const currentDate = new Date();
      if (currentDate < oldPasswordDoc.expiresAt) {
        // Set old password's expiresAt to now
        oldPasswordDoc.expiresAt = currentDate;
      }

      oldPasswordDoc.isActive = false;
      await oldPasswordDoc.save();
      user.passwordHistory.push(oldPasswordDoc._id);
    }
  }

  // Update user password with new password and add to password history
  user.password = newPasswordDoc._id;
  const updatedUser = await user.save();

  res.json({
    message: `Password updated successfully for ${updatedUser.username}`,
  });
});

// @desc Update a user's role
// @route PATCH /users/role
// @access Private
const updateUserRole = asyncHandler(async (req, res) => {
  const { username, role } = req.body;

  // Confirm data
  if (!username || !role) {
    return res.status(400).json({ message: "User ID and role are required" });
  }

  // Find user by ID
  const user = await User.findOne({ username }).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Update user's role
  user.role = role;

  // Save the updated user document
  const updatedUser = await user.save();

  res.json({
    message: `User ${updatedUser.username} role updated to ${updatedUser.role}`,
  });
});

// @desc Update a user's active status
// @route PATCH /users/active
// @access Private
const updateUserActive = asyncHandler(async (req, res) => {
  const { username, isActive } = req.body;

  // Confirm data
  if (!username || isActive === undefined) {
    return res
      .status(400)
      .json({ message: "User ID and active status are required" });
  }

  // Find user by ID
  const user = await User.findOne({ username }).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Update user's active status
  user.active = isActive;

  // Save the updated user document
  const updatedUser = await user.save();

  res.json({
    message: `User ${updatedUser.username} status updated to ${isActive}`,
  });
});

// @desc Update a user's supsension status
// @route PATCH /users/suspended
// @access Private
const updateUserSuspended = asyncHandler(async (req, res) => {
  const { username, isSuspended, start, end } = req.body;

  // Confirm data
  if (!username || isSuspended === undefined) {
    return res
      .status(400)
      .json({ message: "Username and suspension status are required" });
  }

  // Find user by username
  const user = await User.findOne({ username }).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Update user's suspension status based on the isSuspended variabel
  if (isSuspended) {
    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Start and end dates are required for suspension." });
    }

    user.suspended = {
      start_date: new Date(start),
      end_date: new Date(end),
    };
  } else {
    user.suspended = undefined; // This ensures the suspended field does not exist
  }

  // Save updated user
  const updatedUser = await user.save();

  if (isSuspended) {
    res.json({ message: `User ${updatedUser.username} is suspended.` });
  } else {
    res.json({
      message: `User ${updatedUser.username} is no longer suspended.`,
    });
  }
});

module.exports = {
  getAllUsers,
  getUserByUsername,
  getUserByEmail,
  userLogin,
  createNewUser,
  editUser,
  newLoginAttempt,
  updateUserPassword,
  updateUserRole,
  updateUserActive,
  updateUserSuspended,
};
