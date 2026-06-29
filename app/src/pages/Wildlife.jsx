import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Bug, Calendar, AlertTriangle, CheckCircle, Search, Footprints, Filter, Camera, X, ChefHat, Info, Mountain, Maximize2, Waves } from 'lucide-react';
import wildlifeData from '../data/wildlifeData.json';
import { sanitizeWildlifeImages, getWildlifeImageCategory, buildWildlifeImageSrc } from '../utils/wildlifeImageResolver';
import ImageCarousel from '../components/ImageCarousel';
import { useObservations } from '../context/ObservationContext';
import CameraCapture from '../components/CameraCapture';

const Wildlife = () => {
    const [activeTab, setActiveTab] = useState('flora');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Edible, Medicinal, Poisonous
    const [selectedItem, setSelectedItem] = useState(null); // Track selected item for modal
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isCaptureOpen, setIsCaptureOpen] = useState(false);
    const { getObservationsBySpecies } = useObservations();


    // Search Logic
    const filterData = (data) => {
        if (!data) return [];
        return data.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.uses && item.uses.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.habitat && item.habitat.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.behavior && item.behavior.toLowerCase().includes(searchQuery.toLowerCase()));

            if (activeTab === 'flora' && filterType !== 'All') {
                return matchesSearch && item.type.includes(filterType);
            }
            return matchesSearch;
        });
    };

    const ImagePreview = ({ images, collection, category, alt, className = "h-40" }) => {
        const [imgError, setImgError] = useState(false);
        const [isLoaded, setIsLoaded] = useState(false);

        const sanitized = sanitizeWildlifeImages(images);
        const firstImage = sanitized[0];
        const imageSrc = firstImage ? buildWildlifeImageSrc({ image: firstImage, collection, category }) : null;

        React.useEffect(() => {
            setImgError(false);
            setIsLoaded(false);
        }, [imageSrc]);

        if (!imageSrc || imgError) {
            const isDev = import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');
            if (firstImage && imgError && isDev) {
                console.warn(`[Wildlife Image Load Error] Failed to load image: ${imageSrc} for ${alt}`);
            } else if (!firstImage && isDev) {
                console.warn(`[Wildlife Image Missing] No image specified for ${alt}`);
            }
            return (
                <div className={`${className} w-full bg-sage-100 flex flex-col items-center justify-center text-sage-400 p-4 border border-sand-200 rounded-t-2xl`}>
                    <Camera size={32} />
                    <span className="text-xs mt-2 font-semibold">No verified image available</span>
                </div>
            );
        }

        return (
            <div 
                className={`${className} w-full bg-slate-950 relative overflow-hidden group flex items-center justify-center bg-cover bg-center`}
                style={isLoaded ? { backgroundImage: `url("${imageSrc}")` } : {}}
            >
                {/* Blurred background overlay */}
                {isLoaded && <div className="absolute inset-0 bg-black/55 backdrop-blur-md select-none pointer-events-none" />}
                <img
                    src={imageSrc}
                    alt={alt}
                    className="relative z-10 max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => {
                        setImgError(true);
                    }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-sand-50 pb-24 relative">
            {/* Header */}
            <div className="bg-gradient-to-br from-sage-500 via-sage-600 to-sage-700 text-white p-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-md border-b border-sage-400/20">
                <h1 className="text-3xl font-serif font-black mb-1 text-white leading-tight">Wildlife & Nature</h1>
                <p className="text-sage-100 opacity-90 text-xs font-medium tracking-wide">Field guide to the living world.</p>

                {/* Search & Actions Bar */}
                <div className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sage-200" size={20} />
                        <input
                            type="text"
                            placeholder="Search plants, insects, animals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-sage-200 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white/20 transition-all font-serif text-sm backdrop-blur-sm"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCaptureOpen(true)}
                        className="bg-terracotta-500 text-white px-4 rounded-xl shadow-lg flex items-center justify-center hover:bg-terracotta-600 transition-colors"
                        title="Log Sighting"
                    >
                        <Camera size={24} />
                    </motion.button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto gap-2 p-4 border-b border-sand-200 mb-4 bg-white sticky top-0 z-10 shadow-sm no-scrollbar scroll-smooth snap-x snap-mandatory w-full">
                <TabButton
                    active={activeTab === 'flora'}
                    onClick={() => setActiveTab('flora')}
                    icon={<Leaf size={18} />}
                    label="Flora"
                />
                <TabButton
                    active={activeTab === 'insects'}
                    onClick={() => setActiveTab('insects')}
                    icon={<Bug size={18} />}
                    label="Insects"
                />
                <TabButton
                    active={activeTab === 'fauna'}
                    onClick={() => setActiveTab('fauna')}
                    icon={<Footprints size={18} />}
                    label="Fauna"
                />
                <TabButton
                    active={activeTab === 'aquatic'}
                    onClick={() => setActiveTab('aquatic')}
                    icon={<Waves size={18} />}
                    label="Aquatic"
                />
                <TabButton
                    active={activeTab === 'tracking'}
                    onClick={() => setActiveTab('tracking')}
                    icon={<Search size={18} />}
                    label="Tracking"
                />
                <TabButton
                    active={activeTab === 'calendar'}
                    onClick={() => setActiveTab('calendar')}
                    icon={<Calendar size={18} />}
                    label="Season"
                />
            </div>

            {/* Sub-Filters for Flora */}
            {activeTab === 'flora' && (
                <div className="px-6 mb-4 flex overflow-x-auto gap-2 no-scrollbar scroll-smooth w-full snap-x snap-mandatory">
                    {['All', 'Edible', 'Medicinal', 'Poisonous', 'Utility'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`shrink-0 snap-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filterType === type
                                ? 'bg-sage-600 text-white'
                                : 'bg-sand-200 text-sage-700 hover:bg-sand-300'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            )}

            {/* Content Area */}
            <div className="px-4 md:px-6">
                <AnimatePresence mode="wait">
                    {/* FLORA */}
                    {activeTab === 'flora' && (
                        <motion.div
                            key="flora"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filterData(wildlifeData.flora).map((plant, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedItem({ ...plant, sourceCollection: 'flora', category: getWildlifeImageCategory('flora', plant) })}
                                    className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden active:scale-98 transition-transform cursor-pointer"
                                >
                                    <ImagePreview images={plant.images} collection="flora" alt={plant.name} />
                                    <div className={`h-2 ${plant.type.includes('Poisonous') ? 'bg-red-500' : plant.type.includes('Medicinal') ? 'bg-blue-500' : 'bg-green-500'}`} />
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-sage-900">{plant.name}</h3>
                                                <p className="text-xs text-sage-500 italic">{plant.scientific_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${plant.type.includes('Poisonous') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {plant.type}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-charcoal-600 line-clamp-2">
                                            {plant.identification}
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-terracotta-600">
                                            <span>Tap for details</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.flora).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {/* INSECTS */}
                    {activeTab === 'insects' && (
                        <motion.div
                            key="insects"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filterData(wildlifeData.insects).map((insect, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedItem({ ...insect, sourceCollection: 'insects', category: getWildlifeImageCategory('insects', insect) })}
                                    className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden active:scale-98 transition-transform cursor-pointer"
                                >
                                    <ImagePreview images={insect.images} collection="insects" alt={insect.name} />
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-sage-900">{insect.name}</h3>
                                                <p className="text-xs text-sage-500 italic">{insect.scientific_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${insect.role === 'Pest' ? 'bg-red-100 text-red-700' :
                                                insect.role === 'Beneficial' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {insect.role}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-charcoal-600 line-clamp-2">
                                            {insect.identification}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.insects).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {/* FAUNA */}
                    {activeTab === 'fauna' && (
                        <motion.div
                            key="fauna"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filterData(wildlifeData.fauna).map((animal, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedItem({ ...animal, sourceCollection: 'fauna', category: getWildlifeImageCategory('fauna', animal) })}
                                    className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden active:scale-98 transition-transform cursor-pointer"
                                >
                                    <ImagePreview images={animal.images} collection="fauna" alt={animal.name} />
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-bold text-sage-900">{animal.name}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${animal.role === 'Pest' ? 'bg-red-100 text-red-700' :
                                                animal.role === 'Predator' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>{animal.role}</span>
                                        </div>
                                        <p className="text-sm text-charcoal-600 mb-3 line-clamp-2">{animal.notes}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-sage-600">
                                            <CheckCircle size={14} />
                                            <span>Status: {animal.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.fauna).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {/* AQUATIC */}
                    {activeTab === 'aquatic' && (
                        <motion.div
                            key="aquatic"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filterData(wildlifeData.aquatic).map((fish, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedItem({ ...fish, sourceCollection: 'aquatic', category: getWildlifeImageCategory('aquatic', fish) })}
                                    className="bg-white rounded-2xl shadow-sm border border-sand-200 overflow-hidden active:scale-98 transition-transform cursor-pointer"
                                >
                                    <ImagePreview images={fish.images} collection="aquatic" alt={fish.name} />
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-sage-900">{fish.name}</h3>
                                                <p className="text-xs text-sage-500 italic">{fish.scientific_name}</p>
                                            </div>
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                {fish.type}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-charcoal-600 line-clamp-2">
                                            {fish.behavior}
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs font-bold text-terracotta-600">
                                            <span>Bait: {fish.best_bait}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.aquatic).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {/* TRACKING */}
                    {activeTab === 'tracking' && (
                        <motion.div
                            key="tracking"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid md:grid-cols-2 gap-4"
                        >
                            {filterData(wildlifeData.tracking).map((track, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedItem({ ...track, sourceCollection: 'tracking', category: getWildlifeImageCategory('tracking', track) })}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200 flex flex-col active:scale-98 transition-transform cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-sage-900">{track.name}</h3>
                                        <span className="text-xs bg-sand-100 text-sand-600 px-2 py-1 rounded-md">{track.category}</span>
                                    </div>
                                    <p className="text-sm text-charcoal-600 mb-3 flex-1">{track.description}</p>
                                    <ImagePreview images={track.images} collection="tracking" alt={track.name} className="h-32 rounded-lg mb-3" />
                                    <div className="text-xs text-sage-500 bg-sage-50 p-2 rounded-lg">
                                        <span className="font-bold">Gait:</span> {track.gait}
                                    </div>
                                </div>
                            ))}
                            {filterData(wildlifeData.tracking).length === 0 && <EmptyState />}
                        </motion.div>
                    )}

                    {/* CALENDAR */}
                    {activeTab === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="grid gap-4"
                        >
                            {Object.entries(wildlifeData.foraging_calendar).map(([season, items]) => (
                                <div key={season} className="bg-white p-5 rounded-2xl shadow-sm border border-sand-200">
                                    <h3 className="text-lg font-serif font-bold text-sage-800 mb-3 flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${season === 'Spring' ? 'bg-green-400' :
                                            season === 'Summer' ? 'bg-yellow-400' :
                                                season === 'Autumn' ? 'bg-orange-400' : 'bg-blue-300'
                                            }`}></span>
                                        {season}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {items.map((item, i) => (
                                            <span key={i} className="bg-sand-100 text-charcoal-700 px-3 py-1 rounded-full text-sm">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)} // Close on background click
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-3.5 rounded-full hover:bg-black/70 backdrop-blur-md transition-colors animate-fade-in"
                            >
                                <X size={24} />
                            </button>

                            {/* Full Header Carousel */}
                            <div
                                className="h-64 sm:h-80 w-full shrink-0 relative cursor-pointer"
                                onClick={() => selectedItem.images && selectedItem.images.length > 0 && setIsLightboxOpen(true)}
                            >
                                <ImageCarousel
                                    images={selectedItem.images}
                                    speciesId={selectedItem.id}
                                    collection={selectedItem.sourceCollection}
                                    category={selectedItem.category}
                                    alt={selectedItem.name}
                                />
                                {selectedItem.images && selectedItem.images.length > 0 && (
                                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                                        <div className="bg-black/50 text-white p-2 rounded-full backdrop-blur-md">
                                            <Maximize2 size={20} />
                                        </div>
                                    </div>
                                )}
                            </div>



                            {/* Scrollable Content */}
                            <div className="overflow-y-auto p-6 space-y-6">
                                {/* Title Section */}
                                <div>
                                    <h2 className="text-3xl font-serif font-bold text-sage-900">{selectedItem.name}</h2>
                                    {selectedItem.scientific_name && (
                                        <p className="text-sage-500 italic">{selectedItem.scientific_name}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {/* Status / Role Tags */}
                                        {selectedItem.status && (
                                            <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                <CheckCircle size={12} /> {selectedItem.status}
                                            </span>
                                        )}
                                        {selectedItem.type && (
                                            <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-bold">
                                                {selectedItem.type}
                                            </span>
                                        )}
                                        {selectedItem.role && (
                                            <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-bold">
                                                {selectedItem.role}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Main Description / Identification */}
                                {(selectedItem.identification || selectedItem.notes) && (
                                    <div className="bg-sand-50 p-4 rounded-xl border border-sand-200">
                                        <h3 className="text-sm font-bold text-sage-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <Info size={16} /> Identification & Notes
                                        </h3>
                                        <p className="text-charcoal-700">{selectedItem.identification || selectedItem.notes}</p>
                                    </div>
                                )}

                                {/* USES / HABITAT / PROCESSING DETAILS */}
                                {selectedItem.details && (
                                    <div className="space-y-6">
                                        <div className="h-px bg-sand-200 w-full"></div>

                                        {/* Habitat / Behavior */}
                                        {(selectedItem.details.habitat || selectedItem.details.behavior) && (
                                            <div>
                                                <h3 className="text-lg font-bold text-sage-900 mb-2 flex items-center gap-2">
                                                    <Mountain size={20} className="text-sage-600" /> Habitat & Behavior
                                                </h3>
                                                <p className="text-charcoal-700">{selectedItem.details.habitat || selectedItem.details.behavior}</p>
                                            </div>
                                        )}

                                        {/* Processing Instructions */}
                                        {selectedItem.details.processing && (
                                            <div className="bg-terracotta-50 border border-terracotta-100 p-5 rounded-xl">
                                                <h3 className="text-lg font-bold text-terracotta-800 mb-3 flex items-center gap-2">
                                                    <ChefHat size={20} /> Processing & Field Care
                                                </h3>
                                                {Array.isArray(selectedItem.details.processing) ? (
                                                    <ul className="space-y-3">
                                                        {selectedItem.details.processing.map((step, i) => (
                                                            <li key={i} className="flex gap-3 text-terracotta-900">
                                                                {/* <span className="font-bold shrink-0">{i + 1}.</span> */}
                                                                {/* Render steps that are markdown-like bolded specifically manually or just text */}
                                                                <span dangerouslySetInnerHTML={{
                                                                    __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                                }} />
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-terracotta-900">{selectedItem.details.processing}</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Preservation */}
                                        {selectedItem.details.preservation && (
                                            <div>
                                                <h3 className="text-sm font-bold text-sage-500 uppercase tracking-wider mb-1">Preservation</h3>
                                                <p className="text-charcoal-700">{selectedItem.details.preservation}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Standard Uses & Caution (If not already in details) */}
                                {selectedItem.uses && !selectedItem.details?.processing && (
                                    <div>
                                        <h3 className="text-sm font-bold text-sage-500 uppercase tracking-wider mb-1">Common Uses</h3>
                                        <p className="text-charcoal-700">{selectedItem.uses}</p>
                                    </div>
                                )}


                                {selectedItem.id && getObservationsBySpecies(selectedItem.id).length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-sand-200">
                                        <h3 className="text-lg font-bold text-sage-900 flex items-center gap-2">
                                            <Camera size={20} className="text-terracotta-500" /> My Personal Sightings
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {getObservationsBySpecies(selectedItem.id).map((obs) => (
                                                <div key={obs.id} className="bg-sand-50 rounded-xl overflow-hidden border border-sand-200 group relative">
                                                    <img src={obs.image} alt="Sighting" className="w-full aspect-square object-cover" />
                                                    <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-md p-2 text-[10px] text-white">
                                                        {new Date(obs.timestamp).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* LIGHTBOX OVERLAY */}
            <AnimatePresence>
                {isLightboxOpen && selectedItem && selectedItem.images && selectedItem.images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-6 right-6 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-[110]"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X size={32} />
                        </button>

                        <div className="w-full h-full max-w-5xl max-h-[85vh] relative flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <ImageCarousel
                                images={selectedItem.images}
                                speciesId={selectedItem.id}
                                collection={selectedItem.sourceCollection}
                                category={selectedItem.category}
                                alt={selectedItem.name}
                            />
                        </div>

                        {/* Caption in Lightbox */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 text-white px-6 py-3 rounded-full backdrop-blur-xl border border-white/10 text-center max-w-[90vw]">
                            <h4 className="font-serif font-bold text-lg">{selectedItem.name}</h4>
                            <p className="text-xs text-white/70 italic">{selectedItem.scientific_name}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* CAMERA CAPTURE MODAL */}
            <AnimatePresence>
                {isCaptureOpen && (
                    <CameraCapture
                        onClose={() => setIsCaptureOpen(false)}
                        initialSpeciesId={selectedItem?.id}
                        speciesName={selectedItem?.name}
                    />
                )}
            </AnimatePresence>
        </div >
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`shrink-0 snap-center flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${active
            ? 'bg-sage-600 text-white shadow-md'
            : 'bg-white text-sage-700 border border-sand-200 hover:bg-sand-50'
            }`}
    >
        {icon}
        <span className="font-medium text-sm">{label}</span>
    </button>
);

const EmptyState = () => (
    <div className="text-center py-12 text-sand-500 italic">
        <p>No results found roaming these woods.</p>
    </div>
);

export default Wildlife;
