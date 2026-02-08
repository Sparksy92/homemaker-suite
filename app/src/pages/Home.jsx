import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sun, Droplets, Leaf, Thermometer, Battery, Shield, Flame, Activity, Hammer, Tent, Map, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
    const today = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = today.toLocaleDateString('en-US', dateOptions);

    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    const quickActions = [
        { id: 'water', label: 'Water', icon: Droplets, color: 'bg-blue-100 text-blue-600', link: '/manual/water' },
        { id: 'food', label: 'Food', icon: Leaf, color: 'bg-green-100 text-green-600', link: '/manual/food' },
        { id: 'medical', label: 'First Aid', icon: Activity, color: 'bg-red-100 text-red-600', link: '/manual/medical' },
        { id: 'energy', label: 'Energy', icon: Battery, color: 'bg-yellow-100 text-yellow-600', link: '/manual/energy' },
        { id: 'shelter', label: 'Shelter', icon: Tent, color: 'bg-stone-100 text-stone-600', link: '/manual/shelter' },
        { id: 'wilderness', label: 'Wilderness', icon: Flame, color: 'bg-orange-100 text-orange-600', link: '/manual/wilderness' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 space-y-6 pb-24"
        >

            {/* Header / Weather */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-terracotta-600 font-bold text-xs uppercase tracking-widest">{dateString}</span>
                    <h2 className="text-3xl mt-1 text-sage-900 leading-tight">
                        {greeting},<br /><span className="italic text-terracotta-500">Homemaker.</span>
                    </h2>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-sand-200 flex flex-col items-center">
                    <Sun className="text-amber-500 mb-1" size={24} />
                    <span className="text-xl font-bold text-charcoal">72°</span>
                    <span className="text-xs text-sage-500">Clear</span>
                </div>
            </div>

            {/* System Status */}
            <section className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 text-white p-4 rounded-2xl flex items-center gap-3 shadow-md">
                    <div className="bg-white/10 p-2 rounded-full">
                        <Shield size={20} className="text-green-400" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">System</p>
                        <p className="font-bold">Secure</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-sand-200 flex items-center gap-3 shadow-sm">
                    <div className="bg-sand-100 p-2 rounded-full">
                        <Battery size={20} className="text-sage-600" />
                    </div>
                    <div>
                        <p className="text-xs text-sage-500 uppercase font-bold">Power</p>
                        <p className="font-bold text-charcoal">100%</p>
                    </div>
                </div>
            </section>

            {/* Survival Modules (Grid) */}
            <section>
                <h3 className="text-lg font-bold text-sage-900 mb-4 flex items-center gap-2">
                    <BookOpenIcon size={18} className="text-terracotta-500" />
                    Survival Modules
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                        <Link to={action.link} key={action.id} className="block group">
                            <div className="bg-white p-5 rounded-3xl border border-sand-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-3 group-active:scale-95">
                                <div className={`p-4 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                                    <action.icon size={28} />
                                </div>
                                <span className="font-medium text-charcoal-700">{action.label}</span>
                            </div>
                        </Link>
                    ))}
                    {/* Preservation Link as a wide card? Or just add to grid */}
                    <Link to="/manual/preservation" className="col-span-2 block group">
                        <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group-active:scale-95">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-full bg-amber-100 text-amber-700">
                                    <Hammer size={28} />
                                </div>
                                <div>
                                    <span className="font-bold text-amber-900 block">Food Preservation</span>
                                    <span className="text-xs text-amber-700">Canning, Smoking, Curing</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Crisis Scenarios */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-sage-900 flex items-center gap-2">
                        <Map size={18} className="text-terracotta-500" />
                        Crisis Scenarios
                    </h3>
                </div>
                <div className="space-y-3">
                    <Link to="/manual/scenario-winter" className="block bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
                                <Thermometer size={20} />
                            </div>
                            <span className="font-semibold text-blue-900">72-Hour Winter Outage</span>
                        </div>
                    </Link>
                    <Link to="/manual/scenario-summer" className="block bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between hover:bg-orange-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full text-orange-600 shadow-sm">
                                <Sun size={20} />
                            </div>
                            <span className="font-semibold text-orange-900">72-Hour Summer Outage</span>
                        </div>
                    </Link>
                    <Link to="/manual/scenario-kids" className="block bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between hover:bg-purple-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full text-purple-600 shadow-sm">
                                <Shield size={20} />
                            </div>
                            <span className="font-semibold text-purple-900">7-Day Grid-Down (Kids)</span>
                        </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/manual/scenario-water" className="block bg-cyan-50 p-3 rounded-xl border border-cyan-100 hover:bg-cyan-100 transition-colors">
                            <p className="font-semibold text-cyan-900 text-sm">Water Contamination</p>
                        </Link>
                        <Link to="/manual/scenario-budget" className="block bg-green-50 p-3 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                            <p className="font-semibold text-green-900 text-sm">30-Day Budget</p>
                        </Link>
                        <Link to="/manual/scenario-storm" className="block bg-slate-50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                            <p className="font-semibold text-slate-900 text-sm">Severe Winter Storm</p>
                        </Link>
                        <Link to="/manual/scenario-supply" className="block bg-yellow-50 p-3 rounded-xl border border-yellow-100 hover:bg-yellow-100 transition-colors">
                            <p className="font-semibold text-yellow-900 text-sm">3-Month Supply</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Emergency Trigger */}
            <button className="w-full bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-center gap-2 text-red-600 font-bold active:bg-red-600 active:text-white transition-colors">
                <AlertTriangle size={20} />
                EMERGENCY MODE
            </button>

        </motion.div>
    );
};

// Helper for the icon in title
const BookOpenIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
)

export default Dashboard;
