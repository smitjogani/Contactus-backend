const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isSpam: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
messageSchema.index({ isRead: 1, createdAt: -1 });
messageSchema.index({ isSpam: 1 });

module.exports = mongoose.model('Message', messageSchema);
