import express from 'express';
import { getChatHistory, markMessagesAsRead, getUnreadCount } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

router.get('/history/:otherUserId', getChatHistory);
router.put('/read/:senderId', markMessagesAsRead);
router.get('/unread', getUnreadCount);

export default router; 