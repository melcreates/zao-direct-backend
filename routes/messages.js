const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messageController');
const authMiddleware = require("../middleware/verifyToken");

router.get('/messages/:otherUserId', authMiddleware, messagesController.getConversation);
router.get('/chats', authMiddleware, messagesController.getChatList);

router.post('/messages', authMiddleware, messagesController.createMessage);


module.exports = router;