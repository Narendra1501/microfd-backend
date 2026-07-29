import { dbStore, deleteFeedback as removeFeedback, deleteFeedbacksForStudent, deleteUser, listFeedbacks, listUsers, updateUser } from '../utils/dbStore.js';

const getRatings = (fb) => {
    if (fb.ratings) {
        return {
            lifeSkills: Number(fb.ratings.lifeSkills || 0),
            learningExperience: Number(fb.ratings.learningExperience || 0),
            teacherReach: Number(fb.ratings.teacherReach || 0),
            overall: Number(fb.ratings.overall || 0)
        };
    }
    return {
        lifeSkills: Number(fb.life_skills || 0),
        learningExperience: Number(fb.learning_experience || 0),
        teacherReach: Number(fb.teacher_reach || 0),
        overall: Number(fb.overall || 0)
    };
};

export const getAllFeedbacks = async (req, res) => {
    try {
        const reqQuery = { ...req.query };
        delete reqQuery.sort;
        const feedbacks = listFeedbacks(reqQuery);
        const formatted = (feedbacks || []).map((fb) => {
            const { studentId, student_id, id, _id, ...rest } = fb;
            return {
                ...rest,
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
                dateString: fb.dateString ?? fb.date_string,
                createdAt: fb.createdAt ?? fb.created_at
            };
        });

        if (req.query.sort) {
            const isDesc = req.query.sort.startsWith('-');
            const col = req.query.sort.replace('-', '');
            formatted.sort((a, b) => {
                const left = a[col] || '';
                const right = b[col] || '';
                return (String(left).localeCompare(String(right))) * (isDesc ? -1 : 1);
            });
        }

        res.status(200).json({ success: true, count: formatted.length, data: formatted });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteFeedback = async (req, res) => {
    try {
        const removed = removeFeedback(req.params.id);
        if (!removed) {
            return res.status(404).json({ success: false, message: 'Feedback not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const disableStudent = async (req, res) => {
    try {
        const user = listUsers().find((entry) => entry.id === req.params.id || entry._id === req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'faculty') {
            return res.status(400).json({ success: false, message: 'Cannot disable another faculty account' });
        }

        const currentDisabled = user.isDisabled ?? user.is_disabled ?? false;
        const newStatus = req.body.isDisabled !== undefined ? req.body.isDisabled : !currentDisabled;
        const updatedUser = updateUser(user.id, { isDisabled: newStatus, is_disabled: newStatus });

        const userObj = {
            ...updatedUser,
            _id: updatedUser.id,
            registerNumber: updatedUser.registerNumber ?? updatedUser.register_number,
            isDisabled: updatedUser.isDisabled ?? updatedUser.is_disabled
        };

        res.status(200).json({ success: true, data: userObj });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const user = listUsers().find((entry) => entry.id === req.params.id || entry._id === req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'faculty') {
            return res.status(400).json({ success: false, message: 'Cannot delete another faculty account' });
        }

        deleteFeedbacksForStudent(user.id);
        deleteUser(user.id);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getDailySummary = async (req, res) => {
    try {
        let { dateString } = req.query;
        const feedbacks = listFeedbacks();

        if (!dateString) {
            const latest = [...feedbacks].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0];
            if (!latest) return res.status(200).json({ success: true, data: null });
            dateString = latest.dateString ?? latest.date_string;
        }

        const filtered = feedbacks.filter((fb) => (fb.dateString ?? fb.date_string) === dateString);
        if (!filtered.length) {
            return res.status(200).json({ success: true, data: { dateString, totalSubmissions: 0 } });
        }

        let lifeSkills = 0;
        let learningExperience = 0;
        let teacherReach = 0;
        let overall = 0;

        filtered.forEach((fb) => {
            const r = getRatings(fb);
            lifeSkills += r.lifeSkills;
            learningExperience += r.learningExperience;
            teacherReach += r.teacherReach;
            overall += r.overall;
        });

        const count = filtered.length;

        res.status(200).json({
            success: true,
            data: {
                dateString,
                totalSubmissions: count,
                lifeSkills: lifeSkills / count,
                learningExperience: learningExperience / count,
                teacherReach: teacherReach / count,
                overall: overall / count
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getTrends = async (req, res) => {
    try {
        const feedbacks = listFeedbacks();
        const trendsMap = {};

        feedbacks.forEach((fb) => {
            const ds = fb.dateString ?? fb.date_string;
            if (!ds) return;

            if (!trendsMap[ds]) {
                trendsMap[ds] = {
                    _id: { dateString: ds },
                    lifeSkillsSum: 0,
                    learningExperienceSum: 0,
                    teacherReachSum: 0,
                    overallSum: 0,
                    totalSubmissions: 0
                };
            }

            const r = getRatings(fb);
            trendsMap[ds].lifeSkillsSum += r.lifeSkills;
            trendsMap[ds].learningExperienceSum += r.learningExperience;
            trendsMap[ds].teacherReachSum += r.teacherReach;
            trendsMap[ds].overallSum += r.overall;
            trendsMap[ds].totalSubmissions += 1;
        });

        const trends = Object.keys(trendsMap).sort().map((ds) => {
            const item = trendsMap[ds];
            const count = item.totalSubmissions;
            return {
                _id: item._id,
                dateString: ds,
                lifeSkills: item.lifeSkillsSum / count,
                learningExperience: item.learningExperienceSum / count,
                teacherReach: item.teacherReachSum / count,
                overall: item.overallSum / count,
                totalSubmissions: count
            };
        });

        res.status(200).json({ success: true, data: trends });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getSemesterOverall = async (req, res) => {
    try {
        const feedbacks = listFeedbacks();
        if (!feedbacks.length) {
            return res.status(200).json({ success: true, data: null });
        }

        let lifeSkills = 0;
        let learningExperience = 0;
        let teacherReach = 0;
        let overall = 0;

        feedbacks.forEach((fb) => {
            const r = getRatings(fb);
            lifeSkills += r.lifeSkills;
            learningExperience += r.learningExperience;
            teacherReach += r.teacherReach;
            overall += r.overall;
        });

        const count = feedbacks.length;

        res.status(200).json({
            success: true,
            data: {
                lifeSkills: lifeSkills / count,
                learningExperience: learningExperience / count,
                teacherReach: teacherReach / count,
                overall: overall / count,
                totalSubmissions: count
            }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const clearAllFeedback = async (req, res) => {
    try {
        dbStore.feedbacks = [];
        res.status(200).json({ success: true, message: 'All feedback data cleared successfully.' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const resetDailyFeedback = async (req, res) => {
    try {
        const { dateString } = req.body;

        if (!dateString) {
            return res.status(400).json({ success: false, message: 'Please provide dateString.' });
        }

        const deleted = dbStore.feedbacks.filter((fb) => (fb.dateString ?? fb.date_string) === dateString);
        dbStore.feedbacks = dbStore.feedbacks.filter((fb) => (fb.dateString ?? fb.date_string) !== dateString);

        res.status(200).json({ success: true, message: `Cleared ${deleted.length} feedbacks for ${dateString}.` });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
