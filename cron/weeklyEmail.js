import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import cron from 'node-cron';
import supabase from '../config/supabase.js';
import { sendWeeklyAnalysisEmail, sendWeeklyUpdateEmail } from '../utils/mailer.js';

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

export const startCronJobs = () => {

    // Every Friday at 5:00 PM
    cron.schedule('0 17 * * 5', async () => {
        console.log('[CRON] Weekly feedback analysis started');

        try {

            // Change "feedback" to "feedbacks" only if your table is named feedbacks
            const { data: allFeedbacks, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error(error);
                return;
            }

            if (!allFeedbacks || allFeedbacks.length === 0) {
                console.log('No feedback found.');
                return;
            }

            const firstDateStr =
                allFeedbacks[0].dateString ??
                allFeedbacks[0].date_string;

            if (!firstDateStr) return;

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

                        ratingsSum: {
                            lifeSkills: 0,
                            learningExperience: 0,
                            teacherReach: 0,
                            overall: 0
                        }

                    };

                }

                const r = getRatings(fb);

                weeksMap[weekNum].feedbacks.push(fb);

                weeksMap[weekNum].totalSubmissions++;

                weeksMap[weekNum].ratingsSum.lifeSkills += r.lifeSkills;
                weeksMap[weekNum].ratingsSum.learningExperience += r.learningExperience;
                weeksMap[weekNum].ratingsSum.teacherReach += r.teacherReach;
                weeksMap[weekNum].ratingsSum.overall += r.overall;

            });

            const weeks = Object.values(weeksMap).sort(
                (a, b) => b.weekNum - a.weekNum
            );

            if (!weeks.length) return;

            const latestWeek = weeks[0];

            latestWeek.summary = {

                overall:
                    latestWeek.ratingsSum.overall /
                    latestWeek.totalSubmissions,

                lifeSkills:
                    latestWeek.ratingsSum.lifeSkills /
                    latestWeek.totalSubmissions,

                learningExperience:
                    latestWeek.ratingsSum.learningExperience /
                    latestWeek.totalSubmissions,

                teacherReach:
                    latestWeek.ratingsSum.teacherReach /
                    latestWeek.totalSubmissions

            };

            const { data: facultyMembers, error: facultyError } = await supabase
                .from('users')
                .select('email')
                .eq('role', 'faculty');

            if (facultyError) {
                console.error(facultyError);
                return;
            }

            const facultyEmails =
                facultyMembers?.map(f => f.email).filter(Boolean) || [];

            if (facultyEmails.length > 0) {
                await sendWeeklyAnalysisEmail(
                    facultyEmails,
                    latestWeek
                );
            }

            console.log('[CRON] Weekly report sent successfully.');

        } catch (error) {

            console.error('Weekly cron error:', error);

        }

    });

    // Every Saturday at 9:00 AM IST
    cron.schedule(
        '0 9 * * 6',
        async () => {

            console.log('[CRON] Saturday reminder email started');

            try {

                await sendWeeklyUpdateEmail(
                    process.env.FACULTY_EMAIL
                );

                console.log('[CRON] Reminder email sent.');

            } catch (error) {

                console.error('Saturday cron error:', error);

            }

        },
        {
            scheduled: true,
            timezone: 'Asia/Kolkata'
        }
    );

    console.log('Cron jobs initialized.');
};