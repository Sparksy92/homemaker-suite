import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Soup, Repeat, Calendar, Wrench, Flame, Clock, ChefHat, X, AlertTriangle, BookOpen } from 'lucide-react';

// Import JSON data directly
import subEngineData from '../data/SubstitutionEngine.json';
import pantryCalcData from '../data/PantryCalculator.json';
import mealPlannerData from '../data/MealPlannerWizard.json';
import { useUser } from '../context/UserContext';
// import recipeData from '../data/RecipeDatabase.json';

import MealPlans from './MealPlans';

// Import generic file fetcher (simplified for this view)
const Tools = () => {
    const [activeTab, setActiveTab] = useState('wizard');
    const [recipeData, setRecipeData] = useState({ recipes: [] });
    const [survivalTools, setSurvivalTools] = useState([]);

    // Handle initial tab from hash and listen for changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const validTabs = ['wizard', 'survival', 'pantry', 'sub', 'plans'];
            if (validTabs.includes(hash)) {
                setActiveTab(hash);
            }
        };

        handleHashChange(); // Check on mount
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Fetch recipes and survival tools on mount
    useEffect(() => {
        // Fetch recipes
        fetch('/data/recipes.json')
            .then(res => res.json())
            .then(data => setRecipeData(data))
            .catch(err => console.error('Error fetching recipes:', err));

        // Fetch survival tools
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
            <div className="flex flex-wrap gap-2 mb-6">
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
                {activeTab === 'wizard' && <IngredientWizard key="wizard" recipeData={recipeData} />}
                {activeTab === 'pantry' && <PantryCalculator key="pantry" data={pantryCalcData} />}
                {activeTab === 'sub' && <SubstitutionEngine key="sub" data={subEngineData} />}
                {activeTab === 'survival' && <SurvivalToolsList tools={survivalTools} setActiveToolUrl={setActiveToolUrl} />}
                {activeTab === 'plans' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                        <section>
                            <h2 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calendar size={16} /> Interactive Planner
                            </h2>
                            <MealPlanner data={mealPlannerData} />
                        </section>
                        <section>
                            <h2 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BookOpen size={16} /> Seasonal Guides
                            </h2>
                            <MealPlans />
                        </section>
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
        className={`flex-grow flex items-center justify-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${active
            ? 'bg-sage-600 text-white shadow-lg'
            : 'bg-white text-sage-700 border border-sage-200 hover:bg-sage-50'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

/* ---------------- Sub-Components ---------------- */

const IngredientWizard = ({ recipeData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isCookMode, setIsCookMode] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);

    // Debounce search term to avoid heavy calculations on every keystroke
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setVisibleCount(12); // Reset pagination on search change
        }, 500); // 500ms delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Smart Filter: Multi-ingredient matching
    const cookbookResults = useMemo(() => {
        if (!recipeData || !debouncedSearchTerm) return [];

        const searchTerms = debouncedSearchTerm.toLowerCase().split(',').map(t => t.trim()).filter(t => t !== '');

        return recipeData.recipes.map(recipe => {
            let score = 0;
            const recipeText = [
                recipe.title,
                recipe.category,
                ...(recipe.ingredients || []),
                ...(recipe.tags || [])
            ].join(' ').toLowerCase();

            // Calculate match score
            searchTerms.forEach(term => {
                if (recipeText.includes(term)) score += 1;
            });

            return { ...recipe, score };
        })
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score); // Sort by highest match count first
    }, [recipeData, debouncedSearchTerm]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-sand-200 mb-6">
                <label className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-2 block">I have...</label>
                <input
                    type="text"
                    placeholder="e.g., eggs, rice, chicken"
                    className="w-full bg-sand-50 p-3 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm !== debouncedSearchTerm && (
                    <p className="text-[10px] text-sage-400 mt-2 italic animate-pulse">Searching archives...</p>
                )}
            </div>

            <div className="space-y-6">
                {debouncedSearchTerm && cookbookResults.length === 0 && (
                    <div className="text-center p-8 text-charcoal-light">No recipes found. Try a different ingredient.</div>
                )}

                {/* Cookbook Matches */}
                {cookbookResults.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Flame size={16} /> Recipe Ideas ({cookbookResults.length})
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {cookbookResults.slice(0, visibleCount).map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedRecipe(r)}
                                    className="bg-white p-5 rounded-3xl shadow-sm border border-sand-100 hover:border-terracotta-200 transition-colors text-left group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wide">{r.category}</span>
                                        <span className="text-xs text-sand-500">{r.prep_time}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-sage-800 mb-2 leading-tight group-hover:text-terracotta-700">{r.title}</h3>
                                    <p className="text-sm text-charcoal-light italic mb-3 line-clamp-2">
                                        {r.ingredients.join(', ')}
                                    </p>
                                    <div className="text-sm font-bold text-sage-600 group-hover:text-sage-800 flex items-center justify-between mt-auto">
                                        <span>View Recipe →</span>
                                        {r.score > 1 && (
                                            <span className="bg-sage-100 text-sage-700 px-2 py-0.5 rounded-full text-[10px] uppercase">
                                                {r.score} Matches
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Pagination */}
                        {visibleCount < cookbookResults.length && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-8 py-3 bg-white border border-sand-300 rounded-2xl text-sage-700 font-bold hover:bg-sand-50 hover:border-sand-400 transition-all shadow-sm flex items-center gap-2"
                                >
                                    Load More Recipes
                                    <div className="text-[10px] bg-sand-100 px-2 py-0.5 rounded-full text-sand-500">
                                        {cookbookResults.length - visibleCount} left
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal (Copied from Cookbook) */}
            <AnimatePresence>
                {selectedRecipe && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                            onClick={() => { setSelectedRecipe(null); setIsCookMode(false); }}
                        />
                        <motion.div
                            layoutId={`card-${selectedRecipe.id}`}
                            className={`bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl pointer-events-auto relative flex flex-col ${isCookMode ? 'h-[90vh]' : ''}`}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-sand-100 flex justify-between items-start bg-white sticky top-0 z-10">
                                <div>
                                    <h2 className="text-2xl font-serif font-bold text-sage-900 leading-tight">
                                        {selectedRecipe.title}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-sage-600">
                                        <span className="flex items-center gap-1"><Clock size={14} /> Prep: {selectedRecipe.prep_time}</span>
                                        <span className="flex items-center gap-1"><Flame size={14} /> Cook: {selectedRecipe.cook_time}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedRecipe(null); setIsCookMode(false); }}
                                    className="p-2 bg-sand-100 rounded-full text-sage-600 hover:bg-sand-200"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className={`p-6 space-y-8 ${isCookMode ? 'text-lg' : ''}`}>
                                {selectedRecipe.processing_note && (
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                                        <div className="text-sm text-amber-900 leading-relaxed font-bold">
                                            {selectedRecipe.processing_note}
                                        </div>
                                    </div>
                                )}

                                {/* Toggle Cook Mode */}
                                <div className="flex justify-end sticky top-20 z-0">
                                    <button
                                        onClick={() => setIsCookMode(!isCookMode)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isCookMode ? 'bg-terracotta-600 text-white' : 'bg-sand-100 text-charcoal-600'
                                            }`}
                                    >
                                        <ChefHat size={14} />
                                        {isCookMode ? 'Cook Mode ON' : 'Cook Mode'}
                                    </button>
                                </div>

                                <div>
                                    <h3 className="font-bold text-terracotta-600 uppercase tracking-widest text-sm mb-3 border-b border-sand-200 pb-1">
                                        Ingredients
                                    </h3>
                                    <ul className="space-y-2">
                                        {selectedRecipe.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-sand-300 mt-2 shrink-0" />
                                                <span className={`${isCookMode ? 'text-charcoal-900 font-medium' : 'text-charcoal-700'}`}>
                                                    {ing}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-bold text-terracotta-600 uppercase tracking-widest text-sm mb-3 border-b border-sand-200 pb-1">
                                        Instructions
                                    </h3>
                                    <ol className="space-y-4">
                                        {selectedRecipe.steps.map((step, i) => (
                                            <li key={i} className={`p-4 rounded-xl ${isCookMode ? 'bg-sand-50 border border-sand-200' : ''}`}>
                                                <span className={`${isCookMode ? 'text-charcoal-900 leading-relaxed' : 'text-charcoal-700'}`}>
                                                    {step}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

import { useNavigate } from 'react-router-dom';

const SurvivalToolsList = ({ tools, setActiveToolUrl }) => {
    const navigate = useNavigate();

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid gap-6">
                <div>
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-3">Interactive Guides</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                        <WizardCard
                            title="Emergency Plan Base"
                            desc="Create a comprehensive family plan."
                            onClick={() => navigate('/wizard/emergency-plan')}
                            guideLink="/library"
                        />
                        <WizardCard
                            title="Evacuation Decision"
                            desc="Should I Stay or Should I Go?"
                            onClick={() => navigate('/wizard/evacuation')}
                            guideLink="/library"
                        />
                        <WizardCard
                            title="First Aid Triage"
                            desc="Protocols for Bleeding, Burns, & Cold."
                            onClick={() => navigate('/wizard/first-aid')}
                            guideLink="/library"
                        />
                        <WizardCard
                            title="Water Safety Guide"
                            desc="Identify & treat dubious water sources."
                            onClick={() => navigate('/wizard/water-safety')}
                            guideLink="/library"
                        />
                        <WizardCard
                            title="Winter Blackout Protocol"
                            desc="Immediate actions for freezing power outages."
                            onClick={() => navigate('/wizard/winter-blackout')}
                            guideLink="/library"
                        />
                        <WizardCard
                            title="Garden Planner"
                            desc="Crop scheduling based on your frost date."
                            onClick={() => navigate('/wizard/garden-planner')}
                            guideLink="/library"
                        />
                        <WizardCard
                            title="Home Energy Audit"
                            desc="Calculate off-grid power requirements."
                            onClick={() => navigate('/wizard/energy-planner')}
                            guideLink="/library"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest mb-3">Reference Calculators</h3>
                    <div className="grid gap-3">
                        {tools.map(tool => (
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
                        {tools.length === 0 && <p className="text-center text-sand-500 italic">No tools found.</p>}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const PantryCalculator = ({ data }) => {
    const { sustainability, updatePantryItem, updatePeopleCount } = useUser();
    const [weeks, setWeeks] = useState(2);

    const categories = Object.entries(data.categories);
    const pantry = sustainability.pantry || {};
    const people = sustainability.peopleCount || 4;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Header / Config */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-sand-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-serif font-black text-sage-900 mb-1">Pantry Manager</h2>
                    <p className="text-sm text-sage-500 font-medium">Track your actual supplies vs survival requirements.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="flex-1 md:w-24">
                        <label className="text-[10px] font-black text-sage-400 uppercase tracking-widest block mb-1">People</label>
                        <input
                            type="number"
                            min="1"
                            value={people}
                            onChange={e => updatePeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-sand-50 p-3 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif text-lg font-bold text-sage-800"
                        />
                    </div>
                    <div className="flex-1 md:w-24">
                        <label className="text-[10px] font-black text-sage-400 uppercase tracking-widest block mb-1">Weeks Target</label>
                        <input
                            type="number"
                            min="1"
                            value={weeks}
                            onChange={e => setWeeks(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-sand-50 p-3 rounded-xl border border-sand-200 focus:outline-none focus:border-sage-500 font-serif text-lg font-bold text-sage-800"
                        />
                    </div>
                </div>
            </div>

            {/* Inventory List */}
            <div className="space-y-4">
                {categories.map(([key, cat]) => {
                    const targetLbs = (cat.recommendation_lbs_per_week * people * weeks);
                    const currentStock = pantry[key] || 0;
                    const diff = currentStock - targetLbs;
                    const percent = Math.min(100, Math.max(0, (currentStock / targetLbs) * 100));

                    // Specific logic for water
                    const isWater = key === 'water_filtration';
                    // Note: We handle bulk water separately usually, but we'll stick to food items here mainly

                    const statusColor = diff >= 0 ? 'text-sage-600' : 'text-terracotta-600';
                    const barColor = diff >= 0 ? 'bg-sage-500' : 'bg-terracotta-500';

                    return (
                        <div key={key} className="bg-white p-6 rounded-[2rem] border border-sand-100 shadow-sm overflow-hidden relative">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-sage-800 capitalize text-lg">{key.replace('_', ' ')}</h4>
                                        {diff >= 0 && (
                                            <span className="bg-sage-100 text-sage-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">Stocked</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-charcoal-light font-medium">{cat.items.join(', ')}</p>
                                </div>
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="text-right flex-1 md:flex-none">
                                        <label className="text-[10px] font-black text-sage-400 uppercase tracking-widest block mb-0.5">Current Stock (lbs)</label>
                                        <div className="flex items-center gap-2 justify-end">
                                            <button
                                                onClick={() => updatePantryItem(key, Math.max(0, currentStock - 1))}
                                                className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center hover:bg-sand-200 text-sage-600 transition-colors"
                                            >-</button>
                                            <input
                                                type="number"
                                                value={currentStock}
                                                onChange={(e) => updatePantryItem(key, Math.max(0, parseFloat(e.target.value) || 0))}
                                                className="w-16 bg-transparent text-center font-serif font-black text-xl text-sage-800 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => updatePantryItem(key, currentStock + 1)}
                                                className="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center hover:bg-sand-200 text-sage-600 transition-colors"
                                            >+</button>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[80px]">
                                        <label className="text-[10px] font-black text-sage-400 uppercase tracking-widest block mb-0.5">Target</label>
                                        <span className="text-xl font-serif font-bold text-sand-500">{targetLbs.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-sand-100 rounded-full overflow-hidden mt-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    className={`absolute inset-y-0 left-0 ${barColor}`}
                                />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${statusColor}`}>
                                    {diff >= 0 ? `+${diff.toFixed(1)} lbs Surplus` : `${Math.abs(diff).toFixed(1)} lbs Deficit`}
                                </span>
                                <span className="text-[10px] font-black text-sand-400 uppercase tracking-tighter">
                                    {percent.toFixed(0)}% Prepared
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total Water Insight */}
            <div className="mt-8 p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Calculator className="text-white" size={28} />
                    </div>
                    <div>
                        <h4 className="text-xl font-serif font-bold">Total Water Requirement</h4>
                        <p className="text-blue-100 text-sm">Targeting {weeks} weeks for {people} people</p>
                    </div>
                </div>
                <div className="text-center md:text-right">
                    <span className="text-4xl font-serif font-black block">{people * weeks * 7}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Gallons Required</span>
                </div>
            </div>

            <div className="mt-4 p-4 bg-sage-50 rounded-2xl border border-sage-100 flex items-center gap-3">
                <AlertTriangle className="text-sage-500 shrink-0" size={18} />
                <p className="text-xs text-sage-700 leading-tight">
                    <strong>Smart Tip:</strong> The app automatically syncs your Grains, Proteins, and Sugar stocks to the main "Food Stock" alert on your homepage. Keep your inventory updated for accurate survival predictions.
                </p>
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

const WizardCard = ({ title, desc, onClick, guideLink }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-sand-200 hover:border-terracotta-300 transition-all group flex flex-col justify-between h-full">
            <div onClick={onClick} className="cursor-pointer flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-terracotta-700 group-hover:text-terracotta-600 font-serif text-lg leading-tight">{title}</h3>
                    <span className="text-[10px] bg-terracotta-50 text-terracotta-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Wizard</span>
                </div>
                <p className="text-sm text-charcoal-600 font-medium mb-4">{desc}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-sand-100 mt-2">
                <button
                    onClick={onClick}
                    className="text-xs font-bold text-terracotta-600 hover:text-terracotta-800 transition-colors uppercase tracking-widest"
                >
                    Launch Tool →
                </button>
                {guideLink && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(guideLink);
                        }}
                        className="text-[10px] font-bold text-sage-500 hover:text-sage-700 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                        <BookOpen size={12} /> Deep Dive
                    </button>
                )}
            </div>
        </div>
    );
};

const MealPlanner = ({ data }) => {
    const [weeklyPlan, setWeeklyPlan] = useState(data.template_week);
    const [editingDay, setEditingDay] = useState(null);

    const days = Object.keys(weeklyPlan);

    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-sage-900 font-serif">{data.meta.toolName}</h3>
                        <p className="text-sm text-sage-500">{data.meta.description}</p>
                    </div>
                    <button
                        onClick={() => setWeeklyPlan(data.template_week)}
                        className="text-xs font-bold text-terracotta-600 uppercase tracking-widest hover:text-terracotta-700 transition-colors"
                    >
                        Reset Template
                    </button>
                </div>

                <div className="grid gap-4">
                    {days.map(day => (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-sand-50 rounded-2xl border border-sand-100 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-sand-200 flex items-center justify-center flex-col shrink-0">
                                    <span className="text-[10px] font-black text-sage-400 uppercase leading-none">{day.slice(0, 3)}</span>
                                    <span className="text-lg font-serif font-black text-sage-800 leading-none">
                                        {day === 'Monday' ? '1' : day === 'Tuesday' ? '2' : day === 'Wednesday' ? '3' : day === 'Thursday' ? '4' : day === 'Friday' ? '5' : day === 'Saturday' ? '6' : '7'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sage-900 text-sm">{day}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-widest">{weeklyPlan[day].type}</span>
                                        <span className="text-[10px] text-sage-400">•</span>
                                        <span className="text-[10px] font-bold text-sage-500 uppercase tracking-widest">{weeklyPlan[day].effort} Effort</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-16 sm:ml-0">
                                <input
                                    type="text"
                                    placeholder="Assign meal..."
                                    className="bg-white px-3 py-1.5 rounded-lg border border-sand-200 text-sm focus:outline-none focus:border-sage-500 flex-1 min-w-[200px]"
                                    defaultValue={weeklyPlan[day].meal || ''}
                                    onBlur={(e) => {
                                        const newPlan = { ...weeklyPlan };
                                        newPlan[day] = { ...newPlan[day], meal: e.target.value };
                                        setWeeklyPlan(newPlan);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-4 bg-sage-50 rounded-xl border border-sage-100">
                    <h4 className="text-xs font-black text-sage-600 uppercase tracking-[0.2em] mb-3">Planning Logic</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {Object.entries(data.logic).map(([key, val]) => (
                            <div key={key} className="flex gap-2 items-start text-[11px] text-sage-700 leading-tight">
                                <span className="text-terracotta-500 font-bold shrink-0">{key.replace('step', '')}.</span>
                                <span className="font-medium">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;
