import React, { useState } from 'react';
import { ShieldAlert, Search, ChevronRight, FileText, Activity, Check, Heart } from 'lucide-react';
import { GuideHeroCard, ComparisonTable, StepGuide, CalloutBlock } from './index';

// Import JSON database
import healthRef from '../../data/visual-guides/health_sanitation_reference.json';

const HealthSanitationLanding = ({ handleFileClick, files = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const getDisplayName = (name) => {
        return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sanitationRows = healthRef.sanitation.map(s => ({
        system: s.system,
        useCase: s.useCase,
        water: s.water,
        maintenance: s.maintenance,
        risk: s.risk,
        cold: s.cold
    }));

    const triageSteps = healthRef.firstAidTriage.map(t => ({
        title: t.condition,
        body: t.action || t.desc
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Health, Sanitation & Medical"
                subtitle="First-aid triage, medical kit checklist, compost toilet setups, and off-grid hygiene."
                icon={<Activity size={32} />}
                difficulty="Medium"
                estimatedTime="Ongoing"
                tags={["First Aid", "Sanitation", "Hygiene", "Emergency Medicine"]}
                seasonalContext="Year-Round"
                safetyLevel="High"
            />

            {/* Medical Disclaimer */}
            <CalloutBlock type="danger" title="CRITICAL MEDICAL DISCLAIMER">
                <p>
                    All medical references, first-aid triage workflows, and supply checklists are <strong>educational and do not replace professional medical care, diagnosis, or prescription treatment</strong>. Always seek emergency medical help if available.
                </p>
            </CalloutBlock>

            {/* Emergency Triage Guide */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Emergency First Aid Triage</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Critical life-saving responses to secure breathing, halt bleeding, and cool burns.</p>
                </div>
                <StepGuide steps={triageSteps} />
            </section>

            {/* Sanitation Systems comparisons */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Off-Grid Toilet & Waste Systems</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Compare maintenance, water requirements, and cold-weather operation.</p>
                </div>
                <ComparisonTable
                    headers={["Sanitation System", "Best Use Case", "Water Needed", "Primary Maintenance", "Risk Factors", "Winter Operation"]}
                    rows={sanitationRows}
                    keys={["system", "useCase", "water", "maintenance", "risk", "cold"]}
                />
            </section>

            {/* Grid-down hygiene checklists */}
            <section className="space-y-3 bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm">
                <h4 className="text-sm font-bold text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-1.5">
                    Grid-Down Hygiene Checklists
                </h4>
                <div className="grid gap-6 md:grid-cols-2 pt-2">
                    {healthRef.hygiene.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                            <span className="text-[10px] font-black text-sage-600 uppercase tracking-widest flex items-center gap-1">
                                <Check size={12} /> {item.activity}
                            </span>
                            <p className="text-xs text-charcoal-600 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Medical Kit checklist */}
            <section className="space-y-4">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Homestead First Aid Kit Log</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Essential supplies to audit and restock regularly.</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    {healthRef.medKit.map((cat, idx) => (
                        <div key={idx} className="bg-white border border-sand-200 rounded-3xl p-6 space-y-3 shadow-sm">
                            <h4 className="text-xs font-black text-sage-800 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-1.5">
                                <Heart size={12} className="text-red-500" /> {cat.category}
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {cat.items.map(item => (
                                    <span key={item} className="text-[10px] bg-sand-50 border border-sand-200 text-charcoal px-2 py-0.5 rounded font-semibold shadow-sm">{item}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Reference Library */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-3 gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Medical Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Detailed guides on wilderness first aid and sanitation.</p>
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

export default HealthSanitationLanding;
