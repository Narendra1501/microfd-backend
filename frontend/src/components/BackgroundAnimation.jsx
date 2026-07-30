import React from 'react';
import { motion } from 'framer-motion';

const BackgroundAnimation = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Subtle Pastel Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-50/50 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-50/40 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
          className="absolute -bottom-[10%] left-[20%] w-[45%] h-[45%] rounded-full bg-pink-50/30 blur-[100px]"
        />
      </div>

      {/* Floating Particles/Icons Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 1000, 
              y: Math.random() * 1000, 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              y: [null, -100, 0],
              opacity: [0, 1, 0],
              rotate: [0, 360],
              x: [null, (Math.random() - 0.5) * 200]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
            className="absolute p-2"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          >
            <div className="w-1 h-1 bg-brand-500 rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundAnimation;
