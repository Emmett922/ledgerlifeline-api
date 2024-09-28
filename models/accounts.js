const mongoose = require('mongoose')
//const { updateSearchIndex } = require('./loginAttempt')
//const { OrderedBulkOperation } = require('mongodb')

const accountSchema = new mongoose.Schema({
    accountName: {
        type: String,
        required: true,
        unique: true
    },
    accountNumber: {
        type: Number,
        required: true,
        unique: true
    },
    accountDescription: {
        type: String,
        required: true
    },
    normalSide: {
        type: String,
        required: true
    },
    accountCatagory: {
        type: String,
        required: true
    },
    accountSubcatagory: {
        type: String,
        required: true
    },
    initialBalance: {
        type: Number,
        required: true
    },
    debit: {
        type: Number,
        required: true
    },
    credit: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    dateAccountAdded: {
        type: Date,
        default: Date.now,
        required: true
    },
    userID: {
        type: String, //mongoose.Schema.Types.ObjectId, commented out for testing purposes
        ref: 'User',
        required: true
    },
    order: {
        type: String,
        required: true
    },
    statement: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        required: true
    }
})

module.exports = mongoose.model('Account', accountSchema)