const Message = require('../models/message');

exports.getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 'asc' })
      .populate('sender', 'username')
      .populate('recipient', 'username');

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
