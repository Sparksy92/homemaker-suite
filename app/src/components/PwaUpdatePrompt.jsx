import React, { useEffect } from 'react';
import { usePwaLifecycle } from '../context/PwaLifecycleContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Wifi, X } from 'lucide-react';

const PwaUpdatePrompt = () => {
    const {
        needRefresh,
        setNeedRefresh,
        offlineReady,
        setOfflineReady,
        updateServiceWorker
    } = usePwaLifecycle();

    // Auto-dismiss offline ready notification after 5 seconds
    useEffect(() => {
        if (offlineReady) {
            const timer = setTimeout(() => {
                setOfflineReady(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [offlineReady, setOfflineReady]);

    if (!needRefresh && !offlineReady) return null;

    return (
        <div className="fixed bottom-6 left-6 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {/* Offline Ready Banner */}
                {offlineReady && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="bg-sage-600 border border-sage-500 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-between gap-3 pointer-events-auto backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2.5">
                            <Wifi size={16} className="text-white shrink-0" />
                            <span className="leading-tight">Homemaker is ready to work offline.</span>
                        </div>
                        <button
                            onClick={() => setOfflineReady(false)}
                            className="text-white/60 hover:text-white shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}

                {/* Service Worker Update Prompt Banner */}
                {needRefresh && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="bg-charcoal border border-charcoal-700 text-white p-4 rounded-2xl shadow-xl flex flex-col gap-3 pointer-events-auto backdrop-blur-md"
                    >
                        <div className="flex items-start gap-2.5">
                            <Download size={18} className="text-sage-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <span className="font-bold text-xs">New Update Available</span>
                                <p className="text-[10px] text-white/70 leading-normal">
                                    A new version of Homemaker Suite has been downloaded. Reload now to apply updates.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setNeedRefresh(false)}
                                className="py-1 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
                            >
                                Later
                            </button>
                            <button
                                onClick={() => updateServiceWorker(true)}
                                className="py-1 px-3 bg-sage-600 hover:bg-sage-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors"
                            >
                                Update Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PwaUpdatePrompt;
