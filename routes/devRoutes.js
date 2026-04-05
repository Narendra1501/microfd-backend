import express from 'express';
import { resetFacultyPasswordManual, testWeeklyEmail } from '../controllers/devController.js';

const router = express.Router();

router.post('/reset-faculty-password', resetFacultyPasswordManual);
router.get('/test-weekly-email', testWeeklyEmail);

export default router;
