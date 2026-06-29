import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, ChevronRight, ArrowLeft, Heart, AlertCircle, Info, CheckCircle, AlertTriangle, BookOpen, Droplets, Utensils, Sprout, Zap, ShieldCheck, ShieldAlert, Thermometer, Compass, Scissors, LayoutGrid, Timer, BarChart3, Home, Archive, Wrench, Activity } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { GardeningLanding, WaterLanding, EnergyLanding, ShelterLanding, PreservationLanding, HealthSanitationLanding, ToolsRepairLanding } from '../components/visual-guides';
import HomesteadOnboarding from '../components/onboarding/HomesteadOnboarding';

// Helper to clean display names
const getDisplayName = (name) => {
    // Removes leading "0 ", "1 ", "0.1 " etc, and .md extension
    if (!name) return '';
    return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
};

// Categorization for better organization (modernized homestead taxonomy)
const LIBRARY_CATEGORIES = [
    {
        id: 'foundations',
        name: "01 Foundations",
        folders: ["0 Foundations", "7 Budget & Lifestyle", "8 Nutrition", "11 Printables"],
        icon: <BookOpen size={18} />,
        color: "bg-blue-500"
    },
    {
        id: 'shelter',
        name: "02 Shelter & Construction",
        folders: ["17 Shelter & Weatherproofing", "6 Home Maintenance"],
        icon: <Home size={18} />,
        color: "bg-stone-500"
    },
    {
        id: 'water',
        name: "03 Water Systems",
        folders: ["15 Infrastructure"],
        icon: <Droplets size={18} />,
        color: "bg-cyan-500"
    },
    {
        id: 'energy',
        name: "04 Energy & Electricity",
        folders: ["18 Energy & Lighting"],
        icon: <Zap size={18} />,
        color: "bg-yellow-500"
    },
    {
        id: 'gardening',
        name: "05 Gardening & Soil",
        folders: ["5 Gardening"],
        icon: <Sprout size={18} />,
        color: "bg-lime-600"
    },
    {
        id: 'food_production',
        name: "06 Food Production",
        folders: ["13 Meat & Protein Security"],
        icon: <Utensils size={18} />,
        color: "bg-emerald-600"
    },
    {
        id: 'preservation',
        name: "07 Food Preservation & Pantry",
        folders: ["1 Pantry Systems", "2 Cooking Basics", "3 Recipes", "4 Food Storage & Pantry", "4 Preservation"],
        icon: <Archive size={18} />,
        color: "bg-amber-600"
    },
    {
        id: 'wildlife',
        name: "08 Wildlife, Foraging & Living Off Land",
        folders: ["12 Foraging & Wildcrafting", "19 Navigation & Awareness"],
        icon: <Compass size={18} />,
        color: "bg-orange-500"
    },
    {
        id: 'medical',
        name: "09 Health, Sanitation & Medical",
        folders: ["14 Health & First Aid"],
        icon: <Activity size={18} />,
        color: "bg-red-500"
    },
    {
        id: 'tools',
        name: "10 Tools, Workshop & Repair",
        folders: ["16 Tools & Workshop", "10 Tools & Wizards", "50 Interactive Tools"],
        icon: <Wrench size={18} />,
        color: "bg-slate-600"
    },
    {
        id: 'seasonal',
        name: "11 Seasonal Planning",
        folders: ["9 Seasonal Guides"],
        icon: <Timer size={18} />,
        color: "bg-indigo-500"
    },
    {
        id: 'scenarios',
        name: "12 Scenario Playbooks",
        folders: ["21 Scenario Playbooks", "99 Reference Library"],
        icon: <ShieldCheck size={18} />,
        color: "bg-neutral-800"
    }
];

