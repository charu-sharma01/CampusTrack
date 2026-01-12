
import express from 'express';
import { getMessages, getConversations, sendMessage, blockUser, reportUser, markAsRead } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/:matchId', protect, getMessages);
router.post('/', protect, sendMessage);
router.post('/block', protect, blockUser);
router.post('/report', protect, reportUser);
router.put('/read/:messageId', protect, markAsRead);

export default router;
