const JournalEntry = require("../models/journalEntry");
const Account = require("../models/accounts");
const accountController = require("../controllers/accountController");
const asyncHandler = require("express-async-handler");

// -- Controller Funcitons -- //

// @desc Get all journalEntries
// @route Get /journal-entries
// @access Private
const getAllJournalEntries = asyncHandler(async (req, res) => {
    const journalEntries = await JournalEntry.find().select().lean();
    if (!journalEntries?.length) {
      return res.status(400).json({ message: "No journal entries found" });
    }
    res.json(journalEntries);
  });

// @desc Create new journal entry
// @route POST /journal-entry
// @access Private
const createJournalEntry = asyncHandler(async (req, res) => {
    const {
        debit,
        credit,
        type,
        description,
        createdBy
    } = req.body;

    // Confirm data
    if (
        debit === undefined ||
        credit === undefined ||
        !type ||
        !description ||
        !createdBy
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // genrate unique post ref
    const postReference = await generateUniquePostReference();

    // Create and store new journal entry if account exists
    const newJournalEntry = await JournalEntry.create({
        debit,
        credit,
        type,
        description,
        createdBy,
        postReference
    });

    // Process debit and credit entries and update the related accounts
    await processAccountEntries(debit, 'debit', postReference, createdBy);
    await processAccountEntries(credit, 'credit', postReference, createdBy);
    
    // await newJournalEntry.save(); ACCOUNT IS SAVED IN processAccountEntries Function
    res.status(201).json({ message: "New journal entry submitted" })

})

// @desc Approve/Reject Journal Entry
// @route PATCH /journal-entry
// @access Private
const approveRejectEntry = asyncHandler(async (req, res) => {
    const {
        journalEntryID,
        status,
        managerID,
        reason
    } = req.body;

    const journalEntry = await JournalEntry.findById(journalEntryID).exec();

    journalEntry.status = status;  // Approved/Rejected
    journalEntry.managerID = managerID;
    journalEntry.reason = status === 'Rejected' ? reason : null;
    journalEntry.updatedAt = new Date();

    await Promise.all([
        updateAccounts(journalEntry.debit, 'debit', journalEntry),
        updateAccounts(journalEntry.credit, 'credit', journalEntry)
    ]);

    await journalEntry.save();
    res.status(200).json({ message: `Journal entry ${status.toLowerCase()} successfully` });


    // kept the following code just incase, feel free to delete later
    // Calculating total amount of each debit and credit side (OLD LEGACY CODE FOR NOW)
    // debit.forEach(eachDebit);
    // credit.forEach(eachCredit);

    // function eachDebit(item) {
    //     // const account = await Account.findById(item.account._id).exec();
    //     const entry = {
    //         pr: journalEntry.postReference,
    //         amount: item.amount
    //     }
    //     // await account.journalEntries.push(entry);
    // }
    // function eachCredit(item) {
    //     // const account = await Account.findById(item.account._id).exec();
    //     const entry = {
    //         pr: journalEntry.postReference,
    //         amount: item.amount
    //     }
    //     // await account.journalEntries.push(entry);
    // }
    
});

// Helper function to update account with debit/credit entries
async function updateAccounts(entries, type, journalEntry) {
    for (const item of entries) {
        const account = await Account.findById(item.account).exec();
        if (!account) continue;

        const entry = {
            pr: journalEntry.postReference,
            side: type,
            amount: item.amount
        };

        // Update debit/credit amount and balance based on account's normal side
        if (type === 'debit') {
            account.debit += item.amount;
            account.balance += account.normalSide === 'debit' ? item.amount : -item.amount;
        } else {
            account.credit += item.amount;
            account.balance += account.normalSide === 'credit' ? item.amount : -item.amount;
        }

        account.entries.push(entry);
        await account.save();
    }
}

async function generateUniquePostReference() {
    // Find the last journal entry and get the last postReference
    const lastEntry = await JournalEntry.findOne().sort({ postReference: -1 }).lean();
    
    // Generate next post reference (e.g., P1, P2, P3, ...)
    const lastRef = lastEntry?.postReference;
    const lastNumber = lastRef ? parseInt(lastRef.substring(1)) : 0;
    const newPostReference = `P${lastNumber + 1}`;
    
    return newPostReference;
}

// Helper function to process debit/credit entries and update account information
async function processAccountEntries(entries, type, postReference, createdBy) {
    for (const item of entries) {
        const account = await Account.findById(item.account).exec();
        if (!account) continue; // Skip if account not found

        // Create the entry object
        const entry = {
            postReference,
            amount: item.amount,
            date: new Date(),
            createdBy,
            side: type // debit or credit
        };

        // Update the account's journalEntries array and push the new entry
        account.journalEntries.push(entry);
        
        // Save the updated account with the new entry
        await account.save();
    }
}

module.exports = {
    getAllJournalEntries,
    createJournalEntry,
    approveRejectEntry
}