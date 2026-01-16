const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/messages
// @desc    Submit a contact message
// @access  Public
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('subject').trim().notEmpty().withMessage('Subject is required'),
        body('message').trim().notEmpty().withMessage('Message is required'),
        body('phone').optional().trim()
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { name, email, subject, message, phone } = req.body;

            // Create new message
            const newMessage = new Message({
                name,
                email,
                subject,
                message,
                phone
            });

            await newMessage.save();

            res.status(201).json({
                success: true,
                message: 'Your message has been sent successfully! We will get back to you soon.',
                data: {
                    id: newMessage._id,
                    name: newMessage.name,
                    email: newMessage.email,
                    subject: newMessage.subject,
                    createdAt: newMessage.createdAt
                }
            });
        } catch (error) {
            console.error('Submit message error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.'
            });
        }
    }
);

// @route   GET /api/messages
// @desc    Get all messages (with filters)
// @access  Private (Admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, search, page = 1, limit = 10 } = req.query;

        // Build query
        let query = {};

        // Filter by read status
        if (status === 'read') {
            query.isRead = true;
            query.isSpam = false;
        } else if (status === 'unread') {
            query.isRead = false;
            query.isSpam = false;
        } else if (status === 'spam') {
            query.isSpam = true;
        } else {
            // All non-spam messages
            query.isSpam = false;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get messages
        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Message.countDocuments(query);

        // Get statistics
        const stats = {
            total: await Message.countDocuments({ isSpam: false }),
            unread: await Message.countDocuments({ isRead: false, isSpam: false }),
            read: await Message.countDocuments({ isRead: true, isSpam: false }),
            spam: await Message.countDocuments({ isSpam: true })
        };

        res.json({
            success: true,
            data: messages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            },
            stats
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

// @route   GET /api/messages/:id
// @desc    Get single message
// @access  Private (Admin only)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch message'
        });
    }
});

// @route   PATCH /api/messages/:id/read
// @desc    Mark message as read/unread
// @access  Private (Admin only)
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const { isRead } = req.body;

        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isRead: isRead !== undefined ? isRead : true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: `Message marked as ${message.isRead ? 'read' : 'unread'}`,
            data: message
        });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update message'
        });
    }
});

// @route   PATCH /api/messages/:id/spam
// @desc    Mark message as spam
// @access  Private (Admin only)
router.patch('/:id/spam', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { isSpam: true },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message marked as spam',
            data: message
        });
    } catch (error) {
        console.error('Mark spam error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as spam'
        });
    }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
});

// @route   DELETE /api/messages/bulk/delete
// @desc    Bulk delete messages
// @access  Private (Admin only)
router.post('/bulk/delete', authMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide message IDs to delete'
            });
        }

        const result = await Message.deleteMany({ _id: { $in: ids } });

        res.json({
            success: true,
            message: `${result.deletedCount} message(s) deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete messages'
        });
    }
});

module.exports = router;
