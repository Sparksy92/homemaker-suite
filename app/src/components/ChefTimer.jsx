import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChefTimer = ({ duration, label, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            clearInterval(interval);
            setIsActive(false);
            setIsFinished(true);

            // Try to notify if possible
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`Homemaker Suite: ${label}`, {
                    body: "Time's up!",
                    icon: "/favicon.ico"
                });
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, label]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div
            initial={{ y: 100, x: '-50%', opacity: 0 }}
            animate={{ y: 0, x: '-50%', opacity: 1 }}
            exit={{ y: 100, x: '-50%', opacity: 0 }}
            className={`fixed bottom-24 left-1/2 z-[100] p-1 rounded-3xl shadow-2xl backdrop-blur-xl border-2 ${isFinished ? 'bg-terracotta-600 border-terracotta-400 animate-bounce' : 'bg-sage-900/90 border-white/20'} flex items-center gap-4 transition-colors`}
        >
            <div className="pl-5 py-3 pr-2 flex flex-col min-w-[120px]">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1 truncate max-w-[150px]">{label || 'Cook Timer'}</span>
                <span className={`text-3xl font-mono font-black text-white ${isFinished ? 'animate-pulse' : ''}`}>{formatTime(timeLeft)}</span>
            </div>

            <div className="flex gap-1 pr-3 py-3">
                {!isFinished && (
                    <>
                        <button
                            onClick={() => setIsActive(!isActive)}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95"
                        >
                            {isActive ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                        <button
                            onClick={() => setTimeLeft(duration * 60)}
                            className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all active:scale-95"
                        >
                            <RotateCcw size={20} />
                        </button>
                    </>
                )}
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-terracotta-500 hover:bg-terracotta-600 rounded-2xl text-white transition-all shadow-lg active:scale-95 ml-1"
                >
                    <X size={20} />
                </button>
            </div>
        </motion.div>
    );
};

export default ChefTimer;
