import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Users, Droplets, Trash2, ShieldAlert, Check, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const HomesteadOnboarding = ({ onClose }) => {
    const { updateHomesteadProfile } = useUser();
    const [step, setStep] = useState(0);

    // Form states
    const [household, setHousehold] = useState({ size: 2, children: 0, elders: 0, pets: 0 });
    const [region, setRegion] = useState({ climate: 'temperate', frostFreeDays: '150', frostDates: 'Last: May 10 / First: Oct 15' });
    const [water, setWater] = useState({ primary: 'rain_catchment', secondary: 'well' });
    const [pantry, setPantry] = useState({ targetDays: 90, confidence: 'medium' });
    const [energy, setEnergy] = useState({ setup: 'solar_off_grid' });
    const [heat, setHeat] = useState({ source: 'wood_stove' });
    const [sanitation, setSanitation] = useState({ setup: 'composting_toilet' });
    const [garden, setGarden] = useState({ type: 'raised_beds' });
    const [experience, setExperience] = useState({ level: 'beginner' });
    const [preferredUnits, setPreferredUnits] = useState('imperial');
    const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);

    const handleComplete = () => {
        if (!safetyAcknowledged) {
            alert("Please acknowledge the safety disclaimers to complete setup.");
            return;
        }
        const profile = {
            schemaVersion: 1,
            completedAt: new Date().toISOString(),
            household,
            region,
            water,
            pantry,
            energy,
            heat,
            sanitation,
            garden,
            experience,
            preferredUnits,
            safetyAcknowledged: true
        };
        updateHomesteadProfile(profile);
        if (onClose) onClose();
    };

    const handleSkip = () => {
        const skippedProfile = {
            schemaVersion: 1,
            skipped: true,
            completedAt: null
        };
        updateHomesteadProfile(skippedProfile);
        if (onClose) onClose();
    };

    const totalSteps = 6;

    return (
        <div className="fixed inset-0 z-50 bg-sage-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-white rounded-[2.5rem] border border-sand-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col my-8"
            >
                {/* Header bar */}
                <div className="px-6 py-4 bg-sand-50/50 border-b border-sand-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Home size={18} className="text-sage-600" />
                        <span className="text-xs font-black uppercase tracking-wider text-sage-800">Homestead Profile Wizard</span>
                    </div>
                    <button 
                        onClick={handleSkip}
                        className="p-2 hover:bg-sand-100 rounded-full transition-colors text-sand-400 hover:text-sand-600 animate-fade-in"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-sand-100">
                    <div 
                        className="h-full bg-sage-600 transition-all duration-300"
                        style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                    />
                </div>

                <div className="p-6 md:p-8 flex-1 space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2 text-center sm:text-left">
                                    <h2 className="text-2xl md:text-3xl font-serif font-black text-sage-900 leading-tight">Define Your Homestead</h2>
                                    <p className="text-sm text-charcoal-500 leading-relaxed">
                                        Help Homemaker Suite tailor its water calculators, crop schedules, safety warnings, and readiness scoreboards to your specific off-grid location and setup.
                                    </p>
                                </div>

                                <div className="bg-sand-50 border border-sand-200 rounded-2xl p-5 space-y-4">
                                    <h3 className="text-xs font-black text-sage-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <Users size={14} /> Household size & units
                                    </h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Total People</label>
                                            <input 
                                                type="number" min="1" 
                                                value={household.size} 
                                                onChange={e => setHousehold({ ...household, size: Math.max(1, parseInt(e.target.value) || 1) })}
                                                className="w-full p-3 bg-white rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Children Count</label>
                                            <input 
                                                type="number" min="0" 
                                                value={household.children} 
                                                onChange={e => setHousehold({ ...household, children: Math.max(0, parseInt(e.target.value) || 0) })}
                                                className="w-full p-3 bg-white rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Elders Count</label>
                                            <input 
                                                type="number" min="0" 
                                                value={household.elders} 
                                                onChange={e => setHousehold({ ...household, elders: Math.max(0, parseInt(e.target.value) || 0) })}
                                                className="w-full p-3 bg-white rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Preferred Units</label>
                                            <select 
                                                value={preferredUnits} 
                                                onChange={e => setPreferredUnits(e.target.value)}
                                                className="w-full p-3 bg-white rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                                            >
                                                <option value="imperial">Imperial (Gal / Lbs)</option>
                                                <option value="metric">Metric (Liters / Kg)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="water-sanitation"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-serif font-black text-sage-900 leading-tight">Water & Sanitation</h2>
                                    <p className="text-xs text-charcoal-500">How do you source clean water and manage waste offline?</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Primary Water Source</label>
                                        <select 
                                            value={water.primary}
                                            onChange={e => setWater({ ...water, primary: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="rain_catchment">Rainwater Catchment System</option>
                                            <option value="well">Deep Well / Artesian Well</option>
                                            <option value="spring">Natural Spring / Stream</option>
                                            <option value="hauled">Hauled / Trucked Water</option>
                                            <option value="municipal">Municipal Connection</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Secondary Water Source</label>
                                        <select 
                                            value={water.secondary}
                                            onChange={e => setWater({ ...water, secondary: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="none">None / No Redundancy</option>
                                            <option value="well">Deep Well</option>
                                            <option value="rain_catchment">Rainwater Catchment</option>
                                            <option value="spring">Natural Spring / Stream</option>
                                            <option value="bottled">Stored Stash / Bottled Water</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Sanitation Setup</label>
                                        <select 
                                            value={sanitation.setup}
                                            onChange={e => setSanitation({ ...sanitation, setup: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="composting_toilet">Composting Toilet (Bio-dry)</option>
                                            <option value="outhouse">Traditional Pit Outhouse</option>
                                            <option value="bucket">Emergency 5-Gallon Bucket System</option>
                                            <option value="septic">Septic Tank & Leach Field</option>
                                            <option value="municipal">Municipal / Grid Sewer</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="food-garden"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-serif font-black text-sage-900 leading-tight">Food Reserves & Gardening</h2>
                                    <p className="text-xs text-charcoal-500">Estimate target stockpiles and soil cultivation styles.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Pantry Stock Target (Days)</label>
                                        <select 
                                            value={pantry.targetDays}
                                            onChange={e => setPantry({ ...pantry, targetDays: parseInt(e.target.value) || 30 })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="14">14 Days (Starter)</option>
                                            <option value="30">30 Days (Standard Prep)</option>
                                            <option value="90">90 Days (Winter Buffer)</option>
                                            <option value="180">180 Days (Deep Resilience)</option>
                                            <option value="365">365 Days (Full Autonomy)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Current Pantry Stock Confidence</label>
                                        <select 
                                            value={pantry.confidence}
                                            onChange={e => setPantry({ ...pantry, confidence: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="low">Low (Less than 1 week stored)</option>
                                            <option value="medium">Medium (Have basic staples, dry buffers)</option>
                                            <option value="high">High (Fully stocked to target, rotated)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Garden Setup</label>
                                        <select 
                                            value={garden.type}
                                            onChange={e => setGarden({ ...garden, type: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="raised_beds">Raised Beds (Framed)</option>
                                            <option value="in_ground">In-ground Tilled/No-Till Plots</option>
                                            <option value="greenhouse">Passive Solar Greenhouse</option>
                                            <option value="containers">Container Pots / Balcony Setup</option>
                                            <option value="food_forest">Food Forest / Perennials</option>
                                            <option value="none">No Garden Setup</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="energy-heat"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-serif font-black text-sage-900 leading-tight">Energy & Heating</h2>
                                    <p className="text-xs text-charcoal-500">Configure energy arrays and wood heating buffers.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Electrical Energy Setup</label>
                                        <select 
                                            value={energy.setup}
                                            onChange={e => setEnergy({ ...energy, setup: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="solar_off_grid">Off-Grid Solar (Panels + Battery bank)</option>
                                            <option value="solar_hybrid">Grid-Tied Solar with Storage Backup</option>
                                            <option value="generator">Generator Only (Gas, Propane, Diesel)</option>
                                            <option value="grid">Grid Power Only (No Backup)</option>
                                            <option value="none">No Electricity / Lanterns Only</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Primary Cabin Heat Source</label>
                                        <select 
                                            value={heat.source}
                                            onChange={e => setHeat({ ...heat, source: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="wood_stove">Wood Stove (Biomass combustion)</option>
                                            <option value="propane">Propane Heater / Radiant Wall Unit</option>
                                            <option value="heat_pump">Electric Heat Pump (requires solar/grid)</option>
                                            <option value="passive_solar">Passive Solar only (overhangs & mass)</option>
                                            <option value="none">No Built-in Heat / Emergency blankets</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="climate-experience"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-xl md:text-2xl font-serif font-black text-sage-900 leading-tight">Region & Skill Level</h2>
                                    <p className="text-xs text-charcoal-500">Climate zones affect growing periods and structural snow insulation.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Climate / Region Type</label>
                                        <select 
                                            value={region.climate}
                                            onChange={e => setRegion({ ...region, climate: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="temperate">Temperate (4 seasons, regular frost)</option>
                                            <option value="arid">Arid / Semi-Arid (Desert, low rain)</option>
                                            <option value="boreal">Boreal / Alpine (Short summer, deep snow)</option>
                                            <option value="tropical">Tropical / Subtropical (Warm, wet/dry cycles)</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Frost-Free Days Estimate</label>
                                            <input 
                                                type="number"
                                                value={region.frostFreeDays}
                                                onChange={e => setRegion({ ...region, frostFreeDays: e.target.value })}
                                                className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Frost Dates Description</label>
                                            <input 
                                                type="text"
                                                value={region.frostDates}
                                                onChange={e => setRegion({ ...region, frostDates: e.target.value })}
                                                className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Homesteading Experience</label>
                                        <select 
                                            value={experience.level}
                                            onChange={e => setExperience({ ...experience, level: e.target.value })}
                                            className="w-full p-4 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-xs font-bold"
                                        >
                                            <option value="beginner">Beginner (Planning phase or under 1 year)</option>
                                            <option value="intermediate">Intermediate (1-3 years, growing food/managing systems)</option>
                                            <option value="advanced">Advanced (3+ years, fully off-grid, self-reliant)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div
                                key="disclaimer"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-2 text-center">
                                    <div className="p-3 bg-red-500 text-white rounded-full w-fit mx-auto animate-pulse">
                                        <ShieldAlert size={28} />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-serif font-black text-sage-900 leading-tight">Critical Safety Disclaimers</h2>
                                </div>

                                <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4 space-y-3 text-xs leading-relaxed text-red-950 font-medium">
                                    <p>
                                        <strong>1. Structural Rules:</strong> Shelter framing and construction references are for general education. They are NOT engineered blueprints. Work must comply with local code.
                                    </p>
                                    <p>
                                        <strong>2. Electrical Danger:</strong> DC and AC wiring systems carry lethal shock and fire risks. Always consult qualified electricians and install fuses.
                                    </p>
                                    <p>
                                        <strong>3. Preservation & Pathogens:</strong> Incorrect canning of low-acid foods carries severe botulism risks. Water treatment guidelines do not replace local lab water quality checks.
                                    </p>
                                    <p>
                                        <strong>4. Medical Kits:</strong> First aid guides and kit lists are for educational reference and do not replace professional diagnosis or prescription healthcare.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSafetyAcknowledged(!safetyAcknowledged)}
                                    className="w-full flex items-center justify-center gap-3 p-4 bg-white border border-sand-300 rounded-xl hover:bg-sand-50 transition-colors text-left"
                                >
                                    <div className={`p-1 rounded-md border ${safetyAcknowledged ? 'bg-sage-600 border-sage-600 text-white' : 'border-sand-400 text-transparent'}`}>
                                        <Check size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-sage-900">I acknowledge these educational disclaimers.</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Navigation */}
                <div className="p-6 bg-sand-50/50 border-t border-sand-100 flex justify-between gap-3">
                    {step > 0 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-sand-300 bg-white text-sage-800 text-xs font-bold hover:bg-sand-100 transition-colors shadow-sm"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                    ) : (
                        <button
                            onClick={handleSkip}
                            className="px-5 py-3 rounded-xl border border-sand-300 bg-white text-sand-500 text-xs font-bold hover:bg-sand-100 transition-colors shadow-sm"
                        >
                            Skip Setup
                        </button>
                    )}

                    {step < totalSteps - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sage-600 text-white text-xs font-bold hover:bg-sage-700 transition-colors shadow-sm"
                        >
                            Continue <ArrowRight size={14} />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={!safetyAcknowledged}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-colors shadow-sm ${safetyAcknowledged ? 'bg-sage-600 text-white hover:bg-sage-700' : 'bg-sand-200 text-sand-400 cursor-not-allowed'}`}
                        >
                            Save Homestead Profile <Check size={14} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default HomesteadOnboarding;
