
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        
        // Setup Faculty
        const facultyEmail = 'jayanthi@ptuniv.edu.in';
        let faculty = await User.findOne({ email: facultyEmail });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('faculty123', salt);

        if (faculty) {
            faculty.password = 'faculty123'; // The pre-save hook will hash it
            await faculty.save();
            console.log('Faculty password reset to faculty123');
        } else {
            await User.create({
                name: 'Jayanthi',
                email: facultyEmail,
                password: 'faculty123',
                role: 'faculty'
            });
            console.log('Faculty Jayanthi created with password faculty123');
        }

        // Setup Student
        const studentEmail = '2401109073@ptuniv.edu.in';
        let student = await User.findOne({ email: studentEmail });
        if (student) {
            student.password = 'student123';
            await student.save();
            console.log('Student password reset to student123');
        } else {
            await User.create({
                name: 'Test Student',
                registerNumber: '2401109073',
                email: studentEmail,
                password: 'student123',
                role: 'student'
            });
            console.log('Student created with password student123');
        }

        console.log('Seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
