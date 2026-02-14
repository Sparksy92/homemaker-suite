import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Soup, Repeat, Calendar, Wrench } from 'lucide-react';

// Import JSON data directly
import ingredientWizardData from '../data/IngredientWizard.json';
import subEngineData from '../data/SubstitutionEngine.json';
import pantryCalcData from '../data/PantryCalculator.json';

import MealPlans from './MealPlans';

// Import generic file fetcher (simplified for this view)
const Tools = () => {
    const [activeTab, setActiveTab] = useState('wizard');
    const [survivalTools, setSurvivalTools] = useState([]);

    // Fetch survival tools on mount
    React.useEffect(() => {
        fetch('/library_index.json')
            .then(res => res.json())
            .then(data => {
                const tools = data["50 Interactive Tools"] || [];
                setSurvivalTools(tools);
            });
    }, []);

    const [activeToolUrl, setActiveToolUrl] = useState(null);

    return (
        <div className="p-6 min-h-screen pb-24">
            <h1 className="text-3xl mb-6 font-serif text-sage-900">Toolkit</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                <TabButton
                    active={activeTab === 'wizard'}
                    onClick={() => setActiveTab('wizard')}
                    icon={<Soup size={18} />}
                    label="Chef"
                />
                <TabButton
                    active={activeTab === 'survival'}
                    onClick={() => setActiveTab('survival')}
                    icon={<Wrench size={18} />}
                    label="Survival"
                />
                <TabButton
                    active={activeTab === 'pantry'}
                    onClick={() => setActiveTab('pantry')}
                    icon={<Calculator size={18} />}
                    label="Pantry"
                />
                <TabButton
                    active={activeTab === 'sub'}
                    onClick={() => setActiveTab('sub')}
                    icon={<Repeat size={18} />}
                    label="Subs"
                />
                <TabButton
                    active={activeTab === 'plans'}
                    onClick={() => setActiveTab('plans')}
                    icon={<Calendar size={18} />}
                    label="Plans"
                />
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'wizard' && <IngredientWizard key="wizard" data={ingredientWizardData} />}
                {activeTab === 'pantry' && <PantryCalculator key="pantry" data={pantryCalcData} />}
                {activeTab === 'sub' && <SubstitutionEngine key="sub" data={subEngineData} />}
                {activeTab === 'survival' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="grid gap-6">
                            {/* New: Survival Guides Section */}
                            <div>
                                <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-3">Interactive Guides</h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <WizardCard
                                        title="Evacuation Decision"
                                        desc="Should I Stay or Should I Go?"
                                        onClick={() => window.location.href = '/#/wizard/evacuation'}
                                    />
                                    <WizardCard
                                        title="First Aid Triage"
                                        desc="Protocols for Bleeding, Burns, & Cold."
                                        onClick={() => window.location.href = '/#/wizard/first-aid'}
                                    />
                                    <WizardCard
                                        title="Water Safety Guide"
                                        desc="Identify & treat dubious water sources."
                                        onClick={() => window.location.href = '/#/wizard/water-safety'}
                                    />
                                    <WizardCard
                                        title="Winter Blackout Protocol"
                                        desc="Immediate actions for freezing power outages."
                                        onClick={() => window.location.href = '/#/wizard/winter-blackout'}
                                    />
                                    <WizardCard
                                        title="Garden Planner"
                                        desc="Crop scheduling based on your frost date."
                                        onClick={() => window.location.href = '/#/wizard/garden-planner'}
                                    />
                                    <WizardCard
                                        title="Home Energy Audit"
                                        desc="Calculate off-grid power requirements."
                                        onClick={() => window.location.href = '/#/wizard/energy-planner'}
                                    />
                                </div>
                            </div>

                            {/* Existing: Reference Tools Section */}
                            <div>
                                <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-3">Reference Calculators</h3>
                                <div className="grid gap-3">
                                    {survivalTools.map(tool => (
                                        <button
                                            key={tool}
                                            onClick={() => setActiveToolUrl(`/content/50 Interactive Tools/${tool}`)}
                                            className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 text-left hover:border-terracotta-300 transition-all group flex items-center justify-between"
                                        >
                                            <div>
                                                <h3 className="font-serif font-bold text-sage-800 group-hover:text-terracotta-600 transition-colors">
                                                    {tool.replace('50.', '').replace(/\d+\s/, '').replace('.html', '')}
                                                </h3>
                                                <p className="text-xs text-charcoal-light mt-0.5">Offline HTML Utility</p>
                                            </div>
                                            <span className="text-sand-400 group-hover:text-terracotta-500">→</span>
                                        </button>
                                    ))}
                                    {survivalTools.length === 0 && <p className="text-center text-sand-500 italic">No tools found.</p>}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {activeTab === 'plans' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <MealPlans />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tool Modal */}
            {activeToolUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl overflow-hidden flex flex-col relative">
                        <div className="p-4 bg-sage-50 border-b border-sand-200 flex justify-between items-center">
                            <h2 className="font-bold text-sage-800">Tool Viewer</h2>
                            <button onClick={() => setActiveToolUrl(null)} className="p-2 hover:bg-sage-200 rounded-full">✕</button>
                        </div>
                        <iframe
                            src={activeToolUrl}
                            className="flex-1 w-full border-0"
                            title="Tool"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${active
            ? 'bg-sage-600 text-white shadow-lg'
            : 'bg-white text-sage-700 border border-sage-200 hover:bg-sage-50'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

/* ---------------- Sub-Components ---------------- */

const IngredientWizard = ({ data }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Simple filter logic
    const results = data.database.filter(r =>
        r.base.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.recipe.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-sand-200 mb-4">
                <label className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-2 block">I have...</label>
                <input
                    type="text"
                    placeholder="e.g., eggs, rice, chicken"
                    className="w-full bg-sand-50 p-3 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {searchTerm && results.length === 0 && (
                    <div className="text-center p-8 text-charcoal-light">No recipes found. Try a different ingredient.</div>
                )}
                {results.map((r, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-sand-100">
                        <h3 className="text-xl font-bold text-sage-800 mb-2">{r.recipe}</h3>
                        <p className="text-sm text-charcoal-light italic mb-3">{r.method}</p>
                        <div className="flex flex-wrap gap-2">
                            {r.base.map(b => <span key={b} className="bg-sage-50 text-sage-700 px-2 py-1 rounded-md text-xs">{b}</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

const PantryCalculator = ({ data }) => {
    const [people, setPeople] = useState(4);
    const [weeks, setWeeks] = useState(2);

    const categories = Object.entries(data.categories);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-200 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-sage-600 uppercase tracking-widest">People</label>
                        <input type="number" value={people} onChange={e => setPeople(e.target.value)} className="w-full text-3xl font-serif text-sage-900 border-b border-sand-200 focus:outline-none py-2" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-sage-600 uppercase tracking-widest">Weeks</label>
                        <input type="number" value={weeks} onChange={e => setWeeks(e.target.value)} className="w-full text-3xl font-serif text-sage-900 border-b border-sand-200 focus:outline-none py-2" />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {categories.map(([key, cat]) => {
                    const totalLbs = (cat.recommendation_lbs_per_week * people * weeks).toFixed(1);
                    return (
                        <div key={key} className="flex justify-between items-center bg-sand-50 p-4 rounded-2xl">
                            <div>
                                <h4 className="font-bold text-sage-800 capitalize">{key.replace('_', ' ')}</h4>
                                <p className="text-xs text-charcoal-light">{cat.items.slice(0, 3).join(', ')}...</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-serif font-bold text-terracotta-600">{totalLbs}</span>
                                <span className="text-xs text-terracotta-400 block">lbs total</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm text-center">
                Water Needed: <strong>{people * weeks * 7} Gallons</strong>
            </div>
        </motion.div>
    );
};

const SubstitutionEngine = ({ data }) => {
    const subCategories = Object.keys(data.substitutions);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {subCategories.map(cat => (
                <div key={cat} className="mb-8">
                    <h3 className="text-lg font-bold text-sage-900 mb-4 capitalize border-b border-sand-300 pb-2">{cat}</h3>
                    <div className="space-y-3">
                        {Object.entries(data.substitutions[cat]).map(([item, subs]) => (
                            <div key={item} className="bg-white p-4 rounded-xl border border-sand-100">
                                <h4 className="font-bold text-terracotta-600 mb-2 capitalize">{item.replace(/_/g, ' ')}</h4>
                                <ul className="text-sm space-y-1 text-charcoal">
                                    {Object.values(subs).map((s, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-sage-400">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

const WizardCard = ({ title, desc, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 text-left hover:border-terracotta-300 hover:shadow-md transition-all group"
    >
        <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-terracotta-700 group-hover:text-terracotta-600">{title}</h3>
            <span className="text-xs bg-terracotta-50 text-terracotta-700 px-2 py-0.5 rounded-full">Wizard</span>
        </div>
        <p className="text-sm text-charcoal-600">{desc}</p>
    </button>
);

export default Tools;
