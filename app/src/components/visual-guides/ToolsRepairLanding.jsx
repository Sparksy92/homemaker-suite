import React, { useState } from 'react';
import { Wrench, Search, ChevronRight, FileText, Check, Calendar } from 'lucide-react';
import { GuideHeroCard, StepGuide, TimelineGuide, CalloutBlock } from './index';

// Import JSON database
import toolsRef from '../../data/visual-guides/tools_repair_reference.json';

const ToolsRepairLanding = ({ handleFileClick, files = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const getDisplayName = (name) => {
        return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const timelineItems = toolsRef.maintenanceSchedule.map(m => ({
        dateRange: m.dateRange,
        status: m.status,
        title: m.title,
        desc: m.desc
    }));

    const repairSteps = toolsRef.repairWorkflows.map(r => ({
        title: r.title,
        body: r.body,
        checklist: r.checklist
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Tools, Workshop & Repair"
                subtitle="Essential off-grid hand tools, preventive maintenance schedules, and basic home plumbing/carpentry repairs."
                icon={<Wrench size={32} />}
                difficulty="Medium"
                estimatedTime="Ongoing"
                tags={["Workshop", "Plumbing", "Electrical Inspection", "Sharpening"]}
                seasonalContext="Year-Round"
                safetyLevel="Medium"
            />

            {/* Safety Warning */}
            <CalloutBlock type="warning" title="REPAIR SAFETY WARNING">
                <p>
                    Always isolate local water valves and shut off main electrical breakers before attempting repairs. Wear safety goggles when using high-speed files or hammers. This guide is for <strong>basic non-engineered repair education</strong> only.
                </p>
            </CalloutBlock>

            {/* Repair Workflows */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">DIY Repair Workflows</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Practical step instructions for patching small leaks, fixing faucets, and sharpening tools.</p>
                </div>
                <StepGuide steps={repairSteps} />
            </section>

            {/* Preventive Maintenance Calendar */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Homestead Preventive Maintenance</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Follow this schedule to extend tool lifespans and prevent fire/water damage.</p>
                </div>
                <TimelineGuide items={timelineItems} />
            </section>

            {/* Essential Tools by System */}
            <section className="space-y-4">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Essential Hand Tools by System</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Focus first on these grid-independent toolsets for off-grid self-reliance.</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    {toolsRef.toolCategories.map((cat, idx) => (
                        <div key={idx} className="bg-white border border-sand-200 rounded-3xl p-6 space-y-3 shadow-sm">
                            <h4 className="text-xs font-black text-sage-800 uppercase tracking-wider border-b border-sand-100 pb-2 flex items-center gap-1.5">
                                <Check size={12} className="text-sage-600" /> {cat.category}
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
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Workshop Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Explore detailed manuals and specific tool instruction files.</p>
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

export default ToolsRepairLanding;
