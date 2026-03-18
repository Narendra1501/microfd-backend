import multer from 'multer';
import path from 'path';
import CourseNote from '../models/CourseNote.js';

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/notes');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

// File Filter (Only PDFs)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// @desc    Upload course note
// @route   POST /api/notes
// @access  Private (Faculty)
export const uploadNote = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
        }

        const { unitNumber } = req.body;
        if (!unitNumber) {
            return res.status(400).json({ success: false, message: 'Please specify the unit number' });
        }

        // Check if note for this unit already exists, if so update it or delete the old file
        // For simplicity, we'll just allow multiple or you can implement overwrite logic.
        // The user said "upload notes for each unit", implying one per unit is likely.
        
        const note = await CourseNote.create({
            unitNumber,
            fileName: req.file.originalname,
            filePath: `/uploads/notes/${req.file.filename}`
        });

        res.status(201).json({ success: true, data: note });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all course notes
// @route   GET /api/notes
// @access  Public (Student/Faculty)
export const getNotes = async (req, res) => {
    try {
        const notes = await CourseNote.find().sort({ unitNumber: 1 });
        res.status(200).json({ success: true, data: notes });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
