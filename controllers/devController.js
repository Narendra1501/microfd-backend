import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import { sendWeeklyAnalysisEmail } from '../utils/mailer.js';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

// @desc    Manual password reset for developer recovery
// @route   POST /api/dev/reset-faculty-password
// @access  Developer Only (Manual)
export const resetFacultyPasswordManual = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Please provide email and newPassword' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only allow resetting faculty accounts via this specific route if requested
        // but the prompt says reset faculty password manually, so we'll check role if needed.
        // The prompt says "allows the password to be changed manually", usually for the forgotten faculty account.
        
        user.password = newPassword;
        await user.save();

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
        const allFeedbacks = await Feedback.find().sort({ dateString: 1 });
        if (!allFeedbacks.length) return res.status(200).json({ success: true, message: 'No feedbacks to process' });

        const earliestDate = startOfDay(parseISO(allFeedbacks[0].dateString));
        const weeksMap = {};
        
        allFeedbacks.forEach(fb => {
            const currentDate = startOfDay(parseISO(fb.dateString));
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
            weeksMap[weekNum].feedbacks.push(fb);
            weeksMap[weekNum].totalSubmissions += 1;
            weeksMap[weekNum].ratingsSum.lifeSkills += fb.ratings.lifeSkills || 0;
            weeksMap[weekNum].ratingsSum.learningExperience += fb.ratings.learningExperience || 0;
            weeksMap[weekNum].ratingsSum.teacherReach += fb.ratings.teacherReach || 0;
            weeksMap[weekNum].ratingsSum.overall += fb.ratings.overall || 0;
        });

        const weeks = Object.values(weeksMap).sort((a, b) => b.weekNum - a.weekNum);
        const latestWeek = weeks[0];

        latestWeek.summary = {
            overall: latestWeek.ratingsSum.overall / latestWeek.totalSubmissions,
            lifeSkills: latestWeek.ratingsSum.lifeSkills / latestWeek.totalSubmissions,
            learningExperience: latestWeek.ratingsSum.learningExperience / latestWeek.totalSubmissions,
            teacherReach: latestWeek.ratingsSum.teacherReach / latestWeek.totalSubmissions
        };

        const facultyMembers = await User.find({ role: 'faculty' });
        const facultyEmails = facultyMembers.map(f => f.email).filter(Boolean);

        if (facultyEmails.length > 0) {
            await sendWeeklyAnalysisEmail(facultyEmails, latestWeek);
        }

        res.status(200).json({ success: true, message: 'Test email logic executed', latestWeek, sentTo: facultyEmails });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

