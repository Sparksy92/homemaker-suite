import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Droplets, Zap, Thermometer, CloudRain,
    Wind, ShieldAlert, ChevronRight, X,
    MessageSquare, Battery, Activity, Info
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import WeatherWidget from '../components/WeatherWidget';

const Home = () => {
    const { user, lastAccessedItem, sustainability, updateSustainability, durations, readinessScore } = useUser();
    const navigate = useNavigate();
    const [emergencyMode, setEmergencyMode] = useState(false);

    return (
        <div className="relative min-h-[calc(100vh-80px)]">
            <div className="p-6 pb-32 space-y-12 max-w-2xl mx-auto">
                {/* 1. Header & Greeting */}
                <header className="flex justify-between items-start">
                    <div className="space-y-2">
                        <motion.h2
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-serif text-sage-900 leading-tight"
                        >
                            Good morning, <br />
                            <span className="text-terracotta-600 font-bold">{user.name.split(' ')[0]}</span>
                        </motion.h2>
                        <div className="flex items-center gap-2">
                            <p className="text-sand-600 font-medium">Clear skies over the homestead.</p>
                            <span className="text-[10px] bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                Readiness: {readinessScore}%
                            </span>
                        </div>
                    </div>
                    <WeatherWidget />
                </header>

                {/* 2. Quick Resumption */}
                <AnimatePresence>
                    {lastAccessedItem && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-sand-200 group cursor-pointer hover:shadow-md transition-all"
                            onClick={() => {
                                // If it's a guide, we need to handle the routing to Library with pre-selected path
                                navigate('/library');
                            }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] bg-terracotta-100 text-terracotta-700 px-3 py-1 rounded-full font-bold uppercase tracking-widest">Jump Back In</span>
                                <span className="text-xs text-sand-400 font-medium capitalize">{lastAccessedItem.folder || 'Library'}</span>
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-sage-900 group-hover:text-terracotta-700 transition-colors mb-1">
                                {lastAccessedItem.title}
                            </h3>
                            <p className="text-sm text-sand-500 font-medium italic">Continue where you left off...</p>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* 3. System Status */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest pl-1">Sustainability Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatusCard
                            icon={<Droplets className="text-blue-500" size={24} />}
                            label="Water Supply"
                            value={sustainability.water.current}
                            unit={sustainability.water.unit}
                            goal={sustainability.water.goal}
                            onUpdate={(val) => updateSustainability('water', val)}
                            color="blue"
                            sub={`${durations.water} days remaining`}
                        />
                        <StatusCard
                            icon={<Battery className="text-amber-500" size={24} />}
                            label="Food Stock"
                            value={sustainability.food.current}
                            unit={sustainability.food.unit}
                            goal={sustainability.food.goal}
                            onUpdate={(val) => updateSustainability('food', val)}
                            color="amber"
                            sub={`${durations.food} days reserve`}
                        />
                        <StatusCard
                            icon={<Thermometer className="text-terracotta-500" size={24} />}
                            label="Garden Health"
                            value={sustainability.garden.current}
                            unit={sustainability.garden.unit}
                            goal={100}
                            onUpdate={(val) => updateSustainability('garden', val)}
                            color="terracotta"
                            sub="Active Yield"
                        />
                        <StatusCard
                            icon={<Zap className="text-sage-500" size={24} />}
                            label="Power Reserve"
                            value={sustainability.energy.current}
                            unit={sustainability.energy.unit}
                            goal={100}
                            onUpdate={(val) => updateSustainability('energy', val)}
                            color="sage"
                            sub="Grid Status: Stable"
                        />
                    </div>
                </section>

                {/* 4. Daily Preparation (Priority Tasks) */}
                <section className="space-y-6">
                    <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest pl-1">Priority Tasks</h3>
                    <div className="space-y-3">
                        <PriorityItem
                            title="Winter Fuel Check"
                            desc="Audit remaining wood and propane stocks for the upcoming cold front."
                            time="20 mins"
                            icon={<Wind className="text-sage-400" size={20} />}
                        />
                        <PriorityItem
                            title="Greenhouse Ventilation"
                            desc="Ensure morning temps aren't causing moisture buildup."
                            time="10 mins"
                            icon={<CloudRain className="text-sage-400" size={20} />}
                        />
                    </div>
                </section>

                {/* 5. Suggestion Box */}
                <section className="bg-sage-700 p-8 rounded-[2.5rem] text-sand-50 relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-serif font-bold mb-2 text-white">Missing something?</h3>
                        <p className="text-sage-200 mb-6 max-w-[240px] leading-relaxed">Let us know what manual or tool you need for your homestead.</p>
                        <a
                            href="mailto:contact@homemakersuite.com?subject=Guide%20Request"
                            className="inline-flex items-center gap-2 bg-terracotta-500 text-white px-6 py-3 rounded-full font-bold hover:bg-terracotta-600 transition-colors shadow-lg"
                        >
                            Request a Guide <ChevronRight size={18} />
                        </a>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                        <MessageSquare size={160} />
                    </div>
                </section>
            </div>

            {/* Emergency FAB */}
            <div className="fixed bottom-28 right-6 z-50">
                <AnimatePresence>
                    {emergencyMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="absolute bottom-20 right-0 w-72 bg-white rounded-3xl shadow-2xl border-2 border-red-500 overflow-hidden"
                        >
                            <div className="p-5 bg-red-500 text-white flex items-center gap-3">
                                <ShieldAlert size={24} />
                                <span className="font-bold text-lg">Crisis Mode Active</span>
                            </div>
                            <div className="p-4 space-y-3">
                                <EmergencyAction icon={<Zap size={18} />} label="Immediate Power Cut-Off" />
                                <EmergencyAction icon={<Droplets size={18} />} label="Water Main Isolation" />
                                <EmergencyAction icon={<Thermometer size={18} />} label="Seal Thermal Zone 1" />
                                <button
                                    onClick={() => navigate('/library')}
                                    className="w-full mt-2 py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                >
                                    Emergency Procedures <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEmergencyMode(!emergencyMode)}
                    className={`p-5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${emergencyMode ? 'bg-red-600 rotate-90 scale-90' : 'bg-red-500 hover:bg-red-600'
                        }`}
                >
                    {emergencyMode ? <X size={32} className="text-white" /> : <ShieldAlert size={32} className="text-white" />}
                </motion.button>
            </div>
        </div>
    );
};

const PriorityItem = ({ title, desc, time, icon }) => (
    <div className="flex items-start gap-4 p-5 bg-white rounded-3xl border border-sand-100 hover:border-sand-200 transition-all group">
        <div className="mt-1 p-2 bg-sand-50 rounded-xl text-sage-600">
            {icon}
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-sage-900 group-hover:text-terracotta-700 transition-colors uppercase tracking-tight text-sm">{title}</h4>
                <span className="text-[10px] font-bold text-sand-400 uppercase tracking-widest">{time}</span>
            </div>
            <p className="text-xs text-sand-500 leading-relaxed font-medium">{desc}</p>
        </div>
    </div>
);

const StatusCard = ({ icon, label, value, unit, goal, sub, color, onUpdate }) => {
    const colorMap = {
        blue: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", bar: "bg-blue-500", light: "bg-blue-100" },
        amber: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", bar: "bg-amber-500", light: "bg-amber-100" },
        terracotta: { bg: "bg-terracotta-50", border: "border-terracotta-100", text: "text-terracotta-700", bar: "bg-terracotta-500", light: "bg-terracotta-100" },
        sage: { bg: "bg-sage-50", border: "border-sage-100", text: "text-sage-700", bar: "bg-sage-500", light: "bg-sage-100" }
    };

    const scheme = colorMap[color];
    const percentage = Math.min(100, Math.max(0, (value / goal) * 100));

    return (
        <div className={`p-5 rounded-[2rem] border ${scheme.bg} ${scheme.border} ${scheme.text} shadow-sm group hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 ${scheme.light} rounded-lg`}>
                        {React.cloneElement(icon, { size: 18 })}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] opacity-80">{label}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate(Math.max(0, value - 1)); }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full ${scheme.light} hover:bg-white transition-colors`}
                    >
                        -
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdate(value + 1); }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full ${scheme.light} hover:bg-white transition-colors`}
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-serif font-black">{value}</span>
                <span className="text-[10px] font-bold opacity-60 uppercase">{unit}</span>
            </div>

            <div className="space-y-2">
                <div className={`w-full h-1.5 ${scheme.light} rounded-full overflow-hidden`}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full ${scheme.bar}`}
                    />
                </div>
                <p className="text-[10px] font-black opacity-60 italic flex justify-between">
                    <span>{sub}</span>
                    <span>{goal - value > 0 ? `${goal - value} more to goal` : 'Goal reached!'}</span>
                </p>
            </div>
        </div>
    );
};

const EmergencyAction = ({ icon, label }) => (
    <button className="w-full flex items-center gap-3 p-3 bg-white border border-red-100 rounded-xl text-red-700 hover:bg-red-50 transition-all text-left group">
        <div className="text-red-400 group-hover:text-red-600 transition-colors">
            {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
    </button>
);

export default Home;
