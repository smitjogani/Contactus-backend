const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');
const { messageValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/responseHelper');

// @route   POST /api/messages
// @desc    Submit a contact message
// @access  Public
router.post(
    '/',
    messageValidation,
    handleValidationErrors,
    messageController.createMessage
);

// @route   GET /api/messages
// @desc    Get all messages (with filters)
// @access  Private (Admin only)
router.get('/', authMiddleware, messageController.getAllMessages);

// @route   GET /api/messages/:id
// @desc    Get single message
// @access  Private (Admin only)
router.get('/:id', authMiddleware, messageController.getMessageById);

// @route   PATCH /api/messages/:id/read
// @desc    Mark message as read/unread
// @access  Private (Admin only)
router.patch('/:id/read', authMiddleware, messageController.updateReadStatus);

// @route   PATCH /api/messages/:id/spam
// @desc    Mark message as spam
// @access  Private (Admin only)
router.patch('/:id/spam', authMiddleware, messageController.markAsSpam);

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, messageController.deleteMessage);

// @route   POST /api/messages/bulk/delete
// @desc    Bulk delete messages
// @access  Private (Admin only)
router.post('/bulk/delete', authMiddleware, messageController.bulkDeleteMessages);

module.exports = router;
