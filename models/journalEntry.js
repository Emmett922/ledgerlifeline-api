const mongoose = require("mongoose");
const accounts = require("./accounts");

const journalEntrySchema = new mongoose.Schema(
  {
    // Each debit and credit has an account attatched to it
    debit: [
      {
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],

    credit: [
      {
        account: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Account",
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],

    type: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },

    postReference: {
      type: String,
      required: true,
    },
    // -- Ref to journal entries event log model -- //
    journalEntryUpdates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "journalEntries",
      },
    ]
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
