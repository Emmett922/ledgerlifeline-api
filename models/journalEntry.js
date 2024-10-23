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

    updatedBy: {
      type: String,
      default: "",
    },

    postReference: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "Pending",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    // Store file metadata in journalEntry
    files: [
      {
        filename: { type: String, required: true },
        url: {
          type: String,
          required: true, // S3 file URL
        },
        size: { type: Number, required: true }, // File size in bytes
      },
    ],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
