import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, Loader2, MapPin, Tag } from 'lucide-react';
import { useObservations } from '../context/ObservationContext';

const CameraCapture = ({ onClose, initialSpeciesId = null, speciesName = '' }) => {
    const { addObservation } = useObservations();
    const [imagePreview, setImagePreview] = useState(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!imagePreview) return;

        setIsSaving(true);
        try {
            await addObservation({
                image: imagePreview,
                notes,
                speciesId: initialSpeciesId,
                speciesName: speciesName || 'Unknown Species',
                location: 'Local Observation' // Placeholder for GPS
            });
            onClose();
        } catch (error) {
            console.error('Failed to save observation:', error);
            alert('Error saving observation. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="p-4 border-b border-sand-100 flex justify-between items-center bg-sand-50">
                    <h2 className="text-xl font-serif font-bold text-sage-900 flex items-center gap-2">
                        <Camera size={20} className="text-terracotta-500" /> Log Observation
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-sand-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    {/* Image Capture Area */}
                    {!imagePreview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square w-full rounded-2xl border-2 border-dashed border-sand-300 flex flex-col items-center justify-center gap-3 bg-sand-50 cursor-pointer hover:bg-sand-100 transition-colors"
                        >
                            <div className="bg-white p-4 rounded-full shadow-sm text-sage-400">
                                <Camera size={40} />
                            </div>
                            <span className="font-bold text-sage-600">Take Photo / Select Image</span>
                            <p className="text-xs text-sage-400 text-center px-8">Use your device's camera to document your sighting.</p>
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-sand-200 shadow-inner group">
                            <img src={imagePreview} alt="Capture" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setImagePreview(null)}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-md"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Metadata Section */}
                    <div className="space-y-4">
                        {speciesName && (
                            <div className="flex items-center gap-2 text-sm text-sage-600 bg-sage-50 px-3 py-2 rounded-lg">
                                <Tag size={16} />
                                <span className="font-bold">Attaching to:</span> {speciesName}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-sage-500 uppercase tracking-widest pl-1">Field Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Where did you see it? What was its size? Any notable behavior?"
                                className="w-full p-4 rounded-xl bg-sand-50 border border-sand-200 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all text-charcoal min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-xs text-sage-400 pl-1">
                            <MapPin size={14} />
                            <span>GPS Location stored locally (if enabled)</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-sand-50 border-t border-sand-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-sand-300 font-bold text-charcoal hover:bg-sand-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!imagePreview || isSaving}
                        className={`flex-[2] py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!imagePreview || isSaving
                                ? 'bg-sand-300 text-sand-500 cursor-not-allowed'
                                : 'bg-sage-600 text-white shadow-lg hover:bg-sage-700 active:scale-95'
                            }`}
                    >
                        {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                        {isSaving ? 'Saving...' : 'Save Observation'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default CameraCapture;
