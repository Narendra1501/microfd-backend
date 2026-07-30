import { format } from 'date-fns';
import supabase from '../config/supabase.js';

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

        // Check if student already submitted feedback for this day
        const { data: existingFeedback } = await supabase
            .from('feedbacks')
            .select('id')
            .or(`student_id.eq.${studentId},studentId.eq.${studentId}`)
            .or(`date_string.eq.${dateString},dateString.eq.${dateString}`)
            .maybeSingle();

        if (existingFeedback) {
            return res.status(400).json({ success: false, message: 'You have already submitted feedback for today' });
        }

        const { data: feedback, error } = await supabase
            .from('feedbacks')
            .insert([{
                student_id: studentId,
                studentId: studentId,
                date_string: dateString,
                dateString: dateString,
                ratings: ratings,
                text_feedback: textFeedback,
                textFeedback: textFeedback,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ success: false, message: 'You have already submitted feedback for today' });
            }
            return res.status(400).json({ success: false, message: error.message });
        }

        res.status(201).json({ success: true, data: formatFeedback(feedback) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getMyFeedbacks = async (req, res) => {
    try {
        const studentId = req.user.id;

        const { data: feedbacks, error } = await supabase
            .from('feedbacks')
            .select('*')
            .or(`student_id.eq.${studentId},studentId.eq.${studentId}`)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const formatted = (feedbacks || []).map(formatFeedback);

        res.status(200).json({ success: true, count: formatted.length, data: formatted });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
