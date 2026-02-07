import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Bug, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import wildlifeData from '../data/wildlifeData.json';

const Wildlife = () => {
    const [activeTab, setActiveTab] = useState('flora');

    return (
        <div className="min-h-screen bg-sand-50 pb-24">
            {/* Header */}
            <div className="bg-sage-800 text-sand-50 p-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
                <h1 className="text-3xl font-serif font-bold mb-2">Wildlife & Nature</h1>
                <p className="text-sage-200 opacity-90">Identify, understand, and live with the land.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 p-6 overflow-x-auto no-scrollbar">
                <TabButton
                    active={activeTab === 'flora'}
                    onClick={() => setActiveTab('flora')}
                    icon={<Leaf size={18} />}
                    label="Flora"
                />
                <TabButton
                    active={activeTab === 'fauna'}
                    onClick={() => setActiveTab('fauna')}
                    icon={<Bug size={18} />}
                    label="Fauna"
                />
                <TabButton
                    active={activeTab === 'calendar'}
                    onClick={() => setActiveTab('calendar')}
                    icon={<Calendar size={18} />}
                    label="Foraging"
                />
            </div>

            {/* Content Area */}
            <div className="px-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'flora' && (
                        <motion.div
                            key="flora"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {wildlifeData.flora.map((plant, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden">
                                    <div className={`h-2 ${plant.type === 'Poisonous' ? 'bg-red-500' : 'bg-green-500'}`} />
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-sage-900">{plant.name}</h3>
                                                <p className="text-xs text-sage-500 italic">{plant.scientific_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${plant.type === 'Poisonous' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {plant.type}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            <div>
                                                <p className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-1">Identification</p>
                                                <p className="text-sm text-charcoal-600">{plant.identification}</p>
                                            </div>

                                            {plant.uses !== 'NONE - DEADLY.' && (
                                                <div>
                                                    <p className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-1">Uses</p>
                                                    <p className="text-sm text-charcoal-600">{plant.uses}</p>
                                                </div>
                                            )}

                                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex gap-3 items-start">
                                                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800">{plant.caution}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'fauna' && (
                        <motion.div
                            key="fauna"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {wildlifeData.fauna.map((animal, index) => (
                                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-sage-900">{animal.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${animal.role === 'Pest' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>{animal.role}</span>
                                    </div>
                                    <p className="text-sm text-charcoal-600 mb-3">{animal.notes}</p>
                                    <div className="flex items-center gap-2 text-xs font-medium text-sage-600">
                                        <CheckCircle size={14} />
                                        <span>Status: {animal.status}</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid gap-4"
                        >
                            {Object.entries(wildlifeData.foraging_calendar).map(([season, items]) => (
                                <div key={season} className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200">
                                    <h3 className="text-lg font-serif font-bold text-sage-800 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-terracotta-400"></span>
                                        {season}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((item, i) => (
                                            <span key={i} className="bg-sand-100 text-charcoal-700 px-3 py-1 rounded-full text-sm">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all ${active
            ? 'bg-sage-600 text-white shadow-md'
            : 'bg-white text-sage-700 border border-sand-200 hover:bg-sand-50'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

export default Wildlife;
