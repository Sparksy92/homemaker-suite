import React, { useState } from 'react';
import { Zap, Search, ChevronRight, FileText, Activity, ShieldAlert, Calculator } from 'lucide-react';
import { GuideHeroCard, ComparisonTable, CalloutBlock } from './index';

// Import JSON reference
import energyRef from '../../data/visual-guides/energy_system_reference.json';

const EnergyLanding = ({ handleFileClick, files = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Solar Estimator State
    const [lightingQty, setLightingQty] = useState(2);
    const [lightingHrs, setLightingHrs] = useState(4);
    
    const [fridgeQty, setFridgeQty] = useState(1);
    const [fridgeHrs, setFridgeHrs] = useState(12); // cycling time
    
    const [phoneQty, setPhoneQty] = useState(2);
    const [phoneHrs, setPhoneHrs] = useState(2);
    
    const [pumpQty, setPumpQty] = useState(1);
    const [pumpHrs, setPumpHrs] = useState(1);

    // Sizing Sinks
    const lightingWh = lightingQty * 10 * lightingHrs;
    const fridgeWh = fridgeQty * 45 * fridgeHrs;
    const phoneWh = phoneQty * 15 * phoneHrs;
    const pumpWh = pumpQty * 80 * pumpHrs;
    
    const totalDailyWh = lightingWh + fridgeWh + phoneWh + pumpWh;
    
    // Panel calculations (4 peak solar hours, 30% system loss multiplier 1.3)
    const requiredPanelWatts = Math.round((totalDailyWh / 4) * 1.3);
    
    // Battery calculations (at 12V and 24V assuming 2 days of autonomy and 80% DoD for LiFePO4)
    const batteryAh12V = Math.round(((totalDailyWh * 2) / 12) / 0.8);
    const batteryAh24V = Math.round(((totalDailyWh * 2) / 24) / 0.8);

    // Clean file name helper
    const getDisplayName = (name) => {
        return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    // Filter files in this category
    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const batteryRows = energyRef.batteryChemistries.map(b => ({
        type: b.type,
        cycles: b.cycles,
        dod: b.dod,
        tempRange: b.tempRange,
        safety: b.safety,
        cost: b.cost
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Energy & Electricity"
                subtitle="Solar panel array sizing, load calculator tools, and battery bank configurations."
                icon={<Zap size={32} />}
                difficulty="High"
                estimatedTime="Weeks"
                tags={["Solar", "Electrical", "Wiring", "Batteries"]}
                seasonalContext="Year-Round (Winter Sun Drop)"
                safetyLevel="High"
            />

            {/* Electrical Safety Alert */}
            <CalloutBlock type="danger" title="HIGH VOLTAGE / SHIELD WARNING">
                <p>
                    DC current from solar arrays and battery banks can cause <strong>fatal electrical shocks, severe burns, and structural fires</strong> if short-circuited. Always install fuses or circuit breakers between the panels, charge controller, batteries, and inverter. Never work on wiring with wet hands or when panels are in sun.
                </p>
            </CalloutBlock>

            {/* Interactive Solar Load Calculator */}
            <section className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                    <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><Calculator size={20} /></div>
                    <div>
                        <h4 className="text-base font-serif font-black text-sage-900 leading-tight">Interactive Solar Load Planner</h4>
                        <p className="text-[10px] text-charcoal-500 font-semibold mt-0.5">Input your daily off-grid appliances to estimate panel sizing and battery banks.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Lighting */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-50/50 pb-3">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-sage-900">LED Lighting (10W per bulb)</span>
                            <p className="text-[10px] text-charcoal-400 font-semibold">Primary illumination for cabin rooms.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Qty:</span>
                                <input type="number" min="0" value={lightingQty} onChange={e => setLightingQty(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Hours:</span>
                                <input type="number" min="0" value={lightingHrs} onChange={e => setLightingHrs(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* DC Fridge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-50/50 pb-3">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-sage-900">DC Fridge / Freezer (45W cycling)</span>
                            <p className="text-[10px] text-charcoal-400 font-semibold">Homestead cold storage. Assumes compressor runs 50% of the day.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Qty:</span>
                                <input type="number" min="0" value={fridgeQty} onChange={e => setFridgeQty(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Hours:</span>
                                <input type="number" min="0" value={fridgeHrs} onChange={e => setFridgeHrs(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Phone/Laptop Charging */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-50/50 pb-3">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-sage-900">Device Charging (15W per charger)</span>
                            <p className="text-[10px] text-charcoal-400 font-semibold">Cellphones, satellite communicators, and headlamps.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Qty:</span>
                                <input type="number" min="0" value={phoneQty} onChange={e => setPhoneQty(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Hours:</span>
                                <input type="number" min="0" value={phoneHrs} onChange={e => setPhoneHrs(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* DC Water Pump */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-50/50 pb-3">
                        <div className="space-y-0.5">
                            <span className="text-xs font-bold text-sage-900">DC Water Pump (80W pump)</span>
                            <p className="text-[10px] text-charcoal-400 font-semibold">Pressurizes homestead gravity lines from cisterns.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Qty:</span>
                                <input type="number" min="0" value={pumpQty} onChange={e => setPumpQty(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-charcoal font-bold">
                                <span>Hours:</span>
                                <input type="number" min="0" value={pumpHrs} onChange={e => setPumpHrs(parseInt(e.target.value) || 0)} className="w-12 p-1 border rounded bg-sand-50 text-center focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Calculation Outputs */}
                <div className="grid grid-cols-2 gap-4 bg-sand-50 border border-sand-200 p-5 rounded-2xl">
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Total Daily Load</span>
                        <span className="text-lg font-black text-sage-950 font-mono">{totalDailyWh} Wh</span>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Solar Panel Array Size</span>
                        <span className="text-lg font-black text-sage-950 font-mono">{requiredPanelWatts} W</span>
                    </div>
                    <div className="space-y-0.5 mt-2">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">12V LiFePO4 Bank</span>
                        <span className="text-xs font-bold text-charcoal-700 font-mono">{batteryAh12V} Ah (2 days autonomy)</span>
                    </div>
                    <div className="space-y-0.5 mt-2">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">24V LiFePO4 Bank</span>
                        <span className="text-xs font-bold text-charcoal-700 font-mono">{batteryAh24V} Ah (2 days autonomy)</span>
                    </div>
                </div>
            </section>

            {/* Battery Chemistry Comparison */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Battery Chemistry Comparison</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Compare lifecycle cycles, temperature sensitivity, and depth of discharge parameters.</p>
                </div>
                <ComparisonTable
                    headers={["Battery Type", "Life Cycles", "Depth of Discharge (DoD)", "Temp Tolerance Range", "Safety Standard", "Cost Profile"]}
                    rows={batteryRows}
                    keys={["type", "cycles", "dod", "tempRange", "safety", "cost"]}
                />
            </section>

            {/* All Guides in Category */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-3 gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Energy Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Explore detailed manuals and specific solar wiring diagrams.</p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 pr-4 py-1.5 rounded-lg border border-sand-200 bg-white text-xs outline-none focus:border-sage-500 w-full sm:w-48 shadow-sm"
                        />
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sand-400" />
                    </div>
                </div>

                <div className="grid gap-3">
                    {filteredFiles.map(file => (
                        <button
                            key={file}
                            onClick={() => handleFileClick(file)}
                            className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-sand-200 shadow-sm hover:border-sage-400 hover:shadow-md transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><FileText size={18} /></div>
                                <span className="text-sm font-bold text-sage-900 leading-tight">{getDisplayName(file)}</span>
                            </div>
                            <ChevronRight size={16} className="text-sand-300" />
                        </button>
                    ))}
                    {filteredFiles.length === 0 && (
                        <div className="text-center py-6 text-xs text-sand-400">No matching files found.</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default EnergyLanding;
