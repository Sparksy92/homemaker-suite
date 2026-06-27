import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan, savePlan, resetPlan } from '../../services/homesteadPlanningService';
import { calculatePantryTargets, estimateStorageVolume, generateRotationTasks } from '../../planners/pantryPlanner';
import { Archive, ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck, CheckSquare } from 'lucide-react';

const PantryPlannerPage = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    const [plan, setPlan] = useState({
        householdSize: 2,
        targetDays: 90,
        caloriesPerPerson: 2000,
        inventoryNotes: '',
        rotationTasks: []
    });

    const [message, setMessage] = useState('');

    useEffect(() => {
        const loaded = loadPlan('homemaker_pantry_plan');
        setPlan(loaded);
    }, []);

    const handleSave = (updatedPlan = plan) => {
        savePlan('homemaker_pantry_plan', updatedPlan);
        setPlan({ ...updatedPlan });
        setMessage('Plan saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLoadDefaults = () => {
        if (!homesteadProfile || homesteadProfile.skipped) {
            alert('Please configure a Homestead Profile first to pull defaults.');
            return;
        }

        const size = homesteadProfile.household?.size ? parseInt(homesteadProfile.household.size) : plan.householdSize;
        const days = homesteadProfile.pantry?.targetDays ? parseInt(homesteadProfile.pantry.targetDays) : plan.targetDays;

        const updated = {
            ...plan,
            householdSize: size,
            targetDays: days,
            rotationTasks: generateRotationTasks({ targetDays: days })
        };
        handleSave(updated);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset your pantry plan?')) {
            const reset = resetPlan('homemaker_pantry_plan');
            setPlan(reset);
        }
    };

    const handleUpdateField = (field, val) => {
        const updated = {
            ...plan,
            [field]: val
        };
        setPlan(updated);
    };

    const handleToggleTask = (taskId) => {
        const updatedTasks = plan.rotationTasks.map(t => {
            if (t.id !== taskId) return t;
            return { ...t, completed: !t.completed };
        });
        const updated = { ...plan, rotationTasks: updatedTasks };
        handleSave(updated);
    };

    const { totalKcalRequired, categories } = calculatePantryTargets({
        householdSize: plan.householdSize,
        targetDays: plan.targetDays,
        caloriesPerPerson: plan.caloriesPerPerson
    });

    const totalLbs = Object.values(categories).reduce((acc, cat) => acc + (cat.targetLbs || 0), 0);
    const { cubicFeet, estimatedRacks } = estimateStorageVolume(totalLbs);

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
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Pantry & Storage Planner</h2>
                        <p className="text-xs text-charcoal-500 font-medium">Model survival calories, calculate grain/fat totals, and track food rotations.</p>
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

            {message && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-semibold text-xs animate-pulse">
                    {message}
                </div>
            )}

            {/* Safety Disclaimer */}
            <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-3xl flex gap-3 items-start shadow-sm text-xs text-amber-900">
                <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <p className="leading-relaxed">
                    <strong>Estimate only.</strong> Adjust calculations for individual health requirements, active labor levels, regional climates, and pantry temperature variables. This does not replace certified professional nutritional plans.
                </p>
            </div>

            {/* Plan inputs */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Calorie Buffer Calculations
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
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Target Buffer (Days)</label>
                        <input
                            type="number" min="1"
                            value={plan.targetDays}
                            onChange={e => handleUpdateField('targetDays', Math.max(1, parseInt(e.target.value) || 1))}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Calories / Person / Day</label>
                        <input
                            type="number" step="100" min="1000"
                            value={plan.caloriesPerPerson}
                            onChange={e => handleUpdateField('caloriesPerPerson', Math.max(1000, parseInt(e.target.value) || 2000))}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Stockpile Targets */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <div className="border-b border-sand-100 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">
                        Food Category Targets
                    </h3>
                    <span className="text-[10px] text-charcoal-500 font-bold">
                        Total Energy Buffer: {totalKcalRequired.toLocaleString()} kcal
                    </span>
                </div>

                <div className="grid gap-3">
                    {Object.keys(categories).map(key => {
                        const cat = categories[key];
                        return (
                            <div key={key} className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl text-xs flex justify-between items-center gap-4">
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-sage-900 leading-tight">{cat.label}</h4>
                                    <p className="text-[10px] text-charcoal-500 leading-relaxed font-sans">{cat.desc}</p>
                                </div>
                                <div className="text-sm font-black text-sage-700 bg-white border border-sand-200 px-4 py-2 rounded-2xl shadow-sm shrink-0 font-serif">
                                    {cat.targetLbs !== undefined ? `${cat.targetLbs} lbs` : `${cat.targetGallons} gallons`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Storage Estimator */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-sage-600" />
                    <span>Estimated Space Requirements</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-charcoal-400 tracking-wider">Storage Volume</span>
                        <div className="text-lg font-serif font-black text-sage-800">{cubicFeet} cu ft</div>
                        <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">Calculated at ~0.022 cu ft per pound of dry storage.</p>
                    </div>
                    <div className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-charcoal-400 tracking-wider">Required Racks</span>
                        <div className="text-lg font-serif font-black text-sage-800">~{estimatedRacks} standard racks</div>
                        <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">Assuming 5-shelf metal wire racks holds 15 cu ft.</p>
                    </div>
                </div>
            </div>

            {/* Rotation Tasks */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <CheckSquare size={18} className="text-sage-600" />
                    <span>Pantry Rotation Checklist</span>
                </h3>
                <div className="space-y-3">
                    {plan.rotationTasks && plan.rotationTasks.length > 0 ? (
                        plan.rotationTasks.map(t => (
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
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="text-center py-4 text-xs text-charcoal-400 italic">No tasks. Pull profile defaults to initialize!</div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Pantry Inventory Notes
                </h3>
                <textarea
                    rows="4"
                    value={plan.inventoryNotes || ''}
                    onChange={e => handleUpdateField('inventoryNotes', e.target.value)}
                    onBlur={() => handleSave()}
                    placeholder="List specific locations of your caches, catalog canned lots, or outline vacuum sealer schedules..."
                    className="w-full p-4 bg-sand-50 rounded-2xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-semibold leading-relaxed"
                />
            </div>

            {/* Reset Area */}
            <div className="p-6 bg-red-50/50 border border-red-200 rounded-[2rem] flex justify-between items-center">
                <div>
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-wider">Reset Pantry Plan</h4>
                    <p className="text-[10px] text-red-600 leading-relaxed mt-0.5">Wipe all targets, notes, and reset to defaults.</p>
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

export default PantryPlannerPage;
