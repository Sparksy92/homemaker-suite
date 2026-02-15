import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, ChevronRight, ArrowLeft, Heart, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';

// Helper to clean display names
const getDisplayName = (name) => {
    // Removes leading "0 ", "1 ", "0.1 " etc, and .md extension
    if (!name) return '';
    return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
};

// Categorization for better organization
const LIBRARY_CATEGORIES = [
    {
        id: 'foundations',
        name: "Foundations & Lifestyle",
        folders: ["0 Foundations", "7 Budget & Lifestyle", "8 Nutrition", "11 Printables"]
    },
    {
        id: 'culinary',
        name: "Culinary & Pantry",
        folders: ["1 Pantry Systems", "2 Cooking Basics", "3 Recipes", "4 Food Storage & Pantry", "4 Preservation"]
    },
    {
        id: 'production',
        name: "Food Production",
        folders: ["5 Gardening", "12 Foraging & Wildcrafting", "13 Meat & Protein Security"]
    },
    {
        id: 'homestead',
        name: "The Homestead",
        folders: ["6 Home Maintenance", "15 Infrastructure", "16 Tools & Workshop", "17 Shelter & Weatherproofing", "18 Energy & Lighting", "20 Textiles & Clothing"]
    },
    {
        id: 'preparedness',
        name: "Preparedness & Seasonal",
        folders: ["14 Health & First Aid", "19 Navigation & Awareness", "21 Scenario Playbooks", "9 Seasonal Guides", "99 Reference Library"]
    }
];

