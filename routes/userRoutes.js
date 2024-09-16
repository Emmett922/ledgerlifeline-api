const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')

// Route to get all users and create new users
router.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createNewUser)

// Route for getting a user by their username
router.route('/user-by-username')
    .get(usersController.getUserByUsername)

// Route for getting a user by their email
router.route('/user-by-email')
    .get(usersController.getUserByEmail)

// Route for username/password login check
router.route('/login')
    .post(usersController.userLogin)

// Route to update user password
router.route('/password')
    .patch(usersController.updateUserPassword)

// Route to update user role
router.route('/role')
    .patch(usersController.updateUserRole)

// Route to update user active status
router.route('/active')
    .patch(usersController.updateUserActive)

// Route to update user suspension status
router.route('/suspended')
    .patch(usersController.updateUserSuspended)

module.exports = router
