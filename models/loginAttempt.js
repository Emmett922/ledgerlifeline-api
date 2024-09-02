const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose) // Import mongoose-sequence plugin

const loginAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Auto-incr. attempt num. for tracking login attmepts
    attemptNum: {
        type: Number
    },
    // Indicate attempt success
    successful: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: true,    // Gives the date and time when attempt was made
        updatedAt: false    // Don't need this
    }
})

// Apply mongoose-sequence plugin
loginAttemptSchema.plugin(AutoIncrement, {
    inc_field: 'attemptNum'
})

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema)