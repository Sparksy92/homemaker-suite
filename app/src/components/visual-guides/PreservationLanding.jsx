import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Search, ChevronRight, FileText, Activity, ShieldAlert, Check, Calendar } from 'lucide-react';
import { GuideHeroCard, ComparisonTable, StepGuide, TimelineGuide, CalloutBlock } from './index';
import { RootCellarAirflowDiagram } from './diagrams';

// Import JSON database
import preservationRef from '../../data/visual-guides/preservation_reference.json';

const PreservationLanding = ({ handleFileClick, files = [] }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Pantry Calculator State
    const [householdSize, setHouseholdSize] = useState(2);
    const [targetDays, setTargetDays] = useState(90);
    const [caloriesPerDay, setCaloriesPerDay] = useState(2000);

    // Calculate totals
    const totalKcalRequired = householdSize * targetDays * caloriesPerDay;
    const grainsLbs = Math.round((totalKcalRequired * 0.40) / 1600);
    const legumesLbs = Math.round((totalKcalRequired * 0.25) / 1500);
    const fatsLbs = Math.round((totalKcalRequired * 0.15) / 4000);
    const produceLbs = Math.round((totalKcalRequired * 0.20) / 300);

    const normalizeFileItem = (item, fallbackFolder = null) => {
        if (typeof item === 'string') return { file: item, folder: fallbackFolder };
        return item;
    };

    const getDisplayName = (item) => {
        const normalized = normalizeFileItem(item);
        return normalized.file.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const methodRows = preservationRef.methods.map(m => ({
        name: m.name,
        foods: m.foods,
        shelfLife: m.shelfLife,
        equipment: m.equipment,
        risk: m.risk,
        beginner: m.beginner
    }));

    const safetySteps = preservationRef.safetyFlow.map((s, i) => ({
        title: `${i + 1}. ${s.step}`,
        body: s.desc
    }));

    const cellarRows = preservationRef.rootCellarRules.map(c => ({
        aspect: c.aspect,
        rule: c.rule
    }));

    const timelineItems = preservationRef.timeline.map(t => ({
        dateRange: t.dateRange,
        status: t.status,
        title: t.title,
        desc: t.desc
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Food Preservation & Pantry"
                subtitle="Root cellar ventilation layouts, canning safety gates, and dry buffer calculations."
                icon={<Archive size={32} />}
                difficulty="Medium"
                estimatedTime="Ongoing"
                tags={["Canning", "Root Cellar", "Fermentation", "Stockpiling"]}
                seasonalContext="Harvest (Autumn)"
                safetyLevel="High"
            />

            {/* Planner Integration Callout */}
            <div className="p-5 bg-sage-800 text-white rounded-[2rem] border border-sage-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="font-serif font-black text-sm text-sand-100 uppercase tracking-wider">Configure Pantry Stock Plan</h4>
                    <p className="text-[10px] text-sand-200 leading-relaxed font-sans max-w-md">
                        Calculate target calorie buffers, dry food weights, estimated shelf racks volumes, and track food rotations.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/homestead/pantry-plan')}
                    className="py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-center shrink-0 min-h-[44px]"
                >
                    Open Pantry Planner
                </button>
            </div>

            {/* Safety Warning */}
            <CalloutBlock type="danger" title="CRITICAL BOTULISM SAFETY DISPATCH">
                <p>
                    Low-acid foods (vegetables, meat, poultry, fish, stock) <strong>must be pressure canned</strong>. Water bath canning is limited to high-acid foods only. Failure to use pressure processing at correct temperatures allows <em>Clostridium botulinum</em> spores to produce lethal toxins. Follow verified guidelines exactly.
                </p>
            </CalloutBlock>

            {/* Interactive Pantry Calculator */}
            <section className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                    <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><Archive size={20} /></div>
                    <div>
                        <h4 className="text-base font-serif font-black text-sage-900 leading-tight">Interactive Pantry Stock Estimator</h4>
                        <p className="text-[10px] text-charcoal-500 font-semibold mt-0.5">Calculate dry buffers based on survival dietary needs.</p>
                    </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                    <strong>Estimate only.</strong> Adjust for climate, appliance efficiency, personal needs, and local conditions. This is not medical nutrition advice.
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Household Size</label>
                        <input
                            type="number" min="1"
                            value={householdSize}
                            onChange={e => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Target Days</label>
                        <input
                            type="number" min="1"
                            value={targetDays}
                            onChange={e => setTargetDays(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Daily Kcal Per Person</label>
                        <input
                            type="number" min="1200" step="100"
                            value={caloriesPerDay}
                            onChange={e => setCaloriesPerDay(Math.max(1200, parseInt(e.target.value) || 2000))}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none focus:border-sage-500 text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-sand-50 border border-sand-200 p-5 rounded-2xl">
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Total Calories</span>
                        <span className="text-lg font-black text-sage-950 font-mono">{totalKcalRequired.toLocaleString()} kcal</span>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Grains / Starches</span>
                        <span className="text-lg font-black text-sage-950 font-mono">{grainsLbs} lbs</span>
                    </div>
                    <div className="space-y-0.5 mt-2">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Proteins / Legumes</span>
                        <span className="text-xs font-bold text-charcoal-700 font-mono">{legumesLbs} lbs</span>
                    </div>
                    <div className="space-y-0.5 mt-2">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Fats & Oils</span>
                        <span className="text-xs font-bold text-charcoal-700 font-mono">{fatsLbs} lbs</span>
                    </div>
                </div>
            </section>

            {/* Root Cellar Airflow Diagram */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Root Cellar Ventilation</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Ensure constant cool fresh air intake and rising moisture/ethylene gas exhaust vents.</p>
                </div>
                <RootCellarAirflowDiagram />
            </section>

            {/* Canning Safety step guide */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Canning Safety Workflows</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Always execute these step checks to prevent mold and bacterial failure.</p>
                </div>
                <StepGuide steps={safetySteps} />
            </section>

            {/* Rotation / Process Flow */}
            <section className="space-y-3 bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-1.5">
                    Pantry Rotation System (FIFO)
                </h4>
                <p className="text-xs text-charcoal-600 leading-relaxed font-medium">
                    Maintain food safety by following the <strong>First-In, First-Out (FIFO)</strong> rotation sequence:
                </p>
                <ol className="list-decimal pl-4 space-y-2 text-xs text-charcoal-700 font-medium">
                    <li>Label every jar/container with contents and preparation date.</li>
                    <li>Store new jars at the back of the shelf.</li>
                    <li>Move older stock to the front for immediate consumption.</li>
                    <li>Audit shelves monthly for seal failures or bulging lids.</li>
                </ol>
            </section>

            {/* Method comparisons */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Preservation Method Comparison</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Compare shelf life, difficulty, and risk levels before processing.</p>
                </div>
                <ComparisonTable
                    headers={["Method", "Ideal Foods", "Shelf Life", "Equipment Needed", "Risk Profile", "Beginner Suitability"]}
                    rows={methodRows}
                    keys={["name", "foods", "shelfLife", "equipment", "risk", "beginner"]}
                />
            </section>

            {/* Seasonal Calendar */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Preservation Windows</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Timeline checklist for garden harvest processing windows.</p>
                </div>
                <TimelineGuide items={timelineItems} />
            </section>

            {/* Reference Library */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-3 gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Preservation Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Detailed manuals and specific canning files.</p>
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
                    {filteredFiles.map(file => {
                        const normalized = normalizeFileItem(file);
                        return (
                            <button
                                key={normalized.file}
                                onClick={() => handleFileClick(normalized.file, normalized.folder)}
                                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-sand-200 shadow-sm hover:border-sage-400 hover:shadow-md transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><FileText size={18} /></div>
                                    <span className="text-sm font-bold text-sage-900 leading-tight">{getDisplayName(normalized)}</span>
                                </div>
                                <ChevronRight size={16} className="text-sand-300" />
                            </button>
                        );
                    })}
                    {filteredFiles.length === 0 && (
                        <div className="text-center py-6 text-xs text-sand-400">No matching files found.</div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PreservationLanding;
