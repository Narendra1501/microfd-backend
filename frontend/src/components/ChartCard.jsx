import React from 'react';
import { motion } from 'framer-motion';

const ChartCard = ({ title, description, children, delay = 0, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.6,
                delay: delay,
                type: 'spring',
                stiffness: 80,
                damping: 20
            }}
            className={`glass-panel p-6 rounded-3xl relative overflow-hidden group ${className}`}
        >
            {/* Subtle background glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="mb-6 relative z-10">
                {title && <h3 className="text-xl font-bold text-slate-800">{title}</h3>}
                {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
            </div>
            
            <div className="relative z-10 w-full">
                {children}
            </div>
        </motion.div>
    );
};

export default ChartCard;
