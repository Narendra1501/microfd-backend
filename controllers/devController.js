import bcrypt from 'bcrypt';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import supabase from '../config/supabase.js';
import { sendWeeklyAnalysisEmail } from '../utils/mailer.js';

// Helper to extract ratings from a feedback row
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

// @desc    Manual password reset for developer recovery
// @route   POST /api/dev/reset-faculty-password
// @access  Developer Only (Manual)
export const resetFacultyPasswordManual = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide email and newPassword' });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', email);

        res.status(200).json({
            success: true,
            message: `Password for ${email} has been reset successfully.`
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const testWeeklyEmail = async (req, res) => {
    try {
        const { data: allFeedbacks } = await supabase
            .from('feedbacks')
            .select('*')
            .order('date_string', { ascending: true });

        if (!allFeedbacks || !allFeedbacks.length) {
            return res.status(200).json({ success: true, message: 'No feedbacks to process' });
        }

        const firstDateStr = allFeedbacks[0].dateString ?? allFeedbacks[0].date_string;
        const earliestDate = startOfDay(parseISO(firstDateStr));
        const weeksMap = {};

        allFeedbacks.forEach(fb => {
            const ds = fb.dateString ?? fb.date_string;
            if (!ds) return;
            const currentDate = startOfDay(parseISO(ds));
            const diff = differenceInDays(currentDate, earliestDate);
            const weekNum = Math.floor(diff / 7) + 1;

            if (!weeksMap[weekNum]) {
                weeksMap[weekNum] = {
                    weekNum,
                    feedbacks: [],
                    totalSubmissions: 0,
                    ratingsSum: { lifeSkills: 0, learningExperience: 0, teacherReach: 0, overall: 0 }
                };
            }

            const r = getRatings(fb);
            weeksMap[weekNum].feedbacks.push(fb);
            weeksMap[weekNum].totalSubmissions += 1;
            weeksMap[weekNum].ratingsSum.lifeSkills += r.lifeSkills;
            weeksMap[weekNum].ratingsSum.learningExperience += r.learningExperience;
            weeksMap[weekNum].ratingsSum.teacherReach += r.teacherReach;
            weeksMap[weekNum].ratingsSum.overall += r.overall;
        });

        const weeks = Object.values(weeksMap).sort((a, b) => b.weekNum - a.weekNum);
        const latestWeek = weeks[0];

        latestWeek.summary = {
            overall: latestWeek.ratingsSum.overall / latestWeek.totalSubmissions,
            lifeSkills: latestWeek.ratingsSum.lifeSkills / latestWeek.totalSubmissions,
            learningExperience: latestWeek.ratingsSum.learningExperience / latestWeek.totalSubmissions,
            teacherReach: latestWeek.ratingsSum.teacherReach / latestWeek.totalSubmissions
        };

        const { data: facultyMembers } = await supabase
            .from('users')
            .select('email')
            .eq('role', 'faculty');

        const facultyEmails = (facultyMembers || []).map(f => f.email).filter(Boolean);

        if (facultyEmails.length > 0) {
            await sendWeeklyAnalysisEmail(facultyEmails, latestWeek);
        }

        res.status(200).json({ success: true, message: 'Test email logic executed', latestWeek, sentTo: facultyEmails });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
