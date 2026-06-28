import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Post-reload toast handler
    useEffect(() => {
        const postReload = sessionStorage.getItem('homemaker_post_reload_toast');
        if (postReload) {
            if (postReload === 'local_only_restored') {
                showToast('Signed out / Local-only mode restored.', 'success', 4000);
            }
            sessionStorage.removeItem('homemaker_post_reload_toast');
        }
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-white shrink-0" size={16} />;
            case 'error': return <AlertOctagon className="text-white shrink-0" size={16} />;
            case 'warning': return <AlertTriangle className="text-white shrink-0" size={16} />;
            default: return <Info className="text-white shrink-0" size={16} />;
        }
    };

    const getTypeClasses = (type) => {
        switch (type) {
            case 'success': return 'bg-sage-600 border border-sage-500 shadow-sage-900/10';
            case 'error': return 'bg-terracotta-600 border border-terracotta-500 shadow-terracotta-900/10';
            case 'warning': return 'bg-amber-600 border border-amber-500 shadow-amber-950/10';
            default: return 'bg-charcoal border border-charcoal-700 shadow-black/10';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* Toast Portal Container */}
            <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                            className={`${getTypeClasses(toast.type)} text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-lg flex items-center justify-between gap-3 pointer-events-auto backdrop-blur-md`}
                        >
                            <div className="flex items-center gap-2.5">
                                {getIcon(toast.type)}
                                <span className="leading-tight">{toast.message}</span>
                            </div>
                            <button 
                                onClick={() => removeToast(toast.id)}
                                className="text-white/60 hover:text-white shrink-0 p-0.5 hover:bg-white/10 rounded transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
