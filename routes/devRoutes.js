import express from 'express';
import { resetFacultyPasswordManual } from '../controllers/devController.js';

const router = express.Router();

router.post('/reset-faculty-password', resetFacultyPasswordManual);

export default router;
