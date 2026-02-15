import React, { useState, useMemo, useEffect } from 'react';
import { Search, Clock, ChefHat, X, Flame, Leaf, Wheat, Database, Utensils, Star, Filter, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Remove static import
// import recipeData from '../data/RecipeDatabase.json';

const Cookbook = () => {
    const [recipeData, setRecipeData] = useState({ recipes: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSubCategory, setActiveSubCategory] = useState('All');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isCookMode, setIsCookMode] = useState(false);
    const [visibleCount, setVisibleCount] = useState(12);
    const [survivalOnly, setSurvivalOnly] = useState(false);

    const categories = ['All', 'Survival Recipes', "Grandma's Favorites", "Grandma's Alchemy", 'Pantry Staples', 'Breakfast', 'Soups & Stews', 'Dinner', 'Baking', 'Preservation', 'Sauces', 'Wild Game', 'Wild Edibles'];

    const subCategoryMap = {
        'Wild Game': ['All', 'Small Game', 'Upland Birds', 'Waterfowl', 'Big Game'],
        'Wild Edibles': ['All', 'Foraged', 'Medicinal', 'Beverages'],
        'Grandma\'s Alchemy': ['All', 'Antimicrobial', 'Immunity', 'Topical'],
        'Baking': ['All', 'Bread', 'Pastry', 'Survival'],
        'Preservation': ['All', 'Canning', 'Fermenting', 'Drying'],
        'Pantry Staples': ['All', 'Staples', 'Quick Meals']
    };

    // Fetch recipes from public folder
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('/data/recipes.json');
                const data = await response.json();
                setRecipeData(data);
            } catch (error) {
                console.error('Error loading recipes:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipes();
    }, []);

    // Reset sub-category and pagination when main category changes
    useEffect(() => {
        setActiveSubCategory('All');
        setVisibleCount(12);
    }, [activeCategory]);

    // Reset pagination when search changes
    useEffect(() => {
        setVisibleCount(12);
    }, [searchTerm]);

    const filteredRecipes = useMemo(() => {
        if (!recipeData.recipes) return [];
        return recipeData.recipes.filter(recipe => {
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase())) ||
                recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesCategory = activeCategory === 'All' ||
                (activeCategory === 'Survival Recipes' ? (recipe.tags?.includes('survival') || recipe.tags?.includes('grid-down')) : recipe.category === activeCategory);

            const matchesSurvivalToggle = !survivalOnly || (recipe.tags?.includes('survival') || recipe.tags?.includes('grid-down'));

            let matchesSub = true;
            if (activeSubCategory !== 'All') {
                const subTag = activeSubCategory.toLowerCase().replace(' ', '-');
                matchesSub = recipe.tags?.includes(subTag) ||
                    recipe.primary_protein?.toLowerCase() === activeSubCategory.toLowerCase();
            }

            return matchesSearch && matchesCategory && matchesSub && matchesSurvivalToggle;
        });
    }, [recipeData, searchTerm, activeCategory, activeSubCategory, survivalOnly]);

    const visibleRecipes = filteredRecipes.slice(0, visibleCount);

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Baking': return <Wheat size={16} />;
            case 'Preservation': return <Database size={16} />;
            case 'Wild Game': return <Leaf size={16} />;
            case 'Wild Edibles': return <Leaf size={16} className="text-green-600" />;
            case 'Pantry Staples': return <Utensils size={16} />;
            case "Grandma's Favorites": return <Flame size={16} />;
            case 'Breakfast': return <Utensils size={16} />;
            case 'Soups & Stews': return <ChefHat size={16} />;
            case 'Dinner': return <Utensils size={16} />;
            default: return <ChefHat size={16} />;
        }
    };

    const renderDifficulty = (level) => {
        if (!level) return null;
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                    <Star
                        key={i}
                        size={10}
                        className={i <= level ? 'fill-terracotta-500 text-terracotta-500' : 'text-sand-300'}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-sand-50 min-h-full pb-20">
            {/* Header */}
            <div className="bg-white p-6 sticky top-0 z-10 shadow-sm border-b border-sand-200">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-serif font-bold text-sage-900">The Cookbook</h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSurvivalOnly(!survivalOnly)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${survivalOnly
                                ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-md ring-4 ring-terracotta-100'
                                : 'bg-white text-sand-400 border-sand-200 hover:border-sand-300'
                                }`}
                        >
                            <Flame size={12} className={survivalOnly ? 'animate-pulse' : ''} />
                            Grid-Down Only
                        </button>
                        <div className="text-xs font-bold text-sage-400 uppercase tracking-tighter">
                            {filteredRecipes.length} Recipes
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-3.5 text-sand-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, ingredient, or tag (e.g. partridge)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-sand-50 border border-sand-200 rounded-2xl focus:ring-2 focus:ring-sage-500 outline-none transition-all placeholder:text-sand-400 shadow-inner"
                    />
                </div>

                {/* Main Categories */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${activeCategory === cat
                                ? 'bg-sage-700 text-white border-sage-700 shadow-md transform scale-105'
                                : 'bg-white text-sage-600 border-sand-200 hover:bg-sand-100 hover:border-sand-300 shadow-sm'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Sub Categories (Dynamic) */}
                <AnimatePresence mode="wait">
                    {subCategoryMap[activeCategory] && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-wrap gap-1.5 pt-1 border-t border-sand-100 mt-2"
                        >
                            <span className="text-[10px] font-bold text-sand-400 uppercase flex items-center mr-1">
                                <Filter size={10} className="mr-1" /> Refine:
                            </span>
                            {subCategoryMap[activeCategory].map(sub => (
                                <button
                                    key={sub}
                                    onClick={() => setActiveSubCategory(sub)}
                                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${activeSubCategory === sub
                                        ? 'bg-terracotta-100 text-terracotta-700'
                                        : 'bg-sand-50 text-sand-500 hover:bg-sand-100'
                                        }`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="py-20 text-center">
                    <div className="w-12 h-12 border-4 border-sage-100 border-t-sage-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sage-500 font-medium">Loading homestead secrets...</p>
                </div>
            )}

            {/* Grid */}
            {!loading && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mx-auto">
                    {visibleRecipes.map(recipe => (
                        <motion.button
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layoutId={`card-${recipe.id}`}
                            key={recipe.id}
                            onClick={() => setSelectedRecipe(recipe)}
                            className="bg-white p-5 rounded-3xl shadow-sm border border-sand-100 text-left hover:shadow-xl transition-all group relative overflow-hidden flex flex-col h-full w-full"
                        >
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform translate-x-4 -translate-y-4">
                                {getCategoryIcon(recipe.category)}
                            </div>

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-sage-500 flex items-center gap-1">
                                        {getCategoryIcon(recipe.category)}
                                        {recipe.category}
                                    </span>
                                    {renderDifficulty(recipe.difficulty)}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[10px] font-bold text-sand-500 bg-sand-50 px-2 py-1 rounded-full flex items-center gap-1">
                                        <Clock size={10} />
                                        {recipe.prep_time}
                                    </span>
                                    {recipe.survival_rating && (
                                        <div className="flex gap-0.5 opacity-60">
                                            {[...Array(recipe.survival_rating)].map((_, i) => (
                                                <Flame key={i} size={8} className="text-terracotta-500 fill-terracotta-500" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-charcoal-900 mb-1 font-serif group-hover:text-sage-700 transition-colors leading-tight">
                                    {recipe.title}
                                </h3>
                                {recipe.primary_protein && (
                                    <span className="text-[10px] bg-terracotta-50 text-terracotta-600 px-2 py-0.5 rounded font-bold mb-2 inline-block capitalize">
                                        {recipe.primary_protein}
                                    </span>
                                )}
                                <p className="text-xs text-charcoal-400 line-clamp-2 mt-2 leading-relaxed italic">
                                    {recipe.ingredients.slice(0, 4).join(', ')}...
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-sand-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest flex items-center gap-1">
                                    View Recipe <ArrowRight size={10} />
                                </span>
                                <div className="flex gap-1">
                                    {recipe.tags?.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[9px] text-sand-400 bg-sand-50 px-1.5 py-0.5 rounded">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredRecipes.length === 0 && (
                <div className="py-20 px-6 text-center">
                    <div className="w-16 h-16 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sand-400">
                        <Search size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-sage-800">No recipes found</h3>
                    <p className="text-sage-500 text-sm max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
            )}

            {/* Load More */}
            {visibleCount < filteredRecipes.length && (
                <div className="p-8 flex justify-center">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 12)}
                        className="px-8 py-3 bg-white border border-sand-300 rounded-2xl text-sage-700 font-bold hover:bg-sand-50 hover:border-sand-400 transition-all shadow-sm flex items-center gap-2"
                    >
                        Load More Recipes
                        <div className="text-[10px] bg-sand-100 px-2 py-0.5 rounded-full text-sand-500">
                            {filteredRecipes.length - visibleCount} left
                        </div>
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedRecipe && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
                            onClick={() => { setSelectedRecipe(null); setIsCookMode(false); }}
                        />
                        <motion.div
                            layoutId={`card-${selectedRecipe.id}`}
                            className={`bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl pointer-events-auto relative flex flex-col ${isCookMode ? 'h-[90vh]' : ''}`}
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-sand-100 flex justify-between items-start bg-white sticky top-0 z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-tighter text-terracotta-600 bg-terracotta-50 px-2 py-1 rounded">
                                            {selectedRecipe.category}
                                        </span>
                                        {renderDifficulty(selectedRecipe.difficulty)}
                                    </div>
                                    <h2 className="text-3xl font-serif font-bold text-sage-900 leading-tight">
                                        {selectedRecipe.title}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-sage-600 font-medium">
                                        <span className="flex items-center gap-1.5 bg-sand-50 px-3 py-1 rounded-lg">
                                            <Clock size={16} className="text-sage-400" /> Prep: {selectedRecipe.prep_time}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-sand-50 px-3 py-1 rounded-lg">
                                            <Flame size={16} className="text-sage-400" /> Cook: {selectedRecipe.cook_time}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedRecipe(null); setIsCookMode(false); }}
                                    className="p-3 bg-sand-100 rounded-2xl text-sage-600 hover:bg-sand-200 transition-colors shadow-inner"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className={`p-8 space-y-10 ${isCookMode ? 'text-xl' : ''}`}>
                                {/* Toggle Cook Mode */}
                                <div className="flex justify-between items-center sticky top-24 z-0 bg-white/50 backdrop-blur-sm py-2 rounded-xl">
                                    <div className="flex gap-2">
                                        {selectedRecipe.tags?.map(tag => (
                                            <span key={tag} className="text-[10px] font-bold text-sage-400 bg-sand-50 px-2 py-1 rounded-md">#{tag}</span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setIsCookMode(!isCookMode)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-sm ${isCookMode ? 'bg-terracotta-600 text-white ring-4 ring-terracotta-100' : 'bg-sand-100 text-charcoal-600 border border-sand-200 hover:bg-white'
                                            }`}
                                    >
                                        <ChefHat size={16} />
                                        {isCookMode ? 'Cook Mode ON' : 'Cook Mode'}
                                    </button>
                                </div>

                                <div className="grid sm:grid-cols-5 gap-8">
                                    <div className="sm:col-span-2">
                                        <h3 className="font-black text-sage-800 uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center">
                                            <span className="w-4 h-0.5 bg-terracotta-500 inline-block mr-2" />
                                            Ingredients
                                        </h3>
                                        <ul className="space-y-3">
                                            {selectedRecipe.ingredients.map((ing, i) => (
                                                <li key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-sand-50 transition-colors">
                                                    <div className="w-5 h-5 rounded-full bg-sand-100 border border-sand-200 flex items-center justify-center mt-0.5 shrink-0 text-[10px] font-bold text-sand-500">
                                                        {i + 1}
                                                    </div>
                                                    <span className={`${isCookMode ? 'text-charcoal-900 font-bold' : 'text-charcoal-700 font-medium'}`}>
                                                        {ing}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <h3 className="font-black text-sage-800 uppercase tracking-[0.2em] text-[10px] mb-4 flex items-center">
                                            <span className="w-4 h-0.5 bg-terracotta-500 inline-block mr-2" />
                                            Instructions
                                        </h3>
                                        <ol className="space-y-6">
                                            {selectedRecipe.steps.map((step, i) => (
                                                <li key={i} className={`p-6 rounded-3xl transition-all ${isCookMode ? 'bg-sand-50 border-2 border-sage-100 shadow-sm' : 'bg-white border border-sand-100'}`}>
                                                    <div className="text-[10px] font-black text-terracotta-500 mb-2 uppercase tracking-widest">Step {i + 1}</div>
                                                    <span className={`${isCookMode ? 'text-charcoal-900 leading-relaxed font-bold' : 'text-charcoal-700 leading-relaxed font-medium'}`}>
                                                        {step}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>

                                {selectedRecipe.source && (
                                    <div className="mt-12 pt-8 border-t border-sand-100 text-center italic text-sage-400 text-sm">
                                        Source: {selectedRecipe.source}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Cookbook;
