import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan, savePlan, resetPlan } from '../../services/homesteadPlanningService';
import {
    calculateDailyWh,
    estimateSolarArray,
    estimateBatteryBank,
    flagHighDrawLoads,
    generateEnergySafetyChecklist
} from '../../planners/energyPlanner';
import SimpleSolarSystemDiagram from '../../components/visual-guides/diagrams/SimpleSolarSystemDiagram';
import PlannerConfidenceIndicator from '../../components/PlannerConfidenceIndicator';
import { Zap, ArrowLeft, RefreshCw, AlertTriangle, ShieldAlert, Plus, Trash2, ShieldCheck } from 'lucide-react';

const EnergyPlannerPage = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    const [plan, setPlan] = useState({
        dailyLoads: [],
        solarEstimate: { peakSunHours: 4.5, lossFactor: 0.25 },
        batteryEstimate: { autonomyDays: 2.0, voltage: 24, depthOfDischarge: 0.50 },
        generatorBackup: {},
        safetyChecklist: []
    });

    const [newLoad, setNewLoad] = useState({ name: '', watts: '', hoursPerDay: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loaded = loadPlan('homemaker_energy_plan');
        setPlan(loaded);
    }, []);

    const handleSave = (updatedPlan = plan) => {
        savePlan('homemaker_energy_plan', updatedPlan);
        setPlan({ ...updatedPlan });
        setMessage('Plan saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLoadDefaults = () => {
        if (!homesteadProfile || homesteadProfile.skipped) {
            alert('Please configure a Homestead Profile first to pull defaults.');
            return;
        }

        // Add standard starter off-grid loads based on setup
        const starterLoads = [
            { id: 'l1', name: 'LED Lights (Indoor)', watts: 30, hoursPerDay: 5 },
            { id: 'l2', name: 'Water Pump (Shallow Well)', watts: 600, hoursPerDay: 0.5 },
            { id: 'l3', name: 'Mobile Phones (x2)', watts: 20, hoursPerDay: 3 },
            { id: 'l4', name: 'DC Ventilation Fan', watts: 15, hoursPerDay: 8 }
        ];

        const updated = {
            ...plan,
            dailyLoads: starterLoads,
            safetyChecklist: generateEnergySafetyChecklist(starterLoads)
        };
        handleSave(updated);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset your energy plan?')) {
            const reset = resetPlan('homemaker_energy_plan');
            setPlan(reset);
        }
    };

    const handleAddLoad = (e) => {
        e.preventDefault();
        if (!newLoad.name || !newLoad.watts || !newLoad.hoursPerDay) return;

        const updatedLoads = [...(plan.dailyLoads || []), {
            id: `load-${Date.now()}`,
            name: newLoad.name,
            watts: parseInt(newLoad.watts) || 0,
            hoursPerDay: parseFloat(newLoad.hoursPerDay) || 0
        }];

        const updated = {
            ...plan,
            dailyLoads: updatedLoads,
            safetyChecklist: generateEnergySafetyChecklist(updatedLoads)
        };

        setNewLoad({ name: '', watts: '', hoursPerDay: '' });
        handleSave(updated);
    };

    const handleRemoveLoad = (loadId) => {
        const updatedLoads = plan.dailyLoads.filter(l => l.id !== loadId);
        const updated = {
            ...plan,
            dailyLoads: updatedLoads,
            safetyChecklist: generateEnergySafetyChecklist(updatedLoads)
        };
        handleSave(updated);
    };

    const handleUpdateEstimateParam = (block, field, val) => {
        const updatedBlock = { ...plan[block], [field]: parseFloat(val) || 0 };
        const updated = {
            ...plan,
            [block]: updatedBlock
        };
        setPlan(updated);
    };

    const handleToggleChecklist = (taskId) => {
        const updatedChecklist = plan.safetyChecklist.map(c => {
            if (c.id !== taskId) return c;
            return { ...c, completed: !c.completed };
        });
        const updated = { ...plan, safetyChecklist: updatedChecklist };
        handleSave(updated);
    };

    const dailyWhTotal = calculateDailyWh(plan.dailyLoads || []);
    
    const solarWattsTarget = estimateSolarArray({
        dailyWh: dailyWhTotal,
        peakSunHours: plan.solarEstimate?.peakSunHours || 4.5,
        lossFactor: plan.solarEstimate?.lossFactor || 0.25
    });

    const batteryAhTarget = estimateBatteryBank({
        dailyWh: dailyWhTotal,
        autonomyDays: plan.batteryEstimate?.autonomyDays || 2,
        voltage: plan.batteryEstimate?.voltage || 24,
        depthOfDischarge: plan.batteryEstimate?.depthOfDischarge || 0.5
    });

    const highDrawLoads = flagHighDrawLoads(plan.dailyLoads || []);

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-200 pb-5 gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/homestead')}
                        className="p-2.5 bg-white border border-sand-200 text-charcoal hover:bg-sand-100 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Energy & Power Planner</h2>
                        <p className="text-xs text-charcoal-500 font-medium">Model daily loads, calculate solar array size, and estimate battery bank Ah requirements.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleLoadDefaults}
                        className="py-2.5 px-4 bg-white border border-sand-300 text-charcoal font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm hover:bg-sand-50 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                        <RefreshCw size={14} />
                        <span>Pull Profile Defaults</span>
                    </button>
                </div>
            </div>

            <PlannerConfidenceIndicator lastSaved={plan.updatedAt} />

            {message && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-semibold text-xs animate-pulse">
                    {message}
                </div>
            )}

            {/* Safety Warnings */}
            <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-3xl flex gap-3 items-start shadow-sm text-xs text-amber-900">
                <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <p className="leading-relaxed">
                    <strong>Electrical fire hazard.</strong> Solar circuits carry dangerous DC current. Always size wire gauges correctly, install inline fuses/breakers close to battery terminals, and consult local building inspectors before powering on.
                </p>
            </div>

            {/* High Draw warning */}
            {highDrawLoads.length > 0 && (
                <div className="p-5 bg-red-50 border-l-4 border-red-500 rounded-r-3xl flex gap-3 items-start shadow-sm text-xs text-red-950">
                    <ShieldAlert size={18} className="shrink-0 text-red-600 mt-0.5" />
                    <div className="space-y-1">
                        <span className="font-bold">High Draw Inverter Load Surge Flagged</span>
                        <p className="leading-relaxed">
                            Your load list includes items with heavy power consumption ({highDrawLoads.map(l => l.name).join(', ')}). Run these only during peak sunshine hours, and confirm your inverter peak surge rating can support them.
                        </p>
                    </div>
                </div>
            )}

            {/* Daily loads list */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="border-b border-sand-100 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider flex items-center gap-2">
                        <Zap size={18} className="text-sage-600" />
                        <span>Daily Electrical Loads ({plan.dailyLoads?.length || 0})</span>
                    </h3>
                    <span className="text-xs bg-sage-50 text-sage-800 font-bold px-2.5 py-0.5 rounded-full border border-sage-100">
                        Total Wh demand: {dailyWhTotal} Wh/day
                    </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <form onSubmit={handleAddLoad} className="bg-sand-50 p-5 rounded-3xl space-y-3 border border-sand-100">
                        <h4 className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest pl-1">Add Load Profile</h4>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Appliance Name (e.g. Fridge, Pump, Phone)"
                                value={newLoad.name}
                                onChange={e => setNewLoad({ ...newLoad, name: e.target.value })}
                                className="w-full p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs font-bold"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number" placeholder="Watts Draw"
                                    value={newLoad.watts}
                                    onChange={e => setNewLoad({ ...newLoad, watts: e.target.value })}
                                    className="p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs text-center font-semibold"
                                />
                                <input
                                    type="number" step="0.5" placeholder="Hours / Day"
                                    value={newLoad.hoursPerDay}
                                    onChange={e => setNewLoad({ ...newLoad, hoursPerDay: e.target.value })}
                                    className="p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs text-center font-semibold"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all min-h-[44px]"
                        >
                            Add Load
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {plan.dailyLoads && plan.dailyLoads.length > 0 ? (
                            plan.dailyLoads.map(load => (
                                <div key={load.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-sand-200 shadow-sm text-xs">
                                    <div>
                                        <h5 className="font-bold text-sage-800 leading-tight">{load.name}</h5>
                                        <p className="text-[10px] text-charcoal-400 font-sans mt-0.5 font-bold">
                                            {load.watts}W × {load.hoursPerDay} hours/day = {load.watts * load.hoursPerDay} Wh
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveLoad(load.id)}
                                        className="p-2 text-terracotta-600 hover:bg-terracotta-50 rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-charcoal-400 italic">No loads registered. Add one above!</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Calculations Sizing */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-sage-600" />
                    <span>Solar Array & Battery Bank Sizing Estimates</span>
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Solar estimation */}
                    <div className="space-y-4 p-5 bg-sand-50/50 border border-sand-200 rounded-3xl">
                        <h4 className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest pl-1">Solar PV Array Sizing</h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Peak Sun Hours</label>
                                <input
                                    type="number" step="0.5"
                                    value={plan.solarEstimate?.peakSunHours || 4.5}
                                    onChange={e => handleUpdateEstimateParam('solarEstimate', 'peakSunHours', e.target.value)}
                                    onBlur={() => handleSave()}
                                    className="w-full p-2 bg-white rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Loss Factor (e.g. 0.25)</label>
                                <input
                                    type="number" step="0.05"
                                    value={plan.solarEstimate?.lossFactor || 0.25}
                                    onChange={e => handleUpdateEstimateParam('solarEstimate', 'lossFactor', e.target.value)}
                                    onBlur={() => handleSave()}
                                    className="w-full p-2 bg-white rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-sage-50 text-sage-900 rounded-2xl border border-sage-100 flex justify-between items-center text-xs">
                            <span className="font-bold uppercase tracking-wider">Required Array:</span>
                            <span className="text-base font-black font-serif">{solarWattsTarget} Watts</span>
                        </div>
                    </div>

                    {/* Battery Sizing */}
                    <div className="space-y-4 p-5 bg-sand-50/50 border border-sand-200 rounded-3xl">
                        <h4 className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest pl-1">Battery Storage Sizing</h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Autonomy Days</label>
                                <input
                                    type="number" step="0.5"
                                    value={plan.batteryEstimate?.autonomyDays || 2.0}
                                    onChange={e => handleUpdateEstimateParam('batteryEstimate', 'autonomyDays', e.target.value)}
                                    onBlur={() => handleSave()}
                                    className="w-full p-2 bg-white rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Voltage (V)</label>
                                <input
                                    type="number"
                                    value={plan.batteryEstimate?.voltage || 24}
                                    onChange={e => handleUpdateEstimateParam('batteryEstimate', 'voltage', e.target.value)}
                                    onBlur={() => handleSave()}
                                    className="w-full p-2 bg-white rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Max DoD (e.g. 0.5)</label>
                                <input
                                    type="number" step="0.05"
                                    value={plan.batteryEstimate?.depthOfDischarge || 0.50}
                                    onChange={e => handleUpdateEstimateParam('batteryEstimate', 'depthOfDischarge', e.target.value)}
                                    onBlur={() => handleSave()}
                                    className="w-full p-2 bg-white rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-sage-50 text-sage-900 rounded-2xl border border-sage-100 flex justify-between items-center text-xs">
                            <span className="font-bold uppercase tracking-wider">Required Capacity:</span>
                            <span className="text-base font-black font-serif">{batteryAhTarget} Ah @ {plan.batteryEstimate?.voltage}V</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vector Layout Reference */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Visual Wiring Schematic Guideline
                </h3>
                <div className="flex justify-center p-4 bg-sand-50 rounded-2xl">
                    <SimpleSolarSystemDiagram />
                </div>
            </div>

            {/* Safety checklist */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <CheckSquare size={18} className="text-sage-600" />
                    <span>DC Wiring & Fuses Safety Checklist</span>
                </h3>
                <div className="space-y-3">
                    {plan.safetyChecklist && plan.safetyChecklist.length > 0 ? (
                        plan.safetyChecklist.map(c => (
                            <button
                                key={c.id}
                                onClick={() => handleToggleChecklist(c.id)}
                                className="w-full text-left p-3.5 bg-sand-50/50 hover:bg-sand-100/50 rounded-2xl border border-sand-100 text-xs flex gap-3 items-start transition-all"
                            >
                                <div className="mt-0.5 shrink-0 text-sage-600">
                                    {c.completed ? <CheckSquare size={16} /> : <div className="w-4 h-4 rounded border-2 border-sand-300" />}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className={`font-bold ${c.completed ? 'line-through text-charcoal-400' : 'text-charcoal-800'}`}>{c.title}</h4>
                                    <p className="text-[10px] text-charcoal-500 font-sans leading-relaxed">{c.desc}</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-4 text-xs text-charcoal-400 italic">No checklist items generated. Add some loads!</div>
                    )}
                </div>
            </div>

            {/* Reset Area */}
            <div className="p-6 bg-red-50/50 border border-red-200 rounded-[2rem] flex justify-between items-center">
                <div>
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-wider">Reset Energy Plan</h4>
                    <p className="text-[10px] text-red-600 leading-relaxed mt-0.5">Wipe all load schedules, array models, and reset to defaults.</p>
                </div>
                <button
                    onClick={handleReset}
                    className="py-2 px-4 bg-white border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-50 transition-all min-h-[44px]"
                >
                    Reset Planner
                </button>
            </div>
        </div>
    );
};

export default EnergyPlannerPage;
