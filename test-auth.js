import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import supabase from './config/supabase.js';

dotenv.config();

const test = async () => {
    try {
        console.log('Connecting to Supabase...');

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'jayanthi@ptuniv.edu.in')
            .maybeSingle();

        if (error) {
            console.error('Supabase query error:', error);
            process.exit(1);
        }

        if (!user) {
            console.log('Faculty user not found. Creating test faculty...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('faculty123', salt);
            await supabase.from('users').insert([{
                name: 'Jayanthi',
                email: 'jayanthi@ptuniv.edu.in',
                password: hashedPassword,
                role: 'faculty',
                is_disabled: false,
                isDisabled: false
            }]);
            console.log('Test faculty created');
        } else {
            console.log('Found user:', user.email);
            const isMatch = await bcrypt.compare('faculty123', user.password);
            console.log('Password match (faculty123):', isMatch);
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

test();
