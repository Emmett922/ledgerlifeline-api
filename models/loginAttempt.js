const mongoose = require("mongoose");

const loginAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Auto-incr. attempt num. for tracking login attmepts
    attemptNum: {
      type: Number,
    },
    // Indicate attempt success
    successful: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: true, // Gives the date and time when attempt was made
      updatedAt: false, // Don't need this
    },
  }
);

// Pre-save hook to auto-increment attemptNum per user
loginAttemptSchema.pre("save", async function (next) {
  const loginAttempt = this;

  // FInd the latest attempt number for the user
  const latestAttempt = await mongoose
    .model("LoginAttempt")
    .findOne({ user: loginAttempt.user })
    .sort({ attemptNum: -1 })
    .exec();

  // Set attemptNum to 1 if no previous attempts, otherwise increment
  loginAttempt.attemptNum = latestAttempt ? latestAttempt.attemptNum + 1 : 1;

  next();
});

module.exports = mongoose.model("LoginAttempt", loginAttemptSchema);
