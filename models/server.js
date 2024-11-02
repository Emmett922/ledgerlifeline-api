const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
    trialBalance: {
        type: String,
        required: true,
    },
    incomeStatement: {
        type: String,
        required: true,
    },
    balanceSheet: {
        type: String,
        required: true,
    },
    retainedEarningsStatement: {
        type: String,
        required: true,
    },

});

module.exports = mongoose.model("Server", serverSchema);