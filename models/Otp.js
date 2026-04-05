import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['login', 'reset'],
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
    }
});

// Hash OTP before saving
otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
});

// Match user entered OTP to hashed OTP in database
otpSchema.methods.matchOtp = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
