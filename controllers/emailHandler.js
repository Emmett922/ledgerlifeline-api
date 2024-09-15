// Imports
const nodemailer = require('nodemailer')
const asyncHandler = require('express-async-handler')

// -- Controller Functions -- //

// Configure the email transporter using SMTP
const transporter = nodemailer.createTransport({
    host: 'stmp.example.com',
    port: 465,
    secure: true,
    auth: {
        user: 'your-email@example.com', // Replace with your email
        pass: 'your-email-password' // Replace with your email password or app-specific password
    }
})

// @desc Send a new user creation notification email to the admin
// @param adminEmail - Admin's email
// @param userRequestUrl - URL for the admin to review user creation requests
const sendNewUserCreationEmail = asyncHandler(async (adminEmail, userRequestUrl) => {
    const mailOptions = {
        from: '"Your App Name" <your-email@example.com>', // Replace with app email
        to: adminEmail,
        subject: 'New User Creation Request',
        html: `
            <p>Hello Admin,</p>
            <A new user has registered and is awaiting approval. Click the link below to review the request:</p>
            <a href="${userRequestUrl}">${userRequestUrl}</a>
        `
    }

    // Send the email
    await transporter.sendMail(mailOptions)
})

module.exports = {
    sendNewUserCreationEmail
}