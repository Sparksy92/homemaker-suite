import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Lock, User, Palette, Globe, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

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
                        onClick={() => { }}
                    />
                    <SettingItem
                        icon={<Lock size={20} />}
                        label="Security"
                        description="Change password"
                        onClick={() => { }}
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
                        <Switch checked={notifications} onChange={() => setNotifications(!notifications)} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-sand-100">
                        <div className="flex items-center gap-3">
                            <div className="bg-sage-50 p-2 rounded-lg text-sage-600">
                                <Moon size={20} />
                            </div>
                            <div>
                                <h3 className="font-medium text-sage-900">Dark Mode</h3>
                                <p className="text-xs text-charcoal-500">Switch to dark theme</p>
                            </div>
                        </div>
                        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    </div>
                </Section>

                {/* App Info */}
                <Section title="About">
                    <SettingItem
                        icon={<Globe size={20} />}
                        label="Language"
                        value="English (US)"
                        onClick={() => { }}
                    />
                    <div className="text-center pt-4">
                        <p className="text-xs text-sage-400">Homemaker Suite v0.1.0</p>
                        <p className="text-xs text-sage-300 mt-1">Made with ❤️</p>
                    </div>
                </Section>
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
