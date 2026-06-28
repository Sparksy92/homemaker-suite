import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const ImageCarousel = ({
    images: initialImages,
    speciesId,
    category = 'wildlife',
    alt = 'Image',
    enableDiscovery = false
}) => {
    // Filter out any invalid image values (empty string, null, undefined, placeholders) and deduplicate
    const sanitizeImages = (list) => {
        if (!list || !Array.isArray(list)) return [];
        const filtered = list.filter(img => 
            img && 
            typeof img === 'string' && 
            img.trim() !== '' && 
            !['placeholder', 'no-image', 'missing', 'null', 'undefined'].some(term => img.toLowerCase().includes(term))
        );
        return [...new Set(filtered)];
    };

    const [images, setImages] = useState(() => sanitizeImages(initialImages));
    const [currentIndex, setCurrentIndex] = useState(0);

    // Sync state if initialImages prop changes
    React.useEffect(() => {
        setImages(sanitizeImages(initialImages));
        setCurrentIndex(0);
    }, [initialImages]);

    // Lazy Magic Discovery
    React.useEffect(() => {
        if (!enableDiscovery || !speciesId) return;

        const checkImage = async (filename) => {
            try {
                const response = await fetch(`/images/${category}/${filename}`, { method: 'HEAD' });
                return response.ok;
            } catch (e) {
                return false;
            }
        };

        const discover = async () => {
            for (let i = 1; i <= 10; i++) {
                const filename = `${speciesId}_${i}.jpg`;
                if (images.includes(filename)) continue;

                const exists = await checkImage(filename);
                if (exists) {
                    setImages(prev => [...new Set([...prev, filename])]);
                }
            }
        };

        const timer = setTimeout(discover, 500);
        return () => clearTimeout(timer);
    }, [speciesId, category, enableDiscovery, images]);

    const handleImageError = (failedImg) => {
        setImages(prev => {
            const updated = prev.filter(img => img !== failedImg);
            if (currentIndex >= updated.length) {
                setCurrentIndex(Math.max(0, updated.length - 1));
            }
            return updated;
        });
    };

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full bg-sage-100 flex flex-col items-center justify-center text-sage-300">
                <Camera size={48} />
                <span className="text-sm mt-2 font-medium">No Image Available</span>
            </div>
        );
    }

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const currentImage = images[currentIndex];
    const imageSrc = currentImage.startsWith('http') || currentImage.startsWith('/')
        ? currentImage
        : `/images/${category}/${currentImage}`;

    return (
        <div className="relative w-full h-full group overflow-hidden bg-sand-200">
            <AnimatePresence mode="wait">
                <motion.img
                    key={currentImage}
                    src={imageSrc}
                    alt={`${alt} ${currentIndex + 1}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(currentImage)}
                />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all ${currentIndex === i ? 'bg-white w-4' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Counter Tag */}
                    <div className="absolute top-4 left-4 bg-black/40 text-white px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase backdrop-blur-md">
                        {currentIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCarousel;
