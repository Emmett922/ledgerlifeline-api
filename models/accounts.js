const mongoose = require("mongoose");
//const { updateSearchIndex } = require('./loginAttempt')
//const { OrderedBulkOperation } = require('mongodb')

// Define a schema for the journal entry details related to the account
const accountJournalEntrySchema = new mongoose.Schema({
  postReference: { 
    type: String, 
    required: true 
  },
  side: { 
    type: String,  // 'debit' or 'credit'
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  createdBy: { 
    type: String, 
    required: true 
  }
}, { _id: false }); // No need for separate _id field

const accountSchema = new mongoose.Schema(
  {
    accountName: {
      type: String,
      required: true,
      unique: true,
    },
    accountNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    accountDescription: {
      type: String,
      required: true,
    },
    normalSide: {
      type: String,
      required: true,
    },
    accountCatagory: {
      type: String,
      required: true,
    },
    accountSubcatagory: {
      type: String,
      default: " ",
    },
    initialBalance: {
      type: Number,
      required: true,
    },
    debit: {
      type: Number,
      required: true,
    },
    credit: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    order: {
      type: String,
      required: true,
    },
    statement: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    // -- Ref to account update event log model -- //
    accountUpdates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccountUpdate",
      },
    ],


    // New schema for storing journal entry details specific to the account
    journalEntries: [accountJournalEntrySchema]
    
    // OLD journal entries array
    // journalEntries: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "JournalEntry"
    // }]
  },
  {
    timestamps: {
      createdAt: true, // Gives date and time when account is created
      updatedAt: true, // Gives date and time when account is updated
    },
  }
);

module.exports = mongoose.model("Account", accountSchema);
