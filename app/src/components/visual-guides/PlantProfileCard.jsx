import React from 'react';
import { Sprout, Sun, Droplets, Calendar, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const PlantProfileCard = ({ crop }) => {
    if (!crop) return null;

    return (
        <div className="bg-white rounded-[2rem] border border-sand-200 shadow-sm p-6 space-y-6 my-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-sand-100 pb-4">
                <div>
                    <h3 className="text-2xl font-serif font-black text-sage-950">{crop.name}</h3>
                    {crop.botanicalFamily && (
                        <span className="text-[10px] font-bold text-sage-500 italic block mt-0.5">{crop.botanicalFamily}</span>
                    )}
                </div>
                <div className="p-3 bg-sage-50 rounded-2xl text-sage-600">
                    <Sprout size={24} />
                </div>
            </div>

            {/* Quick Sowing Specs */}
            <div className="grid grid-cols-2 gap-4 bg-sand-50 p-4 rounded-2xl border border-sand-100">
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Planting Depth</span>
                    <span className="text-xs font-bold text-charcoal-700">{crop.plantingDepth || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Spacing</span>
                    <span className="text-xs font-bold text-charcoal-700">{crop.spacing || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block flex items-center gap-1">
                        <Sun size={10} className="text-amber-500" /> Sunlight
                    </span>
                    <span className="text-xs font-bold text-charcoal-700 leading-tight block">{crop.sun || 'N/A'}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block flex items-center gap-1">
                        <Droplets size={10} className="text-blue-500" /> Watering
                    </span>
                    <span className="text-xs font-bold text-charcoal-700 leading-tight block">{crop.watering || 'N/A'}</span>
                </div>
            </div>

            {/* Timelines and Soils */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs font-medium text-charcoal-700">
                {crop.soil && (
                    <div className="space-y-1">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Soil Conditions</span>
                        <p className="leading-relaxed">{crop.soil}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white border border-sand-200 px-3 py-1.5 rounded-lg">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} /> Germination
                        </span>
                        <span className="font-bold text-sage-800">{crop.daysToGerminate}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white border border-sand-200 px-3 py-1.5 rounded-lg">
                        <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} /> Harvest Time
                        </span>
                        <span className="font-bold text-sage-800">{crop.daysToHarvest}</span>
                    </div>
                </div>
            </div>

            {/* Companions and Enemies */}
            <div className="grid gap-4 sm:grid-cols-2 border-t border-sand-100 pt-4 text-xs font-medium">
                {crop.companionPlants && crop.companionPlants.length > 0 && (
                    <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-green-600 uppercase tracking-widest block flex items-center gap-1">
                            <CheckCircle2 size={10} /> Companions
                        </span>
                        <ul className="space-y-1 text-charcoal-700 pl-1">
                            {crop.companionPlants.map(p => <li key={p}>• {p}</li>)}
                        </ul>
                    </div>
                )}
                {crop.avoidPlantingNear && crop.avoidPlantingNear.length > 0 && (
                    <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest block flex items-center gap-1">
                            <XCircle size={10} /> Avoid Planting Near
                        </span>
                        <ul className="space-y-1 text-charcoal-700 pl-1">
                            {crop.avoidPlantingNear.map(p => <li key={p}>• {p}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Pests & Storage */}
            {(crop.pestIssues || crop.storageNotes) && (
                <div className="border-t border-sand-100 pt-4 space-y-3 text-xs font-medium">
                    {crop.pestIssues && crop.pestIssues.length > 0 && (
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block flex items-center gap-1">
                                <ShieldAlert size={10} /> Common Pests / Issues
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {crop.pestIssues.map(p => (
                                    <span key={p} className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">{p}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {crop.storageNotes && (
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Harvest Storage</span>
                            <p className="text-charcoal-600 leading-relaxed italic">{crop.storageNotes}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlantProfileCard;
