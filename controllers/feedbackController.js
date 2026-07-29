import { format } from 'date-fns';
import { createFeedback, getFeedbacksByStudent } from '../utils/dbStore.js';

const formatFeedback = (fb) => {
    if (!fb) return null;
    return {
        ...fb,
        _id: fb.id,
        studentId: fb.studentId ?? fb.student_id,
        dateString: fb.dateString ?? fb.date_string,
        ratings: fb.ratings || {
            lifeSkills: fb.life_skills,
            learningExperience: fb.learning_experience,
            teacherReach: fb.teacher_reach,
            overall: fb.overall
        },
        textFeedback: (fb.textFeedback ?? fb.text_feedback) || {
            makeMoreInteresting: fb.make_more_interesting,
            mostInteresting: fb.most_interesting,
            classImpact: fb.class_impact
        },
        createdAt: fb.createdAt ?? fb.created_at
    };
};

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
        const studentId = req.user.id;

        const existingFeedback = getFeedbacksByStudent(studentId).find((entry) => (entry.dateString ?? entry.date_string) === dateString);
        if (existingFeedback) {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for today' });
        }

        const feedback = createFeedback({
            student_id: studentId,
            studentId,
            date_string: dateString,
            dateString,
            ratings,
            text_feedback: textFeedback,
            textFeedback,
            created_at: new Date().toISOString()
        });

        res.status(201).json({ success: true, data: formatFeedback(feedback) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getMyFeedbacks = async (req, res) => {
    try {
        const studentId = req.user.id;
        const feedbacks = getFeedbacksByStudent(studentId).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        const formatted = (feedbacks || []).map(formatFeedback);
        res.status(200).json({ success: true, count: formatted.length, data: formatted });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
