import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const emojis = {
    1: '😢',
    2: '😐',
    3: '🙂',
    4: '😀',
    5: '🤩'
};

const ratingLabels = {
    1: 'Bad',
    2: 'Good',
    3: 'Very Good',
    4: 'Excellent',
    5: 'Outstanding'
};

const StarRating = ({ question, rating, onRatingChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col mb-3 bg-white/40 backdrop-blur-sm p-3 rounded-xl border border-slate-200/50 shadow-sm relative overflow-hidden group hover:bg-white/60 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-slate-600 font-bold text-xs tracking-tight flex-1 pr-4">{question}</h3>
                {(hover > 0 || rating > 0) && (
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100 uppercase tracking-tighter animate-in fade-in zoom-in duration-300">
                        {ratingLabels[hover || rating]}
                    </span>
                )}
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex space-x-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRatingChange(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className={`text-2xl focus:outline-none transition-all duration-300 ${
                                star <= (hover || rating) 
                                ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' 
                                : 'text-slate-200'
                            }`}
                        >
                            ★
                        </motion.button>
                    ))}
                </div>
                <div className="w-10 h-10 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {(hover > 0 || rating > 0) && (
                            <motion.span
                                key={hover || rating}
                                initial={{ opacity: 0, scale: 0, rotate: -20, y: 5 }}
                                animate={{ opacity: 1, scale: 1.2, rotate: 0, y: 0 }}
                                exit={{ opacity: 0, scale: 0, rotate: 20, y: -5 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                className="text-3xl pointer-events-none select-none"
                            >
                                {emojis[hover || rating]}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            {/* Subtle progress bar background */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-brand-500/20 transition-all duration-500 ease-out" style={{ width: `${(rating / 5) * 100}%` }} />
        </div>
    );
};

export default StarRating;
