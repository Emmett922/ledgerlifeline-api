const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router
  .route("/")
  .get(accountController.getAllAccounts)
  .post(accountController.createNewAccount)
  .patch(accountController.updateAccount);

router.route("/active").patch(accountController.updateAccountActive);

route.route("/account-by-id").get(accountController.getAccountById);

module.exports = router;
