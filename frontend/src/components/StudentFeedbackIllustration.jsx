import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentFeedbackIllustration = ({ isReacting, isSubmitting, rating = 0 }) => {
    // Determine expression based on rating
    const getFaceExpression = () => {
        if (rating === 0) return { eyes: "neutral", mouth: "neutral" };
        if (rating === 1) return { eyes: "sad", mouth: "sad" };
        if (rating <= 3) return { eyes: "neutral", mouth: "smile" };
        return { eyes: "happy", mouth: "wide-smile" };
    };

    const face = getFaceExpression();

    return (
        <div className="relative w-full h-full min-h-[300px] flex items-center justify-center overflow-hidden">
            <svg
                viewBox="0 0 400 300"
                className="w-full h-full max-w-sm"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Desk */}
                <rect x="80" y="240" width="240" height="10" rx="5" fill="#E2E8F0" />
                <rect x="100" y="250" width="10" height="40" fill="#CBD5E1" />
                <rect x="290" y="250" width="10" height="40" fill="#CBD5E1" />

                {/* Chair */}
                <rect x="150" y="200" width="100" height="15" rx="3" fill="#94A3B8" />
                <rect x="195" y="215" width="10" height="30" fill="#64748B" />

                {/* Character Body */}
                <motion.g
                    scale={1.2}
                    transformOrigin="center"
                    animate={isReacting ? { y: [0, -4, 0] } : {}}
                    transition={{ duration: 0.2 }}
                >
                    <path
                        d="M160 200C160 170 175 140 200 140C225 140 240 170 240 200H160Z"
                        fill="#6366F1"
                    />
                    {/* Head */}
                    <circle cx="200" cy="115" r="25" fill="#FDBA74" />
                    
                    {/* Face Expressions */}
                    <g transform="translate(185, 110)">
                        {/* Eyes */}
                        {face.eyes === "sad" ? (
                            <path d="M5 5Q10 0 15 5M25 5Q30 0 35 5" stroke="#475569" strokeWidth="2" fill="none" />
                        ) : face.eyes === "happy" ? (
                            <path d="M5 5Q10 10 15 5M25 5Q30 10 35 5" stroke="#475569" strokeWidth="2" fill="none" />
                        ) : (
                            <>
                                <circle cx="8" cy="5" r="2" fill="#475569" />
                                <circle cx="22" cy="5" r="2" fill="#475569" />
                            </>
                        )}
                        
                        {/* Mouth */}
                        {face.mouth === "sad" ? (
                            <path d="M8 18Q15 12 22 18" stroke="#475569" strokeWidth="2" fill="none" />
                        ) : face.mouth === "wide-smile" ? (
                            <path d="M5 15Q15 25 25 15" fill="#475569" />
                        ) : (
                            <path d="M8 15Q15 20 22 15" stroke="#475569" strokeWidth="2" fill="none" />
                        )}
                    </g>

                    {/* Hair */}
                    <path
                        d="M175 115C175 100 185 90 200 90C215 90 225 100 225 115C225 118 220 120 216 120C212 120 207 115 200 115C193 115 188 120 184 120C180 120 175 118 175 115Z"
                        fill="#475569"
                    />
                </motion.g>

                {/* Arms / Typing Animation */}
                <motion.g
                    animate={isReacting ? { 
                        rotate: [0, -8, 8, 0],
                        y: [0, -2, 2, 0]
                    } : {}}
                    transition={{ repeat: isReacting ? Infinity : 0, duration: 0.15 }}
                >
                    <path d="M165 180L135 220" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />
                    <path d="M235 180L265 220" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />
                </motion.g>

                {/* Laptop */}
                <g>
                    <rect x="250" y="160" width="80" height="55" rx="6" fill="#334155" />
                    <motion.rect
                        x="257"
                        y="167"
                        width="66"
                        height="41"
                        rx="3"
                        fill="#818CF8"
                        animate={{
                            fill: isSubmitting ? ["#818CF8", "#4ADE80", "#818CF8"] : "#818CF8",
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                    <defs>
                        <radialGradient id="screenGlow">
                            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx="290" cy="187" r="50" fill="url(#screenGlow)" />
                    <path d="M250 215L220 230H300L330 215H250Z" fill="#1E293B" />
                </g>

                {/* Floating Icons */}
                <AnimatePresence>
                    {isReacting && (
                        <motion.g
                            initial={{ opacity: 0, y: 0, scale: 0 }}
                            animate={{ opacity: 1, y: -60, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.5 }}
                        >
                            <circle cx="120" cy="100" r="7" fill="#60A5FA" />
                            <circle cx="280" cy="80" r="6" fill="#A78BFA" />
                            <path d="M200 50L205 60L215 62L207 68L210 78L200 72L190 78L193 68L185 62L195 60Z" fill="#FBBF24" />
                        </motion.g>
                    )}
                </AnimatePresence>
            </svg>

            {/* Traveling Packets */}
            <AnimatePresence>
                {isSubmitting && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute"
                                initial={{ left: '15%', top: `${40 + i * 8}%`, opacity: 0, scale: 1 }}
                                animate={{ 
                                    left: '75%', 
                                    top: '60%', 
                                    opacity: [0, 1, 0], 
                                    scale: [0.6, 1.2, 0.3] 
                                }}
                                transition={{ 
                                    duration: 0.7, 
                                    delay: i * 0.12,
                                    repeat: Infinity,
                                    ease: "circIn" 
                                }}
                            >
                                <div className="bg-brand-500 w-3 h-3 rounded-full blur-[1px] shadow-[0_0_12px_rgba(99,102,241,0.9)]" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentFeedbackIllustration;
