import React, { useState, useEffect } from 'react';
import { getSyncConfig } from '../services/homesteadSyncService';
import { exportAppData } from '../services/appDataService';
import { useToast } from '../context/ToastContext';
import { AlertCircle, Download, X } from 'lucide-react';

const BackupReminder = () => {
    const { showToast } = useToast();
    const [isVisible, setIsVisible] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const checkBackupStatus = () => {
            const syncConfig = getSyncConfig();
            if (syncConfig.enabled) {
                setIsVisible(false);
                return;
            }

            // If local dismiss flag is active for this session, hide it
            if (sessionStorage.getItem('homemaker_backup_reminder_dismissed') === 'true') {
                setIsVisible(false);
                return;
            }

            const lastExport = localStorage.getItem('homemaker_last_export_at');
            if (!lastExport) {
                // Never exported
                setIsVisible(true);
                return;
            }

            const lastExportTime = new Date(lastExport).getTime();
            const fourteenDays = 14 * 24 * 60 * 60 * 1000;
            if (Date.now() - lastExportTime > fourteenDays) {
                setIsVisible(true);
            }
        };

        checkBackupStatus();
    }, []);

    const handleQuickExport = async () => {
        setIsExporting(true);
        showToast('Preparing backup file...', 'info');
        try {
            const data = await exportAppData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const dateStr = new Date().toISOString().split('T')[0];
            const link = document.createElement('a');
            link.href = url;
            link.download = `homemaker-suite-backup-${dateStr}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Save timestamp
            localStorage.setItem('homemaker_last_export_at', new Date().toISOString());
            showToast('Backup file exported successfully!', 'success');
            setIsVisible(false);
        } catch (err) {
            console.error('Reminder export failed:', err);
            showToast('Failed to create backup.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem('homemaker_backup_reminder_dismissed', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start justify-between gap-4 max-w-xl">
            <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-xl text-amber-700 shrink-0 mt-0.5 animate-pulse">
                    <AlertCircle size={18} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">Homestead Backup Recommended</h4>
                    <p className="text-[11px] leading-normal text-amber-800/80 font-medium">
                        You have not exported a local backup in over 14 days and cloud backup is disabled. Clearing browser caches could delete your data. Keep a copy safe.
                    </p>
                    <button
                        onClick={handleQuickExport}
                        disabled={isExporting}
                        className="mt-2.5 inline-flex items-center gap-1.5 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
                    >
                        <Download size={12} />
                        <span>Backup Now</span>
                    </button>
                </div>
            </div>
            
            <button
                onClick={handleDismiss}
                className="text-amber-800/50 hover:text-amber-800 shrink-0 p-1 hover:bg-amber-500/10 rounded-lg transition-all"
            >
                <X size={14} />
            </button>
        </div>
    );
};

export default BackupReminder;
