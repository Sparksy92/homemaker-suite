import React, { useState, useMemo } from 'react';
import { Search, Clock, ChefHat, X, Flame, Leaf, Wheat, Database, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import recipeData from '../data/RecipeDatabase.json';

const Cookbook = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isCookMode, setIsCookMode] = useState(false);

    const categories = ['All', 'Pantry Staples', 'Baking', 'Preservation', 'Wild Game'];

    const filteredRecipes = useMemo(() => {
        return recipeData.recipes.filter(recipe => {
            const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = activeCategory === 'All' || recipe.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, activeCategory]);

    const getCategoryIcon = (cat) => {
        switch (cat) {
            case 'Baking': return <Wheat size={16} />;
            case 'Preservation': return <Database size={16} />;
            case 'Wild Game': return <Leaf size={16} />;
            case 'Pantry Staples': return <Utensils size={16} />;
            default: return <ChefHat size={16} />;
        }
    };

    return (
        <div className="bg-sand-50 min-h-full pb-20">
            {/* Header */}
            <div className="bg-white p-6 sticky top-0 z-10 shadow-sm border-b border-sand-200">
                <h1 className="text-3xl font-serif font-bold text-sage-900 mb-4">The Cookbook</h1>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-sand-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search recipes, ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-sand-50 border border-sand-200 rounded-xl focus:ring-2 focus:ring-terracotta-500 outline-none transition-all"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeCategory === cat
                                    ? 'bg-sage-600 text-white border-sage-600'
                                    : 'bg-white text-sage-600 border-sand-200 hover:bg-sand-50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="p-4 grid gap-4 md:grid-cols-2">
                {filteredRecipes.map(recipe => (
                    <motion.button
                        layoutId={`card-${recipe.id}`}
                        key={recipe.id}
                        onClick={() => setSelectedRecipe(recipe)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 text-left hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-600 flex items-center gap-1">
                                {getCategoryIcon(recipe.category)}
                                {recipe.category}
                            </span>
                            <span className="text-xs text-sand-500 flex items-center gap-1">
                                <Clock size={12} />
                                {recipe.prep_time}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-charcoal-900 mb-1 group-hover:text-terracotta-700 transition-colors">
                            {recipe.title}
                        </h3>
                        <p className="text-sm text-charcoal-500 line-clamp-2">
                            {recipe.ingredients.slice(0, 3).join(', ')}...
                        </p>
                    </motion.button>
                ))}
            </div>

            {/* Detail Modal */}
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
        </div>
    );
};

export default Cookbook;
