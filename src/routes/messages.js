const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');
const { messageValidation } = require('../utils/validators');
const { handleValidationErrors } = require('../utils/responseHelper');

//POST /api/messages
router.post(
    '/',
    messageValidation,
    handleValidationErrors,
    messageController.createMessage
);

//GET /api/messages
router.get('/', authMiddleware, messageController.getAllMessages);

//GET /api/messages/:id
router.get('/:id', authMiddleware, messageController.getMessageById);

//PATCH /api/messages/:id/read
router.patch('/:id/read', authMiddleware, messageController.updateReadStatus);

//PATCH /api/messages/:id/spam
router.patch('/:id/spam', authMiddleware, messageController.markAsSpam);

//DELETE /api/messages/:id
router.delete('/:id', authMiddleware, messageController.deleteMessage);

//POST /api/messages/bulk/delete
router.post('/bulk/delete', authMiddleware, messageController.bulkDeleteMessages);

module.exports = router;
