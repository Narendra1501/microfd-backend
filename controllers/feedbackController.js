import Feedback from '../models/Feedback.js';
import { format } from 'date-fns';

// @desc    Submit feedback
// @route   POST /api/feedback/submit
// @access  Private (Student)
export const submitFeedback = async (req, res) => {
    try {
        const { ratings, textFeedback } = req.body;

        if (!ratings || !ratings.lifeSkills || !ratings.learningExperience || !ratings.teacherReach || !ratings.overall) {
            return res.status(400).json({ success: false, message: 'Please provide all 3 ratings' });
        }
        
        if (!textFeedback || !textFeedback.makeMoreInteresting || !textFeedback.mostInteresting || !textFeedback.classImpact) {
            return res.status(400).json({ success: false, message: 'Please provide all text feedback answers' });
        }

        const dateString = format(new Date(), 'yyyy-MM-dd');

        // Check if student already submitted feedback for this day
        const existingFeedback = await Feedback.findOne({ studentId: req.user.id, dateString });

        if (existingFeedback) {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for today' });
        }

        const feedback = await Feedback.create({
            studentId: req.user.id,
            dateString,
            ratings,
            textFeedback
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for today' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get logged in student's feedbacks
// @route   GET /api/feedback/my
// @access  Private (Student)
export const getMyFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ studentId: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
