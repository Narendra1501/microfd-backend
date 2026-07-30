/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Users, 
    Star, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    ChevronRight, 
    Trash2, 
    AlertTriangle, 
    RefreshCw, 
    Calendar, 
    Loader2, 
    Sparkles,
    MessageSquare,
    Link as LinkIcon,
    Mic,
    X,
    Send,
    ExternalLink,
    PlayCircle,
    BookOpen,
    ShieldCheck,
    Upload
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInDays, parseISO, startOfDay, format } from 'date-fns';

import AnimatedCard from '../components/AnimatedCard';
import ChartCard from '../components/ChartCard';
import SubjectHeader from '../components/SubjectHeader';
import BackgroundAnimation from '../components/BackgroundAnimation';
import { useAuth } from '../context/AuthContext';

const groupFeedbacksByWeek = (feedbacks) => {
    if (!feedbacks || !feedbacks.length) return [];
    
    // Sort by date ascending to find the earliest date
    const sorted = [...feedbacks].sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
    const earliestDate = startOfDay(parseISO(sorted[0].dateString));
    
    const weeksMap = {};
    
    feedbacks.forEach(fb => {
        const currentDate = startOfDay(parseISO(fb.dateString));
        const diff = differenceInDays(currentDate, earliestDate);
        const weekNum = Math.floor(diff / 7) + 1;
        
        if (!weeksMap[weekNum]) {
            weeksMap[weekNum] = {
                weekNum,
                feedbacks: [],
                totalSubmissions: 0,
                ratingsSum: { lifeSkills: 0, learningExperience: 0, teacherReach: 0, overall: 0 }
            };
        }
        weeksMap[weekNum].feedbacks.push(fb);
        weeksMap[weekNum].totalSubmissions += 1;
        weeksMap[weekNum].ratingsSum.lifeSkills += fb.ratings?.lifeSkills || 0;
        weeksMap[weekNum].ratingsSum.learningExperience += fb.ratings?.learningExperience || 0;
        weeksMap[weekNum].ratingsSum.teacherReach += fb.ratings?.teacherReach || 0;
        weeksMap[weekNum].ratingsSum.overall += fb.ratings?.overall || 0;
    });
    
    return Object.values(weeksMap).sort((a, b) => a.weekNum - b.weekNum).map(w => ({
        ...w,
        summary: {
            lifeSkills: w.ratingsSum.lifeSkills / w.totalSubmissions,
            learningExperience: w.ratingsSum.learningExperience / w.totalSubmissions,
            teacherReach: w.ratingsSum.teacherReach / w.totalSubmissions,
            overall: w.ratingsSum.overall / w.totalSubmissions,
            totalSubmissions: w.totalSubmissions
        }
    }));
};

const studyUnits = [
    { id: 1, title: 'Unit 1' },
    { id: 2, title: 'Unit 2' },
    { id: 3, title: 'Unit 3' },
    { id: 4, title: 'Unit 4' },
    { id: 5, title: 'Unit 5' },
];

