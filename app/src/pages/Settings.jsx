import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Lock, User, Palette, Globe, Moon, Download, Upload, Home, Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import ConflictResolverModal from '../components/ConflictResolverModal';
import PwaInstallPrompt from '../components/PwaInstallPrompt';
import { exportAppData, importAppData } from '../services/appDataService';
import HomesteadOnboarding from '../components/onboarding/HomesteadOnboarding';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import {
    getSyncConfig,
    enableCloudBackup,
    upgradeAnonymousAccount,
    disableCloudBackup,
    deleteRemoteBackup,
    pushQueue,
    pullNow
} from '../services/homesteadSyncService';

const Settings = () => {
    const navigate = useNavigate();
    const { user, settings, updateSettings, updateProfile, clearAppData } = useUser();
    const { showToast } = useToast();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: user.name, email: user.email });
    const [showOnboarding, setShowOnboarding] = useState(false);

    const [syncConfig, setSyncConfig] = useState(getSyncConfig());
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    
    // Conflict states
    const [conflicts, setConflicts] = useState([]);
    const [showConflictModal, setShowConflictModal] = useState(false);

    // Periodically refresh sync config status if syncing/working
    useEffect(() => {
        const interval = setInterval(() => {
            setSyncConfig(getSyncConfig());
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const [showSyncSetup, setShowSyncSetup] = useState(false);

    const handleToggleSync = async () => {
        if (syncConfig.enabled) {
            if (window.confirm('Are you sure you want to disable Cloud Sync? Your local data will remain unchanged, but automatic backups will stop.')) {
                await disableCloudBackup();
                setSyncConfig(getSyncConfig());
                setShowSyncSetup(false);
                showToast('Cloud sync disabled locally. Remote backups intact.', 'warning');
            }
        } else {
            setShowSyncSetup(!showSyncSetup);
        }
    };

    const handleEnableBackup = async (method) => {
        let res;
        if (method === 'anonymous') {
            showToast('Initializing anonymous backup...', 'info');
            res = await enableCloudBackup('anonymous');
        } else {
            if (!authForm.email || !authForm.password) {
                showToast('Please enter both email and password.', 'warning');
                return;
            }
            showToast('Activating cloud account...', 'info');
            res = await enableCloudBackup('email', authForm.email, authForm.password);
        }

        if (res.status === 'success') {
            showToast(method === 'anonymous' ? 'Anonymous backup activated!' : 'Account registered and backup activated!', 'success');
            setSyncConfig(getSyncConfig());
            setShowSyncSetup(false);
            setAuthForm({ email: '', password: '' });
        } else {
            showToast(`Failed to activate backup: ${res.message}`, 'error');
        }
    };

    const handleUpgrade = async () => {
        if (!authForm.email || !authForm.password) {
            showToast('Please specify an email and password.', 'warning');
            return;
        }

        showToast('Linking email account...', 'info');
        const res = await upgradeAnonymousAccount(authForm.email, authForm.password);
        if (res.status === 'success') {
            showToast('Account upgraded successfully!', 'success');
            setSyncConfig(getSyncConfig());
            setAuthForm({ email: '', password: '' });
        } else {
            showToast(`Failed to upgrade account: ${res.message}`, 'error');
        }
    };

    const handlePush = async () => {
        showToast('Pushing updates to cloud...', 'info');
        await pushQueue();
        const cfg = getSyncConfig();
        if (cfg.syncStatus === 'error') {
            showToast('Failed to push updates.', 'error');
        } else {
            showToast('Data pushed to cloud database successfully!', 'success');
        }
        setSyncConfig(cfg);
    };

    const handlePull = async () => {
        showToast('Checking remote database...', 'info');
        const res = await pullNow();
        if (res.status === 'success') {
            showToast(`Data pulled successfully! Merged ${res.mergedCount} modules.`, 'success');
            setTimeout(() => window.location.reload(), 1000);
        } else if (res.status === 'conflict') {
            showToast('Sync conflicts detected. Please resolve.', 'warning');
            setConflicts(res.conflicts);
            setShowConflictModal(true);
        } else {
            showToast(`Failed to pull: ${res.message}`, 'error');
        }
        setSyncConfig(getSyncConfig());
    };

    const handleResolveComplete = () => {
        setShowConflictModal(false);
        setConflicts([]);
        showToast('Conflicts resolved successfully!', 'success');
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleDeleteBackup = async () => {
        if (window.confirm('WARNING: This will permanently delete your remote backups and profile stored in Supabase and disable cloud sync. Local data will NOT be touched. This is permanent. Continue?')) {
            showToast('Deleting remote backups...', 'info');
            const res = await deleteRemoteBackup();
            if (res.status === 'success') {
                showToast('Remote backup deleted successfully.', 'success');
                setSyncConfig(getSyncConfig());
            } else {
                showToast(`Failed to delete remote backup: ${res.message}`, 'error');
            }
        }
    };

    const handleExport = async () => {
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

            // Record export timestamp
            localStorage.setItem('homemaker_last_export_at', new Date().toISOString());
            showToast('Backup file exported successfully!', 'success');
        } catch (err) {
            console.error('Export failed:', err);
            showToast('Failed to export backup file.', 'error');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                
                if (window.confirm('WARNING: Importing this backup will overwrite your current settings, profile, planners, build projects, favorites, water storage, and observations. This cannot be undone. Do you want to proceed?')) {
                    await importAppData(json);
                    alert('Data restored successfully! The app will now reload.');
                    window.location.reload();
                }
            } catch (err) {
                console.error('Import failed:', err);
                alert(`Restore failed: ${err.message || err}`);
            }
        };
        reader.readAsText(file);
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        updateProfile(editForm);
        setIsEditingProfile(false);
    };

    return (
        <div className="min-h-screen bg-sand-50 pb-24">
            {/* Header */}
            <div className="bg-white p-4 items-center flex gap-4 border-b border-sand-200 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-sand-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-sage-700" />
                </button>
                <h1 className="text-xl font-serif font-bold text-sage-900">Settings</h1>
            </div>

            <div className="p-6 space-y-6">

                {/* Account Section */}
                <Section title="Account">
                    <SettingItem
                        icon={<User size={20} />}
                        label="Personal Information"
                        description="Update your name and email"
                        onClick={() => setIsEditingProfile(true)}
                    />
                    <SettingItem
                        icon={<Lock size={20} />}
                        label="Security"
                        description="Change password (Local session only)"
                        onClick={() => alert('Security settings are managed locally in this demo.')}
                    />
                </Section>

                {/* Homestead Profile Section */}
                <Section title="Homestead Profile">
                    <SettingItem
                        icon={<Home size={20} />}
                        label="Configure Homestead Setup"
                        description="Update household size, water sourcing, energy arrays, and disclaimers"
                        onClick={() => setShowOnboarding(true)}
                    />
                </Section>

                {/* Preferences */}
                <Section title="Preferences">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-sand-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-sage-50 p-2 rounded-lg text-sage-600">
                                <Bell size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-sage-900">Notifications</h3>
                                <p className="text-xs text-charcoal-500">Enable push notifications</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.notifications}
                            onChange={() => updateSettings({ notifications: !settings.notifications })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-sand-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-sage-50 p-2 rounded-lg text-sage-600">
                                <Moon size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-sage-900">Dark Mode</h3>
                                <p className="text-xs text-charcoal-500">Switch to dark theme (Coming soon)</p>
                            </div>
                        </div>
                        <Switch
                            checked={settings.darkMode}
                            onChange={() => updateSettings({ darkMode: !settings.darkMode })}
                        />
                    </div>
                    <p className="text-[10px] text-sage-500 px-2 leading-relaxed italic">
                        Weather uses your approximate location to request current conditions from Open-Meteo when enabled.
                    </p>
                </Section>

                {/* Data Backup & Recovery */}
                <Section title="Data Backup & Recovery">
                    <div className="bg-white rounded-xl border border-sand-100 p-4 space-y-4">
                        <p className="text-xs text-charcoal-500 leading-relaxed">
                            Backup your local profile, planners, build projects, field binder settings, water inventory, favorites, read progress, and wildlife observations. All backup files are stored entirely offline on your device.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={handleExport}
                                className="flex items-center justify-center gap-2 p-4 bg-sage-600 text-white rounded-xl font-bold hover:bg-sage-700 transition-colors shadow-sm min-h-[44px]"
                            >
                                <Download size={18} /> Export Data
                            </button>
                            
                            <label className="flex items-center justify-center gap-2 p-4 bg-sand-100 text-sage-800 rounded-xl font-bold hover:bg-sand-200 transition-colors border border-sand-200 cursor-pointer text-center min-h-[44px]">
                                <Upload size={18} /> Import Data
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </Section>

                {/* Cloud Sync & Backup */}
                {isSupabaseConfigured && (
                    <Section title="Cloud Sync & Backup">
                        <div className="bg-white rounded-xl border border-sand-100 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-sage-50 p-2 rounded-lg text-sage-600">
                                        <Cloud size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sage-900">Enable Cloud Backup</h3>
                                        <p className="text-xs text-charcoal-500">Back up structured planners to cloud database</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={syncConfig.enabled || showSyncSetup}
                                    onChange={handleToggleSync}
                                />
                            </div>

                            {(syncConfig.enabled || showSyncSetup) && (
                                <div className="space-y-4 pt-3 border-t border-sand-100">
                                    {syncConfig.enabled ? (
                                        <>
                                            <div className="bg-sand-50 border border-sand-200 rounded-xl p-3 flex items-start gap-2.5 text-[10px] leading-normal text-charcoal-500">
                                                <AlertCircle size={14} className="text-charcoal-400 shrink-0 mt-0.5" />
                                                <span>
                                                    <strong>Important Note:</strong> Disabling Cloud Sync stops automatic backups, but remote database copies are preserved. To erase all remote data, use <strong>Delete Remote Data</strong> at the bottom.
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap justify-between text-xs gap-2">
                                                <span className="font-bold text-charcoal-500">Sync Status:</span>
                                                <span className="font-bold capitalize text-sage-800 bg-sage-50 px-2 py-0.5 rounded border border-sage-100 flex items-center gap-1.5">
                                                    {syncConfig.syncStatus === 'syncing' && <RefreshCw size={10} className="animate-spin" />}
                                                    {syncConfig.syncStatus}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap justify-between text-xs gap-2">
                                                <span className="font-bold text-charcoal-500">Last Synced:</span>
                                                <span className="font-sans font-bold text-charcoal-800">
                                                    {syncConfig.lastSyncAt ? new Date(syncConfig.lastSyncAt).toLocaleString() : 'Never'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap justify-between text-xs gap-2">
                                                <span className="font-bold text-charcoal-500">Backup Type:</span>
                                                <span className="font-bold capitalize text-sage-800">
                                                    {syncConfig.accountUpgradeStatus} {syncConfig.userEmail ? `(${syncConfig.userEmail})` : ''}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="grid grid-cols-2 gap-2 pt-2">
                                                <button
                                                    onClick={handlePush}
                                                    disabled={syncConfig.syncStatus === 'syncing'}
                                                    className="py-2 px-3 bg-sage-600 hover:bg-sage-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all text-center min-h-[36px]"
                                                >
                                                    Push Now
                                                </button>
                                                <button
                                                    onClick={handlePull}
                                                    disabled={syncConfig.syncStatus === 'syncing'}
                                                    className="py-2 px-3 bg-sand-100 hover:bg-sand-200 text-sage-800 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all text-center border border-sand-200 min-h-[36px]"
                                                >
                                                    Pull Latest
                                                </button>
                                            </div>

                                            {/* Upgrade Path for Anonymous Account */}
                                            {syncConfig.accountUpgradeStatus === 'anonymous' && (
                                                <div className="p-4 bg-sand-50 rounded-xl space-y-3 border border-sand-200 text-xs">
                                                    <h4 className="font-bold text-sage-950 uppercase text-[9px] tracking-wider">Upgrade to Permanent Account</h4>
                                                    <p className="text-[10px] text-charcoal-500 leading-normal">
                                                        Temporary anonymous backups can be lost if you clear your browser cookies. Link your email to sync across other devices.
                                                    </p>
                                                    <div className="space-y-2">
                                                        <input
                                                            type="email" placeholder="Email Address"
                                                            value={authForm.email}
                                                            onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                                                            className="w-full p-2 bg-white rounded border border-sand-300 text-xs outline-none focus:border-sage-500 font-semibold"
                                                        />
                                                        <input
                                                            type="password" placeholder="Choose Password"
                                                            value={authForm.password}
                                                            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                                                            className="w-full p-2 bg-white rounded border border-sand-300 text-xs outline-none focus:border-sage-500 font-semibold"
                                                        />
                                                        <button
                                                            onClick={handleUpgrade}
                                                            className="w-full py-1.5 px-3 bg-sage-800 hover:bg-sage-950 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                                                        >
                                                            Link Email Account
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Delete Remote Backup */}
                                            <div className="pt-2 border-t border-sand-100 flex justify-between items-center text-xs">
                                                <span className="text-[10px] text-charcoal-400 font-medium">Want to wipe cloud backups?</span>
                                                <button
                                                    onClick={handleDeleteBackup}
                                                    className="text-terracotta-600 hover:text-terracotta-800 font-bold underline text-[10px]"
                                                >
                                                    Delete Remote Data
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        /* Sign In / Create Account form if setup is open but not yet enabled/authenticated */
                                        <div className="p-4 bg-sand-50 rounded-xl space-y-3 border border-sand-200 text-xs">
                                            <h4 className="font-bold text-sage-950 uppercase text-[9px] tracking-wider">Sign In / Create Account</h4>
                                            <div className="space-y-2">
                                                <input
                                                    type="email" placeholder="Email Address"
                                                    value={authForm.email}
                                                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                                                    className="w-full p-2 bg-white rounded border border-sand-300 text-xs outline-none focus:border-sage-500 font-semibold"
                                                />
                                                <input
                                                    type="password" placeholder="Password"
                                                    value={authForm.password}
                                                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                                                    className="w-full p-2 bg-white rounded border border-sand-300 text-xs outline-none focus:border-sage-500 font-semibold"
                                                />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => handleEnableBackup('email')}
                                                        className="py-1.5 px-3 bg-sage-800 hover:bg-sage-950 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                                                    >
                                                        Login / Signup
                                                    </button>
                                                    <button
                                                        onClick={() => handleEnableBackup('anonymous')}
                                                        className="py-1.5 px-3 bg-sand-200 hover:bg-sand-300 text-charcoal font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all border border-sand-300"
                                                    >
                                                        Anonymous
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                <div className="mt-4">
                    <PwaInstallPrompt inline={true} />
                </div>

                {/* App Info */}
                <Section title="About">
                    <SettingItem
                        icon={<Globe size={20} />}
                        label="Language"
                        value={settings.language}
                        onClick={() => { }}
                    />
                    <button
                        onClick={() => {
                            if (window.confirm('This will reset local app data and sign out of cloud sync on this device. Remote backups are not deleted unless you use Delete Remote Data.')) {
                                clearAppData();
                            }
                        }}
                        className="w-full flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold hover:bg-red-100 transition-colors mt-4"
                    >
                        Clear App Data
                    </button>
                    <div className="text-center pt-8">
                        <p className="text-xs text-sage-400">Homemaker Suite v0.2.0</p>
                        <p className="text-xs text-sage-300 mt-1">Made with ❤️</p>
                    </div>
                </Section>

                {/* Edit Profile Modal */}
                {isEditingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-sage-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="bg-sage-800 p-6 text-white text-center">
                                <h2 className="text-2xl font-serif font-bold">Edit Profile</h2>
                            </div>
                            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-sage-600 uppercase mb-1">Your Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 focus:border-sage-500 outline-none"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-sage-600 uppercase mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 focus:border-sage-500 outline-none"
                                        value={editForm.email}
                                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingProfile(false)}
                                        className="flex-1 py-4 text-sage-600 font-bold hover:bg-sand-50 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-terracotta-500 text-white font-bold rounded-xl shadow-lg hover:bg-terracotta-600 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Onboarding Wizard Overlay */}
                {showOnboarding && (
                    <HomesteadOnboarding onClose={() => setShowOnboarding(false)} />
                )}

                {/* Conflict Resolver Modal */}
                {showConflictModal && (
                    <ConflictResolverModal
                        conflicts={conflicts}
                        onClose={() => {
                            setShowConflictModal(false);
                            setConflicts([]);
                        }}
                        onResolveComplete={handleResolveComplete}
                    />
                )}
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="space-y-3">
        <h2 className="text-sm font-bold text-sage-500 uppercase tracking-wider px-2">{title}</h2>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

const SettingItem = ({ icon, label, description, value, onClick }) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-sand-100 hover:border-sage-200 transition-colors text-left"
    >
        <div className="flex items-center gap-3">
            <div className="bg-sage-50 p-2 rounded-lg text-sage-600">
                {icon}
            </div>
            <div>
                <h3 className="font-medium text-sage-900">{label}</h3>
                {description && <p className="text-xs text-charcoal-500">{description}</p>}
            </div>
        </div>
        {value && <span className="text-sm text-sage-500 font-medium">{value}</span>}
    </button>
);

const Switch = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-terracotta-500' : 'bg-sand-200'}`}
    >
        <motion.div
            animate={{ x: checked ? 24 : 0 }}
            className="w-4 h-4 bg-white rounded-full shadow-sm"
        />
    </button>
);

export default Settings;
