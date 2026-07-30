import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, BookOpen, GraduationCap, Pencil, Sparkles, Laptop, Key } from 'lucide-react';
import BackgroundAnimation from '../components/BackgroundAnimation';

const Login = () => {
    // Views: login-email, login-otp, login-password, forgot-email, forgot-otp, reset-password
    const [view, setView] = useState('login-email'); 
    const [formData, setFormData] = useState({ email: '', password: '', newPassword: '', confirmPassword: '', otp: '' });
    const [otpToken, setOtpToken] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Handle initial email submission (for login or forgot password)
    const handleEmailSubmit = async (e, type) => {
        e.preventDefault();
        const ptUnivRegex = /@ptuniv\.edu\.in$/i;
        if (!ptUnivRegex.test(formData.email) && formData.email !== 'jayanthi@ptuniv.edu.in') {
            toast.error('Only college domain (@ptuniv.edu.in) emails are allowed.');
            // Let it pass if it's the admin or just let backend validate
        }

        setIsLoading(true);
        try {
            if (type === 'login') {
                setView('login-password');
            } else {
                await api.post('/auth/send-otp', { email: formData.email, type });
                toast.success('OTP sent to your email!');
                setCountdown(30);
                setView('forgot-otp');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP verification (for login or forgot password)
    const handleVerifyOtp = async (e, type) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email: formData.email, otp: formData.otp, type });
            setOtpToken(res.data.otpToken);
            toast.success('OTP Verified!');
            if (type === 'login') {
                setView('login-password');
            } else {
                setView('reset-password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { 
                email: formData.email, 
                password: formData.password
            });
            login(res.data.token, res.data.user);
            toast.success('Welcome back!');
            navigate(res.data.user.role === 'faculty' ? '/admin' : '/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { 
                email: formData.email, 
                password: formData.newPassword,
                otpToken
            });
            toast.success('Password reset successfully! Please login.');
            setView('login-email');
            setFormData({ email: '', password: '', newPassword: '', confirmPassword: '', otp: '' });
            setOtpToken('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed');
        } finally {
            setIsLoading(false);
        }
    };

    const resendOtp = async (type) => {
        if (countdown > 0) return;
        setIsLoading(true);
        try {
            await api.post('/auth/send-otp', { email: formData.email, type });
            toast.success('New OTP sent!');
            setCountdown(30);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const getTitle = () => {
        if (view.startsWith('login')) return 'Welcome Back';
        if (view.startsWith('forgot')) return 'Identify Yourself';
        if (view.startsWith('reset')) return 'Reset Password';
        return 'Welcome';
    };

    return (
        <BackgroundAnimation>
            <div className="flex min-h-[calc(100vh-80px)] overflow-hidden bg-transparent relative">

                {/* Left Side - Animated Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-900 via-indigo-900 to-primary-900 items-center justify-center overflow-hidden p-12"
                >
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-500/20 blur-3xl animate-blob"></div>
                        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full bg-primary-500/20 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[60%] rounded-full bg-pink-500/20 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
                    </div>

                    <div className="relative z-10 w-full max-w-lg text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="mb-8"
                        >
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-md mb-6 shadow-xl">
                                <Sparkles className="w-4 h-4 mr-2 text-brand-300" />
                                Premium Education Platform
                            </span>
                            <h1 className="text-5xl font-extrabold leading-tight mb-6">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-300">MicroFeedback</span>
                            </h1>
                            <p className="text-lg text-slate-300 leading-relaxed opacity-90">
                                Join thousands of students shaping the future of education with MicroFeedback. Login securely to share your thoughts anonymously and daily.
                            </p>
                        </motion.div>

                        {/* Floating Icons Display */}
                        <div className="relative h-64 mt-12 text-white">
                            <motion.div
                                animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute top-0 left-10 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                            >
                                <BookOpen className="w-12 h-12 text-cyan-300" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                                className="absolute top-20 right-10 p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                            >
                                <GraduationCap className="w-16 h-16 text-pink-300" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
                                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                                className="absolute bottom-0 left-1/3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                            >
                                <Pencil className="w-10 h-10 text-brand-300" />
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl shadow-2xl shadow-slate-200/50 relative overflow-hidden bg-white/80 backdrop-blur-xl"
                    >
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-brand-400/30 to-cyan-400/30 rounded-full blur-3xl opacity-50"></div>

                        {/* Floating icons in form background */}
                        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden">
                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-10 left-10"><BookOpen className="w-12 h-12" /></motion.div>
                            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-10 right-10"><Laptop className="w-16 h-16" /></motion.div>
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><GraduationCap className="w-32 h-32" /></motion.div>
                        </div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="mx-auto w-16 h-16 bg-gradient-to-tr from-brand-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg mb-8 transform rotate-3 hover:rotate-6 transition-transform"
                            >
                                <Lock className="w-8 h-8 text-white -rotate-3" />
                            </motion.div>

                            <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
                                {getTitle()}
                            </h2>
                            <p className="mt-3 text-center text-sm text-slate-500">
                                {view === 'login-email' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">Sign up</Link>
                                    </>
                                ) : (
                                    <button onClick={() => {
                                        setView('login-email');
                                        setFormData({ email: '', password: '', newPassword: '', confirmPassword: '', otp: '' });
                                        setCountdown(0);
                                    }} className="font-bold text-brand-600 hover:text-brand-500">Start Over</button>
                                )}
                            </p>
                        </div>

                        {/* FLOW 1: LOGIN or FORGOT - EMAIL INPUT */}
                        {(view === 'login-email' || view === 'forgot-email') && (
                            <form className="mt-10 space-y-6 relative z-10" onSubmit={(e) => handleEmailSubmit(e, view === 'login-email' ? 'login' : 'reset')}>
                                <div className="space-y-5">
                                    {view === 'forgot-email' && <p className="text-xs text-slate-500 text-center mb-6">Enter your registered email to verify your identity.</p>}
                                    <div className="group relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-brand-600">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500" /></div>
                                            <input name="email" type="email" required className="input-field pl-11 shadow-inner bg-slate-50" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
                                        </div>
                                    </div>
                                    {view === 'login-email' && (
                                        <div className="flex justify-end">
                                            <button type="button" onClick={() => setView('forgot-email')} className="text-xs font-bold text-brand-600 hover:text-brand-500 uppercase tracking-tighter">Forgot Password?</button>
                                        </div>
                                    )}
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="btn-primary w-full mt-8 h-12 shadow-xl shadow-brand-500/20">
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <div className="flex items-center justify-center">Continue <ArrowRight className="ml-2 h-5 w-5" /></div>}
                                </motion.button>
                            </form>
                        )}

                        {/* FLOW 2: OTP VERIFICATION */}
                        {view === 'forgot-otp' && (
                            <form className="mt-10 space-y-6 relative z-10" onSubmit={(e) => handleVerifyOtp(e, 'reset')}>
                                <p className="text-xs text-brand-600 text-center font-bold mb-6">OTP sent to: {formData.email}</p>
                                <div className="group relative">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">6-Digit OTP</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Key className="h-5 w-5 text-slate-400" /></div>
                                        <input name="otp" type="text" maxLength="6" required className="input-field pl-11 text-center tracking-[0.5em] font-mono text-xl" placeholder="••••••" value={formData.otp} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="text-center text-sm">
                                    {countdown > 0 ? (
                                        <span className="text-slate-500">Resend OTP in {countdown}s</span>
                                    ) : (
                                        <button type="button" onClick={() => resendOtp('reset')} className="font-bold text-brand-600 hover:text-brand-500 focus:outline-none">
                                            Resend OTP
                                        </button>
                                    )}
                                </div>
                                <button type="submit" disabled={isLoading} className="btn-primary w-full h-12 flex items-center justify-center">
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Verify OTP'}
                                </button>
                            </form>
                        )}

                        {/* FLOW 3: LOGIN PASSWORD */}
                        {view === 'login-password' && (
                            <form className="mt-10 space-y-6 relative z-10" onSubmit={handleLoginSubmit}>
                                <p className="text-xs text-brand-600 text-center font-bold mb-6">Verified: {formData.email}</p>
                                <div className="space-y-5">
                                    <div className="group relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-brand-600">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500" /></div>
                                            <input name="password" type="password" required className="input-field pl-11 shadow-inner bg-slate-50" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} className="btn-primary w-full mt-8 h-12 shadow-xl shadow-brand-500/20">
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : <div className="flex items-center justify-center">Sign In <ArrowRight className="ml-2 h-5 w-5" /></div>}
                                </motion.button>
                            </form>
                        )}

                        {/* FLOW 4: RESET PASSWORD */}
                        {view === 'reset-password' && (
                            <form className="mt-10 space-y-6 relative z-10" onSubmit={handleResetSubmit}>
                                <p className="text-xs text-brand-600 text-center font-bold mb-6">Verified: {formData.email}</p>
                                <div className="space-y-4">
                                    <div className="group relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                            <input name="newPassword" type="password" required minLength="6" className="input-field pl-11" placeholder="Minimum 6 characters" value={formData.newPassword} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="group relative">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Confirm New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                            <input name="confirmPassword" type="password" required className="input-field pl-11" placeholder="Repeat new password" value={formData.confirmPassword} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="btn-primary w-full h-12 flex items-center justify-center">
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reset My Password'}
                                </button>
                            </form>
                        )}

                    </motion.div>
                </div>
            </div>
        </BackgroundAnimation>
    );
};

export default Login;
