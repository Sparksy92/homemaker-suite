import React, { useState } from 'react';
import { Home, Search, ChevronRight, FileText, Compass, Info, Check, Wrench } from 'lucide-react';
import { GuideHeroCard, InfoGraphicCard, ComparisonTable, StepGuide, BlueprintCard, CalloutBlock } from './index';
import { SunPathDiagram } from './diagrams';

// Import JSON reference
import shelterRef from '../../data/visual-guides/shelter_build_systems.json';

const ShelterLanding = ({ handleFileClick, files = [] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const getDisplayName = (name) => {
        return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
    };

    const filteredFiles = files.filter(f => 
        getDisplayName(f).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Map factors for InfoGraphicCard
    const drainageGuide = shelterRef.siteSelection.find(s => s.factor === 'Drainage')?.guideline || '';
    const solarGuide = shelterRef.siteSelection.find(s => s.factor === 'Solar Orientation')?.guideline || '';
    const windGuide = shelterRef.siteSelection.find(s => s.factor === 'Wind Exposure')?.guideline || '';
    const snowGuide = shelterRef.siteSelection.find(s => s.factor === 'Snow Load')?.guideline || '';

    // Map foundations rows for ComparisonTable
    const foundationRows = shelterRef.foundations.map(f => ({
        type: f.type,
        useCase: f.useCase,
        difficulty: f.difficulty,
        cost: f.cost,
        frost: f.frost,
        drainage: f.drainage,
        risks: f.risks
    }));

    // Map framing steps for StepGuide
    const framingStepsData = shelterRef.framingSteps.map((f, i) => ({
        title: `${i + 1}. ${f.step}`,
        body: f.desc
    }));

    // Map insulation rows for ComparisonTable
    const insulationRows = shelterRef.insulationOptions.map(i => ({
        material: i.material,
        rValue: i.rValue,
        pros: i.pros,
        cons: i.cons
    }));

    return (
        <div className="space-y-10 pb-16">
            {/* Hero Card */}
            <GuideHeroCard
                title="Shelter & Construction"
                subtitle="Cabin design basics, passive solar layouts, wall framing sequences, and foundation choices."
                icon={<Home size={32} />}
                difficulty="High"
                estimatedTime="Months (Build)"
                tags={["Carpentry", "Passive House", "Insulation", "Foundations"]}
                seasonalContext="Spring / Summer Build"
                safetyLevel="High"
            />

            {/* Safety Disclaimer */}
            <CalloutBlock type="danger" title="CRITICAL STRUCTURAL DISPATCH">
                <p>
                    All shelter construction, load-bearing frames, and roofing schematics are for <strong>general educational reference only</strong>. They do not constitute engineered building designs. Always consult local regulations, codes, and qualified professionals for structural calculations.
                </p>
            </CalloutBlock>

            {/* Sun Path Diagram */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Passive Solar Overhang Design</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Orient structures along the solar axis to maximize free heat and prevent overheating.</p>
                </div>
                <SunPathDiagram />
            </section>

            {/* Site Selection InfoGraphic */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Homestead Site Selection Factors</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Evaluate landscape variables to prevent frost pockets, wind tunnels, or damp rot.</p>
                </div>
                <InfoGraphicCard
                    why="Choosing the right spot determines your solar gain, exposure to storms, and ease of access."
                    how="Verify soil stability, slope angle, and orientation before clearing land."
                    when="Perform audit in all seasons"
                    where="Homestead boundaries"
                    tools={["Clinometer", "Compass", "Soil Probe"]}
                    materials={["Marker stakes", "Surveyor tape"]}
                    mistakes={[
                        "Building in cold low spots (frost pockets).",
                        "Ignoring strong local storm directions.",
                        "Building too far from water access."
                    ]}
                    tips={[
                        "Walk the site during heavy rain to trace water pathways.",
                        "Orient the long axis of the structure within 15 degrees of true South."
                    ]}
                />
            </section>

            {/* Foundation comparisons */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Off-Grid Foundation Types</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Compare load capacity, drainage properties, and frost heave profiles.</p>
                </div>
                <ComparisonTable
                    headers={["Foundation", "Best Use Case", "Difficulty", "Cost Profile", "Frost Action", "Drainage", "Risks"]}
                    rows={foundationRows}
                    keys={["type", "useCase", "difficulty", "cost", "frost", "drainage", "risks"]}
                />
            </section>

            {/* Framing Steps */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Cabin Framing Sequence</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Standard structural progression for non-engineered residential wooden builds.</p>
                </div>
                <StepGuide steps={framingStepsData} />
            </section>

            {/* Insulation Options */}
            <section className="space-y-3">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Insulation Materials Comparison</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Choose building wraps and insulation media based on R-value performance.</p>
                </div>
                <ComparisonTable
                    headers={["Insulation Material", "Thermal R-Value", "Advantages", "Drawbacks & Risks"]}
                    rows={insulationRows}
                    keys={["material", "rValue", "pros", "cons"]}
                />
            </section>

            {/* Build Project Cards */}
            <section className="space-y-4">
                <div className="border-b border-sand-200 pb-2">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Starter Homestead Build Projects</h3>
                    <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Non-structural timber projects to develop carpentry skills.</p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                    {shelterRef.projects.map((proj, idx) => (
                        <BlueprintCard
                            key={idx}
                            title={proj.name}
                            dimensions={proj.time}
                            materials={proj.materials}
                            cuts={[`Difficulty: ${proj.difficulty}`]}
                            instructions={[`Purpose: ${proj.purpose}`, `Safety: ${proj.safety}`]}
                        />
                    ))}
                </div>
            </section>

            {/* Reference Library */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-sand-200 pb-3 gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest pl-1">Shelter Reference Library</h3>
                        <p className="text-xs text-charcoal-500 pl-1 mt-0.5">Detailed manuals and specific winter weatherization guides.</p>
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

export default ShelterLanding;
