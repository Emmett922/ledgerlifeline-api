const mongoose = require("mongoose");

// Account update model object creation
const accountUpdateSchema = new mongoose.Schema(
  {
    // -- Ref to the account that is being updated -- //
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    accountName: {
      type: String,
      required: true,
      unique: false,
    },
    accountNumber: {
      type: Number,
      required: true,
      unique: false,
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
      required: true,
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
    dateAccountAdded: {
      type: Date,
      default: Date.now,
      required: true,
    },
    userID: {
      type: String, //mongoose.Schema.Types.ObjectId, commented out for testing purposes
      ref: "User",
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
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true, // Gives the date and time when the user update information is recorded here
      updatedAt: false, // Don't need this
    },
  }
);

module.exports = mongoose.model("AccountUpdate", accountUpdateSchema);
