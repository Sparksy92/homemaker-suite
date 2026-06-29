import React from 'react';
import { usePwaLifecycle } from '../context/PwaLifecycleContext';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
    const { isOnline } = usePwaLifecycle();

    if (!isOnline) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-500/30 text-amber-100 rounded-full backdrop-blur-md animate-pulse">
                <WifiOff size={12} className="shrink-0 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-wider leading-none">Field Mode (Offline)</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/30 border border-emerald-500/30 text-emerald-100 rounded-full backdrop-blur-md">
            <Wifi size={12} className="shrink-0 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider leading-none">Online & Synced</span>
        </div>
    );
};

export default OfflineIndicator;
