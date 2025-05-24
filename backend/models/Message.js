// Import mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for a message document
const messageSchema = new mongoose.Schema({
  // Reference to the sender (User)
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Reference to the receiver (User)
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // The message content
  message: { type: String, required: true },
  // Timestamp for when the message was created
  timestamp: { type: Date, default: Date.now }
});

// Export the Message model based on the schema
module.exports = mongoose.model('Message', messageSchema);