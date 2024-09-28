const Account = require('../models/accounts')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt') //usually used for password hashing, can delete later if not needed

// -- Controller Funcitons -- //

// @desc Get all accounts
// @route Get /accounts
// @access Private
const getAllAccounts = asyncHandler(async (req, res) => {
    const accounts = await Account.find().select().lean()
    if(!accounts?.length){
        return res.status(400).json({message: 'No accounts found'})
    }
    res.json(accounts)
})

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
        dateAccountAdded,
        userID,
        order,
        statement,
        comment,
        isActive
    } = req.body;

    // Confirm data
    if (
        !accountName ||
        !accountNumber ||
        !accountDescription ||
        !normalSide ||
        !accountCatagory ||
        !accountSubcatagory ||
        initialBalance === undefined||
        debit === undefined||
        credit === undefined||
        balance === undefined||
        !dateAccountAdded ||
        !userID ||
        !order ||
        !statement ||
        !comment ||
        isActive === undefined
     ) {
        return res.status(400).json({message: 'All fields are required'})
    }

    // Check for duplicate
    const duplicate = await Account.findOne({ accountName }).lean().exec()

    if (duplicate) {
        return res.status(400).json({ message: 'Duplicate account name'})
    }

    // Make sure account number do not allow decimals
    if ((accountNumber - Math. floor(accountNumber)) !== 0){
        return res.status(400).json({ message: 'Account number can not be a decimal' })
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
        dateAccountAdded,
        userID,
        order,
        statement,
        comment,
        isActive
    })

    if (newAccount) { //created
        res.status(201).json({ message: `New account ${accountName} created`})
    } else {
        res.status(400).json({ message: 'Invalid account data received'})
    }

})

// @desc Update an account
// @route PATCH /accounts
// @access Private
const updateAccount = asyncHandler(async (req, res) => {
    const {
        _id,
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
        dateAccountAdded,
        userID,
        order,
        statement,
        comment,
        isActive
    } = req.body;

    // checking to see if account exist
    const editAccount = await Account.findById({ _id }).exec()
    if (!editAccount) {
        return res.status(400).json({ message: 'Account not found'})
    }

    // Check for duplicate
    const duplicate = await Account.findOne({ accountName }).lean().exec()
    if (duplicate && duplicate?._id.toString() !== _id){
        return res.status(400).json({ message: 'Account already exists'})
    }
    // Allow updates to the original account
    // if(duplicate && duplicate?._id.toString() !== _id) {
    //     return res.status(400).json({message: 'Duplicate account name'})
    // }

    //check if any account details have been changed, and change if so
    if (editAccount.accountName !== accountName){
        editAccount.accountName = accountName
    }
    if (editAccount.accountNumber !== accountNumber){
        editAccount.accountNumber = accountNumber
    }
    if (editAccount.accountDescription !== accountDescription){
        editAccount.accountDescription = accountDescription
    }
    if (editAccount.normalSide !== normalSide){
        editAccount.normalSide = normalSide
    }
    if (editAccount.accountCatagory !== accountCatagory){
        editAccount.accountCatagory = accountCatagory
    }
    if (editAccount.accountSubcatagory !== accountSubcatagory){
        editAccount.accountSubcatagory = accountSubcatagory
    }
    if (editAccount.initialBalance !== initialBalance){
        editAccount.initialBalance = initialBalance
    }
    if (editAccount.debit !== debit){
        editAccount.debit = debit
    }
    if (editAccount.credit !== credit){
        editAccount.credit = credit
    }
    if (editAccount.balance !== balance){
        editAccount.balance = balance
    }
    if (editAccount.dateAccountAdded !== dateAccountAdded){
        editAccount.dateAccountAdded = dateAccountAdded
    }
    if (editAccount.userID !== userID){
        editAccount.userID = userID
    }
    if (editAccount.order !== order){
        editAccount.order = order
    }
    if (editAccount.statement !== statement){
        editAccount.statement = statement
    }
    if (editAccount.comment !== comment){
        editAccount.comment = comment
    }
    if (editAccount.isActive !== isActive){
        editAccount.isActive = isActive
    }

    const updatedAccount = await editAccount.save()

    res
    .status(201)
    .json({ message: `${updatedAccount.accountName} updated`})
})

// add one for account deactivation
// @desc Deactivate account
// @route PATCH /accounts/active
// @access Private
const updateAccountActive = asyncHandler(async (req, res) => {
    const {
        accountName,
        balance,
        isActive
    } = req.body;

    // Confirm data
    if (!accountName || isActive === undefined){
        return res
        .status(400)
        .json({ message: "Account name, balance, and active status are required" })
    }

    // If account is

    // Find account by name
    const accountActive = await Account.findOne({ accountName }).exec();
    if(!accountActive){
        return res.status(400).json({ message: "Account name not found" });
    }

    // update account's active status
    if(accountActive.balance === 0){
        accountActive.isActive = isActive;
    } else{
        res.status(400).json({ message: "Account balance is greater than 0, can not be deactivated" })
    }

    // Save the updated account status
    const updatedAccountActive = await accountActive.save();

    res.json({
        message: `Account ${updatedAccountActive.accountName} status updated to ${isActive}`,
    });
});

module.exports = {
    getAllAccounts,
    createNewAccount,
    updateAccount,
    updateAccountActive
}