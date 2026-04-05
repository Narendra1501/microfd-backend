import express from 'express';
import { getChats, postChat, clearChats } from '../controllers/chatController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.delete('/clear', authorize('faculty'), clearChats);
router.get('/', getChats);
router.post('/', postChat);

export default router;
