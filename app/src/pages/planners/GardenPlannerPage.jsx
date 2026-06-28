import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan, savePlan, resetPlan } from '../../services/homesteadPlanningService';
import {
    suggestCropsForProfile,
    generateCropCalendar,
    estimateBedCapacity,
    generateGardenTasks
} from '../../planners/gardenPlanner';
import cropProfiles from '../../data/visual-guides/gardening_crop_profiles.json';
import RaisedBedLayoutDiagram from '../../components/visual-guides/diagrams/RaisedBedLayoutDiagram';
import PlannerConfidenceIndicator from '../../components/PlannerConfidenceIndicator';
import { Home, ArrowLeft, Plus, Trash2, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';

const GardenPlannerPage = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    const [plan, setPlan] = useState({
        frostDates: { lastSpringFrost: '', firstFallFrost: '', frostFreeDays: '' },
        beds: [],
        selectedCrops: [],
        cropCalendar: [],
        tasks: []
    });

    const [newBed, setNewBed] = useState({ name: '', width: '4', length: '8', depth: '10' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const loaded = loadPlan('homemaker_garden_plan');
        setPlan(loaded);
    }, []);

    const handleSave = (updatedPlan = plan) => {
        savePlan('homemaker_garden_plan', updatedPlan);
        setPlan({ ...updatedPlan });
        setMessage('Plan saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleLoadDefaults = () => {
        if (!homesteadProfile || homesteadProfile.skipped) {
            alert('Please configure a Homestead Profile first to pull defaults.');
            return;
        }

        const { region } = homesteadProfile;
        let lastSpring = '';
        let firstFall = '';
        if (region?.frostDates) {
            const parts = region.frostDates.split('/');
            lastSpring = parts[0] ? parts[0].replace('Last:', '').trim() : '';
            firstFall = parts[1] ? parts[1].replace('First:', '').trim() : '';
        }

        const suggested = suggestCropsForProfile({ homesteadProfile, cropProfiles });

        const updated = {
            ...plan,
            frostDates: {
                lastSpringFrost: lastSpring || plan.frostDates.lastSpringFrost,
                firstFallFrost: firstFall || plan.frostDates.firstFallFrost,
                frostFreeDays: region?.frostFreeDays || plan.frostDates.frostFreeDays
            },
            selectedCrops: suggested.length > 0 ? suggested : plan.selectedCrops
        };

        // Auto-recalculate tasks & calendars
        updated.cropCalendar = generateCropCalendar({
            selectedCrops: updated.selectedCrops,
            frostDates: updated.frostDates,
            cropProfiles
        });
        updated.tasks = generateGardenTasks({
            selectedCrops: updated.selectedCrops,
            frostDates: updated.frostDates,
            cropProfiles
        });

        handleSave(updated);
    };

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset your garden plan?')) {
            const reset = resetPlan('homemaker_garden_plan');
            setPlan(reset);
        }
    };

    const handleAddBed = (e) => {
        e.preventDefault();
        if (!newBed.name) return;

        const updatedBeds = [...(plan.beds || []), {
            id: `bed-${Date.now()}`,
            name: newBed.name,
            width: parseFloat(newBed.width) || 4,
            length: parseFloat(newBed.length) || 8,
            depth: parseFloat(newBed.depth) || 12
        }];

        const updated = {
            ...plan,
            beds: updatedBeds
        };

        setNewBed({ name: '', width: '4', length: '8', depth: '10' });
        handleSave(updated);
    };

    const handleRemoveBed = (bedId) => {
        const updated = {
            ...plan,
            beds: plan.beds.filter(b => b.id !== bedId)
        };
        handleSave(updated);
    };

    const handleToggleCrop = (cropId) => {
        const isSelected = plan.selectedCrops.includes(cropId);
        const updatedCrops = isSelected 
            ? plan.selectedCrops.filter(id => id !== cropId)
            : [...plan.selectedCrops, cropId];

        const updated = {
            ...plan,
            selectedCrops: updatedCrops,
            cropCalendar: generateCropCalendar({
                selectedCrops: updatedCrops,
                frostDates: plan.frostDates,
                cropProfiles
            }),
            tasks: generateGardenTasks({
                selectedCrops: updatedCrops,
                frostDates: plan.frostDates,
                cropProfiles
            })
        };
        handleSave(updated);
    };

    const handleUpdateFrostField = (field, val) => {
        const updatedFrost = { ...plan.frostDates, [field]: val };
        const updated = {
            ...plan,
            frostDates: updatedFrost,
            cropCalendar: generateCropCalendar({
                selectedCrops: plan.selectedCrops,
                frostDates: updatedFrost,
                cropProfiles
            }),
            tasks: generateGardenTasks({
                selectedCrops: plan.selectedCrops,
                frostDates: updatedFrost,
                cropProfiles
            })
        };
        setPlan(updated); // Update local state immediately
    };

    const { totalSqFt, cropEstimates } = estimateBedCapacity({
        beds: plan.beds || [],
        selectedCrops: plan.selectedCrops || [],
        cropProfiles
    });

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
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Garden & Crop Planner</h2>
                        <p className="text-xs text-charcoal-500 font-medium">Model crop counts, estimate direct seeding, and build frost planting calendars.</p>
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

            {/* Frost dates inputs */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-sage-600" />
                    <span>Frost Window Settings</span>
                </h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Last Spring Frost Date</label>
                        <input
                            type="text"
                            placeholder="e.g. May 10"
                            value={plan.frostDates?.lastSpringFrost || ''}
                            onChange={e => handleUpdateFrostField('lastSpringFrost', e.target.value)}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">First Fall Frost Date</label>
                        <input
                            type="text"
                            placeholder="e.g. October 15"
                            value={plan.frostDates?.firstFallFrost || ''}
                            onChange={e => handleUpdateFrostField('firstFallFrost', e.target.value)}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Frost-Free Days</label>
                        <input
                            type="number"
                            placeholder="e.g. 150"
                            value={plan.frostDates?.frostFreeDays || ''}
                            onChange={e => handleUpdateFrostField('frostFreeDays', e.target.value)}
                            onBlur={() => handleSave()}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Beds Layout */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="border-b border-sand-100 pb-3 flex justify-between items-center">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider flex items-center gap-2">
                        <Home size={18} className="text-sage-600" />
                        <span>Active Garden Beds ({plan.beds?.length || 0})</span>
                    </h3>
                    <span className="text-xs bg-sage-50 text-sage-800 font-bold px-2 py-0.5 rounded-full border border-sage-100">
                        Total Area: {totalSqFt} Sq Ft
                    </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <form onSubmit={handleAddBed} className="bg-sand-50 p-5 rounded-3xl space-y-3 border border-sand-100">
                        <h4 className="text-[10px] font-black text-charcoal-500 uppercase tracking-widest pl-1">Add Garden Bed / Plot</h4>
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Bed Name (e.g. Bed A, North Plot)"
                                value={newBed.name}
                                onChange={e => setNewBed({ ...newBed, name: e.target.value })}
                                className="w-full p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs font-bold"
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="number" step="0.5" placeholder="Width (ft)"
                                    value={newBed.width}
                                    onChange={e => setNewBed({ ...newBed, width: e.target.value })}
                                    className="p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs text-center font-semibold"
                                />
                                <input
                                    type="number" step="0.5" placeholder="Length (ft)"
                                    value={newBed.length}
                                    onChange={e => setNewBed({ ...newBed, length: e.target.value })}
                                    className="p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs text-center font-semibold"
                                />
                                <input
                                    type="number" placeholder="Depth (in)"
                                    value={newBed.depth}
                                    onChange={e => setNewBed({ ...newBed, depth: e.target.value })}
                                    className="p-3 bg-white rounded-xl border border-sand-200 outline-none text-xs text-center font-semibold"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all min-h-[44px]"
                        >
                            Create Bed
                        </button>
                    </form>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {plan.beds && plan.beds.length > 0 ? (
                            plan.beds.map(bed => (
                                <div key={bed.id} className="flex justify-between items-center p-3 bg-white rounded-2xl border border-sand-200 shadow-sm text-xs">
                                    <div>
                                        <h5 className="font-bold text-sage-800 leading-tight">{bed.name}</h5>
                                        <p className="text-[10px] text-charcoal-400 font-sans mt-0.5">
                                            Dimensions: {bed.width}ft × {bed.length}ft × {bed.depth}in • Area: {bed.width * bed.length} sq ft
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveBed(bed.id)}
                                        className="p-2 text-terracotta-600 hover:bg-terracotta-50 rounded-xl transition-all min-w-[36px] min-h-[36px] flex items-center justify-center"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-charcoal-400 italic">No garden beds defined yet. Add one above!</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Crop Selector */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Select Crop Varieties
                </h3>
                <div className="flex flex-wrap gap-2">
                    {cropProfiles.map(crop => {
                        const isSelected = plan.selectedCrops?.includes(crop.id);
                        return (
                            <button
                                key={crop.id}
                                onClick={() => handleToggleCrop(crop.id)}
                                className={`px-4 py-2 rounded-2xl text-xs font-bold border transition-all ${
                                    isSelected 
                                        ? 'bg-sage-600 text-white border-sage-700 shadow-sm' 
                                        : 'bg-sand-50 text-charcoal border-sand-200 hover:bg-sand-100'
                                }`}
                            >
                                {crop.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Calculated planting estimations */}
            {cropEstimates.length > 0 && (
                <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-sage-600" />
                        <span>Estimated Planting Capacity</span>
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {cropEstimates.map(est => (
                            <div key={est.cropId} className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl space-y-1 text-xs">
                                <h4 className="font-bold text-sage-800 leading-tight">{est.name}</h4>
                                <p className="text-[10px] text-charcoal-400 font-sans">Allocated Space: {est.allocatedSqFt} sq ft</p>
                                <p className="text-[10px] text-charcoal-400 font-sans font-bold">Spacing: {est.plantsPerSqFt} per sq ft</p>
                                <div className="text-sm font-black text-sage-700 mt-2 font-serif">
                                    Target Capacity: {est.maxPlants} plants
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Calendar list */}
            {plan.cropCalendar && plan.cropCalendar.length > 0 && (
                <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                        Homestead Planting Calendar
                    </h3>
                    <div className="space-y-3">
                        {plan.cropCalendar.map((item, idx) => (
                            <div key={idx} className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl text-xs flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sage-950">{item.cropName}</span>
                                        <span className="text-[9px] bg-sage-100 text-sage-800 font-bold px-2 py-0.5 rounded-full border border-sage-200 uppercase tracking-wider">{item.action}</span>
                                    </div>
                                    <p className="text-[10px] text-charcoal-500 font-sans">{item.notes}</p>
                                </div>
                                <div className="text-[10px] font-black text-sage-700 bg-white border border-sand-200 px-3 py-1 rounded-xl shadow-sm shrink-0 uppercase tracking-wider">
                                    {item.timing}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vector Layout Reference */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Visual Layout Guideline
                </h3>
                <div className="flex justify-center p-4 bg-sand-50 rounded-2xl">
                    <RaisedBedLayoutDiagram />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-red-50/50 border border-red-200 rounded-[2rem] flex justify-between items-center">
                <div>
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-wider">Reset Garden Planner</h4>
                    <p className="text-[10px] text-red-600 leading-relaxed mt-0.5">Wipe all bed allocations, crop selections, and reset to defaults.</p>
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

export default GardenPlannerPage;
