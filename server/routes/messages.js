const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getConversations, getMessages, startConversation } = require('../controllers/messageController');

// @route GET /api/messages/conversations
router.get('/conversations', auth, getConversations);

// @route GET /api/messages/:conversationId
router.get('/:conversationId', auth, getMessages);

// @route POST /api/messages/start
router.post('/start', auth, startConversation);

module.exports = router;
