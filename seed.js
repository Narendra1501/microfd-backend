import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import supabase from './config/supabase.js';

dotenv.config();

const seed = async () => {
    try {
        console.log('Seeding Supabase database...');

        // Setup Faculty
        const facultyEmail = 'jayanthi@ptuniv.edu.in';
        const { data: faculty } = await supabase
            .from('users')
            .select('*')
            .eq('email', facultyEmail)
            .maybeSingle();

        const salt = await bcrypt.genSalt(10);
        const hashedFacultyPass = await bcrypt.hash('faculty123', salt);

        if (faculty) {
            await supabase
                .from('users')
                .update({ password: hashedFacultyPass })
                .eq('id', faculty.id);
            console.log('Faculty password reset to faculty123');
        } else {
            await supabase
                .from('users')
                .insert([{
                    name: 'Jayanthi',
                    email: facultyEmail,
                    password: hashedFacultyPass,
                    role: 'faculty',
                    is_disabled: false,
                    isDisabled: false
                }]);
            console.log('Faculty Jayanthi created with password faculty123');
        }

        // Setup Student
        const studentEmail = '2401109073@ptuniv.edu.in';
        const { data: student } = await supabase
            .from('users')
            .select('*')
            .eq('email', studentEmail)
            .maybeSingle();

        const hashedStudentPass = await bcrypt.hash('student123', salt);

        if (student) {
            await supabase
                .from('users')
                .update({ password: hashedStudentPass })
                .eq('id', student.id);
            console.log('Student password reset to student123');
        } else {
            await supabase
                .from('users')
                .insert([{
                    name: 'Test Student',
                    register_number: '2401109073',
                    registerNumber: '2401109073',
                    email: studentEmail,
                    password: hashedStudentPass,
                    role: 'student',
                    is_disabled: false,
                    isDisabled: false
                }]);
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
