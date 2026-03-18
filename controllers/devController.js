import User from '../models/User.js';

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
