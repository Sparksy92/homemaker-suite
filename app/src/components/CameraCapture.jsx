import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, Loader2, MapPin, Tag, RefreshCw, Trash2 } from 'lucide-react';
import { useObservations } from '../context/ObservationContext';

const CameraCapture = ({ onClose, initialSpeciesId = null, speciesName = '' }) => {
    const { addObservation } = useObservations();
    const [imagePreview, setImagePreview] = useState(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [gpsStatus, setGpsStatus] = useState('idle'); // idle, acquiring, success, denied, unavailable, timeout, error
    const [coords, setCoords] = useState({ latitude: null, longitude: null, accuracy: null });
    const fileInputRef = useRef(null);

    const acquireGps = () => {
        if (!navigator.geolocation) {
            setGpsStatus('unavailable');
            return;
        }

        setGpsStatus('acquiring');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setGpsStatus('success');
            },
            (error) => {
                console.error("GPS Acquisition Error:", error);
                if (error.code === error.PERMISSION_DENIED) {
                    setGpsStatus('denied');
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    setGpsStatus('unavailable');
                } else if (error.code === error.TIMEOUT) {
                    setGpsStatus('timeout');
                } else {
                    setGpsStatus('error');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    // Geolocation is captured on user consent via "Add GPS Location" button

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
            const observationData = {
                image: imagePreview,
                notes,
                speciesId: initialSpeciesId,
                speciesName: speciesName || 'Unknown Species',
                location: gpsStatus === 'success' && coords.latitude !== null
                    ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
                    : 'Local Sighting'
            };

            if (gpsStatus === 'success' && coords.accuracy !== null) {
                observationData.locationAccuracyMeters = coords.accuracy;
            }

            await addObservation(observationData);
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
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-sand-200 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Close modal"
                    >
                        <X size={24} />
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
                                className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 backdrop-blur-md min-w-[44px] min-h-[44px] flex items-center justify-center"
                                aria-label="Remove image"
                            >
                                <X size={20} />
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

                        <div className="flex flex-col gap-3 bg-sand-50 p-4 rounded-xl border border-sand-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-sage-600 uppercase tracking-widest">
                                    <MapPin size={14} className={gpsStatus === 'success' ? 'text-sage-700 animate-pulse' : 'text-sand-400'} />
                                    <span>Sighting Location</span>
                                </div>
                                <span className="text-[10px] text-sage-400 font-medium italic">Private (stored locally only)</span>
                            </div>

                            {gpsStatus === 'idle' && coords.latitude === null ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-charcoal-700 leading-relaxed">
                                        Observation coordinates are stored locally on this device only.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={acquireGps}
                                        className="w-full min-h-[44px] py-2.5 bg-sage-600 text-white rounded-xl font-bold shadow-sm hover:bg-sage-700 active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <MapPin size={14} /> Add GPS Location
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between text-sm text-charcoal">
                                    <div className="flex items-center gap-2">
                                        {gpsStatus === 'acquiring' && (
                                            <div className="flex items-center gap-2 text-sage-800 font-semibold">
                                                <Loader2 size={14} className="animate-spin text-sage-700" />
                                                <span>Acquiring GPS location...</span>
                                            </div>
                                        )}
                                        {gpsStatus === 'success' && (
                                            <div className="flex flex-col">
                                                <span className="font-mono font-bold text-sage-900">
                                                    {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                                                </span>
                                                {coords.accuracy !== null && (
                                                    <span className="text-[10px] text-sage-500">
                                                        Accuracy: ±{Math.round(coords.accuracy)}m
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {gpsStatus === 'denied' && (
                                            <span className="text-terracotta-600 font-medium">GPS permission denied</span>
                                        )}
                                        {gpsStatus === 'unavailable' && (
                                            <span className="text-sand-500 font-medium">GPS unavailable</span>
                                        )}
                                        {gpsStatus === 'timeout' && (
                                            <span className="text-sand-500 font-medium">GPS timed out</span>
                                        )}
                                        {(gpsStatus === 'error' || (gpsStatus === 'idle' && coords.latitude === null)) && (
                                            <span className="text-sand-400">No coordinates captured</span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {['denied', 'unavailable', 'timeout', 'error', 'idle'].includes(gpsStatus) && (
                                            <button
                                                type="button"
                                                onClick={acquireGps}
                                                className="px-4 py-2 bg-white border border-sand-300 text-sage-700 rounded-lg text-xs font-bold shadow-sm hover:bg-sand-50 transition-colors flex items-center gap-1.5 min-h-[44px]"
                                            >
                                                <RefreshCw size={12} /> Retry
                                            </button>
                                        )}
                                        {gpsStatus === 'success' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCoords({ latitude: null, longitude: null, accuracy: null });
                                                    setGpsStatus('idle');
                                                }}
                                                className="px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-bold shadow-sm hover:bg-red-100 transition-colors flex items-center gap-1.5 min-h-[44px]"
                                            >
                                                <Trash2 size={12} /> Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
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
