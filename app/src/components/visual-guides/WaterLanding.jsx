import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Search, ChevronRight, FileText, Activity, ShieldAlert, Check } from 'lucide-react';
import { GuideHeroCard, SystemMapCard, ComparisonTable, CalloutBlock } from './index';

// Import JSON reference
import waterRef from '../../data/visual-guides/water_system_reference.json';

const WaterLanding = ({ handleFileClick, files = [] }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Clean file name helper
    const getDisplayName = (name) => {
        return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    // Filter files in this category
    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const systemMapNodes = [
        { stepNumber: 1, name: "Roof Surface", desc: "Asphalt shingles discarded. Metal or slate surface captures clean runoff.", icon: <Activity size={18} /> },
        { stepNumber: 2, name: "Gutter Leaf Screen", desc: "Wide gutters with mesh covers trap twigs, leaves, and large debris.", icon: <Activity size={18} /> },
        { stepNumber: 3, name: "First Flush Diverter", desc: "Diverts first 10-20 gallons of bird droppings and dust away from tanks.", icon: <Activity size={18} /> },
        { stepNumber: 4, name: "Storage Cistern", desc: "Opaque food-grade tanks prevent light entry to halt algae growth.", icon: <Activity size={18} /> },
        { stepNumber: 5, name: "Bio-Sand Filter", desc: "Gravity filtration removes pathogens through schmutzdecke biological layer.", icon: <Activity size={18} /> }
    ];

    const filterRows = waterRef.filtrationMethods.map(m => ({
        method: m.method,
        effectiveness: m.effectiveness,
        cost: m.cost,
        flowRate: m.flowRate,
        maintenance: m.maintenance
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Water Systems"
                subtitle="Rainwater harvesting, gravity-fed cistern setups, and pathogen biological filters."
                icon={<Droplets size={32} />}
                difficulty="High"
                estimatedTime="Weeks (setup)"
                tags={["Hydrology", "Rain Catchment", "Gravity Flow"]}
                seasonalContext="Year-Round (Winterize)"
                safetyLevel="High"
            />

            {/* Planner Integration Callout */}
            <div className="p-5 bg-sage-800 text-white rounded-[2rem] border border-sage-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="font-serif font-black text-sm text-sand-100 uppercase tracking-wider">Configure Water Plan</h4>
                    <p className="text-[10px] text-sand-200 leading-relaxed font-sans max-w-md">
                        Calculate daily drinking volumes, buffer targets, container models, and run rain catchment calculations.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/homestead/water-plan')}
                    className="py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-center shrink-0 min-h-[44px]"
                >
                    Open Water Planner
                </button>
            </div>

            {/* Critical Safety Gate Warning */}
            <CalloutBlock type="danger" title="LETHAL RISK DISPATCH">
                <p>
                    Untreated surface or roof runoff contains microscopic pathogens (Giardia, Cryptosporidium, E. Coli). A biological sand filter is highly effective but requires <strong>3 weeks to mature</strong> its biological layer (schmutzdecke) before consumption is safe. Always test or boil water if in doubt.
                </p>
            </CalloutBlock>

            {/* Catchment Flow Map */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Rain Catchment Flow Diagram</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Ensure every physical component matches safety standards from roof capture to the tap.</p>
                </div>
                <SystemMapCard title="Homestead Gravity Catchment Cycle" nodes={systemMapNodes} />
            </section>

            {/* Sizing Calculations Card */}
            <section className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">Rainwater Sizing Formula</h4>
                <p className="text-xs text-charcoal-600 leading-relaxed font-medium">
                    To estimate your monthly collection potential, apply this standard off-grid sizing formula:
                </p>
                <div className="bg-sand-50 border border-sand-100 p-4 rounded-xl font-mono text-center text-xs md:text-sm font-bold text-sage-800">
                    Catchment (gal) = Roof Area (sq ft) × Rain depth (in) × 0.623 × Efficiency (0.85)
                </div>
                <ul className="text-xs text-charcoal-600 space-y-1 list-disc pl-4 leading-relaxed font-medium">
                    <li>A typical 1,200 sq ft cabin roof receiving 1 inch of rain captures ~635 usable gallons.</li>
                    <li>Ensure cistern storage capacity covers at least 60 days of usage during dry seasons.</li>
                </ul>
            </section>

            {/* Filtration Comparisons */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Filtration & Purification Methods</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Select a primary and secondary filtering strategy to guarantee drinking water safety.</p>
                </div>
                <ComparisonTable
                    headers={["Method", "Effectiveness", "Cost Profile", "Flow Speed", "Primary Maintenance"]}
                    rows={filterRows}
                    keys={["method", "effectiveness", "cost", "flowRate", "maintenance"]}
                />
            </section>

            {/* Water Checklist */}
            <section className="space-y-3 bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-1.5">
                    <Check size={16} className="text-sage-600" /> Essential Winterization Tasks
                </h4>
                <ul className="text-xs text-charcoal-600 space-y-2.5 font-medium leading-relaxed">
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-terracotta-500 mt-1.5" />
                        <span>Drain all exposed above-ground PVC pipes and shut off valves leading to exterior faucets before first frost.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-terracotta-500 mt-1.5" />
                        <span>Wrap cistern outlet valves with heavy insulation or thermal wraps to prevent freezing lockups.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-terracotta-500 mt-1.5" />
                        <span>Audit diverter balls and first-flush tubes, removing silt and checking screens for micro-cracking.</span>
                    </li>
                </ul>
            </section>

            {/* All Guides in Category */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-3 gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Water Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Explore detailed manuals and specific biological filter construction guides.</p>
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

export default WaterLanding;
