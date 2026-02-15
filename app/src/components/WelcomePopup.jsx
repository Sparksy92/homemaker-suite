import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Info, MessageSquare, X, Lock, Cloud, Database, UserCheck } from 'lucide-react';

const WelcomePopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenNotice = localStorage.getItem('homemaker_beta_notice_dismissed');
        if (!hasSeenNotice) {
            // Small delay for better UX
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem('homemaker_beta_notice_dismissed', 'true');
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-sage-900/40">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="bg-sage-800 text-sand-50 p-8 pt-10 relative">
                            <button
                                onClick={dismiss}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-terracotta-500 rounded-2xl shadow-lg">
                                    <Shield className="text-white" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-serif font-bold">Welcome to Beta</h2>
                                    <p className="text-sage-200 text-sm font-medium tracking-wide border-l-2 border-terracotta-500 pl-3">Phase 1: Exploration & Field Testing</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto space-y-8">
                            <section>
                                <h3 className="text-xs font-bold text-sage-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Info size={14} className="text-terracotta-500" /> Currently In Development
                                </h3>
                                <p className="text-charcoal-700 leading-relaxed italic">
                                    "Homemaker Suite is being built as a resilient, offline-first encyclopedia for the modern pioneer. We're currently in active development—thank you for joining the journey early."
                                </p>
                            </section>

                            <section className="bg-sand-50 rounded-3xl p-6 border border-sand-200">
                                <h3 className="text-xs font-bold text-sage-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Lock size={14} className="text-sage-600" /> Security & Privacy Policy
                                </h3>

                                <div className="grid gap-6 sm:grid-cols-2">
                                    <SecurityItem
                                        icon={<Database className="text-sage-600" />}
                                        title="Local Storage"
                                        desc="Sightings, notes, and photos are stored in YOUR device's memory (IndexedDB). We never see them."
                                    />
                                    <SecurityItem
                                        icon={<Cloud className="text-sage-600" />}
                                        title="No Backend"
                                        desc="There is no central database to hack. The app is served as secure, static files."
                                    />
                                    <SecurityItem
                                        icon={<Shield className="text-sage-600" />}
                                        title="Cloudflare Secured"
                                        desc="Automatic HTTPS encryption and DDoS protection via Cloudflare infrastructure."
                                    />
                                    <SecurityItem
                                        icon={<UserCheck className="text-sage-600" />}
                                        title="Zero Tracking"
                                        desc="No accounts, no email lists, and no personal data collection. Purely functional."
                                    />
                                </div>
                            </section>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <button
                                    onClick={dismiss}
                                    className="flex-1 py-4 bg-sage-800 text-white rounded-2xl font-bold shadow-lg hover:bg-sage-900 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Start Exploring
                                </button>
                                <a
                                    href="#/feedback"
                                    onClick={dismiss}
                                    className="flex-1 py-4 bg-white border-2 border-sage-100 text-sage-800 rounded-2xl font-bold hover:bg-sage-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare size={18} /> Send Feedback
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const SecurityItem = ({ icon, title, desc }) => (
    <div className="flex gap-4">
        <div className="shrink-0 p-2 bg-white rounded-xl shadow-sm border border-sand-200">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
            <h4 className="font-bold text-sage-900 text-sm mb-1">{title}</h4>
            <p className="text-xs text-charcoal-600 leading-normal">{desc}</p>
        </div>
    </div>
);

export default WelcomePopup;
