import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { comparePassword, createOtp, createUser, deleteOtps, getLatestOtp, getUserByEmail, getUserById, listUsers, updateOtp, updateUser } from '../utils/dbStore.js';
import { sendOtpEmail } from '../utils/mailer.js';

const sendTokenResponse = (user, statusCode, res) => {
    const userId = user.id || user._id;
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const regNum = user.registerNumber ?? user.register_number;

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: userId,
            _id: userId,
            name: user.name,
            email: user.email,
            role: user.role,
            registerNumber: regNum
        }
    });
};

export const sendOtp = async (req, res) => {
    try {
        const { email, type } = req.body;

        if (!email || !type) {
            return res.status(400).json({ success: false, message: 'Please provide email and type' });
        }

        const user = getUserByEmail(email);
        if (!user) {
            return res.status(200).json({ success: true, message: 'If the email exists, an OTP has been sent.' });
        }

        const isDisabled = user.isDisabled ?? user.is_disabled ?? false;
        if (isDisabled) {
            return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact faculty.' });
        }

        const recentOtp = getLatestOtp(email, type);
        if (recentOtp) {
            const createdAtTime = new Date(recentOtp.created_at || recentOtp.createdAt).getTime();
            const timeDiff = (Date.now() - createdAtTime) / 1000;
            if (timeDiff < 30) {
                return res.status(429).json({ success: false, message: 'Please wait 30 seconds before requesting another OTP.' });
            }
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = await bcrypt.hash(otpCode, 10);

        createOtp({
            email,
            otp: hashedOtp,
            type,
            attempts: 0,
            created_at: new Date().toISOString()
        });

        await sendOtpEmail(email, otpCode);
        res.status(200).json({ success: true, message: 'OTP sent to your email.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, type } = req.body;

        if (!email || !otp || !type) {
            return res.status(400).json({ success: false, message: 'Please provide email, otp, and type' });
        }

        const otpRecord = getLatestOtp(email, type);
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP is invalid or has expired' });
        }

        if ((otpRecord.attempts || 0) >= 3) {
            deleteOtps(email, type);
            return res.status(400).json({ success: false, message: 'Maximum attempts reached. Please request a new OTP.' });
        }

        let isMatch = false;
        if (otpRecord.otp.startsWith('$2a$') || otpRecord.otp.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(otp, otpRecord.otp);
        } else {
            isMatch = (otpRecord.otp === otp);
        }

        if (!isMatch) {
            const newAttempts = (otpRecord.attempts || 0) + 1;
            updateOtp(otpRecord.id, { attempts: newAttempts });
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        deleteOtps(email, type);

        const otpToken = jwt.sign({ email, type, verified: true }, process.env.JWT_SECRET, {
            expiresIn: '10m'
        });

        res.status(200).json({ success: true, message: 'OTP verified successfully', otpToken });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const register = async (req, res) => {
    try {
        const { name, registerNumber, email, password } = req.body;

        let finalRole = 'student';
        if (String(email).toLowerCase() === 'jayanthi@ptuniv.edu.in') {
            finalRole = 'faculty';
        }

        const studentEmailRegex = /^[0-9]{10}@ptuniv\.edu\.in$/;
        if (finalRole !== 'faculty') {
            if (!studentEmailRegex.test(email)) {
                return res.status(400).json({ success: false, message: 'Only college domain emails are allowed.' });
            }
            if (!registerNumber) {
                return res.status(400).json({ success: false, message: 'Students must provide a register number.' });
            }
        }

        if (getUserByEmail(email)) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        if (registerNumber && listUsers().some((user) => user.registerNumber === registerNumber || user.register_number === registerNumber)) {
            return res.status(400).json({ success: false, message: 'Register number is already associated with an account' });
        }

        const newUser = await createUser({
            name,
            registerNumber,
            email,
            password,
            role: finalRole,
            is_disabled: false,
            isDisabled: false
        });

        sendTokenResponse(newUser, 201, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isDisabled = user.isDisabled ?? user.is_disabled ?? false;
        if (isDisabled) {
            return res.status(403).json({ success: false, message: 'Your account has been disabled. Contact faculty.' });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userObj = {
            ...user,
            _id: user.id,
            registerNumber: user.registerNumber ?? user.register_number,
            isDisabled: user.isDisabled ?? user.is_disabled ?? false
        };

        res.status(200).json({ success: true, data: userObj });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide an email' });
        }

        const user = getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }

        res.status(200).json({ success: true, message: 'Email verified' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, password, otpToken } = req.body;

        if (!email || !password || !otpToken) {
            return res.status(400).json({ success: false, message: 'Please provide email, new password, and verify OTP' });
        }

        try {
            const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
            if (decoded.email !== email || decoded.type !== 'reset' || !decoded.verified) {
                return res.status(401).json({ success: false, message: 'Invalid OTP session. Please verify email again.' });
            }
        } catch (err) {
            return res.status(401).json({ success: false, message: 'OTP session expired. Please verify email again.' });
        }

        const user = getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        updateUser(user.id, { password: hashedPassword });

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
