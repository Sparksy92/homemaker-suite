import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Cloud, Database, ArrowRight, Check } from 'lucide-react';
import { resolveConflict } from '../services/homesteadSyncService';

const ConflictResolverModal = ({ conflicts, onClose, onResolveComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isResolving, setIsResolving] = useState(false);

    if (!conflicts || conflicts.length === 0) return null;

    const currentConflict = conflicts[currentIndex];
    const { key, localData, remoteData } = currentConflict;

    // Readable name mapping for planners
    const getModuleName = (moduleKey) => {
        switch (moduleKey) {
            case 'homemaker_homestead_profile': return 'Homestead Profile';
            case 'homemaker_homestead_plan': return 'Homestead Master Plan';
            case 'homemaker_garden_plan': return 'Garden Planner';
            case 'homemaker_pantry_plan': return 'Pantry Planner';
            case 'homemaker_water_plan': return 'Water Security Planner';
            case 'homemaker_energy_plan': return 'Energy System Planner';
            case 'homemaker_build_projects': return 'Build/Infrastructure Projects';
            case 'homemaker_seasonal_tasks': return 'Seasonal Task Calendar';
            case 'homemaker_field_binder_settings': return 'Offline Field Binder Settings';
            default: return 'Homestead Module';
        }
    };

    const handleResolve = async (resolution) => {
        setIsResolving(true);
        try {
            const res = await resolveConflict(key, resolution);
            if (res.status === 'success') {
                if (currentIndex + 1 < conflicts.length) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    onResolveComplete();
                }
            } else {
                alert(`Failed to resolve conflict: ${res.message}`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsResolving(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'Never';
        return new Date(isoString).toLocaleString();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-sage-950/70 backdrop-blur-md">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-sand-100 flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
                        <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-700 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-amber-950">Sync Conflict Detected</h2>
                            <p className="text-xs text-amber-800/80 mt-1 leading-normal">
                                Changes were made both locally and remotely on the cloud database. Please select which data version to keep.
                            </p>
                        </div>
                    </div>

                    {/* Progress indicator for multiple conflicts */}
                    {conflicts.length > 1 && (
                        <div className="bg-sand-50 px-6 py-2 border-b border-sand-100 text-[10px] font-bold text-charcoal-400 tracking-wider uppercase flex justify-between">
                            <span>Resolving Conflicts</span>
                            <span>{currentIndex + 1} of {conflicts.length}</span>
                        </div>
                    )}

                    {/* Comparison Workspace */}
                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div className="text-center">
                            <span className="text-[10px] font-bold text-sage-600 bg-sage-50 border border-sage-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                {getModuleName(key)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Local Card */}
                            <div className="border border-sand-200 rounded-2xl p-4 bg-sand-50/50 flex flex-col justify-between h-44">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sage-800 font-bold text-xs uppercase tracking-wide">
                                        <Database size={14} />
                                        <span>Local Device</span>
                                    </div>
                                    <div className="text-[11px] text-charcoal-500 font-medium">
                                        {localData.deletedAt ? (
                                            <span className="text-terracotta-600 font-bold uppercase">Marked for Deletion (Tombstone)</span>
                                        ) : (
                                            <span>Active planner document containing custom homestead logs and tracking data.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-sand-200 flex items-center gap-1.5 text-[10px] text-charcoal-400">
                                    <Clock size={12} />
                                    <span className="font-sans font-medium">{formatDate(localData.updatedAt)}</span>
                                </div>
                            </div>

                            {/* Remote Card */}
                            <div className="border border-sand-200 rounded-2xl p-4 bg-sand-50/50 flex flex-col justify-between h-44">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sage-800 font-bold text-xs uppercase tracking-wide">
                                        <Cloud size={14} />
                                        <span>Cloud Backup</span>
                                    </div>
                                    <div className="text-[11px] text-charcoal-500 font-medium">
                                        {remoteData.deletedAt ? (
                                            <span className="text-terracotta-600 font-bold uppercase">Marked for Deletion (Tombstone)</span>
                                        ) : (
                                            <span>Active planner document backed up on the cloud database server.</span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-sand-200 flex items-center gap-1.5 text-[10px] text-charcoal-400">
                                    <Clock size={12} />
                                    <span className="font-sans font-medium">{formatDate(remoteData.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conflict Resolution Actions */}
                    <div className="bg-sand-50 p-6 border-t border-sand-100 flex flex-col gap-2">
                        <button
                            onClick={() => handleResolve('keep_local')}
                            disabled={isResolving}
                            className="w-full py-3 px-4 bg-sage-700 hover:bg-sage-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span>Keep Local Version</span>
                            <ArrowRight size={14} />
                        </button>
                        
                        <button
                            onClick={() => handleResolve('use_remote')}
                            disabled={isResolving}
                            className="w-full py-3 px-4 bg-white hover:bg-sand-100 text-sage-850 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-sand-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span>Use Cloud Backup Version</span>
                            <ArrowRight size={14} />
                        </button>

                        <button
                            onClick={() => handleResolve('latest_timestamp')}
                            disabled={isResolving}
                            className="w-full py-3 px-4 bg-sand-200 hover:bg-sand-300 text-charcoal-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Clock size={14} />
                            <span>Resolve by Latest Timestamp (Recommended)</span>
                        </button>

                        <button
                            onClick={onClose}
                            disabled={isResolving}
                            className="w-full py-2 px-4 text-charcoal-400 hover:text-charcoal-600 font-bold text-xs uppercase tracking-wider rounded-xl transition-all mt-1"
                        >
                            Cancel Pull
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConflictResolverModal;
