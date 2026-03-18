import express from 'express';
import { getChats, postChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getChats);
router.post('/', postChat);

export default router;
