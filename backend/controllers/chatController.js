import Message from '../models/Message.js';

// Get chat history between two users
export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req;
    const { otherUserId } = req.params;
    
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(50);
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req;
    const { senderId } = req.params;
    
    await Message.updateMany(
      { sender: senderId, receiver: userId, read: false },
      { read: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req;
    
    const count = await Message.countDocuments({
      receiver: userId,
      read: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting unread count' });
  }
}; 