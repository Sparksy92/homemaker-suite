import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { loadPlan } from '../services/homesteadPlanningService';
import { generateSeasonalTasks } from '../planners/seasonalTaskEngine';
import { ArrowLeft, Printer, Copy, Check, AlertTriangle, FileText } from 'lucide-react';

const FieldBinder = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    // Load planning states
    const [homesteadPlan, setHomesteadPlan] = useState(null);
    const [gardenPlan, setGardenPlan] = useState(null);
    const [pantryPlan, setPantryPlan] = useState(null);
    const [waterPlan, setWaterPlan] = useState(null);
    const [energyPlan, setEnergyPlan] = useState(null);
    const [projectsPlan, setProjectsPlan] = useState(null);

    // Section selections
    const [selectedSections, setSelectedSections] = useState({
        profile: true,
        water: true,
        pantry: true,
        garden: true,
        energy: true,
        projects: true,
        safety: true,
        tasks: true,
        emergency: true
    });

    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        setHomesteadPlan(loadPlan('homemaker_homestead_plan'));
        setGardenPlan(loadPlan('homemaker_garden_plan'));
        setPantryPlan(loadPlan('homemaker_pantry_plan'));
        setWaterPlan(loadPlan('homemaker_water_plan'));
        setEnergyPlan(loadPlan('homemaker_energy_plan'));
        setProjectsPlan(loadPlan('homemaker_build_projects'));
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleCopySummary = () => {
        let text = `HOMEMAKER SUITE — HOMESTEAD BINDER SUMMARY\n`;
        text += `Generated: ${new Date().toLocaleDateString()}\n`;
        text += `==========================================\n\n`;

        if (selectedSections.profile && homesteadProfile && !homesteadProfile.skipped) {
            text += `[HOMESTEAD PROFILE]\n`;
            text += `- Household Size: ${homesteadProfile.household?.size || 2}\n`;
            text += `- Climate Zone: ${homesteadProfile.region?.climate || 'temperate'}\n`;
            text += `- Primary Water: ${homesteadProfile.water?.primary || 'none'}\n`;
            text += `- Experience Level: ${homesteadProfile.experience?.level || 'beginner'}\n\n`;
        }

        if (selectedSections.water && waterPlan) {
            text += `[WATER PLAN]\n`;
            text += `- Daily Need: ${waterPlan.householdSize * waterPlan.dailyGallonsPerPerson} Gallons/day\n`;
            text += `- Storage Target: ${waterPlan.householdSize * waterPlan.targetDays * waterPlan.dailyGallonsPerPerson} Gallons (${waterPlan.targetDays} days)\n`;
            text += `- Treatment: ${waterPlan.treatmentMethods?.join(', ') || 'none'}\n\n`;
        }

        if (selectedSections.pantry && pantryPlan) {
            text += `[PANTRY PLAN]\n`;
            text += `- Stock Duration: ${pantryPlan.targetDays} Days for ${pantryPlan.householdSize} people\n`;
            text += `- Notes: ${pantryPlan.inventoryNotes || 'None'}\n\n`;
        }

        if (selectedSections.garden && gardenPlan) {
            text += `[GARDEN PLAN]\n`;
            text += `- Spring Frost: ${gardenPlan.frostDates?.lastSpringFrost || 'Not set'}\n`;
            text += `- Fall Frost: ${gardenPlan.frostDates?.firstFallFrost || 'Not set'}\n`;
            text += `- Crop IDs: ${gardenPlan.selectedCrops?.join(', ') || 'None'}\n\n`;
        }

        if (selectedSections.energy && energyPlan) {
            text += `[ENERGY PLAN]\n`;
            text += `- Daily Wh Consumption: ${energyPlan.dailyLoads?.reduce((acc, l) => acc + (l.watts * l.hoursPerDay), 0)} Wh/day\n\n`;
        }

        if (selectedSections.projects && projectsPlan) {
            text += `[BUILD PROJECTS]\n`;
            projectsPlan.projects?.forEach(p => {
                text += `- ${p.title} (${p.status}): ${p.steps?.filter(s => s.completed).length}/${p.steps?.length} steps done\n`;
            });
            text += `\n`;
        }

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        });
    };

    const toggleSection = (sec) => {
        setSelectedSections(prev => ({
            ...prev,
            [sec]: !prev[sec]
        }));
    };

    const seasonalTasks = generateSeasonalTasks({ homesteadProfile });

    return (
        <div className="space-y-8 pb-16">
            {/* Print styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                        font-size: 11pt !important;
                    }
                    nav, header, footer, button, .no-print {
                        display: none !important;
                    }
                    .print-container {
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                    .print-border {
                        border-bottom: 2px solid black !important;
                    }
                    input, select, textarea {
                        border: none !important;
                        background: none !important;
                    }
                }
            ` }} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-200 pb-5 gap-4 no-print">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/homestead')}
                        className="p-2.5 bg-white border border-sand-200 text-charcoal hover:bg-sand-100 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Offline Field Binder</h2>
                        <p className="text-xs text-charcoal-500 font-medium">Export and print physical sheets for your logs, pantry cabinets, and garden binder.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopySummary}
                        className="py-2.5 px-4 bg-white border border-sand-300 text-charcoal font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm hover:bg-sand-50 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                        {copySuccess ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                        <span>{copySuccess ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                    <button
                        onClick={handlePrint}
                        className="py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                        <Printer size={16} />
                        <span>Print Binder</span>
                    </button>
                </div>
            </div>

            {/* Section Selection Toggles */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4 no-print">
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Select Sections to Include in Printed Binder
                </h3>
                <div className="grid gap-2 sm:grid-cols-3">
                    {Object.keys(selectedSections).map(key => (
                        <button
                            key={key}
                            onClick={() => toggleSection(key)}
                            className={`p-3 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 ${
                                selectedSections[key]
                                    ? 'bg-sage-50 border-sage-400 text-sage-950'
                                    : 'bg-sand-50 border-sand-200 text-charcoal-400'
                            }`}
                        >
                            <div className="w-4 h-4 rounded border flex items-center justify-center shrink-0">
                                {selectedSections[key] && <Check size={12} className="text-sage-600" />}
                            </div>
                            <span className="capitalize">{key.replace('_', ' ')}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Printable Container */}
            <div className="print-container bg-white border border-sand-200 rounded-[2rem] p-8 shadow-sm space-y-12">
                
                {/* Print Title Header */}
                <div className="text-center space-y-2 border-b-4 border-sage-800 pb-6">
                    <h1 className="text-3xl font-serif font-black text-sage-900">HOMESTEAD OPERATING BINDER</h1>
                    <p className="text-xs text-charcoal-500 uppercase tracking-widest font-bold font-sans">
                        Homemaker Suite Offline Field Manual • Last Compiled: {new Date().toLocaleDateString()}
                    </p>
                    <div className="text-[10px] text-charcoal-400 italic max-w-lg mx-auto font-sans pt-1">
                        Printed plans are static. Check local storage backups and context logs to ensure you are referencing the most up-to-date estimations.
                    </div>
                </div>

                {/* 1. Profile section */}
                {selectedSections.profile && homesteadProfile && !homesteadProfile.skipped && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            1. Homestead Profile
                        </h2>
                        <table className="w-full text-xs text-left border-collapse">
                            <tbody>
                                <tr className="border-b border-sand-100"><td className="py-2 font-bold text-charcoal-500 w-1/3">Household Size:</td><td className="py-2 font-black">{homesteadProfile.household?.size || 2} People</td></tr>
                                <tr className="border-b border-sand-100"><td className="py-2 font-bold text-charcoal-500">Climate Region:</td><td className="py-2 font-black capitalize">{homesteadProfile.region?.climate || 'temperate'}</td></tr>
                                <tr className="border-b border-sand-100"><td className="py-2 font-bold text-charcoal-500">Water Procurement:</td><td className="py-2 font-black capitalize">{homesteadProfile.water?.primary?.replace('_', ' ') || 'Well'}</td></tr>
                                <tr className="border-b border-sand-100"><td className="py-2 font-bold text-charcoal-500">Pantry Duration Goal:</td><td className="py-2 font-black">{homesteadProfile.pantry?.targetDays || 90} Days</td></tr>
                                <tr className="border-b border-sand-100"><td className="py-2 font-bold text-charcoal-500">Sanitation System:</td><td className="py-2 font-black capitalize">{homesteadProfile.sanitation?.setup?.replace('_', ' ') || 'Composting'}</td></tr>
                                <tr><td className="py-2 font-bold text-charcoal-500">Energy & Power Setup:</td><td className="py-2 font-black capitalize">{homesteadProfile.energy?.setup?.replace('_', ' ') || 'Solar'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 2. Water section */}
                {selectedSections.water && waterPlan && (
                    <div className="space-y-4 page-break">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            2. Water Security Plan
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 border border-sand-300 rounded-xl">
                                <span className="font-bold text-charcoal-500 text-[10px] uppercase">Daily Household Need</span>
                                <div className="text-base font-serif font-bold text-sage-950 mt-1">
                                    {waterPlan.householdSize * waterPlan.dailyGallonsPerPerson} Gallons/day
                                </div>
                            </div>
                            <div className="p-3 border border-sand-300 rounded-xl">
                                <span className="font-bold text-charcoal-500 text-[10px] uppercase">Cistern Buffer Goal ({waterPlan.targetDays} Days)</span>
                                <div className="text-base font-serif font-bold text-sage-950 mt-1">
                                    {waterPlan.householdSize * waterPlan.targetDays * waterPlan.dailyGallonsPerPerson} Gallons
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-sage-800">Target Containers Checklist</h3>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-sand-300 bg-sand-50"><th className="p-2 font-bold">Container Type</th><th className="p-2 font-bold">Capacity</th><th className="p-2 font-bold text-right">Required Units</th></tr>
                                </thead>
                                <tbody>
                                    {suggestStorageContainers({
                                        targetGallons: waterPlan.householdSize * waterPlan.targetDays * waterPlan.dailyGallonsPerPerson
                                    }).map((rec, i) => (
                                        <tr key={i} className="border-b border-sand-100">
                                            <td className="p-2 font-sans font-bold flex gap-2 items-center">
                                                <div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0" />
                                                <span>{rec.type}</span>
                                            </td>
                                            <td className="p-2">{rec.capacity}</td>
                                            <td className="p-2 text-right font-black">{rec.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. Pantry Section */}
                {selectedSections.pantry && pantryPlan && (
                    <div className="space-y-4 page-break">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            3. Food Pantry & Storage Plan
                        </h2>
                        <div className="p-3 bg-sand-50 text-[10px] italic border border-sand-300 rounded-xl text-charcoal-500 leading-relaxed">
                            <strong>Estimate-only disclaimer:</strong> Energy totals calculated at {pantryPlan.caloriesPerPerson} kcal daily per person. Adjust target weights for storage room humidity and shelf space.
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-sage-800">Dry Stockpile Target Weights</h3>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-sand-300 bg-sand-50"><th className="p-2 font-bold">Category</th><th className="p-2 font-bold">Description</th><th className="p-2 font-bold text-right">Target Amount</th></tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-sand-100"><td className="p-2 font-bold flex gap-2 items-center"><div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0" /><span>Grains & Starches</span></td><td className="p-2">Rice, wheat, flour, pasta</td><td className="p-2 text-right font-black">~{Math.round((pantryPlan.householdSize * pantryPlan.targetDays * pantryPlan.caloriesPerPerson * 0.40) / 1600)} lbs</td></tr>
                                    <tr className="border-b border-sand-100"><td className="p-2 font-bold flex gap-2 items-center"><div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0" /><span>Proteins & Legumes</span></td><td className="p-2">Beans, lentils, canned meats</td><td className="p-2 text-right font-black">~{Math.round((pantryPlan.householdSize * pantryPlan.targetDays * pantryPlan.caloriesPerPerson * 0.25) / 1500)} lbs</td></tr>
                                    <tr className="border-b border-sand-100"><td className="p-2 font-bold flex gap-2 items-center"><div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0" /><span>Fats & Oils</span></td><td className="p-2">Olive oil, coconut oil, butter</td><td className="p-2 text-right font-black">~{Math.round((pantryPlan.householdSize * pantryPlan.targetDays * pantryPlan.caloriesPerPerson * 0.15) / 4000)} lbs</td></tr>
                                    <tr className="border-b border-sand-100"><td className="p-2 font-bold flex gap-2 items-center"><div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0" /><span>Dried Fruits & Sugars</span></td><td className="p-2">Honey, maple syrup, raisins</td><td className="p-2 text-right font-black">~{Math.round((pantryPlan.householdSize * pantryPlan.targetDays * pantryPlan.caloriesPerPerson * 0.10) / 1200)} lbs</td></tr>
                                    <tr className="border-b border-sand-100"><td className="p-2 font-bold flex gap-2 items-center"><div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0" /><span>Vegetables</span></td><td className="p-2">Dehydrated/canned tomatoes, greens</td><td className="p-2 text-right font-black">~{Math.round((pantryPlan.householdSize * pantryPlan.targetDays * pantryPlan.caloriesPerPerson * 0.10) / 300)} lbs</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {pantryPlan.inventoryNotes && (
                            <div className="space-y-1 text-xs">
                                <span className="font-bold text-sage-900 uppercase text-[9px] tracking-wider block">Pantry Inventory Notes</span>
                                <p className="p-3 bg-sand-50 rounded-xl leading-relaxed whitespace-pre-wrap font-sans text-charcoal-600">{pantryPlan.inventoryNotes}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Garden Section */}
                {selectedSections.garden && gardenPlan && (
                    <div className="space-y-4 page-break">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            4. Garden & Crop Plan
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 border border-sand-300 rounded-xl">
                                <span className="font-bold text-charcoal-500 text-[10px] uppercase">Last Spring Frost</span>
                                <div className="text-base font-serif font-bold text-sage-950 mt-1">
                                    {gardenPlan.frostDates?.lastSpringFrost || 'Not Configured'}
                                </div>
                            </div>
                            <div className="p-3 border border-sand-300 rounded-xl">
                                <span className="font-bold text-charcoal-500 text-[10px] uppercase">First Fall Frost</span>
                                <div className="text-base font-serif font-bold text-sage-950 mt-1">
                                    {gardenPlan.frostDates?.firstFallFrost || 'Not Configured'}
                                </div>
                            </div>
                        </div>

                        {gardenPlan.cropCalendar && gardenPlan.cropCalendar.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold text-sage-800">Seed Planting Calendar</h3>
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-sand-300 bg-sand-50"><th className="p-2 font-bold">Crop</th><th className="p-2 font-bold">Action</th><th className="p-2 font-bold text-right">Timing Window</th></tr>
                                    </thead>
                                    <tbody>
                                        {gardenPlan.cropCalendar.map((item, i) => (
                                            <tr key={i} className="border-b border-sand-100">
                                                <td className="p-2 font-bold text-charcoal-800">{item.cropName}</td>
                                                <td className="p-2">{item.action}</td>
                                                <td className="p-2 text-right font-black text-sage-700">{item.timing}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. Energy Section */}
                {selectedSections.energy && energyPlan && (
                    <div className="space-y-4 page-break">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            5. Off-Grid Energy & Loads Plan
                        </h2>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-sage-800">Appliance Electrical Loads</h3>
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-sand-300 bg-sand-50"><th className="p-2 font-bold">Appliance Name</th><th className="p-2 font-bold text-center">Watts Draw</th><th className="p-2 font-bold text-center">Hours/Day</th><th className="p-2 font-bold text-right">Daily Wh</th></tr>
                                </thead>
                                <tbody>
                                    {energyPlan.dailyLoads?.map((load, i) => (
                                        <tr key={i} className="border-b border-sand-100">
                                            <td className="p-2 font-bold text-charcoal-800">{load.name}</td>
                                            <td className="p-2 text-center">{load.watts}W</td>
                                            <td className="p-2 text-center">{load.hoursPerDay} hrs</td>
                                            <td className="p-2 text-right font-black">{load.watts * load.hoursPerDay} Wh</td>
                                        </tr>
                                    ))}
                                    {(!energyPlan.dailyLoads || energyPlan.dailyLoads.length === 0) && (
                                        <tr><td colSpan="4" className="p-4 text-center text-charcoal-400 italic">No loads registered.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 6. Build Projects */}
                {selectedSections.projects && projectsPlan && (
                    <div className="space-y-4 page-break">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            6. Construction & Build Checklists
                        </h2>
                        {projectsPlan.projects?.length > 0 ? (
                            <div className="space-y-6">
                                {projectsPlan.projects.map((proj, i) => (
                                    <div key={i} className="p-4 border border-sand-300 rounded-2xl space-y-3">
                                        <div className="flex justify-between border-b border-sand-200 pb-2">
                                            <h3 className="font-serif font-black text-sm text-sage-900">{proj.title}</h3>
                                            <span className="text-[10px] font-black uppercase text-charcoal-400">{proj.status}</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[9px] font-black uppercase text-charcoal-400 tracking-wider">Steps Checklist</span>
                                            {proj.steps?.map((step, idx) => (
                                                <div key={idx} className="flex gap-2 items-start text-xs font-sans text-charcoal-700">
                                                    <div className="w-3.5 h-3.5 border border-sand-400 rounded shrink-0 mt-0.5 flex items-center justify-center font-bold">
                                                        {step.completed && <span className="text-[8px] text-sage-600">&#10003;</span>}
                                                    </div>
                                                    <span className={step.completed ? 'line-through text-charcoal-400' : ''}>{step.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-charcoal-400 italic">No active projects planned.</p>
                        )}
                    </div>
                )}

                {/* 7. Safety disclaimers */}
                {selectedSections.safety && (
                    <div className="space-y-4 page-break">
                        <h2 className="text-lg font-serif font-black text-sage-900 border-b border-sand-300 pb-1 uppercase tracking-wider">
                            7. Critical Safety Dispatches
                        </h2>
                        <div className="grid gap-4 text-xs font-medium leading-relaxed">
                            <div className="p-4 border border-red-300 bg-red-50 text-red-950 rounded-xl flex gap-3">
                                <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-900 uppercase text-[10px]">Canning & Preservation</h3>
                                    <p className="mt-0.5">Low-acid foods must be pressure canned. Water bath processing of vegetables or meat is dangerous and can lead to botulism food poisoning.</p>
                                </div>
                            </div>
                            <div className="p-4 border border-amber-300 bg-amber-50 text-amber-950 rounded-xl flex gap-3">
                                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-amber-900 uppercase text-[10px]">Water Sanitation</h3>
                                    <p className="mt-0.5">Rainwater and surface water contains pathogens. Boil or filter water using tested ceramic or multi-stage filtration tools before consumption.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FieldBinder;
