// Load environment variables fron .env file
require("dotenv").config();

// Imports
const nodemailer = require("nodemailer");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

// -- Controller Functions -- //

// Configure the email transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @desc Send a new user creation notification email to the admin
// @param adminEmail - Admin's email
// @param userRequestUrl - URL for the admin to review user creation requests
const sendNewUserCreationEmail = asyncHandler(async (adminEmail, user) => {
  const API_URL = process.env.API_URL;
  const CLIENT_URL = process.env.CLIENT_URL;

  const mailOptions = {
    from: `"Ledger Lifeline" <${process.env.EMAIL_USER}>`, // Replace with app email
    to: adminEmail,
    subject: "New User Creation Request",
    html: `
        <p>Hello Admin,</p>
        <p>New user created:</p>
        <ul>
            <li>Username: ${user.username}</li>
            <li>Name: ${user.first_name} ${user.last_name}</li>
        </ul>
        <p>Please choose an action:</p>
        <a href="${CLIENT_URL}/accept-request/${user.username}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Accept</a>
        <a href="${API_URL}/admin/deny/${user.username}" style="background-color: #f44336; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; margin-left: 10px;">Deny</a>
    `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
});

const sendUserRequestResult = asyncHandler(async (reqResult, user) => {
  const CLIENT_URL = process.env.CLIENT_URL;

  let subject, message;

  if (reqResult === "accepted") {
    subject = "Your User Request Has Been Accepted";
    message = `
      <p>Hello ${user.first_name} ${user.last_name},</p>
      <p>Your request has been accepted!</p>
      <p>Login Here: <a href="${CLIENT_URL}" style="color: blue; text-decoration: none;">Login</a></p>
    `;
  } else if (reqResult === "denied") {
    subject = "Your User Request Has Been Denied";
    message = `
      <p>Hello ${user.first_name} ${user.last_name},</p>
      <p>Unfortunately, your request has been denied.</p>
    `;
  } else {
    throw new Error("Invalid request result");
  }

  const mailOptions = {
    from: `"Ledger Lifeline" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: subject,
    html: message,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
});

// @desc Send a custom email to the selected user with a given subject and message
// @param username - The username of the selected user
// @param subject - The subject of the email
// @param message - The body message of the email
const sendCustomEmailToUser = asyncHandler(async (req, res) => {
  const { user, subject, message } = req.body;

  if (!user || !user.email || !subject || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const mailOptions = {
    from: `"Ledger Lifeline" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: subject,
    html: `
      <p>${message}</p>
    `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Custom email sent successfully to ${user.username}");
  } catch (error) {
    console.error("Error sending custom email:", error);
  }
});

// @desc Send a custom email to a list of users with a given subject and message
// @param users - Array of user objects
// @param subject - The subject of the email
// @param message - The body message of the email
const sendCustomEmailToAllUsers = asyncHandler(async (req, res) => {
  const { users, subject, message } = req.body;

  if (!Array.isArray(users) || users.length === 0 || !subject || !message) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Create an array of promises for sending emails
  const sendEmails = users.map(async (user) => {
    if (!user.email) {
      console.error(`No email found for user: ${user.username}`);
      return;
    }

    const mailOptions = {
      from: `"Ledger Lifeline" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: subject,
      html: `<p>${message}</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Custom email sent successfully to ${user.username}`);
    } catch (error) {
      console.error(`Error sending custom email to ${user.username}:`, error);
    }
  });

  // Wait for all email sending promises to resolve
  await Promise.all(sendEmails);

  return res.status(200).json({ message: "Emails sent successfully" });
});

module.exports = {
  sendNewUserCreationEmail,
  sendUserRequestResult,
  sendCustomEmailToUser,
  sendCustomEmailToAllUsers,
};
