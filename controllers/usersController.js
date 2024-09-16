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
    const users = await User.find().select('-password -passwordHistory').lean()
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }
    res.json(users)
})

// @desc Get single user by username
// @route GET /users/user-by-username
// @access Private
const getUserByUsername = asyncHandler(async (req, res) => {
    const { username } = req.query

    // Confirm data
    if (!username) {
        return res.status(400).json({ message: 'A username is required' })
    }

    // Find user by username
    const user = await User.findOne({ username }).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }
    res.json(user)
})

// @desc Get single user by email
// @route GET /users/user-by-email
// @access Private
const getUserByEmail = asyncHandler(async (req, res) => {
    const { email } = req.body

    // Confirm data
    if (!email) {
        return res.status(400).json({ message: 'An email is required' })
    }

    // Find user by email
    const user = await User.findOne({ email }).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }
    res.json(user)
})


// @desc Get user password
// @route POST /users/login
// @access private
const userLogin = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    // Confirm data
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and Password are required'})
    }

    // Find user by username
    const user = await User.findOne({ username }).exec()

    // Track whether username exists
    const usernameExists = !!user;

    if (!usernameExists) {
        // Username does not exist
        return res.status(400).json({ message: 'Incorrect username!' })
    }

    // Retrieve the current active password document
    const passwordDoc = await Password.findOne({ user: user._id, isActive: true }).exec()

    // Compare entered password with stored password
    const isPasswordMatch = passwordDoc ? await bcrypt.compare(String(password), String(passwordDoc.password)) : false
    
    if (!isPasswordMatch) {
        // Password does not match
        await newLoginAttempt({ username, successful: false })
        return res.status(400).json({ message: 'Incorrect password!' })
    }

    // Successful login
    await newLoginAttempt({ username, successful: true })
    return res.status(201).json({ message: `Welcome, ${user.username}!`, success: true })
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, first_name, last_name, email, address, dob, securityQuestion } = req.body

    // Confirm data
    if (!username || !password|| !first_name || !last_name || !email || !address.street || !address.city || !address.state || !address.postal_code || !dob || !securityQuestion || !securityQuestion.question || !securityQuestion.answer) {
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
        email,
        address: {
            street: address.street,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code
        },
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
    await user.save()
    
    res.status(201).json({ message: `New user ${username} created` })
})

// @desc Create new login attmept
// @route NO ROUTE! Called by userLogin() function
// @access Private
const newLoginAttempt = asyncHandler(async ({ username, successful} ) => {

    // Find user by ID
    const user = await User.findOne({ username }).exec()

    if (!user) {
        console.error(`User with username ${username} not found.`)
        return false
    }

    // Create a new login attempt document
    const loginAttempt = await LoginAttempt.create({
        user: user._id,
        successful: successful
    })

    if (!loginAttempt) {
        console.error('Failed to create and log login attempt')
        return false
    }

    user.loginAttempts.push(loginAttempt._id)
    await user.save()

    // Respond with the created login attempt
    console.log('Login attempt logged')
})

// @desc Update a user's password
// @route PATCH /users/password
// @access Private
const updateUserPassword = asyncHandler(async (req, res) => {
    const { username, newPassword } = req.body

    // Confirm data
    if (!username || !newPassword) {
        return res.status(400).json({ meassage: 'User ID and new password are required' })
    }

    // Find user by username
    const user = await User.findOne({ username }).exec()

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
        user: user._id, // Reference to user
        password: hashedPwd,
        expiresAt: expiresAt,
        isActive: true
    })

    // Update old current password to inactive
    if (user.password) {
        // Fetch the old password document
        const oldPasswordDoc = await Password.findById(user.password).exec()
        if (oldPasswordDoc) {
            oldPasswordDoc.isActive = false
            await oldPasswordDoc.save()
            user.passwordHistory.push(oldPasswordDoc._id)
        }
    }

    // Update user password with new password and add to password history
    user.password = newPasswordDoc._id
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
    user.role = role

    // Save the updated user document
    const updatedUser = await user.save()

    res.json({ message: `User ${updatedUser.username} role updated to ${updatedUser.role}`})
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

// @desc Update a user's supsension status
// @route PATCH /users/suspended
// @access Private
const updateUserSuspended = asyncHandler(async (req, res) => {
    const { username, isSuspended } = req.body

    // Confirm data
    if (!username || isSuspended === undefined) {
        return res.status(400).json({ message: 'Username and suspension status are required' })
    }

    // Find user by username
    const user = await User.findOne({ username }).exec()

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    // Update user's suspension status
    user.suspended = isSuspended
    
    // Save updated user
    const updatedUser = await user.save()

    if (isSuspended) {
        res.json({ message: `User ${updatedUser.username} is suspended.` })  
    } else {
        res.json({ message: `User ${updatedUser.username} is no longer suspended.` })
    }
})

module.exports = {
    getAllUsers,
    getUserByUsername,
    getUserByEmail,
    userLogin,
    createNewUser,
    newLoginAttempt,
    updateUserPassword,
    updateUserRole,
    updateUserActive,
    updateUserSuspended
}