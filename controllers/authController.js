import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../utils/mailer.js';

// @desc    Generate and send OTP
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
    try {
        const { email, type } = req.body;

        if (!email || !type) {
            return res.status(400).json({ success: false, message: 'Please provide email and type' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // To prevent email enumeration, we return success even if user not found for password reset
            return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent.' });
        }

        if (user.isDisabled) {
            return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact faculty.' });
        }

        // Check cooldown (prevent generating new OTP too frequently)
        const recentOtp = await Otp.findOne({ email, type }).sort({ createdAt: -1 });
        if (recentOtp) {
            const timeDiff = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
            if (timeDiff < 30) {
                return res.status(429).json({ success: false, message: 'Please wait 30 seconds before requesting another OTP.' });
            }
        }

        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB
        await Otp.create({
            email,
            otp: otpCode,
            type
        });

        // Send Email
        await sendOtpEmail(email, otpCode);

        res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, type } = req.body;

        if (!email || !otp || !type) {
            return res.status(400).json({ success: false, message: 'Please provide email, otp, and type' });
        }

        // Find the most recent OTP record for this email and type
        const otpRecord = await Otp.findOne({ email, type }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP is invalid or has expired' });
        }

        // Check max attempts
        if (otpRecord.attempts >= 3) {
            await Otp.deleteMany({ email, type }); // clear them out
            return res.status(400).json({ success: false, message: 'Maximum attempts reached. Please request a new OTP.' });
        }

        // Verify OTP
        const isMatch = await otpRecord.matchOtp(otp);

        if (!isMatch) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // OTP is correct. Issue short-lived otpToken (e.g. 10 mins)
        await Otp.deleteMany({ email, type }); // Remove verified OTPs

        const otpToken = jwt.sign({ email, type, verified: true }, process.env.JWT_SECRET, {
            expiresIn: '10m'
        });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            otpToken
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Helper to generate token and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            registerNumber: user.registerNumber
        }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, registerNumber, email, password, role } = req.body;

        // Enforce faculty role rule
        let finalRole = 'student';
        if (email.toLowerCase() === 'jayanthi@ptuniv.edu.in') {
            finalRole = 'faculty';
        }

        // Validate student email format: 2401109073@ptuniv.edu.in
        const studentEmailRegex = /^[0-9]{10}@ptuniv\.edu\.in$/;

        if (finalRole !== 'faculty') {
            if (!studentEmailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Only college domain emails are allowed.'
                });
            }
            if (!registerNumber) {
                return res.status(400).json({
                    success: false,
                    message: 'Students must provide a register number.'
                });
            }
        }

        // Check if user already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        if (registerNumber) {
            const regExists = await User.findOne({ registerNumber });
            if (regExists) {
                return res.status(400).json({ success: false, message: 'Register number is already associated with an account' });
            }
        }

        // Create user
        const user = await User.create({
            name,
            registerNumber,
            email,
            password,
            role: finalRole
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.isDisabled) {
            return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact faculty.' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
// @desc    Check if email exists for password recovery
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Email verified'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { email, password, otpToken } = req.body;

        if (!email || !password || !otpToken) {
            return res.status(400).json({ success: false, message: 'Please provide email, new password, and verify OTP' });
        }

        // Verify OTP token
        try {
            const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
            if (decoded.email !== email || decoded.type !== 'reset' || !decoded.verified) {
                return res.status(401).json({ success: false, message: 'Invalid OTP session. Please verify email again.' });
            }
        } catch (err) {
            return res.status(401).json({ success: false, message: 'OTP session expired. Please verify email again.' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update password (hashing is handled by User.js pre('save') hook)
        user.password = password;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
