// Imports
const User = require('../models/user')
const Password = require('../models/password')
const LoginAttempt = require('../models/loginAttempt')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

// -- Controller Functions -- //

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }
    res.json(users)
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, first_name, last_name, address, dob, securityQuestion, password } = req.body

    // Confirm data
    if (!username || !password|| !first_name || !last_name || !address || !dob || !securityQuestion || !securityQuestion.question || !securityQuestion.answer) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec()

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Create and store new user
    const user = await User.create({
        username,
        first_name,
        last_name,
        address,
        dob,
        securityQuestion: {
            question: securityQuestion.question,
            answer: securityQuestion.answer
        },
        passwordHistory: [], // Initialize history with an empty array
        loginAttempts: [] // Initialize attemtps with an empty array
    })

    if (!user) {
        res.status(400).json({ message: 'Invalid user data received' })
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // 10 salt rounds

    // Set password expiration
    const expiresAt = new Date();
    // Set expiration to 3 days from creation to test email update for password expiration
    expiresAt.setDate(expiresAt.getDate() + 3) // Adjust expiration time as needed

    // Create a new password document linked to user
    const passwordDoc = await Password.create({
        user: user._id, // Set user to created user ID
        password: hashedPwd,
        expiresAt: expiresAt,
        isActive: true
    })

    // Update user document with reference to new password
    user.password = passwordDoc._id
    user.passwordHistory.push(passwordDoc._id)
    await user.save()
    
    res.status(201).json({ message: `New user ${username} created` })
})

// @desc Create new login attmept
// @route POST /users/login-attempts
// @access Private
const newLoginAttempt = asyncHandler(async (req, res) => {
    const { id, successful } = req.body

    // Confirm data
    if (!id || successful === undefined) {
        return res.status(400).json({ message: 'User ID and success status are required'})
    }

    // Find user by ID
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Create a new login attempt document
    const loginAttempt = await LoginAttempt.create({
        user: id,
        successful: successful
    })

    // Respond with the created login attempt
    res.status(201).json({ message: 'Login attempt recorded' })
})

// @desc Update a user's password
// @route PATCH /users/password
// @access Private
const updateUserPassword = asyncHandler(async (req, res) => {
    const { id, newPassword } = req.body

    // Confirm data
    if (!id || !newPassword) {
        return res.status(400).json({ meassage: 'User ID and new password are required' })
    }

    // Find user by ID
    const user = await User.findById(id).populate('password').exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Hash new password
    const hashedPwd = await bcrypt.hash(newPassword, 10) // 10 salt rounds

    // Set new password expiration
    const expiresAt = new Date()
    // Set expiration to 3 days from creation to test email update for password expiration
    expiresAt.setDate(expiresAt.getDate() + 3) // Adjust expiration time as needed

    // Create a new password document
    const newPasswordDoc = await Password.create({
        user: id, // Reference to user
        password: hashedPwd,
        expiresAt: expiresAt,
        isActive: true
    })

    // Update old current password to inactive
    if (user.password) {
        user.password.isActive = false;
        await user.password.save()
    }

    // Update user password with new password and add to password history
    user.password = newPasswordDoc._id
    user.passwordHistory.push(newPasswordDoc._id)
    const updatedUser = await user.save()

    res.json({ message: `Password updated successfully for ${updatedUser.username}` })
})

// @desc Update a user's role
// @route PATCH /users/role
// @access Private
const updateUserRole = asyncHandler(async (req, res) => {
    const { id, role } = req.body

    // Confirm data
    if (!id || !role) {
        return res.status(400).json({ message: 'User ID and role are required'})
    }

    // Find user by ID
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Update user's role
    user.roles = role

    // Save the updated user document
    const updatedUser = await user.save()

    res.json({ message: `User ${updatedUser.username} role updated to ${updatedUser.roles}`})
})

// @desc Update a user's active status
// @route PATCH /users/active
// @access Private
const updateUserActive = asyncHandler(async (req, res) => {
    const { id, isActive } = req.body

    // Confirm data
    if (!id || isActive === undefined) {
        return res.status(400).json({ message: 'User ID and active status are required' })
    }
    
    // Find user by ID
    const user = await User.findById(id).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Update user's active status
    user.active = isActive

    // Save the updated user document
    const updatedUser = await user.save()
    
    res.json({ message: `User ${updatedUser.username} status updated to ${isActive}` })
})

module.exports = {
    getAllUsers,
    createNewUser,
    newLoginAttempt,
    updateUserPassword,
    updateUserRole,
    updateUserActive
}