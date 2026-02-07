import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Bug, Calendar, AlertTriangle, CheckCircle, Search, Footprints, Filter } from 'lucide-react';
import wildlifeData from '../data/wildlifeData.json';

const Wildlife = () => {
    const [activeTab, setActiveTab] = useState('flora');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Edible, Medicinal, Poisonous

    // Search Logic
    const filterData = (data) => {
        return data.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.uses && item.uses.toLowerCase().includes(searchQuery.toLowerCase()));

            if (activeTab === 'flora' && filterType !== 'All') {
                return matchesSearch && item.type.includes(filterType);
            }
            return matchesSearch;
        });
    };

    return (
        <div className="min-h-screen bg-sand-50 pb-24">
            {/* Header */}
            <div className="bg-sage-800 text-sand-50 p-6 pt-12 pb-8 rounded-b-3xl shadow-lg">
                <h1 className="text-3xl font-serif font-bold mb-2">Wildlife & Nature</h1>
                <p className="text-sage-200 opacity-90">Field guide to the living world.</p>

                {/* Search Bar */}
                <div className="mt-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search plants, animals, tracks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-sage-900/50 border border-sage-700 text-sand-50 placeholder-sage-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all font-serif"
                    />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b border-sand-200 mb-4 bg-white sticky top-0 z-10 shadow-sm">
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
                    active={activeTab === 'tracking'}
                    onClick={() => setActiveTab('tracking')}
                    icon={<Footprints size={18} />}
                    label="Tracking"
                />
                <TabButton
                    active={activeTab === 'calendar'}
                    onClick={() => setActiveTab('calendar')}
                    icon={<Calendar size={18} />}
                    label="Season"
                />
            </div>

            {/* Sub-Filters for Flora */}
            {activeTab === 'flora' && (
                <div className="px-6 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {['All', 'Edible', 'Medicinal', 'Poisonous', 'Utility'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === type
                                    ? 'bg-sage-600 text-white'
                                    : 'bg-sand-200 text-sage-700 hover:bg-sand-300'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className="px-4 md:px-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'flora' && (
                        <motion.div
                            key="flora"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filterData(wildlifeData.flora).map((plant, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden">
                                    <div className={`h-2 ${plant.type.includes('Poisonous') ? 'bg-red-500' : plant.type.includes('Medicinal') ? 'bg-blue-500' : 'bg-green-500'}`} />
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-sage-900">{plant.name}</h3>
                                                <p className="text-xs text-sage-500 italic">{plant.scientific_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${plant.type.includes('Poisonous') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {plant.type}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mt-4">
                                            <div>
                                                <p className="text-xs font-bold text-sage-400 uppercase tracking-wider mb-1">ID</p>
                                                <p className="text-sm text-charcoal-600">{plant.identification}</p>
                                            </div>

                                            {!plant.type.includes('Poisonous') && (
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
                            {filterData(wildlifeData.flora).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {activeTab === 'fauna' && (
                        <motion.div
                            key="fauna"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filterData(wildlifeData.fauna).map((animal, index) => (
                                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-sage-900">{animal.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${animal.role === 'Pest' ? 'bg-red-100 text-red-700' :
                                                animal.role === 'Predator' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>{animal.role}</span>
                                    </div>
                                    <p className="text-sm text-charcoal-600 mb-3">{animal.notes}</p>
                                    <div className="flex items-center gap-2 text-xs font-medium text-sage-600">
                                        <CheckCircle size={14} />
                                        <span>Status: {animal.status}</span>
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.fauna).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {activeTab === 'tracking' && (
                        <motion.div
                            key="tracking"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid md:grid-cols-2 gap-4"
                        >
                            {filterData(wildlifeData.tracking).map((track, index) => (
                                <div key={index} className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-sage-900">{track.name}</h3>
                                        <span className="text-xs bg-sand-100 text-sand-600 px-2 py-1 rounded-md">{track.category}</span>
                                    </div>
                                    <p className="text-sm text-charcoal-600 mb-3 flex-1">{track.description}</p>
                                    <div className="text-xs text-sage-500 bg-sage-50 p-2 rounded-lg">
                                        <span className="font-bold">Gait:</span> {track.gait}
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.tracking).length === 0 && <EmptyState />}
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
                                        <span className={`w-3 h-3 rounded-full ${season === 'Spring' ? 'bg-green-400' :
                                                season === 'Summer' ? 'bg-yellow-400' :
                                                    season === 'Autumn' ? 'bg-orange-400' : 'bg-blue-300'
                                            }`}></span>
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
        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${active
            ? 'bg-sage-600 text-white shadow-md'
            : 'bg-white text-sage-700 border border-sand-200 hover:bg-sand-50'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const EmptyState = () => (
    <div className="text-center py-12 text-sand-500 italic">
        <p>No results found roaming these woods.</p>
    </div>
);

export default Wildlife;
