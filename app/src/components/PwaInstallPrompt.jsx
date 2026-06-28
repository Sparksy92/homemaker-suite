import React, { useState } from 'react';
import { usePwaLifecycle } from '../context/PwaLifecycleContext';
import { useToast } from '../context/ToastContext';
import { Download, Info, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PwaInstallPrompt = ({ inline = false }) => {
    const { showToast } = useToast();
    const { installPrompt, isStandalone, isIOS, triggerNativeInstall } = usePwaLifecycle();
    const [showIosModal, setShowIosModal] = useState(false);

    // If standalone/installed, do not render install prompts
    if (isStandalone) return null;

    const handleInstallClick = async () => {
        const success = await triggerNativeInstall();
        if (success) {
            showToast('Homemaker Suite installed successfully!', 'success');
        }
    };

    // Determine state
    let installState = 'unsupported';
    if (installPrompt) {
        installState = 'native-install-available';
    } else if (isIOS) {
        installState = 'ios-manual-instructions';
    }

    if (installState === 'unsupported') return null;

    if (inline) {
        return (
            <div className="bg-white border border-sand-100 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-sage-50 p-2.5 rounded-lg text-sage-600 shrink-0">
                        <Download size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-sage-900 uppercase tracking-wide">Install Homemaker Suite</h4>
                        <p className="text-[10px] text-charcoal-500 leading-normal">
                            Run Homemaker as a standalone app on your home screen for complete offline field access.
                        </p>
                    </div>
                </div>

                {installState === 'native-install-available' ? (
                    <button
                        onClick={handleInstallClick}
                        className="py-1.5 px-3 bg-sage-700 hover:bg-sage-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                    >
                        Install
                    </button>
                ) : (
                    <button
                        onClick={() => setShowIosModal(true)}
                        className="py-1.5 px-3 bg-sand-200 hover:bg-sand-300 text-charcoal font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all border border-sand-300"
                    >
                        Instructions
                    </button>
                )}

                {/* iOS Instructions Modal Overlay */}
                <AnimatePresence>
                    {showIosModal && (
                        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-sage-950/70 backdrop-blur-md">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-sand-100 flex flex-col"
                            >
                                <div className="p-6 border-b border-sand-150 flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-sage-900 uppercase tracking-wider">Install on iOS Safari</h3>
                                    <button onClick={() => setShowIosModal(false)} className="text-charcoal-400 hover:text-charcoal-600">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-4 text-xs text-charcoal-600 leading-relaxed font-sans">
                                    <p className="font-medium text-charcoal-800">Apple iOS Safari does not support one-click installations. Please follow these steps:</p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2.5">
                                            <div className="bg-sand-100 px-2 py-0.5 rounded font-bold">1</div>
                                            <span>Open Homemaker Suite in <strong>Safari</strong>.</span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="bg-sand-100 px-2 py-0.5 rounded font-bold">2</div>
                                            <span className="flex items-center gap-1 flex-wrap">
                                                Tap the <strong>Share</strong> button <Share size={12} className="inline shrink-0" /> at the bottom or top of your browser.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2.5">
                                            <div className="bg-sand-100 px-2 py-0.5 rounded font-bold">3</div>
                                            <span className="flex items-center gap-1 flex-wrap">
                                                Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare size={12} className="inline shrink-0" />.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-sand-50 p-4 border-t border-sand-150 flex justify-end">
                                    <button
                                        onClick={() => setShowIosModal(false)}
                                        className="py-1.5 px-4 bg-sage-700 hover:bg-sage-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                                    >
                                        Got It
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return null;
};

export default PwaInstallPrompt;