const AdminDashboard = () => {
    const { user } = useAuth();
    const [semesterOverall, setSemesterOverall] = useState(null);
    const [allFeedbacks, setAllFeedbacks] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(null); // Will hold the week object
    const [chats, setChats] = useState([]);
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [isUploadingNote, setIsUploadingNote] = useState(false);
    
    // Upload modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedUnitForUpload, setSelectedUnitForUpload] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [semesterRes, feedbacksRes, notesRes] = await Promise.all([
                api.get('/admin/semester-overall'),
                api.get('/admin/feedbacks'),
                api.get('/notes').catch(() => ({ data: { data: [] } }))
            ]);

            setSemesterOverall(semesterRes.data.data);
            const feedbacksDb = feedbacksRes.data.data;
            setAllFeedbacks(feedbacksDb);
            setNotes(notesRes.data.data || []);
            
            const grouped = groupFeedbacksByWeek(feedbacksDb);
            setWeeklyData(grouped);
            
            // Default to latest week
            if (grouped.length > 0) {
                // Keep the current week selected if possible, else the latest
                setSelectedWeek(prev => prev ? grouped.find(w => w.weekNum === prev.weekNum) || grouped[grouped.length - 1] : grouped[grouped.length - 1]);
            } else {
                setSelectedWeek(null);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
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

    useEffect(() => {
        fetchData();
        fetchChats();
        const interval = setInterval(fetchChats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this feedback?')) return;
        setActionLoading(true);
        try {
            await api.delete(`/admin/feedback/${id}`);
            toast.success('Feedback deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete feedback');
            setActionLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('WARNING: This will permanently delete ALL feedback data for the entire semester. Are you absolutely sure?')) return;
        
        setActionLoading(true);
        try {
            await api.delete('/admin/clear-all');
            toast.success('All feedback data cleared');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clear data');
            setActionLoading(false);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        setActionLoading(true);
        try {
            await api.post('/chats', { message: chatMessage });
            setChatMessage('');
            fetchChats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearChats = async () => {
        if (!window.confirm('Are you sure you want to clear all chat messages?')) return;
        
        setActionLoading(true);
        try {
            await api.delete('/chats/clear');
            toast.success('All chat messages cleared successfully');
            fetchChats();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to clear chats');
        } finally {
            setActionLoading(false);
        }
    };
    
    const handleUnitClick = (unitTitle) => {
        const note = notes.find(n => n.unitNumber === unitTitle);
        if (note && note.filePath) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            window.open(`${baseUrl}${note.filePath}`, '_blank');
        } else {
            // No note exists yet, open upload modal
            setSelectedUnitForUpload(unitTitle);
            setShowUploadModal(true);
        }
    };
    
    const handleUploadClick = (e, unitTitle) => {
        e.stopPropagation();
        setSelectedUnitForUpload(unitTitle);
        setShowUploadModal(true);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error("Please upload only PDF files.");
                return;
            }
            setSelectedFile(file);
        }
    };

    const submitNoteUpload = async () => {
        if (!selectedFile || !selectedUnitForUpload) return;
        
        setIsUploadingNote(true);
        const formData = new FormData();
        formData.append('note', selectedFile);
        formData.append('unitNumber', selectedUnitForUpload);
        
        try {
            await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`${selectedUnitForUpload} notes uploaded!`);
            setShowUploadModal(false);
            setSelectedFile(null);
            fetchData(); // refresh notes
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setIsUploadingNote(false);
        }
    };

    if (isLoading) {
        return (
            <BackgroundAnimation>
                <div className="flex justify-center items-center h-[calc(100vh-80px)]">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="p-4 rounded-full bg-white/10 backdrop-blur-md shadow-2xl border border-white/20"
                    >
                        <Loader2 className="w-12 h-12 text-brand-300" />
                    </motion.div>
                </div>
            </BackgroundAnimation>
        );
    }

    const hasData = weeklyData.length > 0;
    
    // Questions data mapped from selected week's summary
    const questionsData = selectedWeek ? [
        { subject: 'Life Skills', score: Number((selectedWeek.summary.lifeSkills || 0).toFixed(2)) },
        { subject: 'Learning Ex.', score: Number((selectedWeek.summary.learningExperience || 0).toFixed(2)) },
        { subject: 'Teacher R.', score: Number((selectedWeek.summary.teacherReach || 0).toFixed(2)) },
        { subject: 'Overall', score: Number((selectedWeek.summary.overall || 0).toFixed(2)) }
    ] : [];

    let bestMetric = { name: 'N/A', score: 0 };
    let lowestMetric = { name: 'N/A', score: 0 };

    if (selectedWeek) {
        bestMetric = questionsData.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
        lowestMetric = questionsData.reduce((prev, curr) => (prev.score < curr.score) ? prev : curr);
    }

    const trendData = weeklyData.map(w => ({
        period: `Week ${w.weekNum}`,
        overall: Number((w.summary.overall || 0).toFixed(2)),
        total: w.summary.totalSubmissions
    }));

    const pieData = selectedWeek ? [
        { name: 'Satisfaction Score', value: Number((selectedWeek.summary.overall || 0).toFixed(2)) },
        { name: 'Gap', value: Number((5 - (selectedWeek.summary.overall || 0)).toFixed(2)) }
    ] : [];

    const pieColors = ['#8b5cf6', '#f1f5f9'];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const statCardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
    };

    return (
        <BackgroundAnimation>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 w-full animate-fade-in">
            {/* Header section with Subject Branding */}
            <SubjectHeader 
                subjectName="Digital Communication"
                courseCode="ECUC1110"
                subtitle="Teacher Dashboard & Analytics"
            >
                <div className="mt-4 sm:mt-0 px-5 py-2.5 bg-brand-800/50 backdrop-blur-md rounded-xl border border-white/20 shadow-xl self-end sm:self-auto flex items-center shrink-0">
                    <Activity className="w-5 h-5 mr-3 text-cyan-300" />
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-brand-200 font-bold mb-0.5">Semester Average</div>
                        <div className="text-xl font-black text-white leading-none">
                            {semesterOverall ? (semesterOverall.overall || 0).toFixed(2) : '0.00'}
                            <span className="text-brand-300 ml-1 text-sm font-bold">/ 5</span>
                        </div>
                    </div>
                </div>
            </SubjectHeader>
            
            {/* Faculty Notes Uploading Section */}
            <section className="mt-8 mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-brand-300" />
                        Study Notes Portal
                    </h2>
                    <span className="text-xs font-bold text-brand-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">Faculty Upload Area</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {studyUnits.map((unit) => {
                        const note = notes.find(n => n.unitNumber === unit.title);
                        const isAvailable = !!(note && note.filePath);
                        return (
                            <motion.div
                                key={unit.id}
                                whileHover={{ scale: 1.05, y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center space-y-2 h-32 ${
                                    isAvailable 
                                    ? 'bg-white border-brand-100 text-brand-700 shadow-sm cursor-pointer hover:border-brand-300' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-pointer border-dashed hover:bg-slate-100'
                                }`}
                                onClick={() => handleUnitClick(unit.title)}
                            >
                                <span className="font-bold text-lg">{unit.title}</span>
                                <span className="text-[10px] uppercase font-bold tracking-widest">
                                    {isAvailable ? 'View Notes' : 'Upload Needed'}
                                </span>
                                
                                <button 
                                    onClick={(e) => handleUploadClick(e, unit.title)}
                                    className={`absolute top-2 right-2 p-1.5 rounded-lg ${isAvailable ? 'bg-brand-50 text-brand-500 hover:bg-brand-100' : 'bg-slate-200 text-slate-500 hover:bg-brand-50 hover:text-brand-500'}`}
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {!hasData ? (
                <AnimatedCard className="max-w-2xl mx-auto text-center py-20 px-10 border-brand-100 shadow-xl mt-12 bg-white/90 backdrop-blur-md">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="mx-auto w-24 h-24 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-brand-100"
                    >
                        <Activity className="w-12 h-12" />
                    </motion.div>
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">No Insights Available</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
                        Data will automatically populate here once students begin submitting their daily feedback. Weekly analysis will be generated sequentially.
                    </p>
                    <button onClick={fetchData} className="btn-primary inline-flex items-center space-x-2 px-8 py-3 rounded-full text-sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        <span>Refresh Dashboard</span>
                    </button>
                </AnimatedCard>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
                    
                    {/* Controls & Selectors for Weeks */}
                    <AnimatedCard className="p-2 bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl shadow-brand-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-6 z-30 rounded-3xl">
                        <div className="flex items-center space-x-3 px-3 py-2">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Weekly Analysis</h1>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metrics Control Matrix</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            {weeklyData.map(w => (
                                <button
                                    key={w.weekNum}
                                    onClick={() => setSelectedWeek(w)}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedWeek?.weekNum === w.weekNum ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Week {w.weekNum}
                                </button>
                            ))}
                            <button onClick={fetchData} className="p-2.5 ml-2 bg-slate-100 hover:bg-brand-50 text-slate-600 hover:text-brand-600 rounded-xl transition-colors border border-slate-200">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </AnimatedCard>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div variants={statCardVariants} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Week Average Rating</p>
                                    <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">{(selectedWeek?.summary?.overall || 0).toFixed(1)}</h3>
                                </div>
                                <div className="p-3 bg-brand-50 rounded-2xl text-brand-600 shadow-sm border border-brand-100">
                                    <Star className="w-6 h-6 fill-current" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                System Target: &gt; 4.0
                            </div>
                        </motion.div>

                        <motion.div variants={statCardVariants} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Week Submissions</p>
                                    <h3 className="text-4xl font-extrabold text-slate-900 tracking-tighter">{selectedWeek?.totalSubmissions || 0}</h3>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm border border-indigo-100">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-1 rounded-md">
                                <Activity className="w-3 h-3 mr-1" />
                                Active Engagement
                            </div>
                        </motion.div>

                        <motion.div variants={statCardVariants} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Strongest Metric</p>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-2 leading-tight">{bestMetric.name}</h3>
                                    <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center">
                                        {bestMetric.score.toFixed(2)}/5.0
                                    </p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={statCardVariants} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rose-100 to-transparent rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Needs Attention</p>
                                    <h3 className="text-xl font-extrabold text-slate-900 mt-2 leading-tight">{lowestMetric.name}</h3>
                                    <p className="text-sm font-bold text-rose-600 mt-1 flex items-center">
                                        {lowestMetric.score.toFixed(2)}/5.0
                                    </p>
                                </div>
                                <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 shadow-sm border border-rose-100">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Historical Trends Graph & Performance Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ChartCard delay={0.3} className="lg:col-span-2 shadow-xl shadow-slate-200/50 border-0 rounded-3xl overflow-hidden ring-1 ring-slate-100">
                            <div className="flex items-center justify-between mb-8 px-2">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-900 flex items-center tracking-tight">
                                        <TrendingUp className="w-6 h-6 mr-2 text-brand-500" />
                                        Weekly Performance History
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Tracking aggregate feedback ratings across all weeks.</p>
                                </div>
                            </div>
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="period" stroke="#94a3b8" tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#94a3b8" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} dx={-10} />
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold' }}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }} />
                                        <Line 
                                            type="monotone" 
                                            dataKey="overall" 
                                            name="Avg Rating" 
                                            stroke="#6366f1" 
                                            strokeWidth={4}
                                            dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} 
                                            activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        <ChartCard delay={0.4} className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl border-0 rounded-3xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[80px] rounded-full pointer-events-none"></div>
                            
                            <h3 className="text-xl font-bold text-white flex items-center mb-6 relative z-10">
                                <Calendar className="w-5 h-5 mr-2 text-brand-400" />
                                {selectedWeek ? `Week ${selectedWeek.weekNum} Overview` : 'Overview'}
                            </h3>

                            <div className="h-[220px] relative z-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.95)', color: '#0f172a', fontWeight: 'bold' }}
                                            itemStyle={{ color: '#0f172a' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-white leading-none">
                                        {((selectedWeek?.summary?.overall || 0) * 20).toFixed(0)}%
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Satisfaction</span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3 relative z-10">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-sm font-medium text-slate-300">Achieved Score</span>
                                    <span className="text-sm font-bold text-white bg-brand-500 px-2.5 py-1 rounded-lg">{(selectedWeek?.summary?.overall || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                                    <span className="text-sm font-medium text-slate-300">Growth Gap</span>
                                    <span className="text-sm font-bold text-white bg-slate-700 px-2.5 py-1 rounded-lg">{(5 - (selectedWeek?.summary?.overall || 0)).toFixed(2)}</span>
                                </div>
                            </div>
                        </ChartCard>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                        {/* Selected Navigator Info */}
                        <div className="lg:col-span-1 flex flex-col space-y-4">
                            <AnimatedCard delay={0.6} className="bg-white border text-center p-6 border-slate-100 shadow-xl rounded-3xl h-full flex flex-col justify-center items-center">
                                <Calendar className="w-12 h-12 text-brand-500 mb-4" />
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Active Week Selection</h3>
                                <p className="text-sm text-slate-500 mt-2 leading-relaxed">Metrics and feedback table are currently filtered to show results for the selected week period.</p>
                                
                                {selectedWeek && (
                                    <div className="mt-6 px-6 py-3 bg-brand-50 text-brand-700 rounded-2xl text-sm font-black border-2 border-brand-100 inline-flex items-center shadow-lg w-full justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse mr-2.5 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                                        Viewing: Week {selectedWeek.weekNum}
                                    </div>
                                )}
                            </AnimatedCard>
                        </div>

                        {/* Detailed Metrics Breakdown */}
                        <div className="lg:col-span-3">
                            <AnimatedCard delay={0.7} className="h-full p-6 bg-white border border-slate-100 shadow-xl rounded-3xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center">
                                            <Activity className="w-5 h-5 mr-3 text-slate-600" />
                                            Detailed Metrics Breakdown
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">Granular scores for current selected week segment.</p>
                                    </div>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={questionsData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                            <XAxis type="number" domain={[0, 5]} hide />
                                            <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#475569', fontSize: 12, fontWeight: 700}} />
                                            <RechartsTooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                                            />
                                            <Bar dataKey="score" radius={[0, 10, 10, 0]} maxBarSize={30} animationDuration={1000}>
                                                {questionsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === questionsData.length - 1 ? '#4f46e5' : '#818cf8'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </AnimatedCard>
                        </div>
                    </div>


                    {/* Action Hub */}
                    <div className="mt-12 space-y-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg text-white">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Administrative Actions & Details</h2>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Control Center</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Selected Week Feedback Stream */}
                            <AnimatedCard delay={0.9} className="xl:col-span-2 p-0 overflow-hidden bg-white border border-slate-200 shadow-xl rounded-3xl">
                                <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                        <Calendar className="w-5 h-5 mr-3 text-slate-600" />
                                        Week {selectedWeek ? selectedWeek.weekNum : ''} Raw Feedbacks
                                    </h3>
                                    <span className="px-3 py-1 bg-brand-100 text-brand-700 text-[10px] font-black rounded-full uppercase">Week View</span>
                                </div>
                                <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black sticky top-0 z-20">
                                            <tr>
                                                <th className="px-8 py-5">Timestamp</th>
                                                <th className="px-8 py-5">Ratings</th>
                                                <th className="px-8 py-5 min-w-[300px]">Written Answers</th>
                                                <th className="px-8 py-5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedWeek && selectedWeek.feedbacks.map((fb) => (
                                                <tr key={fb._id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-8 py-6 align-top">
                                                        <div className="font-black text-slate-900 leading-none mb-1.5">Submitted</div>
                                                        <div className="text-[11px] text-slate-400 font-bold uppercase">{format(new Date(fb.createdAt), 'MMM dd, yyyy · hh:mm a')}</div>
                                                    </td>
                                                    <td className="px-8 py-6 align-top">
                                                        <div className="flex items-center mb-1">
                                                            <div className="flex space-x-0.5 mr-3">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} className={`w-3 h-3 ${i < Math.round(fb.ratings?.overall || 0) ? 'text-brand-500 fill-brand-500' : 'text-slate-200 fill-slate-200'}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-sm font-black text-slate-800">{(fb.ratings?.overall || 0).toFixed(1)}</span>
                                                        </div>
                                                        <div className="text-[10px] text-slate-500">
                                                            <span className="font-bold">Life:</span> {fb.ratings?.lifeSkills?.toFixed(1) || '?'} ·  
                                                            <span className="font-bold"> Learn:</span> {fb.ratings?.learningExperience?.toFixed(1) || '?'} · 
                                                            <span className="font-bold"> Reach:</span> {fb.ratings?.teacherReach?.toFixed(1) || '?'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 align-top text-xs text-slate-600 space-y-2">
                                                        {fb.textFeedback ? (
                                                            <>
                                                                <div><span className="font-bold text-slate-800">Interest:</span> {fb.textFeedback.makeMoreInteresting}</div>
                                                                <div><span className="font-bold text-slate-800">Most Int.:</span> {fb.textFeedback.mostInteresting}</div>
                                                                <div><span className="font-bold text-slate-800">Impact:</span> {fb.textFeedback.classImpact}</div>
                                                            </>
                                                        ) : (
                                                            <span className="italic text-slate-400">Legacy Rating Format</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 align-top text-right">
                                                        <button 
                                                            onClick={() => handleDeleteFeedback(fb._id)}
                                                            disabled={actionLoading}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!selectedWeek || selectedWeek.feedbacks.length === 0) && (
                                                <tr>
                                                    <td colSpan="4" className="py-12 text-center text-slate-400 font-medium">
                                                        No historical feedback records found for this week.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </AnimatedCard>

                            {/* System Maintenance */}
                            <AnimatedCard delay={1.0} className="xl:col-span-1 border-2 border-rose-50 bg-white shadow-xl shadow-rose-100 p-6 rounded-3xl h-full flex flex-col">
                                <h3 className="text-lg font-extrabold text-slate-900 flex items-center mb-6 pb-4 border-b border-slate-100">
                                    <AlertTriangle className="w-5 h-5 mr-3 text-rose-500" />
                                    Danger Zone
                                </h3>
                                
                                <div className="space-y-6 flex-1 flex flex-col justify-end">
                                    <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl">
                                        <h4 className="font-bold text-rose-800 mb-2">Factory Reset</h4>
                                        <p className="text-xs text-rose-600/70 leading-relaxed mb-4">
                                            DANGER: Erases the entire database. All student feedback history across all dates and years will be permanently destroyed.
                                        </p>
                                        <button 
                                            onClick={handleClearAll}
                                            disabled={actionLoading}
                                            className="w-full py-3 px-4 bg-rose-500 text-white font-bold rounded-xl text-sm transition-all hover:bg-rose-600 shadow-md shadow-rose-200 disabled:opacity-50 flex justify-center items-center"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Everything'}
                                        </button>
                                    </div>
                                </div>
                            </AnimatedCard>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Class Chat Group Management */}
            <div className="mt-16 pt-12 border-t-2 border-slate-100 relative z-20">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg text-white">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Doubt Clarification Chat</h2>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Broadcasting to all Active Students</p>
                                </div>
                            </div>

                            <AnimatedCard className="max-w-4xl mx-auto p-0 border border-slate-200 shadow-2xl rounded-3xl overflow-hidden flex flex-col h-[600px] bg-white">
                                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                        </span>
                                        <span className="text-sm font-bold text-slate-700">Live Global Chat</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase">Admin View</span>
                                        <button 
                                            onClick={handleClearChats}
                                            disabled={actionLoading}
                                            className="text-xs font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1 rounded-full uppercase transition-colors"
                                        >
                                            Clear Chat
                                        </button>
                                    </div>
                                </div>

                                {/* Chat Transcript View */}
                                <div 
                                    ref={chatContainerRef}
                                    className="flex-1 p-6 overflow-y-auto bg-slate-100/50 flex flex-col space-y-5 custom-scrollbar"
                                >
                                    {chats.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-40 text-slate-500">
                                            <MessageSquare className="w-12 h-12 mb-3" />
                                            <p className="text-sm font-bold">No announcements or discussion messages yet.</p>
                                        </div>
                                    ) : (
                                        chats.map((chat) => {
                                            const isAdmin = chat.sender?._id === user?.id || chat.sender?.role === 'faculty';
                                            return (
                                                <div key={chat._id} className={`flex flex-col max-w-[70%] ${isAdmin ? 'self-end items-end' : 'self-start items-start'}`}>
                                                    <span className="text-[11px] font-bold text-slate-400 mb-1.5 px-1 flex items-center">
                                                        {isAdmin && <ShieldCheck className="w-3 h-3 text-brand-500 mr-1" />}
                                                        {isAdmin ? 'You (Faculty)' : chat.sender?.name || 'Unknown Student'}
                                                    </span>
                                                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] shadow-sm leading-relaxed ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm border-0' : 'bg-white border text-slate-800 border-slate-200 rounded-tl-sm'}`}>
                                                        {chat.message}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-1.5 uppercase font-medium">
                                                        {format(new Date(chat.createdAt), 'MMM dd · hh:mm a')}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-100 flex space-x-3">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="text"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="Broadcast an announcement, notes, or reply..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-5 pr-12 py-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all shadow-inner font-medium text-slate-800"
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={actionLoading || !chatMessage.trim()}
                                        className="h-full aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 shadow-md flex-shrink-0"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </form>
                            </AnimatedCard>

            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md relative z-10 p-6 border border-slate-100"
                        >
                            <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            
                            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                                <Upload className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 shadow-sm border-b border-slate-100 pb-3">Upload Notes for {selectedUnitForUpload}</h3>
                            
                            <div className="mt-5">
                                <div 
                                    className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-brand-400 hover:bg-brand-50/50 transition-colors flex flex-col items-center justify-center cursor-pointer mb-2"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
                                    <p className="text-sm font-bold text-slate-600">
                                        {selectedFile ? selectedFile.name : "Click to select a PDF file"}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">PDF max 20MB</p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="application/pdf"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </div>
                            
                            <div className="mt-6 flex space-x-3">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitNoteUpload}
                                    disabled={!selectedFile || isUploadingNote}
                                    className="flex-1 px-4 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center disabled:opacity-50 shadow-md shadow-brand-500/30"
                                >
                                    {isUploadingNote ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                    Upload
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            </div>
        </BackgroundAnimation>
    );
};

export default AdminDashboard;
