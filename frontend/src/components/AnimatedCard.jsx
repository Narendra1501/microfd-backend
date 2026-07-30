import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({ children, className = '', delay = 0, noHover = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: delay,
                type: 'spring',
                stiffness: 100,
                damping: 20
            }}
            whileHover={!noHover ? {
                y: -5,
                boxShadow: "0 20px 40px -10px rgba(139, 92, 246, 0.15), 0 10px 20px -5px rgba(139, 92, 246, 0.1)",
                transition: { duration: 0.2, ease: "easeOut" }
            } : {}}
            className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
