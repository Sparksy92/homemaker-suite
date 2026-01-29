import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, ChevronRight, ArrowLeft } from 'lucide-react';

const Library = () => {
    const [currentPath, setCurrentPath] = useState([]);
    const [fileContent, setFileContent] = useState(null);
    const [structure, setStructure] = useState({});

    // Hardcoded structure since we can't scan filesystem from browser easily
    // In a real app, we'd generate a manifest.json during build.
    // For now, I will populate the top level structure manually based on our knowledge.

    // NOTE: This structure matches what we copied to /public/content
    const fileSystem = {
        "0 Foundations": ["0.1 Welcome.md", "0.2 Philosophy.md", "0.3 Tools & Equipment.md", "0.4 Kitchen Setup.md", "0.5 Food Safety.md"],
        "1 Pantry Systems": ["1.1 Homemaker Pantry.md", "1.2 Long Term Storage.md", "1.3 Budget Grocery Framework.md", "1.4 Ingredient Substitutions.md", "1.5 Shelf Life Guide.md"],
        "2 Cooking Basics": ["2.1 Knife Skills.md", "2.2 How to Read Recipes.md", "2.3 Heat & Doneness.md", "2.4 Flavor Balancing.md", "2.5 Limited Ingredients.md", "2.6 One Pot Cooking.md"],
        "3 Recipes": ["3.1 Breakfasts.md", "3.2 Soups & Stews.md", "3.3 Main Dishes.md", "3.4 Breads & Grains.md", "3.5 Sauces & Condiments.md"],
        "4 Preservation": ["4.1 Water Bath Canning.md", "4.2 Pressure Canning.md", "4.3 Dehydrating.md", "4.4 Fermentation.md", "4.5 Root Cellaring.md"],
        "5 Gardening": ["5.1 Garden Planning.md", "5.2 Soil Health.md", "5.3 Seed Starting.md", "5.4 Composting.md", "5.5 Pest Management.md"],
        "6 Home Maintenance": ["6.1 Cleaning Chemistry.md", "6.2 Basic Repairs.md"],
        "7 Budget & Lifestyle": ["7.1 The Envelope System.md", "7.2 Frugal Living.md"],
        "8 Nutrition": ["8.1 Nutrition 101.md"],
        "9 Seasonal Guides": ["9.1 Spring.md", "9.2 Summer.md", "9.3 Autumn.md", "9.4 Winter.md"],
        "11 Printables": ["CleaningChecklists.md", "EmergencyReference.md", "GardenPlanner.md", "MealPlanner.md", "PantryInventory.md"]
    };

    const handleFileClick = async (fileName) => {
        try {
            const folder = currentPath[0];
            const response = await fetch(`/content/${folder}/${fileName}`);
            const text = await response.text();
            setFileContent({ name: fileName, text });
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-sand-50">
            <AnimatePresence mode="wait">
                {/* View 1: Root Folders */}
                {currentPath.length === 0 && !fileContent && (
                    <motion.div
                        key="root"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="p-6 pb-24"
                    >
                        <h1 className="text-3xl mb-6 font-serif text-sage-900">Library</h1>
                        <div className="grid gap-3">
                            {Object.keys(fileSystem).map((folder) => (
                                <button
                                    key={folder}
                                    onClick={() => setCurrentPath([folder])}
                                    className="flex items-center justify-between p-4 bg-white rounded-2xl border border-sand-200 shadow-sm active:scale-95 transition-transform"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-sage-100 p-2 rounded-full text-sage-700">
                                            <Folder size={20} />
                                        </div>
                                        <span className="font-medium text-charcoal">{folder}</span>
                                    </div>
                                    <ChevronRight size={18} className="text-sand-400" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* View 2: Folder Contents */}
                {currentPath.length > 0 && !fileContent && (
                    <motion.div
                        key="folder"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="p-6 pb-24"
                    >
                        <button
                            onClick={() => setCurrentPath([])}
                            className="flex items-center gap-1 text-sage-600 text-sm font-bold mb-6 hover:underline"
                        >
                            <ArrowLeft size={16} /> Back to Library
                        </button>
                        <h2 className="text-2xl mb-4 font-serif text-sage-900">{currentPath[0]}</h2>
                        <div className="grid gap-2">
                            {fileSystem[currentPath[0]].map((file) => (
                                <button
                                    key={file}
                                    onClick={() => handleFileClick(file)}
                                    className="flex items-center gap-3 p-4 bg-white rounded-xl border border-sand-100 shadow-sm text-left active:scale-95 transition-transform"
                                >
                                    <FileText size={18} className="text-terracotta-500 shrink-0" />
                                    <span className="text-charcoal-light text-sm font-medium">{file.replace('.md', '')}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* View 3: File Viewer */}
                {fileContent && (
                    <motion.div
                        key="file"
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 bg-white z-50 flex flex-col"
                    >
                        <div className="p-4 border-b border-sand-200 flex justify-between items-center bg-sand-50">
                            <button
                                onClick={() => setFileContent(null)}
                                className="p-2 bg-white rounded-full border border-sand-300 shadow-sm"
                            >
                                <ArrowLeft size={20} className="text-sage-700" />
                            </button>
                            <span className="font-bold text-sage-900 truncate max-w-[200px]">{fileContent.name.replace('.md', '')}</span>
                            <div className="w-10"></div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 prose prose-sage prose-headings:font-serif prose-p:text-charcoal-light prose-a:text-terracotta-500 pb-24">
                            {/* Simple Markdown Renderer (using pre-wrap for now to keep it lightweight) */}
                            {/* In a real app, I'd use react-markdown. For now, we simulate the look. */}
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed font-normal text-justify">
                                {fileContent.text}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Library;
