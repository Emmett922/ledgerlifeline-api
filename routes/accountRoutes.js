const express = require('express')
const router = express.Router()
const accountController = require('../controllers/accountController')

router.route('/')
.get(accountController.getAllAccounts)
.post(accountController.createNewAccount)
.patch(accountController.updateAccount)

router.route('/active').patch(accountController.updateAccountActive)

module.exports = router