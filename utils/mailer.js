import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export const sendWeeklyAnalysisEmail = async (facultyEmails, weekData) => {
    try {
        const mailOptions = {
            from: `"Micro Feedback System" <${process.env.SMTP_USER || 'noreply@microfeedback.com'}>`,
            to: facultyEmails,
            subject: `Weekly Analysis Ready - Week ${weekData.weekNum}`,
            html: `
                <h2>Feedback Analysis for Week ${weekData.weekNum} is Ready!</h2>
                <p>Hello Faculty,</p>
                <p>All students have submitted their feedbacks for the completed week. The analysis has been automatically generated.</p>
                <h3>Week ${weekData.weekNum} Overview</h3>
                <ul>
                    <li><strong>Total Submissions:</strong> ${weekData.totalSubmissions}</li>
                    <li><strong>Overall Satisfaction Score:</strong> ${weekData.summary.overall.toFixed(2)} / 5.0</li>
                </ul>
                <p>Please log in to the Teacher Dashboard to view detailed metrics and student comments.</p>
                <p>Best regards,<br>Micro Feedback System</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Weekly analysis email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
