import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, FileDigit, ArrowRight, Loader2, UserPlus, BookOpen, GraduationCap, Pencil, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', registerNumber: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validateForm = () => {
        const isFaculty = formData.email.toLowerCase() === 'jayanthi@ptuniv.edu.in';

        if (!isFaculty) {
            const emailRegex = /^[0-9]{10}@ptuniv\.edu\.in$/;
            if (!emailRegex.test(formData.email)) {
                toast.error('Only college domain emails are allowed.', { id: 'reg-err' });
                return false;
            }
            if (!formData.registerNumber) {
                toast.error('Register number is required for students', { id: 'reg-err' });
                return false;
            }
            const emailPrefix = formData.email.split('@')[0];
            if (formData.registerNumber !== emailPrefix) {
                toast.error('Register number must match the email prefix', { id: 'reg-err' });
                return false;
            }
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters', { id: 'reg-err' });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        const submitData = { ...formData };
        if (submitData.email.toLowerCase() === 'jayanthi@ptuniv.edu.in') {
            delete submitData.registerNumber;
        }

        try {
            const res = await api.post('/auth/register', submitData);
            login(res.data.token, res.data.user);
            toast.success('Account created successfully!');
            navigate(res.data.user.role === 'faculty' ? '/admin' : '/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const isStudentEmail = formData.email.toLowerCase() !== 'jayanthi@ptuniv.edu.in';

    return (
        <div className="flex min-h-[calc(100vh-80px)] overflow-hidden bg-slate-50 relative">
            {/* Left Side - Animated Illustration */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-900 via-primary-900 to-brand-900 items-center justify-center overflow-hidden p-12"
            >
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-pink-500/20 blur-3xl animate-blob"></div>
                    <div className="absolute top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-cyan-500/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[60%] rounded-full bg-brand-500/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
                </div>

                <div className="relative z-10 w-full max-w-lg text-white">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="mb-8"
                    >
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-md mb-6 shadow-xl">
                            <Sparkles className="w-4 h-4 mr-2 text-pink-300" />
                            Join the Community
                        </span>
                        <h1 className="text-5xl font-extrabold leading-tight mb-6">
                            Start Improving <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-brand-300">Together</span>.
                        </h1>
                        <p className="text-lg text-slate-300 leading-relaxed opacity-90">
                            Create an account to start giving valuable feedback to your professors anonymously. Sign up with your college email.
                        </p>
                    </motion.div>

                    {/* Floating Icons Display */}
                    <div className="relative h-64 mt-12">
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-0 left-10 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                        >
                            <UserPlus className="w-12 h-12 text-pink-300" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                            className="absolute top-20 right-10 p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                        >
                            <BookOpen className="w-16 h-16 text-cyan-300" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                            className="absolute bottom-0 left-1/3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                        >
                            <GraduationCap className="w-10 h-10 text-brand-300" />
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto max-h-[calc(100vh-80px)]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl shadow-2xl shadow-slate-200/50 relative overflow-hidden my-auto"
                >
                    {/* Decorative glowing orb inside the card */}
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-indigo-400/30 to-purple-400/30 rounded-full blur-3xl opacity-40"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                            className="mx-auto w-16 h-16 bg-gradient-to-bl from-brand-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 mb-8 transform -rotate-3 hover:rotate-0 transition-transform"
                        >
                            <UserPlus className="w-8 h-8 text-white rotate-3 group-hover:rotate-0 transition-transform" />
                        </motion.div>

                        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                            Create Account
                        </h2>
                        <p className="mt-3 text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 hover:after:w-full after:transition-all after:duration-300">
                                Sign in instead
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-5 relative z-10" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-brand-600">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="input-field pl-11 shadow-inner bg-slate-50 text-slate-900"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-brand-600">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="input-field pl-11 shadow-inner bg-slate-50 text-slate-900"
                                        placeholder="2401109073@ptuniv.edu.in"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <AnimatePresence>
                                    {isStudentEmail && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-1.5 ml-1 text-[11px] font-medium text-slate-500 leading-tight"
                                        >
                                            Students must use: <span className="text-brand-600 font-semibold">[10-digits]@ptuniv.edu.in</span>
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence>
                                {isStudentEmail && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="group relative"
                                    >
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-brand-600">
                                            Register Number
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <FileDigit className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                            </div>
                                            <input
                                                name="registerNumber"
                                                type="text"
                                                required={isStudentEmail}
                                                className="input-field pl-11 shadow-inner bg-slate-50 text-slate-900"
                                                placeholder="2401109073"
                                                value={formData.registerNumber}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="group relative">
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-brand-600">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        minLength="6"
                                        className="input-field pl-11 shadow-inner bg-slate-50 text-slate-900"
                                        placeholder="Min. 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="group btn-primary w-full mt-6 h-12 shadow-xl shadow-brand-500/20"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin h-5 w-5 text-white" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
