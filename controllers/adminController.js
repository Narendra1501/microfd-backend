import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

// @desc    Get all feedbacks
// @route   GET /api/admin/feedbacks
// @access  Private (Faculty)
export const getAllFeedbacks = async (req, res) => {
    try {
        let query;
        const reqQuery = { ...req.query };
        const removeFields = ['sort'];
        removeFields.forEach(param => delete reqQuery[param]);

        query = Feedback.find(reqQuery).select('-studentId -_id');

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const feedbacks = await query;
        res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a specific feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private (Faculty)
export const deleteFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }
        await feedback.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Disable or re-enable a student account
// @route   PATCH /api/admin/disable-student/:id
// @access  Private (Faculty)
export const disableStudent = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'faculty') {
            return res.status(400).json({ success: false, message: 'Cannot disable another faculty account' });
        }
        user.isDisabled = req.body.isDisabled !== undefined ? req.body.isDisabled : !user.isDisabled;
        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete a student permanently
// @route   DELETE /api/admin/delete-student/:id
// @access  Private (Faculty)
export const deleteStudent = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (user.role === 'faculty') {
            return res.status(400).json({ success: false, message: 'Cannot delete another faculty account' });
        }
        await Feedback.deleteMany({ studentId: user._id });
        await user.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get daily summary
// @route   GET /api/admin/daily-summary
// @access  Private (Faculty)
export const getDailySummary = async (req, res) => {
    try {
        let { dateString } = req.query;
        if (!dateString) {
            const latest = await Feedback.findOne().sort('-dateString');
            if (!latest) return res.status(200).json({ success: true, data: null });
            dateString = latest.dateString;
        }

        const stats = await Feedback.aggregate([
            { $match: { dateString } },
            {
                $group: {
                    _id: null,
                    lifeSkills: { $avg: "$ratings.lifeSkills" },
                    learningExperience: { $avg: "$ratings.learningExperience" },
                    teacherReach: { $avg: "$ratings.teacherReach" },
                    overall: { $avg: "$ratings.overall" },
                    totalSubmissions: { $sum: 1 }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(200).json({ success: true, data: { dateString, totalSubmissions: 0 } });
        }

        res.status(200).json({ success: true, data: { ...stats[0], dateString } });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get historically daily trends
// @route   GET /api/admin/trends
// @access  Private (Faculty)
export const getTrends = async (req, res) => {
    try {
        const trends = await Feedback.aggregate([
            {
                $group: {
                    _id: { dateString: "$dateString" },
                    lifeSkills: { $avg: "$ratings.lifeSkills" },
                    learningExperience: { $avg: "$ratings.learningExperience" },
                    teacherReach: { $avg: "$ratings.teacherReach" },
                    overall: { $avg: "$ratings.overall" },
                    totalSubmissions: { $sum: 1 }
                }
            },
            { $sort: { "_id.dateString": 1 } }
        ]);

        res.status(200).json({ success: true, data: trends });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get semester overall rating (all feedbacks)
// @route   GET /api/admin/semester-overall
// @access  Private (Faculty)
export const getSemesterOverall = async (req, res) => {
    try {
        const stats = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    lifeSkills: { $avg: "$ratings.lifeSkills" },
                    learningExperience: { $avg: "$ratings.learningExperience" },
                    teacherReach: { $avg: "$ratings.teacherReach" },
                    overall: { $avg: "$ratings.overall" },
                    totalSubmissions: { $sum: 1 }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(200).json({ success: true, data: null });
        }

        res.status(200).json({ success: true, data: stats[0] });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Clear all feedback data
// @route   DELETE /api/admin/clear-all
// @access  Private (Faculty)
export const clearAllFeedback = async (req, res) => {
    try {
        await Feedback.deleteMany({});
        res.status(200).json({ success: true, message: 'All feedback data cleared successfully.' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reset a specific day's feedback
// @route   DELETE /api/admin/reset-daily
// @access  Private (Faculty)
export const resetDailyFeedback = async (req, res) => {
    try {
        const { dateString } = req.body;

        if (!dateString) {
             return res.status(400).json({ success: false, message: 'Please provide dateString.' });
        }

        const result = await Feedback.deleteMany({ dateString });
        
        res.status(200).json({ 
            success: true, 
            message: `Cleared ${result.deletedCount} feedbacks for ${dateString}.` 
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
