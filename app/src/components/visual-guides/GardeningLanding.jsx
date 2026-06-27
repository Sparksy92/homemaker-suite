import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, Search, ChevronRight, FileText, Calendar, Compass } from 'lucide-react';
import { GuideHeroCard, PlantProfileCard, ComparisonTable, TimelineGuide, CalloutBlock } from './index';

// Import JSON databases
import cropData from '../../data/visual-guides/gardening_crop_profiles.json';
import companionData from '../../data/visual-guides/gardening_companion_planting.json';
import calendarData from '../../data/visual-guides/seasonal_garden_calendar.json';

const GardeningLanding = ({ handleFileClick, files = [] }) => {
    const navigate = useNavigate();
    const crops = Array.isArray(cropData) ? cropData : (cropData.crops || []);
    const [selectedCrop, setSelectedCrop] = useState(crops[0]?.name || '');
    const [searchQuery, setSearchQuery] = useState('');

    const cropMap = crops.reduce((acc, c) => {
        acc[c.name] = c;
        return acc;
    }, {});

    const activeCrop = cropMap[selectedCrop] || crops[0];

    // Helper to clean file names for display
    const getDisplayName = (name) => {
        return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    // Filter files in this category
    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Map companion data into rows for ComparisonTable
    const companionRows = companionData.map(c => ({
        crop: c.crop,
        companions: c.companions.join(', '),
        antagonists: c.antagonists.join(', ')
    }));

    // Map calendar data into items for TimelineGuide
    const timelineItems = calendarData.map(c => ({
        dateRange: c.startIndoors.includes('Fall') || c.startIndoors.includes('Autumn') ? 'Fall/Winter' : 'Spring/Summer',
        status: c.startIndoors.includes('Direct') ? 'Direct Sow' : 'Indoors First',
        title: `${c.crop} Life Cycle`,
        desc: `Sow: ${c.startIndoors}. Transplant: ${c.transplant}. Harvest: ${c.harvest}.`
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Gardening & Soil"
                subtitle="Homestead crop schedules, companion planting matrices, and soil health basics."
                icon={<Sprout size={32} />}
                difficulty="Medium"
                estimatedTime="Ongoing"
                tags={["Permaculture", "Compost", "Seed Saving"]}
                seasonalContext="Spring / Fall Planting"
                safetyLevel="Low"
            />

            {/* Planner Integration Callout */}
            <div className="p-5 bg-sage-800 text-white rounded-[2rem] border border-sage-700 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h4 className="font-serif font-black text-sm text-sand-100 uppercase tracking-wider">Configure Garden Plan</h4>
                    <p className="text-[10px] text-sand-200 leading-relaxed font-sans max-w-md">
                        Map out your specific raised beds, estimate planting capacity, and calculate custom frost dates in the Garden Planner.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/homestead/garden-plan')}
                    className="py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-center shrink-0 min-h-[44px]"
                >
                    Open Garden Planner
                </button>
            </div>

            {/* Start Here Pathway */}
            <CalloutBlock type="tip" title="Getting Started Pathway">
                <p>
                    For a self-sufficient homestead, focus first on establishing <strong>high-calorie staples</strong> (potatoes, carrots, squash) and <strong>soil fertility</strong> (aerobic composting, organic mulches). Use the crop profile cards below to plan spacing and companion grids.
                </p>
            </CalloutBlock>

            {/* Interactive Crop Profiles */}
            <section className="space-y-4">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Crop Reference Profiles</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Select a crop to inspect planting depth, spacing, companion guidelines, and storage notes.</p>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar scroll-smooth w-full">
                    {crops.map(c => (
                        <button
                            key={c.name}
                            onClick={() => setSelectedCrop(c.name)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${c.name === selectedCrop ? 'bg-sage-600 text-white border-sage-600 shadow-sm' : 'bg-white border-sand-200 text-sage-700 hover:bg-sand-50'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                <PlantProfileCard crop={activeCrop} />
            </section>

            {/* Companion Planting Matrix */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Companion Planting Matrix</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Sow mutualistic species nearby to deter pests and enrich soil biology naturally.</p>
                </div>
                <ComparisonTable
                    headers={["Crop", "Companions (Mutual benefits)", "Antagonists (Avoid planting near)"]}
                    rows={companionRows}
                    keys={["crop", "companions", "antagonists"]}
                />
            </section>

            {/* Planting Timelines */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Homestead Planting Timelines</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Follow this seasonal window checklist to coordinate start schedules.</p>
                </div>
                <TimelineGuide items={timelineItems} />
            </section>

            {/* All Guides in Category */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-3 gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Gardening Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Explore detailed manuals and specific soil preservation files.</p>
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

export default GardeningLanding;
