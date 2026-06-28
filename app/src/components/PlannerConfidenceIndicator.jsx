import React, { useState, useEffect } from 'react';
import { getSyncConfig } from '../services/homesteadSyncService';
import { usePwaLifecycle } from '../context/PwaLifecycleContext';
import { CheckCircle2, Cloud, CloudOff, RefreshCw } from 'lucide-react';

const PlannerConfidenceIndicator = ({ lastSaved }) => {
    const { isOnline } = usePwaLifecycle();
    const [syncConfig, setSyncConfig] = useState(() => getSyncConfig());

    useEffect(() => {
        const interval = setInterval(() => {
            setSyncConfig(getSyncConfig());
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const formatLastSaved = (dateStr) => {
        if (!dateStr) return 'Not saved yet';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Not saved yet';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getStatusTextAndIcon = () => {
        if (!syncConfig.enabled) {
            return {
                text: 'Local Only (Cloud sync disabled)',
                color: 'text-charcoal-400 bg-sand-100 border-sand-200',
                icon: <CloudOff size={12} className="shrink-0" />
            };
        }

        if (!isOnline) {
            return {
                text: 'Offline — Pending queue sync',
                color: 'text-amber-700 bg-amber-50 border-amber-200',
                icon: <CloudOff size={12} className="shrink-0" />
            };
        }

        switch (syncConfig.syncStatus) {
            case 'syncing':
                return {
                    text: 'Syncing changes...',
                    color: 'text-sage-700 bg-sage-50 border-sage-200',
                    icon: <RefreshCw size={12} className="animate-spin shrink-0" />
                };
            case 'retrying':
                return {
                    text: `Retrying cloud backup... Attempt ${syncConfig.syncRetryCount + 1}/3`,
                    color: 'text-amber-800 bg-amber-50 border-amber-200',
                    icon: <RefreshCw size={12} className="animate-spin shrink-0" />
                };
            case 'error':
                return {
                    text: 'Cloud sync failed. Will retry when connection stabilizes.',
                    color: 'text-terracotta-700 bg-red-50 border-red-200',
                    icon: <CloudOff size={12} className="shrink-0" />
                };
            case 'conflict':
                return {
                    text: 'Sync Conflict — Resolve in Settings',
                    color: 'text-amber-800 bg-amber-50 border-amber-200',
                    icon: <CloudOff size={12} className="shrink-0" />
                };
            default:
                return {
                    text: 'Backup Synced to Cloud',
                    color: 'text-sage-700 bg-sage-50 border-sage-200',
                    icon: <Cloud size={12} className="shrink-0" />
                };
        }
    };

    const status = getStatusTextAndIcon();

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-sand-100 text-[11px] font-medium leading-none mt-4 select-none">
            <div className="flex items-center gap-1.5 text-sage-800">
                <CheckCircle2 size={12} className="text-sage-500 shrink-0" />
                <span>Saved Locally: <strong>{formatLastSaved(lastSaved)}</strong></span>
            </div>
            
            <div className={`flex items-center gap-1.5 px-2.5 py-1 border rounded-lg ${status.color}`}>
                {status.icon}
                <span>{status.text}</span>
            </div>
        </div>
    );
};

export default PlannerConfidenceIndicator;
