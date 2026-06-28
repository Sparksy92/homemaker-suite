import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from './ToastContext';
import { initializeSyncReconnectHandler } from '../services/homesteadSyncService';

const PwaLifecycleContext = createContext(null);

export const usePwaLifecycle = () => {
    const context = useContext(PwaLifecycleContext);
    if (!context) {
        throw new Error('usePwaLifecycle must be used within a PwaLifecycleProvider');
    }
    return context;
};

export const PwaLifecycleProvider = ({ children }) => {
    const { showToast } = useToast();
    const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    // Proxy the Vite PWA service worker prompts hook
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker
    } = useRegisterSW();

    // Check device standalone & OS properties
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const checkStandalone = () => {
            const isMirrorStandalone = window.matchMedia('(display-mode: standalone)').matches 
                || window.navigator.standalone === true; // iOS Safari
            setIsStandalone(isMirrorStandalone);
        };

        const checkIOS = () => {
            const ua = window.navigator.userAgent.toLowerCase();
            const appleDevices = /iphone|ipad|ipod/.test(ua);
            setIsIOS(appleDevices);
        };

        checkStandalone();
        checkIOS();

        // Listen for change in standalone mode queries
        const matcher = window.matchMedia('(display-mode: standalone)');
        const listener = (e) => setIsStandalone(e.matches);
        if (matcher.addEventListener) {
            matcher.addEventListener('change', listener);
            return () => matcher.removeEventListener('change', listener);
        }
    }, []);

    // Monitor network online/offline statuses
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Capture install prompt event for native install buttons
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    }, []);

    // Initialize idempotent sync reconnect handler
    useEffect(() => {
        initializeSyncReconnectHandler({ showToast });
    }, [showToast]);

    // Install trigger method
    const triggerNativeInstall = async () => {
        if (!installPrompt) return false;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        setInstallPrompt(null);
        return outcome === 'accepted';
    };

    const value = {
        isOnline,
        installPrompt,
        isStandalone,
        isIOS,
        offlineReady,
        setOfflineReady,
        needRefresh,
        setNeedRefresh,
        updateServiceWorker,
        triggerNativeInstall
    };

    return (
        <PwaLifecycleContext.Provider value={value}>
            {children}
        </PwaLifecycleContext.Provider>
    );
};
