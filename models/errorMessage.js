const mongoose = require("mongoose");

const errorMessageSchema = new mongoose.Schema({
    errorID: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        requird: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ErrorMessage", errorMessageSchema);