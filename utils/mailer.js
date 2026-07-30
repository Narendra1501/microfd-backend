import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

// ===============================
// Weekly Analysis Email
// ===============================
export const sendWeeklyAnalysisEmail = async (facultyEmails, weekData) => {
    try {
        const mailOptions = {
            from: `"Micro Feedback System" <${emailUser}>`,
            to: facultyEmails,
            subject: `📊 Weekly Feedback Analysis - Week ${weekData.weekNum}`,
            html: `
                <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;padding:20px">

                    <h2 style="color:#2563eb;">
                        Weekly Feedback Analysis Ready
                    </h2>

                    <p>Hello Faculty,</p>

                    <p>
                        The weekly student feedback analysis has been generated successfully.
                    </p>

                    <table style="border-collapse:collapse;width:100%;margin-top:20px">
                        <tr>
                            <td><b>Week</b></td>
                            <td>${weekData.weekNum}</td>
                        </tr>

                        <tr>
                            <td><b>Total Feedbacks</b></td>
                            <td>${weekData.totalSubmissions}</td>
                        </tr>

                        <tr>
                            <td><b>Overall Rating</b></td>
                            <td>${weekData.summary.overall.toFixed(2)} / 5</td>
                        </tr>

                        <tr>
                            <td><b>Life Skills</b></td>
                            <td>${weekData.summary.lifeSkills.toFixed(2)} / 5</td>
                        </tr>

                        <tr>
                            <td><b>Learning Experience</b></td>
                            <td>${weekData.summary.learningExperience.toFixed(2)} / 5</td>
                        </tr>

                        <tr>
                            <td><b>Teacher Reach</b></td>
                            <td>${weekData.summary.teacherReach.toFixed(2)} / 5</td>
                        </tr>
                    </table>

                    <br>

                    <a
                        href="${process.env.FRONTEND_URL}"
                        style="
                            background:#2563eb;
                            color:white;
                            padding:12px 20px;
                            text-decoration:none;
                            border-radius:6px;
                        "
                    >
                        Open Teacher Dashboard
                    </a>

                    <br><br>

                    <p>
                        Regards,<br>
                        <b>Micro Feedback System</b>
                    </p>

                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Weekly Analysis Email Sent:", info.messageId);

        return info;
    } catch (err) {
        console.error("Weekly Analysis Email Error:", err);
        throw err;
    }
};

// ===============================
// OTP Email
// ===============================
export const sendOtpEmail = async (toEmail, otp) => {
    try {
        const mailOptions = {
            from: `"Micro Feedback System" <${emailUser}>`,
            to: toEmail,
            subject: "Your Verification OTP",
            html: `
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">

                    <h2 style="color:#2563eb">
                        Email Verification
                    </h2>

                    <p>Your OTP is:</p>

                    <h1
                        style="
                            letter-spacing:8px;
                            text-align:center;
                            background:#f3f4f6;
                            padding:20px;
                            border-radius:10px;
                        "
                    >
                        ${otp}
                    </h1>

                    <p>
                        This OTP will expire in <b>5 minutes</b>.
                    </p>

                    <p>
                        If you didn't request this OTP, please ignore this email.
                    </p>

                    <br>

                    <p>
                        Regards,<br>
                        <b>Micro Feedback System</b>
                    </p>

                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("OTP Email Sent:", info.messageId);

        return info;
    } catch (err) {
        console.error("OTP Email Error:", err);
        throw err;
    }
};

// ===============================
// Weekly Reminder Email
// ===============================
export const sendWeeklyUpdateEmail = async (toEmail) => {
    try {
        const mailOptions = {
            from: `"Micro Feedback System" <${emailUser}>`,
            to: toEmail,
            subject: "📢 Weekly Student Feedback Updated",

            html: `
                <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:20px">

                    <h2 style="color:#2563eb">
                        Weekly Feedback Available
                    </h2>

                    <p>
                        Good Morning Ma'am,
                    </p>

                    <p>
                        The weekly student feedback has been submitted successfully.
                    </p>

                    <p>
                        Click the button below to login and view the Teacher Dashboard.
                    </p>

                    <br>

                    <a
                        href="${process.env.FRONTEND_URL}"
                        style="
                            background:#16a34a;
                            color:white;
                            padding:12px 22px;
                            text-decoration:none;
                            border-radius:6px;
                            font-weight:bold;
                        "
                    >
                        View Feedback
                    </a>

                    <br><br>

                    <p>
                        Or copy this link:
                    </p>

                    <p>
                        <a href="${process.env.FRONTEND_URL}">
                            ${process.env.FRONTEND_URL}
                        </a>
                    </p>

                    <hr>

                    <p style="font-size:12px;color:#777">
                        © ${new Date().getFullYear()} Micro Feedback System
                    </p>

                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Weekly Reminder Email Sent:", info.messageId);

        return info;
    } catch (err) {
        console.error("Weekly Reminder Email Error:", err);
        throw err;
    }
};