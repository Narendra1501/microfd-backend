import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
            return res.status(400).json({ success: false, message: 'Please provide an email and password' });
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
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and new password' });
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
