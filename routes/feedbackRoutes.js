import express from 'express';
import { submitFeedback, getMyFeedbacks } from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('student'));

router.post('/submit', submitFeedback);
router.get('/my', getMyFeedbacks);

export default router;
