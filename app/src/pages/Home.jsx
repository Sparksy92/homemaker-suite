import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Droplets, Zap, Thermometer, CloudRain,
    Wind, ShieldAlert, ChevronRight, X,
    MessageSquare, Battery, Activity, Info,
    Heart, Sprout, ArrowLeft, BarChart3
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';

const Home = () => {
    const {
        user,
        lastAccessedItem,
        sustainability,
        updateSustainability,
        durations,
        readinessScore,
        toggleTask,
        addCustomTask,
        removeTask
    } = useUser();
    const navigate = useNavigate();
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', desc: '', time: '' });
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [showReadinessModal, setShowReadinessModal] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    const {
        homeWidgets,
        toggleHomeWidget,
        readinessBreakdown,
        favorites
    } = useUser();

    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return 'Good Night';
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        if (hour < 21) return 'Good Evening';
        return 'Good Night';
    };

    const getSeasonalTip = () => {
        const month = new Date().getMonth();
        const tips = [
            { title: "Winter Pruning", desc: "Jan: Best time for dormant pruning of fruit trees." },
            { title: "Seed Starting", desc: "Feb: Start peppers and eggplant indoors now." },
            { title: "First Planting", desc: "Mar: Peas and greens can go in the ground." },
            { title: "Spring Cleanup", desc: "Apr: Mulch beds before the heat kicks in." },
            { title: "Transplant Time", desc: "May: Tomatoes and basil can finally move out." },
            { title: "Watering Routine", desc: "Jun: Check soil moisture early in the morning." },
            { title: "Harvest Prep", desc: "Jul: Preserve that zucchini overload!" },
            { title: "Late Planting", desc: "Aug: Start your fall brassicas now." },
            { title: "Preservation Peak", desc: "Sep: Best month for fermenting and canning." },
            { title: "Bed Prep", desc: "Oct: Add compost to beds for next season." },
            { title: "Wood Stock", desc: "Nov: Final wood pile audit before deep snow." },
            { title: "Tool Maintenance", desc: "Dec: Clean and oil your shovels and saws." }
        ];
        return tips[month];
    };

    const tasks = sustainability.tasks || [];

    return (
        <div className="relative min-h-[calc(100vh-80px)]">
            <div className="p-6 pb-32 space-y-12 max-w-2xl mx-auto">
                {/* 1. Header & Greeting */}
                <header className="flex justify-between items-start">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="text-xs font-black text-sage-500 uppercase tracking-[0.3em] mb-1">Homestead OS</span>
                            <h2 className="text-4xl font-serif text-sage-900 leading-tight">
                                {getTimeBasedGreeting()}, <br />
                                <span className="text-terracotta-600 font-bold">{user.name.split(' ')[0]}</span>
                            </h2>
                        </motion.div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowReadinessModal(true)}
                                className="group flex items-center gap-2 bg-sage-50 hover:bg-sage-100 px-3 py-1.5 rounded-full transition-all border border-sage-100"
                            >
                                <Activity size={14} className="text-sage-600" />
                                <span className="text-[10px] text-sage-700 font-black uppercase tracking-wider">
                                    Readiness: {readinessScore}%
                                </span>
                                <ChevronRight size={12} className="text-sage-400 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                            <button
                                onClick={() => setShowConfig(true)}
                                className="p-2 bg-sand-100 text-sand-600 rounded-full hover:bg-sand-200 transition-colors"
                                title="Configure Dashboard"
                            >
                                <Info size={16} />
                            </button>
                        </div>
                    </div>
                    <WeatherWidget />
                </header>

                {/* 2. Quick Resumption */}
                <AnimatePresence>
                    {lastAccessedItem && homeWidgets.quickResume && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-sand-200 group cursor-pointer hover:shadow-md transition-all"
                            onClick={() => {
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

                {/* 2.5 Favorites Quick Access */}
                <AnimatePresence>
                    {favorites.length > 0 && homeWidgets.favoritesPreview && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-between items-end px-1">
                                <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest pl-1">Quick Access Favorites</h3>
                                <Link to="/library" className="text-[10px] font-bold text-sand-400 uppercase tracking-widest hover:text-sage-600">View All</Link>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                {favorites.slice(0, 5).map(fav => (
                                    <button
                                        key={fav.id}
                                        onClick={() => navigate('/library')}
                                        className="shrink-0 w-40 bg-white p-4 rounded-3xl border border-sand-100 shadow-sm hover:border-terracotta-200 transition-all text-left group"
                                    >
                                        <div className="p-2 bg-terracotta-50 rounded-xl text-terracotta-500 mb-3 w-fit">
                                            <Heart size={16} fill="currentColor" />
                                        </div>
                                        <h4 className="font-serif font-bold text-sage-900 text-sm leading-tight group-hover:text-terracotta-600 line-clamp-2">{fav.title}</h4>
                                    </button>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {homeWidgets.sustainabilityStats && (
                    <section className="space-y-6">
                        <div className="flex justify-between items-end px-1">
                            <div className="flex flex-col">
                                <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest pl-1">Sustainability Status</h3>
                                <span className="text-[10px] text-sage-400 font-medium pl-1 italic">Based on {sustainability.peopleCount} People</span>
                            </div>
                            <span className="text-[10px] font-bold text-sage-400 uppercase tracking-widest">Homestead Logic v1.2</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <StatusCard
                                icon={<Droplets size={24} />}
                                label="Water Supply"
                                value={sustainability.water.current}
                                unit={sustainability.water.unit}
                                goal={sustainability.water.goal}
                                onUpdate={(val) => updateSustainability('water', val)}
                                color="blue"
                                sub={`${durations.water} days remaining`}
                                duration={durations.water}
                                actionLink="/wizard/water-safety"
                                actionLabel="Treat Water"
                            />
                            <StatusCard
                                icon={<Battery size={24} />}
                                label="Food Stock"
                                value={sustainability.food.current}
                                unit={sustainability.food.unit}
                                goal={sustainability.food.goal}
                                onUpdate={(val) => updateSustainability('food', val)}
                                color="amber"
                                sub={`${durations.food} days reserve`}
                                duration={durations.food}
                                actionLink="/tools#pantry"
                                actionLabel="Update Pantry"
                            />
                            <StatusCard
                                icon={<Thermometer size={24} />}
                                label="Garden Health"
                                value={sustainability.garden.current}
                                unit={sustainability.garden.unit}
                                goal={100}
                                onUpdate={(val) => updateSustainability('garden', val)}
                                color="terracotta"
                                sub="Active Yield"
                                actionLink="/wizard/garden-planner"
                                actionLabel="Manage Crops"
                            />
                            <StatusCard
                                icon={<Zap size={24} />}
                                label="Power Reserve"
                                value={sustainability.energy.current}
                                unit={sustainability.energy.unit}
                                goal={100}
                                onUpdate={(val) => updateSustainability('energy', val)}
                                color="sage"
                                sub="Grid Status: Stable"
                                actionLink="/wizard/energy-planner"
                                actionLabel="Audit Energy"
                            />
                        </div>
                    </section>
                )}

                {/* 4. Daily Preparation (Priority Tasks) */}
                {homeWidgets.priorityTasks && (
                    <section className="space-y-6">
                        <div className="flex justify-between items-center px-1">
                            <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest pl-1">Priority Tasks</h3>
                            <button
                                onClick={() => setIsAddingTask(!isAddingTask)}
                                className="text-[10px] font-bold text-terracotta-600 uppercase tracking-widest hover:text-terracotta-700 transition-colors"
                            >
                                {isAddingTask ? 'Cancel' : '+ New Task'}
                            </button>
                        </div>

                        <AnimatePresence>
                            {isAddingTask && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white p-6 rounded-3xl border border-sand-200 shadow-sm space-y-4"
                                >
                                    <input
                                        type="text"
                                        placeholder="Task Title..."
                                        className="w-full bg-sand-50 p-3 rounded-xl border border-sand-100 focus:outline-none focus:border-sage-500 font-bold text-sage-800"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description / Context..."
                                        className="w-full bg-sand-50 p-3 rounded-xl border border-sand-100 focus:outline-none focus:border-sage-500 text-sm"
                                        value={newTask.desc}
                                        onChange={e => setNewTask({ ...newTask, desc: e.target.value })}
                                    />
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Duration (e.g. 10 mins)"
                                            className="flex-1 bg-sand-50 p-3 rounded-xl border border-sand-100 focus:outline-none focus:border-sage-500 text-sm"
                                            value={newTask.time}
                                            onChange={e => setNewTask({ ...newTask, time: e.target.value })}
                                        />
                                        <button
                                            onClick={() => {
                                                if (newTask.title) {
                                                    addCustomTask(newTask);
                                                    setNewTask({ title: '', desc: '', time: '' });
                                                    setIsAddingTask(false);
                                                }
                                            }}
                                            className="bg-sage-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sage-700 transition-colors shadow-lg"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            {tasks.map(task => (
                                <PriorityItem
                                    key={task.id}
                                    title={task.title}
                                    desc={task.desc}
                                    time={task.time}
                                    completed={task.completed}
                                    onToggle={() => toggleTask(task.id)}
                                    onRemove={() => removeTask(task.id)}
                                    isAuto={task.type === 'auto'}
                                    icon={task.type === 'auto' ? <ShieldAlert className="text-red-500" size={20} /> : <Wind className="text-sage-400" size={20} />}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 4.5 Seasonal Tip */}
                {homeWidgets.seasonalTip && (
                    <section className="bg-sand-100 p-6 rounded-[2.5rem] border border-sand-200 flex gap-5 items-start">
                        <div className="bg-white p-4 rounded-2xl text-sage-600 shadow-sm shrink-0">
                            <Sprout size={24} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-sage-500 uppercase tracking-[0.2em] block mb-1">Seasonal Intelligence</span>
                            <h4 className="text-xl font-serif font-black text-sage-900 mb-1">{getSeasonalTip().title}</h4>
                            <p className="text-sm text-sand-600 font-medium leading-relaxed">{getSeasonalTip().desc}</p>
                        </div>
                    </section>
                )}

                {/* 5. Suggestion Box */}
                {homeWidgets.guideRequest && (
                    <section className="bg-sage-700 p-8 rounded-[2.5rem] text-sand-50 relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-serif font-bold mb-2 text-white">Missing something?</h3>
                            <p className="text-sage-200 mb-6 max-w-[240px] leading-relaxed">Let us know what manual or tool you need for your homestead.</p>
                            <a
                                href="mailto:homemakersuite.help@gmail.com?subject=Guide%20Request"
                                className="inline-flex items-center gap-2 bg-terracotta-500 text-white px-6 py-3 rounded-full font-bold hover:bg-terracotta-600 transition-colors shadow-lg"
                            >
                                Request a Guide <ChevronRight size={18} />
                            </a>
                        </div>
                        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                            <MessageSquare size={160} />
                        </div>
                    </section>
                )}
            </div>

            {/* Readiness Breakdown Modal */}
            <AnimatePresence>
                {showReadinessModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-sage-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        onClick={() => setShowReadinessModal(false)}
                    >
                        <motion.div
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="bg-white rounded-[3rem] p-8 max-w-lg w-full shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-serif font-black text-sage-900">Readiness Score</h2>
                                    <p className="text-sand-500 text-xs font-bold uppercase tracking-widest mt-1">Multi-Factor Analysis</p>
                                </div>
                                <div className="text-5xl font-serif font-black text-terracotta-600 leading-none">
                                    {readinessScore}<span className="text-sm">%</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-8">
                                <BreakdownRow label="Water Security" value={readinessBreakdown.water} weight="40%" color="bg-blue-500" />
                                <BreakdownRow label="Food Reserves" value={readinessBreakdown.food} weight="30%" color="bg-amber-500" />
                                <BreakdownRow label="Energy Audit" value={readinessBreakdown.energy} weight="15%" color="bg-sage-600" />
                                <BreakdownRow label="Garden Vitality" value={readinessBreakdown.garden} weight="15%" color="bg-terracotta-500" />
                            </div>

                            <div className="bg-sand-50 p-6 rounded-3xl border border-sand-100">
                                <h4 className="text-sm font-bold text-sage-800 mb-2 flex items-center gap-2">
                                    <ShieldAlert size={16} className="text-terracotta-500" />
                                    The 14-Day Baseline
                                </h4>
                                <p className="text-xs text-sand-600 leading-relaxed font-medium">
                                    Your readiness is calculated based on a minimum 2-week survival window for your household ({sustainability.peopleCount} people). This includes 1 gallon of water and 0.7lbs of nutrient-dense food per person, per day.
                                </p>
                            </div>

                            <button
                                onClick={() => setShowReadinessModal(false)}
                                className="w-full mt-8 py-4 bg-sage-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-sage-900 transition-all"
                            >
                                Acknowledged
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Dashboard Config Modal */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-sage-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
                        onClick={() => setShowConfig(false)}
                    >
                        <motion.div
                            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                            className="bg-white rounded-[3rem] p-8 max-w-lg w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-3xl font-serif font-black text-sage-900 mb-2">Configure Home</h2>
                            <p className="text-sand-500 text-xs font-bold uppercase tracking-widest mb-8">Personalize your command center</p>

                            <div className="grid gap-3 mb-8">
                                <WidgetToggle id="quickResume" label="Quick Resumption" icon={<ArrowLeft size={16} />} active={homeWidgets.quickResume} onToggle={toggleHomeWidget} />
                                <WidgetToggle id="sustainabilityStats" label="Sustainability Cards" icon={<BarChart3 size={16} />} active={homeWidgets.sustainabilityStats} onToggle={toggleHomeWidget} />
                                <WidgetToggle id="priorityTasks" label="Focus Tasks" icon={<Wind size={16} />} active={homeWidgets.priorityTasks} onToggle={toggleHomeWidget} />
                                <WidgetToggle id="favoritesPreview" label="Favorites Access" icon={<Heart size={16} />} active={homeWidgets.favoritesPreview} onToggle={toggleHomeWidget} />
                                <WidgetToggle id="seasonalTip" label="Seasonal Intelligence" icon={<Sprout size={16} />} active={homeWidgets.seasonalTip} onToggle={toggleHomeWidget} />
                                <WidgetToggle id="guideRequest" label="Request Guide Card" icon={<MessageSquare size={16} />} active={homeWidgets.guideRequest} onToggle={toggleHomeWidget} />
                            </div>

                            <button
                                onClick={() => setShowConfig(false)}
                                className="w-full py-4 bg-terracotta-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-terracotta-700 transition-all"
                            >
                                Done
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

const PriorityItem = ({ title, desc, time, icon, completed, onToggle, onRemove, isAuto }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-start gap-4 p-5 rounded-3xl border transition-all group relative overflow-hidden ${completed ? 'bg-sand-50/50 border-sand-100 opacity-60' : 'bg-white border-sand-100 hover:border-sand-200 shadow-sm'
            }`}
    >
        {isAuto && !completed && (
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
        )}

        <button
            onClick={onToggle}
            className={`mt-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${completed ? 'bg-sage-600 border-sage-600' : 'border-sand-300 hover:border-sage-400'
                }`}
        >
            {completed && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </button>

        <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
                <h4 className={`font-bold text-sm transition-colors uppercase tracking-tight ${completed ? 'text-sand-400 line-through' : 'text-sage-900 group-hover:text-terracotta-700'
                    }`}>
                    {title}
                </h4>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-sand-400 uppercase tracking-widest">{time}</span>
                    <button
                        onClick={onRemove}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-sand-300 hover:text-red-400 p-1"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
            <p className={`text-xs leading-relaxed font-medium ${completed ? 'text-sand-300' : 'text-sand-500'
                }`}>
                {desc}
            </p>
        </div>
    </motion.div>
);

const StatusCard = ({ icon, label, value, unit, goal, sub, color, onUpdate, actionLink, actionLabel, duration }) => {
    const navigate = useNavigate();
    const colorMap = {
        blue: {
            bg: "bg-gradient-to-br from-blue-50 to-white",
            border: "border-blue-100",
            text: "text-blue-700",
            bar: "bg-blue-500",
            light: "bg-blue-100/50",
            glow: "shadow-blue-100",
            button: "bg-blue-600 hover:bg-blue-700",
            accent: "text-blue-400"
        },
        amber: {
            bg: "bg-gradient-to-br from-amber-50 to-white",
            border: "border-amber-100",
            text: "text-amber-700",
            bar: "bg-amber-500",
            light: "bg-amber-100/50",
            glow: "shadow-amber-100",
            button: "bg-amber-600 hover:bg-amber-700",
            accent: "text-amber-400"
        },
        terracotta: {
            bg: "bg-gradient-to-br from-terracotta-50 to-white",
            border: "border-terracotta-100",
            text: "text-terracotta-700",
            bar: "bg-terracotta-500",
            light: "bg-terracotta-100/50",
            glow: "shadow-terracotta-100",
            button: "bg-terracotta-600 hover:bg-terracotta-700",
            accent: "text-terracotta-400"
        },
        sage: {
            bg: "bg-gradient-to-br from-sage-50 to-white",
            border: "border-sage-100",
            text: "text-sage-700",
            bar: "bg-sage-500",
            light: "bg-sage-100/50",
            glow: "shadow-sage-100",
            button: "bg-sage-600 hover:bg-sage-700",
            accent: "text-sage-400"
        }
    };

    const scheme = colorMap[color];
    const percentage = Math.min(100, Math.max(0, (value / goal) * 100));

    // Urgency styling overrides
    const isCritical = (label.includes('Water') && duration <= 3) ||
        (label.includes('Food') && duration <= 7) ||
        ((label.includes('Garden') || label.includes('Power')) && percentage <= 20);

    const isWarning = !isCritical && (
        (label.includes('Water') && duration <= 7) ||
        (label.includes('Food') && duration <= 14) ||
        ((label.includes('Garden') || label.includes('Power')) && percentage <= 40));

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`p-6 rounded-[2.5rem] border ${scheme.bg} ${scheme.border} ${scheme.text} shadow-xl ${scheme.glow} flex flex-col h-full relative overflow-hidden transition-all duration-300`}
        >
            {/* Urgency Badge */}
            <AnimatePresence>
                {(isCritical || isWarning) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-10 ${isCritical ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white'
                            }`}
                    >
                        {isCritical ? 'Critical' : 'Attention'}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={isCritical ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`p-3 ${scheme.light} rounded-2xl`}
                    >
                        {React.cloneElement(icon, { size: 24 })}
                    </motion.div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block">{label}</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-4xl font-serif font-black">{Math.round(value)}</span>
                            <span className="text-xs font-bold opacity-50 uppercase">{unit}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold opacity-70">
                        <span>Current Reserve</span>
                        <span>Goal: {goal} {unit}</span>
                    </div>
                    <div className={`w-full h-2.5 ${scheme.light} rounded-full overflow-hidden p-0.5`}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : scheme.bar} shadow-sm`}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className={`text-xs font-bold leading-tight ${isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : ''}`}>
                            {sub}
                        </p>
                        <p className="text-[10px] opacity-50 font-medium">Predicted Stability</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdate(Math.max(0, value - 5)); }}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-sand-100 hover:border-sand-300 text-charcoal-400 hover:text-charcoal-700 transition-all shadow-sm active:scale-95`}
                        >
                            -
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onUpdate(value + 5); }}
                            className={`w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-sand-100 hover:border-sand-300 text-charcoal-400 hover:text-charcoal-700 transition-all shadow-sm active:scale-95`}
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Link */}
            {(isCritical || isWarning) && actionLink && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(actionLink)}
                    className={`mt-6 w-full py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${isCritical ? 'bg-red-600 hover:bg-red-700' : scheme.button
                        }`}
                >
                    {actionLabel || 'Fix Issue'}
                </motion.button>
            )}
        </motion.div>
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

const BreakdownRow = ({ label, value, weight, color }) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-sage-600 px-1">
            <span>{label} <span className="text-sand-400 font-bold ml-1 opacity-50">({weight})</span></span>
            <span className={value < 30 ? 'text-terracotta-600' : 'text-sage-500'}>{value}%</span>
        </div>
        <div className="w-full h-2 bg-sand-100 rounded-full overflow-hidden p-0.5">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                className={`h-full rounded-full ${color} shadow-sm`}
            />
        </div>
    </div>
);

const WidgetToggle = ({ id, label, icon, active, onToggle }) => (
    <button
        onClick={() => onToggle(id)}
        className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${active ? 'bg-sage-50 border-sage-200 text-sage-900 shadow-sm' : 'bg-white border-sand-100 text-sand-400 opacity-60'
            }`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${active ? 'bg-white text-sage-600' : 'bg-sand-50 text-sand-300'}`}>
                {icon}
            </div>
            <span className="text-sm font-bold">{label}</span>
        </div>
        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${active ? 'bg-sage-600' : 'bg-sand-200'}`}>
            <motion.div
                animate={{ x: active ? 16 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm"
            />
        </div>
    </button>
);
