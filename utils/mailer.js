import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'narendraramesh15@gmail.com',
        pass: process.env.SMTP_PASS || 'lefo ygee gyzy kupz'
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

export const sendOtpEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"Micro Feedback System" <${process.env.SMTP_USER || 'noreply@microfeedback.com'}>`,
            to: toEmail,
            subject: 'Your MicroFeedback Authentication OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #1e293b; text-align: center;">Verification Required</h2>
                    <p style="color: #475569; font-size: 16px;">Hello,</p>
                    <p style="color: #475569; font-size: 16px;">Please use the following 6-digit OTP to complete your authentication process. This code will expire in 5 minutes.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #94a3b8; font-size: 12px; text-align: center;">&copy; ${new Date().getFullYear()} Micro Feedback System. All rights reserved.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

export const sendWeeklyUpdateEmail = async (toEmail) => {
    try {
        const mailOptions = {
            from: `"Micro Feedback System" <${process.env.SMTP_USER || 'noreply@microfeedback.com'}>`,
            to: toEmail,
            subject: 'Weekly student feedbacks has been updated',
            html: `
                <p>Good Morning Ma'am,</p>
                <p>Weekly student feedbacks has been updated.</p>
                <p>You can view the details by visiting our website: <a href="https://micro-feedback.netlify.app">https://micro-feedback.netlify.app</a></p>
                <br>
                <p>Best regards,<br>Micro Feedback System</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Weekly update email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending weekly update email:', error);
    }
};
