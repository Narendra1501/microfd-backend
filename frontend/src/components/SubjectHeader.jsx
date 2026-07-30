import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

const SubjectHeader = ({ 
    subjectName = "Digital Communication", 
    courseCode = "ECUC1110",
    subtitle = "Daily Teaching Analytics",
    icon: Icon = BookOpen,
    children
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden mb-8 rounded-3xl shadow-xl shadow-brand-500/10"
        >
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-900 via-indigo-900 to-primary-900">
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[200%] bg-pink-500/30 blur-3xl rounded-full transform rotate-12 animate-blob"></div>
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-cyan-500/20 blur-3xl rounded-full transform -rotate-12 animate-blob" style={{ animationDelay: '2s' }}></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-white/10 rounded-3xl bg-black/10 backdrop-blur-md gap-6">
                
                <div className="flex items-center space-x-5">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="p-4 bg-white/10 rounded-2xl border border-white/20 shadow-xl backdrop-blur-md text-cyan-300 hidden sm:flex shrink-0"
                    >
                        <Icon className="w-10 h-10" />
                    </motion.div>
                    
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center space-x-2 text-primary-200 mb-2 font-medium"
                        >
                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold tracking-wider uppercase border border-white/10 backdrop-blur-md text-cyan-300">
                                Course Code: {courseCode}
                            </span>
                        </motion.div>
                        
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                        >
                            {subjectName} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-brand-300">Feedback</span>
                        </motion.h1>
                        
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-slate-300 mt-2 text-sm sm:text-base font-medium max-w-xl"
                        >
                            {subtitle}
                        </motion.p>
                    </div>
                </div>

                {/* Right Action Container (Children like Notifications / Badges) */}
                {children && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center space-x-4 relative z-20 self-end sm:self-center shrink-0"
                    >
                        {children}
                    </motion.div>
                )}

                {/* Decorative element on the right (if no children) */}
                {!children && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, type: "spring" }}
                        className="hidden lg:flex absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
                    >
                        <Sparkles className="w-24 h-24 text-pink-300" />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default SubjectHeader;
