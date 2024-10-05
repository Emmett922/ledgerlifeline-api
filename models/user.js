const mongoose = require("mongoose");

// User model object creation
const userSchema = new mongoose.Schema(
  {
    // -- Required info from user -- //
    username: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postal_code: {
        type: String,
        required: true,
      },
    },
    // Date of Birth (DOB)
    dob: {
      type: Date,
      required: true,
    },
    // Security question
    securityQuestion: {
      question: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },

    // -- Store reference to current password -- //
    password: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Password",
    },

    // -- Ref to password management in Password model -- //
    passwordHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Password",
      },
    ],

    // -- Ref to login attempt management in Login Attempt model -- //
    loginAttempts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoginAttempt",
      },
    ],

    // -- When new user is created -- //
    // Default to "Employee", admin will change role (to admin, manager, or accountant) when approving user creation request
    role: {
      type: String,
      default: "Employee",
    },
    // Default active status to false until the administrator approves user creation request
    active: {
      type: Boolean,
      default: false,
    },
    // Deafult suspended status to false until the administrator gives the user a suspension
    suspended: {
      start_date: {
        type: Date,
        default: null,
      },
      end_date: {
        type: Date,
        default: null,
      },
    },
    createdBy: {
      type: String,
      required: true,
    },

    // -- Ref to user updates event log model -- //
    userUpdates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserUpdate",
      },
    ],
  },
  {
    timestamps: {
      createdAt: true, // Don't need this
      updatedAt: true, // Gives date and time when user is updated
    },
  }
);

module.exports = mongoose.model("User", userSchema);
