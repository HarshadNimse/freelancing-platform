const Message = require('../models/Message');

// Send a message
exports.sendMessage = async (req, res) => {
  const { receiverId, message } = req.body;
  const senderId = req.user.id; // From auth middleware

  const newMessage = new Message({ senderId, receiverId, message });
  await newMessage.save();
  res.status(201).json(newMessage);
};

// Get chat history between two users
exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  const myId = req.user.id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userId },
      { senderId: userId, receiverId: myId }
    ]
  }).sort({ timestamp: 1 });

  res.status(200).json(messages);
};
