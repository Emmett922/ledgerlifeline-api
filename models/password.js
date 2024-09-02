const mongoose = require('mongoose')

const passwordSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    password: {
        type: String,
        required: true
    },
    expiresAt: { // To set an expiration date for each password created
        type: Date,
        required: true
    },
    isActive: { // Indicates the current password
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: true,    // Gives the date and time when the password is created
        updatedAt: false    // Don't need this
    }
})

module.exports = mongoose.model('Password', passwordSchema)