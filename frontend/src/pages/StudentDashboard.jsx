/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, 
    Calendar, 
    Send, 
    Clock, 
    Loader2, 
    Sparkles, 
    Star, 
    MessageSquare, 
    Link as LinkIcon, 
    Mic, 
    Play, 
    Pause, 
    ChevronDown, 
    ChevronUp,
    CheckCircle2,
    HelpCircle,
    Bell,
    Check,
    Edit3,
    Save
} from 'lucide-react';

import StarRating from '../components/StarRating';
import AnimatedCard from '../components/AnimatedCard';
import SubjectHeader from '../components/SubjectHeader';
import StudentFeedbackIllustration from '../components/StudentFeedbackIllustration';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import BackgroundAnimation from '../components/BackgroundAnimation';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [chats, setChats] = useState([]);
    const [activeTab, setActiveTab] = useState('feedback');

    const [ratings, setRatings] = useState({
        lifeSkills: 0,
        learningExperience: 0,
        teacherReach: 0
    });

    const [textFeedback, setTextFeedback] = useState({
        makeMoreInteresting: '',
        mostInteresting: '',
        classImpact: ''
    });

    const [chatMessage, setChatMessage] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChatSubmitting, setIsChatSubmitting] = useState(false);
    const [isReacting, setIsReacting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    
    const chatContainerRef = useRef(null);

    const ratingQuestions = [
        { id: 'lifeSkills', label: "Are there any life skill tips between classes of any use?" },
        { id: 'learningExperience', label: "How is your learning experience in today's class or this week?" },
        { id: 'teacherReach', label: "Does the teacher reach to make everyone understand the concept?" }
    ];

    const textQuestions = [
        { id: 'makeMoreInteresting', label: "How do you think, the class can be made more interesting?" },
        { id: 'mostInteresting', label: "What do you think, the most interesting in today's class?" },
        { id: 'classImpact', label: "Was there any impact created by this week's class or today's class?" }
    ];

    const [notes, setNotes] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);

    const studyUnits = [
        { id: 1, title: 'Unit 1' },
        { id: 2, title: 'Unit 2' },
        { id: 3, title: 'Unit 3' },
        { id: 4, title: 'Unit 4' },
        { id: 5, title: 'Unit 5' },
    ];

    const fetchNotes = async () => {
        setIsLoadingNotes(true);
        try {
            const res = await api.get('/notes');
            setNotes(res.data.data);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const res = await api.get('/feedback/my');
            setFeedbacks(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch past feedbacks');
        } finally {
            setIsFetching(false);
            setIsLoading(false);
        }
    };

    const fetchChats = async () => {
        try {
            const res = await api.get('/chats');
            setChats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch chats:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notif) => {
        if (notif.isRead) return;
        try {
            await api.put(`/notifications/${notif._id}/read`);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
        fetchNotes();
        fetchChats();
        fetchNotifications();

        const interval = setInterval(fetchChats, 5000); // Polling chat every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom of chat when new messages arrive
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);

    const handleRatingChange = (id, value) => {
        setRatings(prev => ({ ...prev, [id]: value }));
        setIsReacting(true);
        setTimeout(() => setIsReacting(false), 800);
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        const unansweredRatings = ratingQuestions.filter(q => !ratings[q.id]);
        const unansweredText = textQuestions.filter(q => !textFeedback[q.id].trim());
        
        if (unansweredRatings.length > 0 || unansweredText.length > 0) {
            toast.error('Please complete all questions before submitting');
            return;
        }

        const overall = (ratings.lifeSkills + ratings.learningExperience + ratings.teacherReach) / 3;

        setIsSubmitting(true);
        try {
            await api.post('/feedback/submit', { 
                ratings: { ...ratings, overall },
                textFeedback 
            });
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSuccess(true);
                toast.success('Feedback submitted!', { icon: '🚀' });
                fetchFeedbacks();
                setTimeout(() => {
                    setIsSuccess(false);
                    setRatings({ lifeSkills: 0, learningExperience: 0, teacherReach: 0 });
                    setTextFeedback({ makeMoreInteresting: '', mostInteresting: '', classImpact: '' });
                }, 3000);
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Submission failed');
            setIsSubmitting(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        setIsChatSubmitting(true);
        try {
            await api.post('/chats', { message: chatMessage });
            setChatMessage('');
            fetchChats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setIsChatSubmitting(false);
        }
    };

    const handleUnitClick = (unitTitle) => {
        const note = notes.find(n => n.unitNumber === unitTitle);
        if (note && note.filePath) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            window.open(`${baseUrl}${note.filePath}`, '_blank');
        } else {
            toast.info('Notes will be uploaded soon.');
        }
    };

    return (
        <BackgroundAnimation>
            <div className="space-y-8 animate-fade-in relative z-10 w-full max-w-7xl mx-auto px-4 pb-12">

            <SubjectHeader 
                subjectName="Digital Communication"
                courseCode="ECUC1110"
                subtitle={`Welcome, ${user?.name || 'Student'}`}
            >
                <div className="relative">
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all relative group"
                    >
                        <Bell className={`w-6 h-6 text-white ${notifications.some(n => !n.isRead) ? 'animate-bounce' : ''}`} />
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-900 shadow-lg">
                                {notifications.filter(n => !n.isRead).length}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                                >
                                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Notifications</h3>
                                        <button 
                                            onClick={markAllRead}
                                            className="text-[10px] font-black text-brand-600 uppercase hover:text-brand-700 underline underline-offset-4"
                                        >
                                            Mark all read
                                        </button>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-10 text-center">
                                                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                                <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div 
                                                    key={notif._id}
                                                    onClick={() => {
                                                        markAsRead(notif);
                                                        setIsNotifOpen(false);
                                                    }}
                                                    className={`p-4 border-b border-slate-50 cursor-pointer transition-colors flex items-start space-x-3 ${notif.isRead ? 'bg-white opacity-60' : 'bg-brand-50/30 hover:bg-brand-50/50'}`}
                                                >
                                                    <div className={`p-2 rounded-xl mt-0.5 ${notif.isRead ? 'bg-slate-100 text-slate-400' : 'bg-brand-100 text-brand-600'}`}>
                                                        <MessageSquare className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs ${notif.isRead ? 'text-slate-500 font-medium' : 'text-slate-900 font-bold'}`}>
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 mt-1 font-bold italic">
                                                            {format(new Date(notif.createdAt), 'MMM dd · hh:mm a')}
                                                        </p>
                                                    </div>
                                                    {!notif.isRead && (
                                                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-2" />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </SubjectHeader>

            {/* Study Notes Section */}
            <section>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-brand-500" />
                    Study Notes
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {studyUnits.map((unit) => {
                        const note = notes.find(n => n.unitNumber === unit.title);
                        const isAvailable = !!(note && note.filePath);
                        return (
                            <motion.button
                                key={unit.id}
                                whileHover={{ scale: 1.05, y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUnitClick(unit.title)}
                                className={`p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center space-y-2 h-32 ${
                                    isAvailable 
                                    ? 'bg-white border-brand-100 text-brand-700 hover:border-brand-300 shadow-sm' 
                                    : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                }`}
                            >
                                <span className="font-bold text-lg">{unit.title}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest">
                                    {isAvailable ? 'View Notes' : 'Coming Soon'}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>
            </section>

            {/* Feedback Section - Side by Side (Ratings Left, Text Right) */}
            <AnimatedCard delay={0.1} whileHover={{ y: -2 }} className="p-0 overflow-hidden group border-brand-100/50 shadow-xl shadow-brand-500/5">
                <div className="p-6 lg:p-8 bg-white/40">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <Send className="w-5 h-5 mr-2 text-brand-500" />
                        Daily Feedback
                    </h2>
                    
                    <form onSubmit={handleSubmitFeedback} className="space-y-6">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                            {/* Left: Ratings Feedback */}
                            <div className="w-full lg:w-1/2 flex flex-col space-y-4">
                                <h3 className="text-sm font-bold text-brand-600 uppercase tracking-widest border-b border-brand-100 pb-2 mb-4">Rating Scale</h3>
                                <div className="space-y-4">
                                    {ratingQuestions.map((q) => (
                                        <StarRating 
                                            key={q.id}
                                            question={q.label}
                                            rating={ratings[q.id] || 0}
                                            onRatingChange={(val) => handleRatingChange(q.id, val)}
                                        />
                                    ))}
                                </div>
                                <div className="flex-1 min-h-[200px] mt-8 flex items-center justify-center border-t border-slate-100 pt-8">
                                    <StudentFeedbackIllustration 
                                        isReacting={isReacting} 
                                        isSubmitting={isSubmitting}
                                        rating={ratings.learningExperience}
                                    />
                                </div>
                            </div>

                            {/* Right: Texting Feedback */}
                            <div className="w-full lg:w-1/2 flex flex-col space-y-4">
                                <h3 className="text-sm font-bold text-brand-600 uppercase tracking-widest border-b border-brand-100 pb-2">Written Answers</h3>
                                <div className="flex-1 space-y-5">
                                    {textQuestions.map((q) => (
                                        <div key={q.id} className="flex flex-col h-[110px]">
                                            <label className="block text-xs font-bold text-slate-700 mb-2">{q.label}</label>
                                            <textarea
                                                rows="3"
                                                value={textFeedback[q.id]}
                                                onChange={(e) => setTextFeedback({ ...textFeedback, [q.id]: e.target.value })}
                                                className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none shadow-inner"
                                                placeholder="..."
                                            ></textarea>
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || isSuccess}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`w-full py-4 mt-6 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center space-x-2 ${
                                        isSuccess ? 'bg-emerald-500' : 'bg-brand-600 hover:bg-brand-700'
                                    }`}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Submit Daily Feedback</span>}
                                </motion.button>
                            </div>
                        </div>
                    </form>
                </div>
            </AnimatedCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chat Group App */}
                <AnimatedCard delay={0.2} whileHover={{ y: -5 }} className="lg:col-span-2 p-6 border-indigo-100/50 shadow-xl shadow-indigo-500/5 flex flex-col h-[550px]">
                    <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" />
                        Doubt Clarification Chat
                    </h2>
                    
                    {/* Chat Messages */}
                    <div 
                        ref={chatContainerRef}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 overflow-y-auto mb-4 flex flex-col space-y-4 custom-scrollbar"
                    >
                        {chats.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center opacity-50 text-slate-400">
                                <MessageSquare className="w-10 h-10 mb-2" />
                                <p className="text-sm">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <div key={chat._id} className={`flex flex-col max-w-[80%] ${chat.sender?._id === user?.id ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                                        {chat.sender?.name || 'Unknown'} {chat.sender?.role === 'faculty' && <span className="text-brand-500">(Faculty)</span>}
                                    </span>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${chat.sender?._id === user?.id ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                                        {chat.message}
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-1 uppercase">
                                        {format(new Date(chat.createdAt), 'MMM dd · hh:mm a')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleChatSubmit} className="flex space-x-2">
                        <input 
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type a message to the class..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-sm"
                        />
                        <button 
                            type="submit"
                            disabled={isChatSubmitting || !chatMessage.trim()}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 shadow-md"
                        >
                            {isChatSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </AnimatedCard>

                {/* History Section */}
                <AnimatedCard id="history-section" delay={0.3} whileHover={{ y: -5 }} className="lg:col-span-1 p-6 flex flex-col h-[550px] bg-white/40 border-amber-100/50 shadow-xl shadow-amber-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-amber-500" /> Feedback History
                        </h2>
                    </div>
                    
                    {isFetching ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
                    ) : (
                        feedbacks.length === 0 ? (
                            <div className="text-center h-full flex flex-col items-center justify-center opacity-50 text-slate-400">
                                <Clock className="w-10 h-10 mb-2" />
                                <p className="text-sm">No feedback submitted yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                {feedbacks.map((fb) => (
                                    <div key={fb._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col space-y-2 group hover:border-brand-200 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="bg-brand-50 text-brand-600 font-bold px-3 py-1 rounded-lg text-[10px] uppercase">
                                                {format(new Date(fb.createdAt), 'MMMM yyyy')}
                                            </div>
                                            <span className="text-[10px] text-slate-400">{format(new Date(fb.createdAt), 'MMM dd')}</span>
                                        </div>
                                        <div className="text-sm font-medium text-slate-600">
                                            Score: <span className="text-slate-900 font-bold">{(fb.ratings?.overall || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </AnimatedCard>
            </div>
            </div>
        </BackgroundAnimation>
    );
};

export default StudentDashboard;
