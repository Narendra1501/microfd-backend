
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const test = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: 'jayanthi@ptuniv.edu.in' }).select('+password');
        if (!user) {
            console.log('Faculty user not found. Creating test faculty...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('faculty123', salt);
            await User.create({
                name: 'Jayanthi',
                email: 'jayanthi@ptuniv.edu.in',
                password: 'faculty123',
                role: 'faculty'
            });
            console.log('Test faculty created');
        } else {
            console.log('Found user:', user.email);
            const isMatch = await user.matchPassword('faculty123');
            console.log('Password match (faculty123):', isMatch);
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

test();
