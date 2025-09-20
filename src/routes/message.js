const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const messageController = require('../controllers/message');

// @route   GET api/messages/:userId
// @desc    Get chat history with a specific user
// @access  Private
router.get('/:userId', auth, messageController.getChatHistory);

module.exports = router;
