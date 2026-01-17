const messageService = require('../services/messageService');

class MessageController {
    // Submit a contact message
    async createMessage(req, res) {
        try {
            const message = await messageService.createMessage(req.body);

            res.status(201).json({
                success: true,
                message: 'Your message has been sent successfully! We will get back to you soon.',
                data: message
            });
        } catch (error) {
            console.error('Submit message error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.'
            });
        }
    }

    // Get all messages with filters
    async getAllMessages(req, res) {
        try {
            const result = await messageService.getAllMessages(req.query);

            res.json({
                success: true,
                data: result.messages,
                pagination: result.pagination,
                stats: result.stats
            });
        } catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch messages'
            });
        }
    }

    // Get single message
    async getMessageById(req, res) {
        try {
            const message = await messageService.getMessageById(req.params.id);

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Get message error:', error);

            if (error.message === 'Message not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to fetch message'
            });
        }
    }

    // Mark message as read/unread
    async updateReadStatus(req, res) {
        try {
            const { isRead } = req.body;
            const message = await messageService.updateReadStatus(
                req.params.id,
                isRead !== undefined ? isRead : true
            );

            res.json({
                success: true,
                message: `Message marked as ${message.isRead ? 'read' : 'unread'}`,
                data: message
            });
        } catch (error) {
            console.error('Update message error:', error);

            if (error.message === 'Message not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update message'
            });
        }
    }

    // Mark message as spam
    async markAsSpam(req, res) {
        try {
            const message = await messageService.markAsSpam(req.params.id);

            res.json({
                success: true,
                message: 'Message marked as spam',
                data: message
            });
        } catch (error) {
            console.error('Mark spam error:', error);

            if (error.message === 'Message not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to mark message as spam'
            });
        }
    }

    // Delete message
    async deleteMessage(req, res) {
        try {
            await messageService.deleteMessage(req.params.id);

            res.json({
                success: true,
                message: 'Message deleted successfully'
            });
        } catch (error) {
            console.error('Delete message error:', error);

            if (error.message === 'Message not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to delete message'
            });
        }
    }

    // Bulk delete messages
    async bulkDeleteMessages(req, res) {
        try {
            const deletedCount = await messageService.bulkDeleteMessages(req.body.ids);

            res.json({
                success: true,
                message: `${deletedCount} message(s) deleted successfully`,
                deletedCount
            });
        } catch (error) {
            console.error('Bulk delete error:', error);

            if (error.message === 'Please provide message IDs to delete') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to delete messages'
            });
        }
    }
}

module.exports = new MessageController();
