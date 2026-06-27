import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Lock, User, Palette, Globe, Moon, Download, Upload, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import { exportAppData, importAppData } from '../services/appDataService';
import HomesteadOnboarding from '../components/onboarding/HomesteadOnboarding';

const Settings = () => {
    const navigate = useNavigate();
    const { user, settings, updateSettings, updateProfile, clearAppData } = useUser();

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: user.name, email: user.email });
    const [showOnboarding, setShowOnboarding] = useState(false);

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
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export backup file.');
        }
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target.result);
                
                if (window.confirm('WARNING: Importing this backup will overwrite your current settings, favorites, water storage, and observations. This cannot be undone. Do you want to proceed?')) {
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
                            Backup your local profile, water inventory, favorites, read progress, and wildlife observations. All backup files are stored entirely offline on your device.
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
                            if (window.confirm('This will reset all your progress, favorites, and settings. Continue?')) {
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
