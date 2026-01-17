const Message = require('../models/Message');

class MessageService {
    // Create a new contact message
    // @param {Object} messageData - Message data
    // @returns {Promise<Object>} Created message
    async createMessage(messageData) {
        const { name, email, subject, message, phone } = messageData;

        const newMessage = new Message({
            name,
            email,
            subject,
            message,
            phone
        });

        await newMessage.save();

        return {
            id: newMessage._id,
            name: newMessage.name,
            email: newMessage.email,
            subject: newMessage.subject,
            createdAt: newMessage.createdAt
        };
    }

    // Get all messages with filters and pagination
    // @param {Object} filters - Filter options
    // @returns {Promise<Object>} Messages with pagination and stats
    async getAllMessages(filters) {
        const { status, search, page = 1, limit = 10 } = filters;

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
        const stats = await this.getMessageStats();

        return {
            messages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            },
            stats
        };
    }

    // Get message by ID
    // @param {string} messageId - Message ID
    // @returns {Promise<Object>} Message
    async getMessageById(messageId) {
        const message = await Message.findById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }
        return message;
    }

    // Update message read status
    // @param {string} messageId - Message ID
    // @param {boolean} isRead - Read status
    // @returns {Promise<Object>} Updated message
    async updateReadStatus(messageId, isRead = true) {
        const message = await Message.findByIdAndUpdate(
            messageId,
            { isRead },
            { new: true }
        );

        if (!message) {
            throw new Error('Message not found');
        }

        return message;
    }

    // Mark message as spam
    // @param {string} messageId - Message ID
    // @returns {Promise<Object>} Updated message
    async markAsSpam(messageId) {
        const message = await Message.findByIdAndUpdate(
            messageId,
            { isSpam: true },
            { new: true }
        );

        if (!message) {
            throw new Error('Message not found');
        }

        return message;
    }

    // Delete message
    // @param {string} messageId - Message ID
    // @returns {Promise<Object>} Deleted message
    async deleteMessage(messageId) {
        const message = await Message.findByIdAndDelete(messageId);
        if (!message) {
            throw new Error('Message not found');
        }
        return message;
    }

    // Bulk delete messages
    // @param {Array<string>} messageIds - Array of message IDs
    // @returns {Promise<number>} Number of deleted messages
    async bulkDeleteMessages(messageIds) {
        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            throw new Error('Please provide message IDs to delete');
        }

        const result = await Message.deleteMany({ _id: { $in: messageIds } });
        return result.deletedCount;
    }

    // Get message statistics
    // @returns {Promise<Object>} Message stats
    async getMessageStats() {
        return {
            total: await Message.countDocuments({ isSpam: false }),
            unread: await Message.countDocuments({ isRead: false, isSpam: false }),
            read: await Message.countDocuments({ isRead: true, isSpam: false }),
            spam: await Message.countDocuments({ isSpam: true })
        };
    }
}

module.exports = new MessageService();