const Library = ({ type = 'all' }) => {
    const navigate = useNavigate();
    const [currentPath, setCurrentPath] = useState([]);
    const [viewMode, setViewMode] = useState('modules'); // 'modules' or 'reference'
    const [fileContent, setFileContent] = useState(null);
    const [fileSystem, setFileSystem] = useState({});
    const [loading, setLoading] = useState(true);
    const { recordAccess, sustainability, readinessScore, readinessBreakdown, lastAccessedItem, homesteadProfile, readGuides } = useUser();
    const [guidesMetadata, setGuidesMetadata] = useState([]);
    const [showOnboarding, setShowOnboarding] = useState(false);

    React.useEffect(() => {
        if (homesteadProfile === null) {
            setShowOnboarding(true);
        }
    }, [homesteadProfile]);

    // Clean up old homemaker-v1 cache on mount if it exists
    React.useEffect(() => {
        caches.has('homemaker-v1').then(hasOld => {
            if (hasOld) caches.delete('homemaker-v1');
        });
    }, []);

    // Fetch the dynamic index and metadata on mount with caching
    React.useEffect(() => {
        const loadCacheAndFetch = async () => {
            try {
                const cache = await caches.open('homemaker-v2');

                // Try loading from Cache API first for instant offline access
                const cachedIndex = await cache.match('/library_index.json');
                if (cachedIndex) {
                    const data = await cachedIndex.json();
                    setFileSystem(data);
                }

                const cachedMeta = await cache.match('/guides_metadata.json');
                if (cachedMeta) {
                    const data = await cachedMeta.json();
                    setGuidesMetadata(data);
                }

                // Fetch fresh data from network and update cache in background
                const indexRes = await fetch('/library_index.json');
                if (indexRes.ok) {
                    const indexClone = indexRes.clone();
                    const data = await indexRes.json();
                    setFileSystem(data);
                    await cache.put('/library_index.json', indexClone);
                }

                const metaRes = await fetch('/guides_metadata.json');
                if (metaRes.ok) {
                    const metaClone = metaRes.clone();
                    const data = await metaRes.json();
                    setGuidesMetadata(data);
                    await cache.put('/guides_metadata.json', metaClone);
                }
            } catch (err) {
                console.error("Failed to load library files/metadata:", err);
            } finally {
                setLoading(false);
            }
        };

        loadCacheAndFetch();
    }, []);

    // Deep linking helper
    const location = useLocation();
    React.useEffect(() => {
        if (Object.keys(fileSystem).length === 0) return;

        const params = new URLSearchParams(location.search);
        const folderParam = params.get('folder');
        const fileParam = params.get('file');

        if (folderParam && fileParam) {
            setCurrentPath([folderParam]);
            handleFileClick(fileParam, folderParam);
        } else if (!folderParam && !fileParam) {
            // Reset to root categories if no parameters are present (e.g. clicked Guides tab)
            setCurrentPath([]);
            setFileContent(null);
        }
    }, [location.search, fileSystem]);

    // Offline Mode Logic (Cache Storage API)
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showSafetyAck, setShowSafetyAck] = useState(null); // { file, folder }

    // Files that require explicit safety acknowledgment
    const LETHAL_RISK_FILES = [
        "12.3 Mushroom Safety.md",
        "13.2 Salting and Smoking.md",
        "15.1 Water Procurement.md",
        "14.1 Herbal Medicine.md",
        "4.2 Pressure Canning.md",
        "15.7 Bio-Sand Filtration.md"
    ];
    const [isOfflineReady, setIsOfflineReady] = useState(false);

    // Check if offline cache is populated
    React.useEffect(() => {
        caches.has('homemaker-v2').then(hasCache => {
            if (hasCache) {
                caches.open('homemaker-v2').then(cache => {
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
            const cache = await caches.open('homemaker-v2');
            
            // Precache core offline files
            const coreAssets = [
                '/library_index.json',
                '/guides_metadata.json',
                '/images/botany/chamomile.jpg',
                '/images/botany/self_heal.jpg',
                '/images/wildlife/cricket.jpg',
                '/images/wildlife/cicada.jpg'
            ];
            for (const asset of coreAssets) {
                try {
                    await cache.add(asset);
                } catch (err) {
                    console.warn(`Could not cache asset ${asset}:`, err);
                }
            }

            const allItems = allFiles;
            let completed = 0;

            // Batch requests to avoid choking the network
            const BATCH_SIZE = 5;
            for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
                const batch = allItems.slice(i, i + BATCH_SIZE);
                await Promise.all(batch.map(async (item) => {
                    const url = `/content/${encodeURIComponent(item.folder)}/${encodeURIComponent(item.file)}`;
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

    const handleFileClick = async (fileName, folderOverride = null) => {
        const folder = folderOverride || currentPath[0];
        if (LETHAL_RISK_FILES.includes(fileName) && !sessionStorage.getItem(`safety_ack_${fileName}`)) {
            setShowSafetyAck({ file: fileName, folder: folder });
            return;
        }

        try {
            const url = `/content/${encodeURIComponent(folder)}/${encodeURIComponent(fileName)}`;
            let contentState = { name: fileName, text: '', url: url };

            const isBinary = fileName.endsWith('.pdf') || fileName.endsWith('.mp4') || fileName.endsWith('.html');

            // 1. Try Cache API first (Offline First strategy)
            const cache = await caches.open('homemaker-v2');
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
                    // Binary handling - for now, just set the URL directly for iframe/object
                    contentState.url = url;
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

    const confirmSafetyAck = async () => {
        if (showSafetyAck) {
            sessionStorage.setItem(`safety_ack_${showSafetyAck.file}`, 'true');
            const { file, folder } = showSafetyAck;
            setShowSafetyAck(null);

            // Re-trigger handleFileClick to load the file now that ack is confirmed
            await handleFileClick(file, folder);
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
    // Smart Discovery Logic
    const recommendedGuides = React.useMemo(() => {
        const recs = [];

        // 0. Onboarding recommendation
        if (!homesteadProfile) {
            recs.push({ 
                title: 'Homestead Profile Setup', 
                folder: 'onboarding', 
                file: 'setup', 
                reason: 'Start Here',
                desc: 'Set up your off-grid profile for personalized guides.' 
            });
        } else if (homesteadProfile.skipped) {
            recs.push({ 
                title: 'Complete Homestead Profile', 
                folder: 'onboarding', 
                file: 'setup', 
                reason: 'Profile Incomplete',
                desc: 'Fill out your household profile to enable accurate metrics.' 
            });
        }

        // 1. Water Systems (Water score low < 50)
        if (readinessBreakdown && readinessBreakdown.water < 50) {
            recs.push({ 
                title: 'Water Procurement', 
                folder: '15 Infrastructure', 
                file: '15.1 Water Procurement.md', 
                reason: 'Water Storage Low',
                desc: 'Review catchment calculations and storage sizing.'
            });
            recs.push({
                title: 'Bio-Sand Filtration',
                folder: '15 Infrastructure',
                file: '15.7 Bio-Sand Filtration.md',
                reason: 'Water Safety Critical',
                desc: 'Build a biological sand filter column.'
            });
        }

        // 2. Food & Pantry (Food score low < 50)
        if (readinessBreakdown && readinessBreakdown.food < 50) {
            recs.push({ 
                title: 'Long Term Storage', 
                folder: '1 Pantry Systems', 
                file: '1.2 Long Term Storage.md', 
                reason: 'Food Reserves Low',
                desc: 'Store shelf-stable calories safely.'
            });
            recs.push({
                title: 'Pressure Canning',
                folder: '4 Preservation',
                file: '4.2 Pressure Canning.md',
                reason: 'Preservation Critical',
                desc: 'Learn low-acid canning guidelines to prevent botulism.'
            });
        }

        // 3. Gardening & Soil (Garden score low < 50)
        if (readinessBreakdown && readinessBreakdown.garden < 50) {
            recs.push({ 
                title: 'Soil Health', 
                folder: '5 Gardening', 
                file: '5.2 Soil Health.md', 
                reason: 'Garden Vitality Low',
                desc: 'Amend organic soils and compost correct layers.'
            });
            recs.push({
                title: 'Garden Planning',
                folder: '5 Gardening',
                file: '5.1 Garden Planning.md',
                reason: 'Crop Scheduling',
                desc: 'Plan sowing zones and frost dates.'
            });
        }

        // 4. Energy & Lighting (Energy score low < 50)
        if (readinessBreakdown && readinessBreakdown.energy < 50) {
            recs.push({ 
                title: 'Solar & Passive Energy', 
                folder: '18 Energy & Lighting', 
                file: '18.2 Solar & Passive Energy.md', 
                reason: 'Energy Autonomy Low',
                desc: 'Build solar cookers and passive heating thermal mass.'
            });
        }

        // 5. Unread Starter Guides
        const starterGuides = [
            { title: 'Home Maintenance', folder: '6 Home Maintenance', file: '6.1 Basic Repairs.md' },
            { title: 'First Aid Basics', folder: '14 Health & First Aid', file: '14.1 Herbal Medicine.md' }
        ];
        starterGuides.forEach(guide => {
            if (readGuides && !readGuides.includes(guide.file) && recs.length < 4) {
                recs.push({
                    title: guide.title,
                    folder: guide.folder,
                    file: guide.file,
                    reason: 'Unread Foundation',
                    desc: 'Review essential homestead repair and medicine.'
                });
            }
        });

        return recs.slice(0, 4);
    }, [readinessBreakdown, homesteadProfile, readGuides]);

    const searchResults = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return [];

        if (guidesMetadata && guidesMetadata.length > 0) {
            return guidesMetadata.filter(item => {
                const titleMatch = item.title.toLowerCase().includes(query);
                const categoryMatch = item.category.toLowerCase().includes(query);
                const tagMatch = item.tags.some(tag => tag.toLowerCase().includes(query));
                const filenameMatch = item.path.toLowerCase().includes(query);
                return titleMatch || categoryMatch || tagMatch || filenameMatch;
            }).map(item => {
                const parts = item.path.split('/');
                const file = parts[parts.length - 1];
                return { file, folder: item.category, metadata: item };
            });
        }

        return allFiles.filter(item =>
            getDisplayName(item.file).toLowerCase().includes(query) ||
            getDisplayName(item.folder).toLowerCase().includes(query)
        );
    }, [searchQuery, guidesMetadata, allFiles]);

    const [activeFilter, setActiveFilter] = useState('all');

    const getFilteredGuides = React.useMemo(() => {
        return () => {
            if (!guidesMetadata || guidesMetadata.length === 0) return [];
            
            return guidesMetadata.filter(item => {
                const tags = item.tags || [];
                const fileName = item.path.split('/').pop() || '';
                
                if (activeFilter === 'visual') {
                    return item.category === '5 Gardening' || item.category === '15 Infrastructure' || item.category === '18 Energy & Lighting' || tags.includes('visual') || item.type === 'visual';
                }
                if (activeFilter === 'safety') {
                    return LETHAL_RISK_FILES.includes(fileName) || tags.includes('safety') || item.safety === 'High' || item.safetyLevel === 'High';
                }
                if (activeFilter === 'seasonal') {
                    return item.category === '9 Seasonal Guides' || tags.includes('seasonal') || tags.includes('season') || item.seasonalContext !== undefined;
                }
                if (activeFilter === 'start') {
                    return tags.includes('beginner') || tags.includes('foundations') || tags.includes('basics') || item.difficulty === 'Easy';
                }
                if (activeFilter === 'build') {
                    return tags.includes('build') || tags.includes('construction') || tags.includes('project') || item.category === '17 Shelter & Weatherproofing' || item.category === '16 Tools & Workshop';
                }
                return true;
            }).map(item => {
                const parts = item.path.split('/');
                const file = parts[parts.length - 1];
                return { file, folder: item.category, tags: item.tags, metadata: item };
            });
        };
    }, [activeFilter, guidesMetadata]);

    return (
        <div className="min-h-screen bg-sand-50">
            <AnimatePresence mode="wait">
                {/* View 1: Root Categories */}
                {currentPath.length === 0 && !fileContent && (
                    <motion.div
                        key="root"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="p-4 md:p-6 pb-24 max-w-6xl mx-auto w-full"
                    >
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-8 border-b border-sand-200 gap-6">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-sage-500 uppercase tracking-[0.3em]">Knowledge Hub</span>
                                <h1 className="text-5xl font-serif font-black text-sage-900 tracking-tight">Library</h1>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative w-full md:w-80 overflow-hidden">
                                    <input
                                        type="text"
                                        placeholder="Search across all modules..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 rounded-2xl border border-sand-200 focus:border-sage-500 focus:ring-0 bg-white shadow-sm outline-none transition-all font-serif text-lg text-sage-800 placeholder:text-sand-300"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadAll}
                                    disabled={downloading || isOfflineReady}
                                    className={`p-4 rounded-2xl transition-all shadow-sm flex-shrink-0 relative overflow-hidden ${isOfflineReady ? 'bg-sage-100 text-sage-600' : 'bg-white border border-sand-200 text-sand-400 hover:border-terracotta-400 hover:text-terracotta-500'}`}
                                >
                                    {downloading ? <span className="text-xs font-black">{downloadProgress}%</span> : isOfflineReady ? <CheckCircle size={22} /> : <Droplets size={22} />}
                                    {downloading && <div className="absolute bottom-0 left-0 h-1 bg-terracotta-500 transition-all duration-300" style={{ width: `${downloadProgress}%` }} />}
                                </button>
                            </div>
                        </div>

                        {/* Smart Recommendations */}
                        {recommendedGuides.length > 0 && !searchQuery && (
                            <section className="mb-12">
                                <h3 className="text-[10px] font-black text-sage-400 uppercase tracking-widest mb-4">Recommended For You</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {recommendedGuides.map((rec, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (rec.folder === 'onboarding') {
                                                    setShowOnboarding(true);
                                                } else {
                                                    setCurrentPath([rec.folder]);
                                                    handleFileClick(rec.file, rec.folder);
                                                }
                                            }}
                                            className="group bg-terracotta-600 p-5 rounded-[2rem] text-white shadow-xl shadow-terracotta-200/50 hover:bg-terracotta-700 transition-all text-left flex items-start gap-4"
                                        >
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-80">{rec.reason}</span>
                                                <h4 className="font-serif font-black text-lg block leading-tight">{rec.title}</h4>
                                                {rec.desc && <p className="text-[10px] text-white/80 font-medium leading-relaxed mt-1">{rec.desc}</p>}
                                                <div className="flex items-center gap-1 mt-2 opacity-70">
                                                    <BookOpen size={10} />
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">View Guide</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Discovery Filters */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar scroll-smooth w-full">
                            {['all', 'visual', 'safety', 'seasonal', 'start', 'build'].map(filter => {
                                const labels = {
                                    all: 'All Categories',
                                    visual: 'Visual Guides',
                                    safety: 'Safety Critical',
                                    seasonal: 'Seasonal Planning',
                                    start: 'Start Here',
                                    build: 'Build Projects'
                                };
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => {
                                            setActiveFilter(filter);
                                            setSearchQuery('');
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${filter === activeFilter ? 'bg-sage-600 text-white border-sage-600 shadow-sm' : 'bg-white border-sand-200 text-sage-800 hover:bg-sand-50'}`}
                                    >
                                        {labels[filter]}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search & Filter Feed */}
                        {searchQuery ? (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-sage-600 uppercase tracking-widest">Found {searchResults.length} matches</h3>
                                <div className="grid gap-3">
                                    {searchResults.map((item) => (
                                        <button
                                            key={item.file}
                                            onClick={() => {
                                                setCurrentPath([item.folder]);
                                                handleFileClick(item.file, item.folder);
                                            }}
                                            className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-sand-100 shadow-sm hover:shadow-md hover:border-terracotta-200 transition-all text-left"
                                        >
                                            <div className="p-3 bg-sage-50 rounded-2xl text-sage-500"><FileText size={20} /></div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-lg font-serif font-black text-sage-900 truncate">{getDisplayName(item.file)}</span>
                                                <span className="text-[10px] text-sand-400 font-black uppercase tracking-widest block mt-0.5">{getDisplayName(item.folder)}</span>
                                                {item.metadata && item.metadata.tags && item.metadata.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {item.metadata.tags.map(tag => (
                                                            <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded-md border border-sage-100">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight size={18} className="text-sand-300" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : activeFilter !== 'all' ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-sand-200 pb-2">
                                    <h3 className="text-xs font-black text-sage-500 uppercase tracking-[0.2em]">
                                        Filtered Results ({getFilteredGuides().length})
                                    </h3>
                                    <button onClick={() => setActiveFilter('all')} className="text-xs font-black uppercase tracking-widest text-terracotta-600 hover:text-terracotta-800 transition-colors">
                                        Clear Filter
                                    </button>
                                </div>
                                <div className="grid gap-3">
                                    {getFilteredGuides().map((item) => (
                                        <button
                                            key={item.file}
                                            onClick={() => {
                                                setCurrentPath([item.folder]);
                                                handleFileClick(item.file, item.folder);
                                            }}
                                            className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-sand-100 shadow-sm hover:shadow-md hover:border-terracotta-200 transition-all text-left"
                                        >
                                            <div className="p-3 bg-sage-50 rounded-2xl text-sage-500"><FileText size={20} /></div>
                                            <div className="flex-1 min-w-0">
                                                <span className="block text-lg font-serif font-black text-sage-900 truncate">{getDisplayName(item.file)}</span>
                                                <span className="text-[10px] text-sand-400 font-black uppercase tracking-widest block mt-0.5">{getDisplayName(item.folder)}</span>
                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                                        {item.tags.map(tag => (
                                                            <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded-md border border-sage-100">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <ChevronRight size={18} className="text-sand-300" />
                                        </button>
                                    ))}
                                    {getFilteredGuides().length === 0 && (
                                        <div className="text-center py-12 text-sand-400 text-xs font-medium">
                                            No matching resources found offline.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Category Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {LIBRARY_CATEGORIES.map(category => (
                                    <div key={category.id} className="space-y-4 group">
                                        <div className="flex items-center gap-3 px-1">
                                            <div className={`p-2 rounded-lg text-white ${category.color} shadow-sm`}>{category.icon}</div>
                                            <h3 className="text-xs font-black text-sage-600 uppercase tracking-widest">{category.name}</h3>
                                        </div>

                                        <div className="space-y-3">
                                            {category.folders.map(folder => {
                                                if (!fileSystem[folder]) return null;
                                                return (
                                                    <button
                                                        key={folder}
                                                        onClick={() => setCurrentPath([folder])}
                                                        className="w-full group/card flex items-center justify-between p-5 bg-white rounded-3xl border border-sand-200 shadow-sm hover:shadow-xl hover:shadow-sage-900/5 hover:border-sage-400 transition-all text-left"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-serif text-lg font-black text-sage-900 block truncate leading-tight group-hover/card:text-sage-700">{getDisplayName(folder)}</span>
                                                            <span className="text-[10px] font-black text-sand-400 uppercase tracking-widest block mt-1">{fileSystem[folder].length} Resources</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-sand-50 flex items-center justify-center text-sand-300 group-hover/card:bg-sage-600 group-hover/card:text-white transition-all">
                                                            <ChevronRight size={16} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Other Modules Fallback */}
                                {(() => {
                                    const categorizedFolders = new Set(LIBRARY_CATEGORIES.flatMap(c => c.folders));
                                    const uncategorizedFolders = Object.keys(fileSystem).filter(f => !categorizedFolders.has(f) && f !== "50 Interactive Tools");

                                    if (uncategorizedFolders.length === 0) return null;

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 px-1">
                                                <div className="p-2 rounded-lg text-white bg-sand-400 shadow-sm"><LayoutGrid size={18} /></div>
                                                <h3 className="text-xs font-black text-sage-600 uppercase tracking-widest">Other Modules</h3>
                                            </div>
                                            <div className="grid gap-3">
                                                {uncategorizedFolders.map(folder => (
                                                    <button
                                                        key={folder}
                                                        onClick={() => setCurrentPath([folder])}
                                                        className="w-full group/card flex items-center justify-between p-5 bg-white rounded-3xl border border-sand-200 shadow-sm hover:shadow-xl hover:shadow-sage-900/5 hover:border-sage-400 transition-all text-left"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-serif text-lg font-black text-sage-900 block truncate leading-tight group-hover/card:text-sage-700">{getDisplayName(folder)}</span>
                                                            <span className="text-[10px] font-black text-sand-400 uppercase tracking-widest block mt-1">{fileSystem[folder].length} Resources</span>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-sand-50 flex items-center justify-center text-sand-300 group-hover/card:bg-sage-600 group-hover/card:text-white transition-all">
                                                            <ChevronRight size={16} />
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
                        {currentPath[0] === '5 Gardening' ? (
                            <GardeningLanding
                                handleFileClick={handleFileClick}
                                files={fileSystem[currentPath[0]]}
                            />
                        ) : currentPath[0] === '15 Infrastructure' ? (
                            <WaterLanding
                                handleFileClick={handleFileClick}
                                files={fileSystem[currentPath[0]]}
                            />
                        ) : currentPath[0] === '18 Energy & Lighting' ? (
                            <EnergyLanding
                                handleFileClick={handleFileClick}
                                files={fileSystem[currentPath[0]]}
                            />
                        ) : currentPath[0] === '17 Shelter & Weatherproofing' ? (
                            <ShelterLanding
                                handleFileClick={handleFileClick}
                                files={fileSystem[currentPath[0]]}
                            />
                        ) : (currentPath[0] === '1 Pantry Systems' || currentPath[0] === '4 Food Storage & Pantry' || currentPath[0] === '4 Preservation') ? (
                            <PreservationLanding
                                handleFileClick={handleFileClick}
                                files={[
                                    ...(fileSystem['1 Pantry Systems'] || []).map(file => ({ file, folder: '1 Pantry Systems' })),
                                    ...(fileSystem['4 Food Storage & Pantry'] || []).map(file => ({ file, folder: '4 Food Storage & Pantry' })),
                                    ...(fileSystem['4 Preservation'] || []).map(file => ({ file, folder: '4 Preservation' }))
                                ]}
                            />
                        ) : currentPath[0] === '14 Health & First Aid' ? (
                            <HealthSanitationLanding
                                handleFileClick={handleFileClick}
                                files={fileSystem[currentPath[0]]}
                            />
                        ) : (currentPath[0] === '16 Tools & Workshop' || currentPath[0] === '10 Tools & Wizards' || currentPath[0] === '50 Interactive Tools') ? (
                            <ToolsRepairLanding
                                handleFileClick={handleFileClick}
                                files={[
                                    ...(fileSystem['16 Tools & Workshop'] || []).map(file => ({ file, folder: '16 Tools & Workshop' })),
                                    ...(fileSystem['10 Tools & Wizards'] || []).map(file => ({ file, folder: '10 Tools & Wizards' })),
                                    ...(fileSystem['50 Interactive Tools'] || []).map(file => ({ file, folder: '50 Interactive Tools' }))
                                ]}
                            />
                        ) : (
                            <>
                                <h2 className="text-2xl sm:text-4xl mb-6 font-serif text-sage-900">{getDisplayName(currentPath[0])}</h2>
                                <FolderContentList
                                    files={fileSystem[currentPath[0]]}
                                    folder={currentPath[0]}
                                    handleFileClick={handleFileClick}
                                    guidesMetadata={guidesMetadata}
                                />
                            </>
                        )}

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
                                onClick={() => {
                                    setFileContent(null);
                                    navigate('/library', { replace: true });
                                }}
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
                                    <div className="px-0 sm:px-6 py-4 sm:py-12 pb-32">
                                        <article className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-3xl shadow-sm border-y sm:border border-sand-100 max-w-3xl mx-auto">
                                            <MarkdownRenderer content={fileContent.text} />
                                        </article>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Safety Acknowledgment Modal */}
            <AnimatePresence>
                {showSafetyAck && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] bg-sage-900/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-8 md:p-12 max-w-xl w-full shadow-2xl border-4 border-terracotta-500 overflow-hidden relative"
                        >
                            {/* Warning Background Icon */}
                            <div className="absolute -right-8 -top-8 text-terracotta-50 opacity-10">
                                <ShieldAlert size={200} />
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-terracotta-100 rounded-2xl flex items-center justify-center text-terracotta-600 mb-6">
                                    <ShieldAlert size={32} />
                                </div>

                                <h2 className="text-3xl font-serif font-black text-sage-900 mb-4 leading-tight">
                                    Lethal Hazard Warning
                                </h2>

                                <p className="text-lg text-sage-600 mb-8 leading-relaxed">
                                    The module <span className="font-black text-terracotta-600">"{getDisplayName(showSafetyAck.file)}"</span> contains information about activities that carry a **lethal risk of illness or death** (e.g., botulism, mycophagy, waterborne pathogens) if performed incorrectly.
                                </p>

                                <div className="space-y-4">
                                    <button
                                        onClick={confirmSafetyAck}
                                        className="w-full py-5 bg-terracotta-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-terracotta-700 transition-all shadow-xl shadow-terracotta-200"
                                    >
                                        I Understand the Risks
                                    </button>
                                    <button
                                        onClick={() => setShowSafetyAck(null)}
                                        className="w-full py-4 bg-sand-100 text-sage-600 rounded-2xl font-bold hover:bg-sand-200 transition-all"
                                    >
                                        Return to Library
                                    </button>
                                </div>

                                <p className="mt-8 text-center text-xs text-sage-400 font-bold uppercase tracking-tighter">
                                    Safety First • Homemaker Suite
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showOnboarding && (
                <HomesteadOnboarding onClose={() => setShowOnboarding(false)} />
            )}
        </div>
    );
};

// Extracted for pagination
const FolderContentList = ({ files, folder, handleFileClick, guidesMetadata = [] }) => {
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
                <h3 className="text-[10px] font-black text-sand-400 uppercase tracking-[0.2em] pl-1">Knowledge Modules</h3>
                {visibleFiles.map((file) => {
                    const fileMeta = guidesMetadata.find(m => m.path === `content/${folder}/${file}`);
                    const readTime = fileMeta && fileMeta.word_count ? Math.max(1, Math.round(fileMeta.word_count / 200)) : 8;
                    const tags = fileMeta ? fileMeta.tags : [];

                    return (
                        <div key={file} className="relative group">
                            <button
                                onClick={() => handleFileClick(file, folder)}
                                className="w-full flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-sand-100 shadow-sm hover:shadow-xl hover:shadow-sage-900/5 hover:border-terracotta-400 transition-all text-left"
                            >
                                <div className="p-3 bg-terracotta-50 rounded-2xl text-terracotta-500">
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-xl font-serif font-black text-sage-900 group-hover:text-terracotta-700 transition-colors leading-tight">{getDisplayName(file)}</span>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5 text-sand-400">
                                            <Timer size={10} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{readTime} min read</span>
                                        </div>
                                        {tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 mt-0.5">
                                                {tags.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-[8px] font-black uppercase tracking-widest bg-sage-50 text-sage-600 px-1.5 py-0.5 rounded-md border border-sage-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-sand-400">
                                                <BarChart3 size={10} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Guide</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-sand-200 group-hover:text-terracotta-500 group-hover:translate-x-1 transition-all" />
                            </button>
                            <div className="absolute right-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <FavoriteButton
                                    item={{ id: file, title: getDisplayName(file), category: folder }}
                                />
                            </div>
                        </div>
                    );
                })}

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
            className={`p-3.5 rounded-full transition-all duration-300 ${active ? 'bg-terracotta-50 text-terracotta-500 scale-110' : 'bg-white text-sand-400 hover:text-terracotta-400 hover:bg-sand-50'}`}        >
            <Heart size={20} fill={active ? "currentColor" : "none"} />
        </button>
    );
};

export default Library;
