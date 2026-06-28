import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan, savePlan, resetPlan } from '../../services/homesteadPlanningService';
import {
    calculateDailyWaterNeed,
    calculateStorageTarget,
    estimateRainCatchment,
    suggestStorageContainers,
    generateWaterMaintenanceTasks
} from '../../planners/waterPlanner';
import RainCatchmentDiagram from '../../components/visual-guides/diagrams/RainCatchmentDiagram';
import PlannerConfidenceIndicator from '../../components/PlannerConfidenceIndicator';
import { Droplets, ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck, CheckSquare } from 'lucide-react';

const WaterPlannerPage = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    const [plan, setPlan] = useState({
        householdSize: 2,
        dailyGallonsPerPerson: 2,
        targetDays: 90,
        primarySource: 'rain_catchment',
        backupSource: 'well',
        storageContainers: [],
        treatmentMethods: [],
        maintenanceTasks: []
    });

    const [rainInputs, setRainInputs] = useState({ roofArea: '1000', rainfall: '1', efficiency: '0.85' });
    const [rainEstimate, setRainEstimate] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loaded = loadPlan('homemaker_water_plan');
        setPlan(loaded);
    }, []);

    // Recalculate rain estimate on inputs change
    useEffect(() => {
        const est = estimateRainCatchment({
            roofAreaSqFt: parseFloat(rainInputs.roofArea) || 0,
            rainfallInches: parseFloat(rainInputs.rainfall) || 0,
            efficiency: parseFloat(rainInputs.efficiency) || 0.85
        });
        setRainEstimate(est);
    }, [rainInputs]);

    const handleSave = (updatedPlan = plan) => {
        savePlan('homemaker_water_plan', updatedPlan);
        setPlan({ ...updatedPlan });
        setMessage('Plan saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLoadDefaults = () => {
        if (!homesteadProfile || homesteadProfile.skipped) {
            alert('Please configure a Homestead Profile first to pull defaults.');
            return;
        }

        const { household, water, pantry, region } = homesteadProfile;
        const size = household?.size ? parseInt(household.size) : plan.householdSize;
        const days = pantry?.targetDays ? parseInt(pantry.targetDays) : plan.targetDays;
        const primary = water?.primary || plan.primarySource;
        const backup = water?.secondary || plan.backupSource;

        const containerRecs = suggestStorageContainers({
            targetGallons: calculateStorageTarget({ people: size, targetDays: days, gallonsPerPerson: plan.dailyGallonsPerPerson })
        });

        const updated = {
            ...plan,
            householdSize: size,
            targetDays: days,
            primarySource: primary,
            backupSource: backup,
            storageContainers: containerRecs,
            maintenanceTasks: generateWaterMaintenanceTasks({
                sources: [primary, backup],
                treatmentMethods: plan.treatmentMethods,
                climate: region?.climate || 'temperate'
            })
        };
        handleSave(updated);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset your water plan?')) {
            const reset = resetPlan('homemaker_water_plan');
            setPlan(reset);
        }
    };

    const handleUpdateField = (field, val) => {
        const updated = { ...plan, [field]: val };
        setPlan(updated);
    };

    const handleToggleTreatment = (method) => {
        const isSelected = plan.treatmentMethods.includes(method);
        const updatedMethods = isSelected
            ? plan.treatmentMethods.filter(m => m !== method)
            : [...plan.treatmentMethods, method];

        const updated = {
            ...plan,
            treatmentMethods: updatedMethods,
            maintenanceTasks: generateWaterMaintenanceTasks({
                sources: [plan.primarySource, plan.backupSource],
                treatmentMethods: updatedMethods,
                climate: homesteadProfile?.region?.climate || 'temperate'
            })
        };
        handleSave(updated);
    };

    const handleToggleTask = (taskId) => {
        const updatedTasks = plan.maintenanceTasks.map(t => {
            if (t.id !== taskId) return t;
            return { ...t, completed: !t.completed };
        });
        const updated = { ...plan, maintenanceTasks: updatedTasks };
        handleSave(updated);
    };

    const dailyNeed = calculateDailyWaterNeed({
        people: plan.householdSize,
        gallonsPerPerson: plan.dailyGallonsPerPerson
    });

    const targetStorage = calculateStorageTarget({
        people: plan.householdSize,
        targetDays: plan.targetDays,
        gallonsPerPerson: plan.dailyGallonsPerPerson
    });

    const containerRecs = suggestStorageContainers({ targetGallons: targetStorage });

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
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Water Systems Planner</h2>
                        <p className="text-xs text-charcoal-500 font-medium">Model daily consumption buffers, evaluate rain catchment basins, and schedule sanitations.</p>
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
                    <strong>Test water locally.</strong> All water harvested from rain or surface ponds must be verified clean using physical labs or treated with multi-stage filters (ceramic, micron, UV) before consumption.
                </p>
            </div>

            {/* Core Calculations */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Water Volume Calculations
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Household Size</label>
                        <input
                            type="number" min="1"
                            value={plan.householdSize}
                            onChange={e => handleUpdateField('householdSize', Math.max(1, parseInt(e.target.value) || 1))}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Gallons / Person / Day</label>
                        <input
                            type="number" min="1" step="0.5"
                            value={plan.dailyGallonsPerPerson}
                            onChange={e => handleUpdateField('dailyGallonsPerPerson', Math.max(0.5, parseFloat(e.target.value) || 2))}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Buffer Days</label>
                        <input
                            type="number" min="1"
                            value={plan.targetDays}
                            onChange={e => handleUpdateField('targetDays', Math.max(1, parseInt(e.target.value) || 1))}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Calculated targets */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-sage-600" />
                    <span>Calculated Targets</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-charcoal-400 tracking-wider">Daily Household Consumption</span>
                        <div className="text-lg font-serif font-black text-sage-800">{dailyNeed} Gallons/day</div>
                        <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">Calculated at {plan.dailyGallonsPerPerson} gallons daily per household member.</p>
                    </div>
                    <div className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-charcoal-400 tracking-wider">Potable Storage Target</span>
                        <div className="text-lg font-serif font-black text-sage-800">{targetStorage} Gallons</div>
                        <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">Required reserve size to survive a {plan.targetDays}-day supply interruption.</p>
                    </div>
                </div>
            </div>

            {/* Rain Catchment Estimator */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Roof Rain Catchment Estimator
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div className="grid gap-3 grid-cols-3">
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Roof Footprint (Sq Ft)</label>
                                <input
                                    type="number"
                                    value={rainInputs.roofArea}
                                    onChange={e => setRainInputs({ ...rainInputs, roofArea: e.target.value })}
                                    className="w-full p-2 bg-sand-50 rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Rainfall (Inches)</label>
                                <input
                                    type="number" step="0.1"
                                    value={rainInputs.rainfall}
                                    onChange={e => setRainInputs({ ...rainInputs, rainfall: e.target.value })}
                                    className="w-full p-2 bg-sand-50 rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[8px] font-black text-charcoal-400 uppercase tracking-wider">Runoff Efficiency</label>
                                <input
                                    type="number" step="0.05"
                                    value={rainInputs.efficiency}
                                    onChange={e => setRainInputs({ ...rainInputs, efficiency: e.target.value })}
                                    className="w-full p-2 bg-sand-50 rounded-lg border border-sand-200 text-xs font-semibold text-center outline-none"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100 flex justify-between items-center text-xs">
                            <span className="font-bold uppercase tracking-wider">Estimated Harvest:</span>
                            <span className="text-base font-black font-serif">{rainEstimate.toLocaleString()} Gallons</span>
                        </div>
                    </div>

                    <div className="flex justify-center p-4 bg-sand-50 rounded-2xl">
                        <RainCatchmentDiagram />
                    </div>
                </div>
            </div>

            {/* Container recommendations */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Recommended Storage Container Allocation
                </h3>
                <div className="grid gap-3">
                    {containerRecs.map((rec, idx) => (
                        <div key={idx} className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl text-xs flex justify-between items-center gap-4">
                            <div className="space-y-0.5">
                                <h4 className="font-bold text-charcoal-800 leading-tight">{rec.type} ({rec.capacity})</h4>
                                <p className="text-[10px] text-charcoal-500 font-sans leading-relaxed">{rec.desc}</p>
                            </div>
                            <div className="text-sm font-black text-sage-700 bg-white border border-sand-200 px-4 py-2 rounded-2xl shadow-sm shrink-0 font-serif">
                                {rec.count} units
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Treatment Methods */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Potable Treatment Methods Checklist
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['filtration', 'boiling', 'uv_sterilization', 'chlorine_treatment'].map(method => {
                        const isSelected = plan.treatmentMethods.includes(method);
                        return (
                            <button
                                key={method}
                                onClick={() => handleToggleTreatment(method)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                                    isSelected
                                        ? 'bg-sage-600 text-white border-sage-700 shadow-sm'
                                        : 'bg-sand-50 text-charcoal border-sand-200 hover:bg-sand-100'
                                }`}
                            >
                                {method.replace('_', ' ').toUpperCase()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Maintenance tasks */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <CheckSquare size={18} className="text-sage-600" />
                    <span>Maintenance & Winterization Schedule</span>
                </h3>
                <div className="space-y-3">
                    {plan.maintenanceTasks && plan.maintenanceTasks.length > 0 ? (
                        plan.maintenanceTasks.map(t => (
                            <button
                                key={t.id}
                                onClick={() => handleToggleTask(t.id)}
                                className="w-full text-left p-3.5 bg-sand-50/50 hover:bg-sand-100/50 rounded-2xl border border-sand-100 text-xs flex gap-3 items-start transition-all"
                            >
                                <div className="mt-0.5 shrink-0 text-sage-600">
                                    {t.completed ? <CheckSquare size={16} /> : <div className="w-4 h-4 rounded border-2 border-sand-300" />}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className={`font-bold ${t.completed ? 'line-through text-charcoal-400' : 'text-charcoal-800'}`}>{t.title}</h4>
                                    <p className="text-[10px] text-charcoal-500 font-sans leading-relaxed">{t.desc}</p>
                                    <span className="inline-block text-[8px] bg-sand-200 text-charcoal-600 font-bold px-1.5 py-0.25 rounded uppercase tracking-wider mt-1">{t.interval}</span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-4 text-xs text-charcoal-400 italic">No tasks. Pull profile defaults to generate!</div>
                    )}
                </div>
            </div>

            {/* Reset Area */}
            <div className="p-6 bg-red-50/50 border border-red-200 rounded-[2rem] flex justify-between items-center">
                <div>
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-wider">Reset Water Plan</h4>
                    <p className="text-[10px] text-red-600 leading-relaxed mt-0.5">Wipe all inputs, container allocations, and reset to defaults.</p>
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

export default WaterPlannerPage;
