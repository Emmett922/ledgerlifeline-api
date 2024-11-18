const JournalEntry = require("../models/journalEntry");
const Account = require("../models/accounts");
const asyncHandler = require("express-async-handler");
const AccountUpdate = require("../models/accountUpdate");
const User = require("../models/user");
const {
  sendAdjustingEntrySubmissionEmail,
  sendClosingEntrySubmissionEmail,
} = require("./emailHandler");

// Assume this function is imported or defined to handle S3 uploads
const { uploadFileToS3 } = require("../utils/s3helper");

// -- Controller Functions -- //

// @desc Get all journalEntries
// @route Get /journal-entries
// @access Private
const getAllJournalEntries = asyncHandler(async (req, res) => {
  const journalEntries = await JournalEntry.find()
    .populate("debit.account") // Populate the debit account information
    .populate("credit.account") // Populate the credit account information
    .lean();
  if (!journalEntries?.length) {
    return res.status(400).json({ message: "No journal entries found" });
  }
  res.json(journalEntries);
});

// @desc Get files from entry
// @route Get /journal-entries/files
// @access Private
const getEntryFiles = asyncHandler(async (req, res) => {
  const { id } = req.query;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Entry ID is required" });
  }

  // Find entry by ID
  const entry = await JournalEntry.findById(id).exec();

  if (!entry) {
    return res.status(400).json({ message: "Journal entry not found!" });
  }

  res.json(entry.files);
});

// @desc Create new journal entry
// @route POST /journal-entry
// @access Private
const createJournalEntry = asyncHandler(async (req, res) => {
  // Parse the journal entry data from the FormData
  const journalEntryData = JSON.parse(req.body.journalEntry);
  const { debit, credit, type, description, createdBy } = journalEntryData;
  const files = req.files || []; // Access uploaded files

  // Log the files to confirm structure
  console.log("Files uploaded:", files);

  // Confirm data integrity
  if (
    !Array.isArray(debit) ||
    !Array.isArray(credit) ||
    debit.length === 0 ||
    credit.length === 0 ||
    !type ||
    !description ||
    !createdBy
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Initialize new journal entry with the provided data
  const newEntry = new JournalEntry({
    debit,
    credit,
    type,
    description,
    createdBy,
  });

  console.log("New journal entry to be saved:", newEntry);

  // Save the new journal entry with uploaded files
  // Save the new journal entry with uploaded files
  try {
    // Upload files to S3 and get their data
    const filesData = await Promise.all(
      files.map(async (file) => {
        const { url } = await uploadFileToS3(file); // Upload the file to S3

        // Return an object that matches the required schema
        return {
          filename: file.originalname, // Original name of the uploaded file
          size: file.size, // Size of the uploaded file
          url: url, // S3 URL of the uploaded file
        };
      })
    );

    // Assign files data to the new journal entry
    newEntry.files = filesData;

    // Save the journal entry
    await newEntry.save();

    if (type === "Adjusting") {
      const managerUsers = await User.find({ role: "Manager" }).lean().exec();
      if (!managerUsers || managerUsers.length === 0) {
        return res.status(500).json({ message: "Manager users not found!" });
      }

      // Send email notification to each manager
      for (const manager of managerUsers) {
        await sendAdjustingEntrySubmissionEmail(manager.email);
      }
    }

    if (type === "Closing") {
      const managerUsers = await User.find({ role: "Manager" }).lean().exec();
      if (!managerUsers || managerUsers.length === 0) {
        return res.status(500).json({ message: "Manager users not found!" });
      }

      // Send email notification to each manager
      for (const manager of managerUsers) {
        await sendClosingEntrySubmissionEmail(manager.email);
      }
    }

    res.status(201).json({ message: "New journal entry submitted", newEntry });
  } catch (error) {
    console.error("Error saving journal entry:", error);
    return res
      .status(500)
      .json({ message: "Error saving journal entry", error: error.message });
  }
});

// @desc Approve/Reject Journal Entry
// @route PATCH /journal-entry
// @access Private
const approveRejectEntry = asyncHandler(async (req, res) => {
  const { journalEntryID, status, managerID, reason } = req.body;

  const journalEntry = await JournalEntry.findById(journalEntryID).exec();

  if (!journalEntry) {
    return res.status(400).json({ message: "Journal entry not found!" });
  }

  // Generate unique post reference
  const postReference = await generateUniquePostReference();
  journalEntry.postReference = postReference;
  journalEntry.status = status;
  journalEntry.updatedBy = managerID;
  journalEntry.rejectionReason = status === "Rejected" ? reason : null;
  journalEntry.updatedAt = new Date();

  if (status === "Approved") {
    await Promise.all([
      updateAccounts(journalEntry.debit, "debit", journalEntry, managerID),
      updateAccounts(journalEntry.credit, "credit", journalEntry, managerID),
    ]);
  }

  await journalEntry.save();
  res.status(200).json({ message: `Journal entry successfully ${status}` });
});

// Helper function to update account with debit/credit entries
async function updateAccounts(entry, type, journalEntry, updatedBy) {
  for (const item of entry) {
    const account = await Account.findById(item.account._id).exec();
    if (!account) continue;

    const amount = Number(item.amount);

    // Update debit/credit amount and balance based on account's normal side
    if (type === "debit") {
      account.debit += amount;
      if (account.normalSide === "L") {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
    } else {
      account.credit += amount;
      if (account.normalSide === "R") {
        account.balance += amount;
      } else {
        account.balance -= amount;
      }
    }

    const entry = {
      postReference: journalEntry.postReference,
      side: type,
      amount: item.amount,
      entryDescription: journalEntry.description,
      currBalance: account.balance,
      date: new Date(),
      addedBy: updatedBy,
    };

    account.journalEntries.push(entry);

    const updatedAccountDoc = await AccountUpdate.create({
      account: account._id,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      accountDescription: account.accountDescription,
      normalSide: account.normalSide,
      accountCatagory: account.accountCatagory,
      accountSubcatagory: account.accountSubcatagory,
      initialBalance: account.initialBalance,
      debit: account.debit,
      credit: account.credit,
      balance: account.balance,
      dateAccountAdded: account.dateAccountAdded,
      userID: account.createdBy,
      order: account.order,
      statement: account.statement,
      comment: account.comment,
      isActive: account.isActive,
      updatedBy: updatedBy,
    });

    account.accountUpdates.push(updatedAccountDoc._id);
    await account.save();
  }
}

async function generateUniquePostReference() {
  // Find all journal entries and get the postReferences
  const entries = await JournalEntry.find({}, { postReference: 1 }).lean();

  // Extract postReference numbers and find the highest
  const postReferences = entries
    .map((entry) => entry.postReference)
    .map((ref) => parseInt(ref.slice(1))) // Convert 'P<number>' to number
    .filter((num) => !isNaN(num)); // Filter out any invalid numbers

  // Find the maximum number
  const maxNumber = postReferences.length > 0 ? Math.max(...postReferences) : 0;

  // Generate the next post reference
  const newPostReference = `P${maxNumber + 1}`; // Increment the highest number by 1

  return newPostReference;
}

module.exports = {
  getAllJournalEntries,
  getEntryFiles,
  createJournalEntry,
  approveRejectEntry,
};
