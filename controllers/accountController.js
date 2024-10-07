const Account = require("../models/accounts");
const UpdateAccount = require("../models/accountUpdate");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt"); //usually used for password hashing, can delete later if not needed

// -- Controller Funcitons -- //

// @desc Get all accounts
// @route Get /accounts
// @access Private
const getAllAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find().select().lean();
  if (!accounts?.length) {
    return res.status(400).json({ message: "No accounts found" });
  }
  res.json(accounts);
});

// @desc Create new account
// @route POST /accounts
// @access Private
const createNewAccount = asyncHandler(async (req, res) => {
  const {
    accountName,
    accountNumber,
    accountDescription,
    normalSide,
    accountCatagory,
    accountSubcatagory,
    initialBalance,
    debit,
    credit,
    balance,
    createdBy,
    order,
    statement,
    comment,
    isActive,
  } = req.body;

  // Confirm data
  if (
    !accountName ||
    !accountNumber ||
    !accountDescription ||
    !normalSide ||
    !accountCatagory ||
    initialBalance === undefined ||
    debit === undefined ||
    credit === undefined ||
    balance === undefined ||
    !createdBy ||
    !order ||
    !statement ||
    !comment ||
    isActive === undefined
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate
  const duplicate = await Account.findOne({ accountName }).lean().exec();

  if (duplicate) {
    return res.status(400).json({ message: "Duplicate account name" });
  }

  // Make sure account number do not allow decimals
  if (accountNumber - Math.floor(accountNumber) !== 0) {
    return res
      .status(400)
      .json({ message: "Account number can not be a decimal" });
  }

  // Create and store new account
  const newAccount = await Account.create({
    accountName,
    accountNumber,
    accountDescription,
    normalSide,
    accountCatagory,
    accountSubcatagory,
    initialBalance,
    debit,
    credit,
    balance,
    createdBy,
    order,
    statement,
    comment,
    isActive,
    accountUpdates: [], // Initialize updates with an empty array
  });

  // Create a new updateAccount linked to account
  const updateAccountDoc = await UpdateAccount.create({
    account: newAccount._id,
    accountName: newAccount.accountName,
    accountNumber: newAccount.accountNumber,
    accountDescription: newAccount.accountDescription,
    normalSide: newAccount.normalSide,
    accountCatagory: newAccount.accountCatagory,
    accountSubcatagory: newAccount.accountSubcatagory,
    initialBalance: newAccount.initialBalance,
    debit: newAccount.debit,
    credit: newAccount.credit,
    balance: newAccount.balance,
    dateAccountAdded: newAccount.dateAccountAdded,
    userID: newAccount.createdBy,
    order: newAccount.order,
    statement: newAccount.statement,
    comment: newAccount.comment,
    isActive: newAccount.isActive,
    updatedBy: createdBy,
  });

  if (newAccount) {
    //created
    newAccount.accountUpdates.push(updateAccountDoc._id);
    const createdAccount = await newAccount.save();
    res
      .status(201)
      .json({ message: `New account ${createdAccount.accountName} created` });
  } else {
    res.status(400).json({ message: "Invalid account data received" });
  }
});

// @desc Update an account
// @route PATCH /accounts
// @access Private
const updateAccount = asyncHandler(async (req, res) => {
  const {
    id,
    accountName,
    accountNumber,
    accountDescription,
    normalSide,
    accountCatagory,
    accountSubcatagory,
    debit,
    credit,
    balance,
    order,
    statement,
    comment,
    updatedBy,
  } = req.body;

  // checking to see if account exist
  const editAccount = await Account.findById(id).exec();
  if (!editAccount) {
    return res.status(400).json({ message: "Account not found" });
  }

  // Check for duplicate account name
  const duplicateName = await Account.findOne({ accountName }).lean().exec();
  if (duplicateName && duplicateName?._id.toString() !== id) {
    return res.status(400).json({ message: "Account name already exists" });
  }

  let isUpdated = false;

  // Log the current account details
  console.log("Current Account Data:", editAccount);
  console.log("Incoming Account Data:", req.body);

  // Convert incoming string values to numbers where necessary
  const parsedDebit = Number(debit);
  const parsedCredit = Number(credit);
  const parsedBalance = Number(balance);

  //check if any account details have been changed, and change if so
  if (editAccount.accountName !== accountName) {
    const duplicateName = await Account.findOne({ accountName }).lean().exec();
    if (duplicateName && duplicateName?._id.toString() !== id) {
      return res.status(400).json({ message: "Account name already exists" });
    } else {
      editAccount.accountName = accountName;
      isUpdated = true;
    }
  }
  if (editAccount.accountNumber !== accountNumber) {
    const duplicateNumber = await Account.findOne({ accountNumber })
      .lean()
      .exec();
    if (duplicateNumber && duplicateNumber?._id.toString() !== id) {
      return res.status(400).json({ message: "Account number already exists" });
    } else {
      editAccount.accountNumber = accountNumber;
      isUpdated = true;
    }
  }
  if (editAccount.accountDescription !== accountDescription) {
    editAccount.accountDescription = accountDescription;
    isUpdated = true;
  }
  if (editAccount.normalSide !== normalSide) {
    editAccount.normalSide = normalSide;
    isUpdated = true;
  }
  if (editAccount.accountCatagory !== accountCatagory) {
    editAccount.accountCatagory = accountCatagory;
    isUpdated = true;
  }
  if (editAccount.accountSubcatagory !== accountSubcatagory) {
    editAccount.accountSubcatagory = accountSubcatagory;
    isUpdated = true;
  }
  if (editAccount.debit !== parsedDebit) {
    editAccount.debit = debit;
    isUpdated = true;
  }
  if (editAccount.credit !== parsedCredit) {
    editAccount.credit = credit;
    isUpdated = true;
  }
  if (editAccount.balance !== parsedBalance) {
    editAccount.balance = balance;
    isUpdated = true;
  }
  if (editAccount.order !== order) {
    editAccount.order = order;
    isUpdated = true;
  }
  if (editAccount.statement !== statement) {
    editAccount.statement = statement;
    isUpdated = true;
  }
  if (editAccount.comment !== comment) {
    editAccount.comment = comment;
    isUpdated = true;
  }

  // Create a new updateAccount linked to account
  // Only create an update document if changes were made
  if (isUpdated) {
    const updateAccountDoc = await UpdateAccount.create({
      account: editAccount._id,
      accountName: editAccount.accountName,
      accountNumber: editAccount.accountNumber,
      accountDescription: editAccount.accountDescription,
      normalSide: editAccount.normalSide,
      accountCatagory: editAccount.accountCatagory,
      accountSubcatagory: editAccount.accountSubcatagory,
      initialBalance: editAccount.initialBalance,
      debit: editAccount.debit,
      credit: editAccount.credit,
      balance: editAccount.balance,
      dateAccountAdded: editAccount.dateAccountAdded,
      userID: editAccount.createdBy,
      order: editAccount.order,
      statement: editAccount.statement,
      comment: editAccount.comment,
      isActive: editAccount.isActive,
      updatedBy: updatedBy,
    });

    const currentDate = new Date();
    editAccount.updatedAt = currentDate;
    editAccount.accountUpdates.push(updateAccountDoc._id);
    const updatedAccount = await editAccount.save();
    res
      .status(201)
      .json({ message: `"${updatedAccount.accountName}" updated` });
  } else {
    res.status(400).json({ message: "No account details updated" });
  }
});

// add one for account deactivation
// @desc Deactivate account
// @route PATCH /accounts/active
// @access Private
const updateAccountActive = asyncHandler(async (req, res) => {
  const { accountName, balance, isActive, updatedBy } = req.body;

  console.log(req.body);

  // Confirm data
  if (
    !accountName ||
    !balance === undefined ||
    isActive === undefined ||
    !updatedBy
  ) {
    return res.status(400).json({
      message:
        "Account name, balance, active status, and updatedBy are required",
    });
  }

  // If account is

  // Find account by name
  const accountActive = await Account.findOne({ accountName }).exec();
  if (!accountActive) {
    return res.status(400).json({ message: "Account name not found" });
  }

  // update account's active status
  if (!isActive) {
    if (balance === 0) {
      accountActive.isActive = isActive;
    } else {
      res.status(400).json({
        message: "Account balance is greater than 0, can not be deactivated",
      });
    }
  } else {
    accountActive.isActive = isActive;
  }

  const updateAccountDoc = await UpdateAccount.create({
    account: accountActive._id,
    accountName: accountActive.accountName,
    accountNumber: accountActive.accountNumber,
    accountDescription: accountActive.accountDescription,
    normalSide: accountActive.normalSide,
    accountCatagory: accountActive.accountCatagory,
    accountSubcatagory: accountActive.accountSubcatagory,
    initialBalance: accountActive.initialBalance,
    debit: accountActive.debit,
    credit: accountActive.credit,
    balance: accountActive.balance,
    dateAccountAdded: accountActive.dateAccountAdded,
    userID: accountActive.createdBy,
    order: accountActive.order,
    statement: accountActive.statement,
    comment: accountActive.comment,
    isActive,
    updatedBy: updatedBy,
  });

  // Save the updated account status
  accountActive.accountUpdates.push(updateAccountDoc._id);
  const updatedAccountActive = await accountActive.save();

  res.json({
    message: `Account "${updatedAccountActive.accountName}" status updated to ${
      isActive ? "Active" : "Inactive"
    }`,
  });
});

module.exports = {
  getAllAccounts,
  createNewAccount,
  updateAccount,
  updateAccountActive,
};
