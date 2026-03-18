import express from 'express';
import {
    getAllFeedbacks,
    deleteFeedback,
    disableStudent,
    deleteStudent,
    getDailySummary,
    getTrends,
    getSemesterOverall,
    clearAllFeedback,
    resetDailyFeedback
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('faculty'));

router.get('/feedbacks', getAllFeedbacks);
router.get('/daily-summary', getDailySummary);
router.get('/trends', getTrends);
router.get('/semester-overall', getSemesterOverall);
router.delete('/feedback/:id', deleteFeedback);
router.delete('/clear-all', clearAllFeedback);
router.delete('/reset-daily', resetDailyFeedback);
router.patch('/disable-student/:id', disableStudent);
router.delete('/delete-student/:id', deleteStudent);

export default router;
