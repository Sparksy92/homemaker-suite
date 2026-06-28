import React from 'react';
import { usePwaLifecycle } from '../context/PwaLifecycleContext';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
    const { isOnline } = usePwaLifecycle();

    if (!isOnline) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full backdrop-blur-md animate-pulse">
                <WifiOff size={12} className="shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Field Mode (Offline)</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-sage-500/10 border border-sage-500/20 text-sage-700 rounded-full backdrop-blur-md">
            <Wifi size={12} className="shrink-0 text-sage-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">Online & Synced</span>
        </div>
    );
};

export default OfflineIndicator;
