import express from 'express';
import { uploadNote, getNotes, upload } from '../controllers/noteController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Publicly available to authenticated users
router.get('/', protect, getNotes);

// Faculty only upload
router.post('/', protect, authorize('faculty'), upload.single('note'), uploadNote);

export default router;
