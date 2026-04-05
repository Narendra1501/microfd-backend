import cron from 'node-cron';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import { sendWeeklyAnalysisEmail, sendWeeklyUpdateEmail } from '../utils/mailer.js';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

export const startCronJobs = () => {
    // Run every Friday at 17:00 (5 PM)
    cron.schedule('0 17 * * 5', async () => {
        console.log('Running weekly feedback analysis cron job...');
        try {
            // Calculate current week's stats
            const allFeedbacks = await Feedback.find().sort({ dateString: 1 });
            if (!allFeedbacks.length) return;

            const earliestDate = startOfDay(parseISO(allFeedbacks[0].dateString));

            // Get current week feedbacks (feedbacks within the last 7 days from now)
            const currentWeekFeedbacks = [];
            // To properly identify "Week N", we use the same formulation
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
                weeksMap[weekNum].ratingsSum.lifeSkills += fb.ratings.lifeSkills;
                weeksMap[weekNum].ratingsSum.learningExperience += fb.ratings.learningExperience;
                weeksMap[weekNum].ratingsSum.teacherReach += fb.ratings.teacherReach;
                weeksMap[weekNum].ratingsSum.overall += fb.ratings.overall;
            });

            const weeks = Object.values(weeksMap).sort((a, b) => b.weekNum - a.weekNum); // newest first
            if (!weeks.length) return;

            const latestWeek = weeks[0]; // Currently active week

            // Calculate summaries
            latestWeek.summary = {
                overall: latestWeek.ratingsSum.overall / latestWeek.totalSubmissions,
                lifeSkills: latestWeek.ratingsSum.lifeSkills / latestWeek.totalSubmissions,
                learningExperience: latestWeek.ratingsSum.learningExperience / latestWeek.totalSubmissions,
                teacherReach: latestWeek.ratingsSum.teacherReach / latestWeek.totalSubmissions
            };

            // Grab all faculty emails
            const facultyMembers = await User.find({ role: 'faculty' });
            const facultyEmails = facultyMembers.map(f => f.email).filter(Boolean);

            if (facultyEmails.length > 0) {
                await sendWeeklyAnalysisEmail(facultyEmails, latestWeek);
            }
        } catch (error) {
            console.error('Error in weekly cron job:', error);
        }
    });

    // Run every Saturday at 9:00 AM IST
    cron.schedule('0 9 * * 6', async () => {
        console.log('Running Saturday morning email cron job...');
        try {
            await sendWeeklyUpdateEmail('2401109085@ptuniv.edu.in');
        } catch (error) {
            console.error('Error in Saturday morning cron job:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('Cron jobs initialized.');
};

// export const startCronJobs = () => {

//     // Run every 1 minute
//     cron.schedule('* * * * *', async () => {
//         console.log('Running weekly feedback analysis cron job...');
//         try {
//             const allFeedbacks = await Feedback.find().sort({ dateString: 1 });
//             if (!allFeedbacks.length) return;

//             const earliestDate = startOfDay(parseISO(allFeedbacks[0].dateString));

//             const weeksMap = {};

//             allFeedbacks.forEach(fb => {
//                 const currentDate = startOfDay(parseISO(fb.dateString));
//                 const diff = differenceInDays(currentDate, earliestDate);
//                 const weekNum = Math.floor(diff / 7) + 1;

//                 if (!weeksMap[weekNum]) {
//                     weeksMap[weekNum] = {
//                         weekNum,
//                         feedbacks: [],
//                         totalSubmissions: 0,
//                         ratingsSum: {
//                             lifeSkills: 0,
//                             learningExperience: 0,
//                             teacherReach: 0,
//                             overall: 0
//                         }
//                     };
//                 }

//                 weeksMap[weekNum].feedbacks.push(fb);
//                 weeksMap[weekNum].totalSubmissions += 1;
//                 weeksMap[weekNum].ratingsSum.lifeSkills += fb.ratings.lifeSkills;
//                 weeksMap[weekNum].ratingsSum.learningExperience += fb.ratings.learningExperience;
//                 weeksMap[weekNum].ratingsSum.teacherReach += fb.ratings.teacherReach;
//                 weeksMap[weekNum].ratingsSum.overall += fb.ratings.overall;
//             });

//             const weeks = Object.values(weeksMap).sort((a, b) => b.weekNum - a.weekNum);
//             if (!weeks.length) return;

//             const latestWeek = weeks[0];

//             latestWeek.summary = {
//                 overall: latestWeek.ratingsSum.overall / latestWeek.totalSubmissions,
//                 lifeSkills: latestWeek.ratingsSum.lifeSkills / latestWeek.totalSubmissions,
//                 learningExperience: latestWeek.ratingsSum.learningExperience / latestWeek.totalSubmissions,
//                 teacherReach: latestWeek.ratingsSum.teacherReach / latestWeek.totalSubmissions
//             };

//             const facultyMembers = await User.find({ role: 'faculty' });
//             const facultyEmails = facultyMembers.map(f => f.email).filter(Boolean);

//             if (facultyEmails.length > 0) {
//                 await sendWeeklyAnalysisEmail(facultyEmails, latestWeek);
//             }

//         } catch (error) {
//             console.error('Error in cron job:', error);
//         }
//     });

//     // Also every 1 minute
//     cron.schedule('* * * * *', async () => {
//         console.log('Running email cron job...');
//         try {
//             await sendWeeklyUpdateEmail('2401109085@ptuniv.edu.in');
//         } catch (error) {
//             console.error('Error in cron job:', error);
//         }
//     }, {
//         scheduled: true,
//         timezone: "Asia/Kolkata"
//     });

//     console.log('Cron jobs initialized.');
// };