const Library = ({ type = 'all' }) => {
    const [currentPath, setCurrentPath] = useState([]);
    const [viewMode, setViewMode] = useState('modules'); // 'modules' or 'reference'
    const [fileContent, setFileContent] = useState(null);
    const [fileSystem, setFileSystem] = useState({});
    const [loading, setLoading] = useState(true);
    const { recordAccess } = useUser();

    // Fetch the dynamic index on mount
    React.useEffect(() => {
        fetch('/library_index.json')
            .then(res => res.json())
            .then(data => {
                setFileSystem(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load library index:", err);
                setLoading(false);
            });
    }, []);

    // Offline Mode Logic (Cache Storage API)
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isOfflineReady, setIsOfflineReady] = useState(false);

    // Check if offline cache is populated
    React.useEffect(() => {
        caches.has('homemaker-v1').then(hasCache => {
            if (hasCache) {
                // Ideally check file count, but for now cache existence is a good proxy
                caches.open('homemaker-v1').then(cache => {
                    cache.keys().then(keys => {
                        if (keys.length > 50) setIsOfflineReady(true);
                    });
                });
            }
        });
    }, []);

    const handleDownloadAll = async () => {
        setDownloading(true);
        setDownloadProgress(0);

        try {
            const cache = await caches.open('homemaker-v1');
            const allItems = allFiles;
            let completed = 0;

            // Batch requests to avoid choking the network
            const BATCH_SIZE = 5;
            for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
                const batch = allItems.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (item) => {
                    const url = `/content/${item.folder}/${item.file}`;
                    // Skip if already cached
                    const match = await cache.match(url);
                    if (!match) {
                        try {
                            await cache.add(url);
                        } catch (e) {
                            console.error(`Failed to cache ${url}`, e);
                        }
                    }
                }));

                completed += batch.length;
                setDownloadProgress(Math.min(100, Math.round((completed / allItems.length) * 100)));
            }

            setIsOfflineReady(true);
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setDownloading(false);
        }
    };

    const handleFileClick = async (fileName) => {
        try {
            const folder = currentPath[0];
            const url = `/content/${folder}/${fileName}`;
            let contentState = { name: fileName, text: '', url: url };

            const isBinary = fileName.endsWith('.pdf') || fileName.endsWith('.mp4') || fileName.endsWith('.html');

            // 1. Try Cache API first (Offline First strategy)
            const cache = await caches.open('homemaker-v1');
            const cachedResponse = await cache.match(url);

            if (cachedResponse) {
                if (isBinary) {
                    const blob = await cachedResponse.blob();
                    contentState.url = URL.createObjectURL(blob);
                } else {
                    contentState.text = await cachedResponse.text();
                }
            } else {
                // 2. Fallback to Network
                if (isBinary) {
                    // Binary handling
                } else {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("Network response was not ok");
                    contentState.text = await response.text();
                }
            }

            // Record this visit
            recordAccess({
                id: fileName,
                title: getDisplayName(fileName),
                folder: folder,
                type: isBinary ? 'tool' : 'guide',
                url: url
            });

            setFileContent(contentState);
        } catch (e) {
            console.error("Error reading file:", e);
            alert("Could not load guide. Are you offline?");
        }
    };





    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Flatten all files for searching
    const allFiles = React.useMemo(() => {
        let files = [];
        Object.keys(fileSystem).forEach(folder => {
            fileSystem[folder].forEach(file => {
                files.push({ file, folder });
            });
        });
        return files;
    }, [fileSystem]);

    // Filtered results
    const searchResults = allFiles.filter(item =>
        getDisplayName(item.file).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getDisplayName(item.folder).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-sand-50">
            <AnimatePresence mode="wait">
                {/* View 1: Root Folders OR Search Results */}
                {currentPath.length === 0 && !fileContent && (
                    <motion.div
                        key="root"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="p-4 md:p-6 pb-24 max-w-4xl mx-auto w-full"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 border-b border-sand-200 pb-6 gap-4">
                            <h1 className="text-4xl md:text-5xl font-serif text-sage-900">
                                {type === 'guides' ? 'Guides' : type === 'reference' ? 'Reference' : 'Library'}
                            </h1>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80 min-w-0">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-full border border-sand-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 bg-white shadow-sm outline-none transition-all font-serif text-base"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadAll}
                                    disabled={downloading || isOfflineReady}
                                    className={`p-3 rounded-full transition-all shadow-sm flex-shrink-0 relative overflow-hidden ${isOfflineReady ? 'bg-sage-100 text-sage-600' : 'bg-white border border-sand-300 text-sand-500 hover:border-terracotta-400 hover:text-terracotta-500'}`}
                                    title={isOfflineReady ? "Library Downloaded" : "Download for Offline Use"}
                                >
                                    {downloading ? (
                                        <span className="text-xs font-bold text-terracotta-600">{downloadProgress}%</span>
                                    ) : isOfflineReady ? (
                                        <CheckCircle size={20} />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                    )}

                                    {/* Progress Background */}
                                    {downloading && (
                                        <div
                                            className="absolute bottom-0 left-0 h-1 bg-terracotta-400 transition-all duration-300"
                                            style={{ width: `${downloadProgress}%` }}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Filter Categories based on Type */}
                        {searchQuery ? (
                            <div className="grid gap-3">
                                {searchResults.length > 0 ? (
                                    <>
                                        <p className="text-sand-500 font-medium mb-2 uppercase tracking-wider text-sm">Found {searchResults.length} results</p>
                                        {searchResults.map((item) => (
                                            <div key={item.file} className="relative group">
                                                <button
                                                    onClick={() => {
                                                        setCurrentPath([item.folder]);
                                                        handleFileClick(item.file);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-sand-100 shadow-sm hover:shadow-md hover:border-terracotta-200 text-left transition-all"
                                                >
                                                    <div className="p-2 bg-sage-50 rounded-lg text-sage-500 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="block text-base font-serif text-charcoal group-hover:text-terracotta-700 transition-colors truncate">{getDisplayName(item.file)}</span>
                                                        <span className="text-xs text-sand-500 uppercase tracking-wide truncate block">{getDisplayName(item.folder)}</span>
                                                    </div>
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center py-12 text-sand-500 italic">
                                        No guides found matching "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {LIBRARY_CATEGORIES.map(category => {
                                    // Filter folders in this category that match the 'type' (guides vs reference)
                                    const categoryFolders = category.folders.filter(folderName => {
                                        if (!fileSystem[folderName]) return false;
                                        const num = parseInt(folderName.split(' ')[0]);
                                        if (type === 'guides') return num < 40;
                                        if (type === 'reference') return num >= 40 && num < 50 || num >= 90;
                                        return true;
                                    });

                                    if (categoryFolders.length === 0) return null;

                                    return (
                                        <div key={category.id} className="space-y-4">
                                            <h3 className="text-sm font-bold text-sage-600 uppercase tracking-[0.2em] border-b border-sand-200 pb-2 ml-1">
                                                {category.name}
                                            </h3>
                                            <div className="grid gap-4">
                                                {categoryFolders.map(folder => (
                                                    <button
                                                        key={folder}
                                                        onClick={() => setCurrentPath([folder])}
                                                        className="group flex flex-row items-center p-4 bg-white rounded-2xl border border-sand-200 shadow-sm hover:shadow-md hover:border-sage-300 transition-all text-left gap-4"
                                                    >
                                                        <div className="bg-sage-50 p-3 rounded-xl text-sage-600 group-hover:bg-sage-600 group-hover:text-white transition-colors shrink-0">
                                                            <Folder size={24} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-serif text-xl text-charcoal group-hover:text-sage-900 truncate pr-2">{getDisplayName(folder)}</span>
                                                                <ChevronRight size={18} className="text-sand-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                                            </div>
                                                            <span className="text-xs text-sand-500 mt-1 font-medium uppercase tracking-wider block">{fileSystem[folder].length} Items</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Fallback for any folders not categorized (Safety Net) */}
                                {(() => {
                                    const categorizedFolders = new Set(LIBRARY_CATEGORIES.flatMap(c => c.folders));
                                    const uncategorizedFolders = Object.keys(fileSystem).filter(f => !categorizedFolders.has(f) && f !== "50 Interactive Tools");

                                    if (uncategorizedFolders.length === 0) return null;

                                    return (
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-sand-400 uppercase tracking-widest border-b border-sand-200 pb-2 ml-1">
                                                Other Modules
                                            </h3>
                                            <div className="grid gap-4">
                                                {uncategorizedFolders.map(folder => (
                                                    <button
                                                        key={folder}
                                                        onClick={() => setCurrentPath([folder])}
                                                        className="group flex flex-row items-center p-4 bg-white rounded-2xl border border-sand-200 shadow-sm hover:shadow-md hover:border-sage-300 transition-all text-left gap-4"
                                                    >
                                                        <div className="bg-sand-50 p-3 rounded-xl text-sand-400 group-hover:bg-sand-400 group-hover:text-white transition-colors shrink-0">
                                                            <Folder size={24} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-serif text-xl text-charcoal group-hover:text-sage-900 truncate pr-2">{getDisplayName(folder)}</span>
                                                            <span className="text-xs text-sand-500 mt-1 font-medium uppercase tracking-wider block">{fileSystem[folder].length} Items</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* View 2: Folder Contents */}
                {currentPath.length > 0 && !fileContent && (
                    <motion.div
                        key="folder"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="p-4 pb-24 max-w-5xl mx-auto w-full"
                    >
                        <button
                            onClick={() => setCurrentPath([])}
                            className="flex items-center gap-2 text-sage-600 font-bold mb-8 hover:text-sage-800 transition-colors bg-white px-4 py-2 rounded-full shadow-sm w-fit"
                        >
                            <ArrowLeft size={18} /> Back to Library
                        </button>
                        <h2 className="text-4xl mb-8 font-serif text-sage-900">{getDisplayName(currentPath[0])}</h2>

                        <FolderContentList
                            files={fileSystem[currentPath[0]]}
                            folder={currentPath[0]}
                            handleFileClick={handleFileClick}
                        />

                    </motion.div>
                )}

                {/* View 3: File Viewer (Rich UI) */}
                {fileContent && (
                    <motion.div
                        key="file"
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 bg-sand-50 z-50 flex flex-col"
                    >
                        {/* Header Bar */}
                        <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-sand-200 flex justify-between items-center sticky top-0 z-10">
                            <button
                                onClick={() => setFileContent(null)}
                                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-sand-300 hover:bg-sand-50 transition-colors shadow-sm text-sage-700 font-medium"
                            >
                                <ArrowLeft size={18} /> Back
                            </button>

                            <h1 className="font-serif font-bold text-xl text-sage-900 truncate max-w-md hidden md:block">
                                {getDisplayName(fileContent.name)}
                            </h1>

                            <FavoriteButton
                                item={{ id: fileContent.name, title: getDisplayName(fileContent.name), category: currentPath[0] }}
                            />
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto bg-sand-50">
                            <div className="max-w-5xl mx-auto h-full flex flex-col">
                                {fileContent.name.endsWith('.pdf') ? (
                                    <div className="flex-1 p-4 h-full">
                                        {/* Object Tag is reliable for PDF display */}
                                        <object
                                            data={fileContent.url} // We need the URL, not text content for binaries
                                            type="application/pdf"
                                            className="w-full h-full min-h-[80vh] rounded-xl shadow-md border border-sand-200"
                                        >
                                            <div className="flex flex-col items-center justify-center h-full text-sand-500 gap-4">
                                                <p>Your browser strongly loves nature but struggles with this PDF.</p>
                                                <a href={fileContent.url} download className="px-6 py-3 bg-sage-600 text-white rounded-full font-bold">Download PDF</a>
                                            </div>
                                        </object>
                                    </div>
                                ) : fileContent.name.endsWith('.mp4') ? (
                                    <div className="flex-1 p-4 flex items-center justify-center min-h-[50vh]">
                                        <div className="w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-xl">
                                            <video controls className="w-full">
                                                <source src={fileContent.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                ) : fileContent.name.endsWith('.html') ? (
                                    <div className="flex-1 h-full min-h-[85vh]">
                                        <iframe
                                            src={fileContent.url}
                                            className="w-full h-full border-0 bg-white"
                                            title="Interactive Tool"
                                            sandbox="allow-scripts allow-same-origin allow-forms"
                                        />
                                    </div>
                                ) : (
                                    // Default Markdown View
                                    <div className="px-6 py-12 pb-32">
                                        <article className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-sand-100 max-w-3xl mx-auto">
                                            <MarkdownRenderer content={fileContent.text} />
                                        </article>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
};

// Extracted for pagination
const FolderContentList = ({ files, folder, handleFileClick }) => {
    const [visibleCount, setVisibleCount] = useState(20);
    const navigate = useNavigate();

    // Topic-Aware Linkages
    const relatedContent = React.useMemo(() => {
        const folderSlug = folder.toLowerCase();
        const related = {
            scenarios: [],
            wizards: []
        };

        if (folderSlug.includes('water')) {
            related.scenarios.push({ id: 'scenario-water', title: 'Water Contamination Playbook', link: '/manual/scenario-water' });
            related.wizards.push({ id: 'water-safety', title: 'Water Safety Wizard', link: '/wizard/water-safety' });
        }
        if (folderSlug.includes('food')) {
            related.scenarios.push({ id: 'scenario-budget', title: '30-Day Budget Survival', link: '/manual/scenario-budget' });
            related.scenarios.push({ id: 'scenario-supply', title: '3-Month Supply Plan', link: '/manual/scenario-supply' });
        }
        if (folderSlug.includes('seasonal') || folderSlug.includes('winter')) {
            related.scenarios.push({ id: 'scenario-winter', title: '72-Hour Winter Outage', link: '/manual/scenario-winter' });
            related.scenarios.push({ id: 'scenario-storm', title: 'Severe Winter Storm Playbook', link: '/manual/scenario-storm' });
            related.wizards.push({ id: 'winter-blackout', title: 'Winter Blackout Protocol', link: '/wizard/winter-blackout' });
        }
        if (folderSlug.includes('gardening')) {
            related.wizards.push({ id: 'garden-planner', title: 'Garden Crop Scheduler', link: '/wizard/garden-planner' });
        }
        if (folderSlug.includes('energy')) {
            related.wizards.push({ id: 'energy-planner', title: 'Home Energy Audit', link: '/wizard/energy-planner' });
        }
        if (folderSlug.includes('medical')) {
            related.wizards.push({ id: 'first-aid', title: 'First Aid Triage', link: '/wizard/first-aid' });
        }

        return related;
    }, [folder]);

    // Reset when folder changes
    React.useEffect(() => {
        setVisibleCount(20);
    }, [folder]);

    const visibleFiles = files.slice(0, visibleCount);
    const hasMore = visibleCount < files.length;

    return (
        <div className="space-y-8">
            <div className="grid gap-3">
                <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest pl-1">Educational Guides</h3>
                {visibleFiles.map((file) => (
                    <div key={file} className="relative group">
                        <button
                            onClick={() => handleFileClick(file)}
                            className="w-full flex items-center gap-4 p-5 bg-white rounded-xl border border-sand-100 shadow-sm hover:shadow-md hover:border-terracotta-200 text-left transition-all"
                        >
                            <div className="p-2 bg-terracotta-50 rounded-lg text-terracotta-500">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <span className="block text-lg font-serif text-charcoal group-hover:text-terracotta-700 transition-colors">{getDisplayName(file)}</span>
                            </div>
                        </button>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FavoriteButton
                                item={{ id: file, title: getDisplayName(file), category: folder }}
                            />
                        </div>
                    </div>
                ))}

                {hasMore && (
                    <button
                        onClick={() => setVisibleCount(prev => prev + 20)}
                        className="w-full py-4 bg-sand-100 text-sand-500 font-bold rounded-xl hover:bg-sand-200 transition-colors mt-4"
                    >
                        Load More ({files.length - visibleCount} remaining)
                    </button>
                )}
            </div>

            {/* Related Tools & Scenarios */}
            {(relatedContent.scenarios.length > 0 || relatedContent.wizards.length > 0) && (
                <div className="mt-12 space-y-6">
                    <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest border-b border-sand-200 pb-2">Topic Integration: Scenarios & Tools</h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {relatedContent.scenarios.map(scenario => (
                            <Link to={scenario.link} key={scenario.id} className="block group">
                                <div className="bg-sage-50 p-4 rounded-2xl border border-sage-100 shadow-sm group-hover:bg-sage-100 transition-all flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full text-sage-600 shadow-sm">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <span className="font-bold text-sage-900 text-sm leading-tight">{scenario.title}</span>
                                </div>
                            </Link>
                        ))}
                        {relatedContent.wizards.map(wizard => (
                            <Link to={wizard.link} key={wizard.id} className="block group">
                                <div className="bg-terracotta-50 p-4 rounded-2xl border border-terracotta-100 shadow-sm group-hover:bg-terracotta-100 transition-all flex items-center gap-3">
                                    <div className="bg-white p-2 rounded-full text-terracotta-600 shadow-sm">
                                        <Info size={18} />
                                    </div>
                                    <span className="font-bold text-terracotta-900 text-sm leading-tight">{wizard.title}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Extracted for cleaner usage
const FavoriteButton = ({ item }) => {
    const { isFavorite, toggleFavorite } = useUser();
    const active = isFavorite(item.id);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(item);
            }}
            className={`p-3 rounded-full transition-all duration-300 ${active ? 'bg-terracotta-50 text-terracotta-500 scale-110' : 'bg-white text-sand-400 hover:text-terracotta-400 hover:bg-sand-50'}`}
        >
            <Heart size={20} fill={active ? "currentColor" : "none"} />
        </button>
    );
};

export default Library;
