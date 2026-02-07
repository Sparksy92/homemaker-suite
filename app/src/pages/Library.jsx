import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, ChevronRight, ArrowLeft, Heart, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Helper to clean display names
const getDisplayName = (name) => {
    // Removes leading "0 ", "1 ", "0.1 " etc, and .md extension
    if (!name) return '';
    return name.replace(/^\d+(\.\d+)?\s+/, '').replace('.md', '');
};

const Library = ({ type = 'all' }) => {
    const [currentPath, setCurrentPath] = useState([]);
    const [fileContent, setFileContent] = useState(null);
    const [fileSystem, setFileSystem] = useState({});
    const [loading, setLoading] = useState(true);

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
                    // Start fetching to ensure it exists, but we can display the direct URL
                    // Note: For offline without cache, this fails, but that's expected.
                    // We just use the 'url' string which points to the server.
                } else {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error("Network response was not ok");
                    contentState.text = await response.text();
                }
            }

            setFileContent(contentState);
        } catch (e) {
            console.error("Error reading file:", e);
            alert("Could not load guide. Are you offline?");
        }
    };



    // Custom Components for Markdown
    const MarkdownComponents = {
        h1: ({ children }) => (
            <h1 className="text-4xl font-serif text-sage-900 border-b-2 border-sage-200 pb-4 mb-8 mt-2">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-2xl font-serif text-sage-800 mt-8 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-terracotta-400 rounded-full inline-block"></span>
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-xl font-serif text-sage-700 mt-6 mb-3 border-l-4 border-sage-300 pl-3">{children}</h3>
        ),
        p: ({ children }) => (
            <p className="mb-4 text-charcoal leading-relaxed text-lg">{children}</p>
        ),
        ul: ({ children }) => (
            <ul className="space-y-2 mb-6 ml-4">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal space-y-2 mb-6 ml-6 text-charcoal-dark font-medium">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="pl-2 border-l-2 border-sand-300 hover:border-terracotta-400 transition-colors pl-4">{children}</li>
        ),
        blockquote: ({ children }) => {
            // Check if this is a GitHub style alert
            const content = React.Children.toArray(children);
            // This is a naive check, for robust parsing we might need rehypse plugins, but this works for standard blockquotes
            // Since we can't easily parse the [!TIP] syntax inside the child without plugins in this simple setup,
            // we will stick to styling standard blockquotes nicely for now, BUT we can try a simple text check if the first child is a paragraph.

            // Actually, let's just make ALL blockquotes look like "Sage Advice"
            return (
                <div className="bg-sand-100 border-l-4 border-sage-500 p-6 rounded-r-xl my-6 italic text-sage-800 shadow-sm relative">
                    <div className="absolute -left-3 -top-3 bg-sage-500 text-white p-1 rounded-full">
                        <Info size={16} />
                    </div>
                    {children}
                </div>
            )
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
    }, []);

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
                        className="p-6 pb-24 max-w-4xl mx-auto"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-sand-200 pb-6 gap-4">
                            <h1 className="text-5xl font-serif text-sage-900">
                                {type === 'guides' ? 'Guides' : type === 'reference' ? 'Reference' : 'Library'}
                            </h1>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="relative flex-1 md:w-80">
                                    <input
                                        type="text"
                                        placeholder="Search guides..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-full border border-sand-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 bg-white shadow-sm outline-none transition-all font-serif text-lg"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sand-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
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
                                        <CheckCircle size={24} />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
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
                                                    className="w-full flex items-center gap-4 p-5 bg-white rounded-xl border border-sand-100 shadow-sm hover:shadow-md hover:border-terracotta-200 text-left transition-all"
                                                >
                                                    <div className="p-2 bg-sage-50 rounded-lg text-sage-500">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="block text-lg font-serif text-charcoal group-hover:text-terracotta-700 transition-colors">{getDisplayName(item.file)}</span>
                                                        <span className="text-xs text-sand-500 uppercase tracking-wide">{getDisplayName(item.folder)}</span>
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
                            <div className="grid gap-4">
                                {Object.keys(fileSystem)
                                    .filter(folder => {
                                        const num = parseInt(folder.split(' ')[0]);
                                        if (type === 'guides') return num < 40;
                                        if (type === 'reference') return num >= 40 && num < 50 || num >= 90; // Manuals (40) and Reference (99)
                                        // Note: Interactive Tools (50) will be handled separately in Tools page,
                                        // or we can include them in reference if we want.
                                        // Let's hide 50 from here since it's going to Tools tab?
                                        // Actually, let's keep it simple: Guides < 40. Reference >= 40 (excluding Tools if we move them).
                                        // Re-reading plan: Tools tab gets the "Survival Tools".
                                        // So let's exclude 50 from here entirely if it's meant for Tools tab.
                                        if (num === 50) return false;
                                        return true;
                                    })
                                    .map((folder) => (
                                        <button
                                            key={folder}
                                            onClick={() => setCurrentPath([folder])}
                                            className="group flex flex-row items-center p-6 bg-white rounded-2xl border border-sand-200 shadow-sm hover:shadow-md hover:border-sage-300 transition-all text-left gap-6"
                                        >
                                            <div className="bg-sage-50 p-4 rounded-xl text-sage-600 group-hover:bg-sage-600 group-hover:text-white transition-colors shrink-0">
                                                <Folder size={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-serif text-2xl text-charcoal group-hover:text-sage-900 truncate pr-2">{getDisplayName(folder)}</span>
                                                    <ChevronRight size={20} className="text-sand-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                                </div>
                                                <span className="text-xs text-sand-500 mt-1 font-medium uppercase tracking-wider block">{fileSystem[folder].length} Items</span>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* View 2: Folder Contents */}
                {currentPath.length > 0 && !fileContent && (
                    <motion.div
                        key="folder"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="p-6 pb-24 max-w-5xl mx-auto"
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
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={MarkdownComponents}
                                            >
                                                {fileContent.text}
                                            </ReactMarkdown>
                                        </article>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Extracted for pagination
const FolderContentList = ({ files, folder, handleFileClick }) => {
    const [visibleCount, setVisibleCount] = useState(20);

    // Reset when folder changes
    React.useEffect(() => {
        setVisibleCount(20);
    }, [folder]);

    const visibleFiles = files.slice(0, visibleCount);
    const hasMore = visibleCount < files.length;

    return (
        <div className="grid gap-3">
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
