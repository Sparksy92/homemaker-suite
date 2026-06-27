import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import HomesteadOnboarding from './HomesteadOnboarding';
import { Home, ArrowRight, Clock, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingGate = () => {
    const { homesteadProfile, updateHomesteadProfile } = useUser();
    const [showBanner, setShowBanner] = useState(false);
    const [showWizard, setShowWizard] = useState(false);

    useEffect(() => {
        // If there's no profile, and we haven't asked in this session
        const isReminded = sessionStorage.getItem('homemaker_onboarding_reminded') === 'true';
        if (homesteadProfile === null && !isReminded) {
            // Show banner after a slight delay for better UX transition
            const timer = setTimeout(() => {
                setShowBanner(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setShowBanner(false);
        }
    }, [homesteadProfile]);

    const handleSetUpNow = () => {
        setShowBanner(false);
        setShowWizard(true);
    };

    const handleSkipForNow = () => {
        const skippedProfile = {
            schemaVersion: 1,
            skipped: true,
            completedAt: null,
            skippedAt: new Date().toISOString()
        };
        updateHomesteadProfile(skippedProfile);
        setShowBanner(false);
    };

    const handleRemindMeLater = () => {
        sessionStorage.setItem('homemaker_onboarding_reminded', 'true');
        setShowBanner(false);
    };

    if (showWizard) {
        return <HomesteadOnboarding onClose={() => setShowWizard(false)} />;
    }

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-40 bg-sage-800 text-white rounded-3xl p-5 shadow-2xl border border-sage-600 backdrop-blur-md"
                >
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <div className="p-2.5 bg-white/10 rounded-2xl text-sand-100 shrink-0">
                                <Home size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-serif font-black text-base text-sand-100 leading-tight">Welcome to your Homestead OS</h4>
                                <p className="text-xs text-sand-200 leading-relaxed font-sans">
                                    Set up your profile to customize crop calendars, solar calculator estimates, and safety gates for your specific region and household size.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1.5">
                            <button
                                onClick={handleSetUpNow}
                                className="w-full py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 active:bg-terracotta-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>Set Up Profile Now</span>
                                <ArrowRight size={14} />
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleRemindMeLater}
                                    className="py-2 px-3 bg-white/10 hover:bg-white/20 text-sand-100 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Clock size={12} />
                                    <span>Remind Later</span>
                                </button>
                                <button
                                    onClick={handleSkipForNow}
                                    className="py-2 px-3 bg-white/5 hover:bg-white/15 text-sand-300 hover:text-sand-100 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                                >
                                    <EyeOff size={12} />
                                    <span>Skip for Now</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OnboardingGate;
