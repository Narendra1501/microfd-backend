import multer from 'multer';
import { createNote, listNotes } from '../utils/dbStore.js';

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

const formatNote = (note) => {
    if (!note) return null;
    return {
        ...note,
        _id: note.id,
        unitNumber: note.unitNumber ?? note.unit_number,
        fileName: note.fileName ?? note.file_name,
        filePath: note.filePath ?? note.file_path,
        createdAt: note.createdAt ?? note.created_at
    };
};

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

        const note = createNote({
            unit_number: unitNumber,
            unitNumber: unitNumber,
            file_name: req.file.originalname,
            fileName: req.file.originalname,
            file_path: `/uploads/notes/${req.file.filename}`,
            filePath: `/uploads/notes/${req.file.filename}`,
            created_at: new Date().toISOString()
        });

        res.status(201).json({ success: true, data: formatNote(note) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get all course notes
// @route   GET /api/notes
// @access  Public (Student/Faculty)
export const getNotes = async (req, res) => {
    try {
        const notes = listNotes().sort((a, b) => String(a.unitNumber || a.unit_number || '').localeCompare(String(b.unitNumber || b.unit_number || '')));
        const formatted = (notes || []).map(formatNote);
        res.status(200).json({ success: true, data: formatted });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
