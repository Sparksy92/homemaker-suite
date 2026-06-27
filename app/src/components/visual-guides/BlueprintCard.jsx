import React from 'react';
import { Ruler, Package, Scissors, Hammer } from 'lucide-react';

const BlueprintCard = ({ title, dimensions, materials = [], cuts = [], instructions = [], schematic }) => {
    return (
        <div className="bg-gradient-to-b from-blue-900 to-blue-950 text-white rounded-[2rem] border border-blue-800 shadow-xl p-6 my-8 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start border-b border-blue-700/50 pb-4">
                    <div>
                        <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block">Structural Blueprint</span>
                        <h3 className="text-xl md:text-2xl font-serif font-black">{title}</h3>
                    </div>
                    {dimensions && (
                        <div className="flex items-center gap-1.5 bg-blue-800/60 border border-blue-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
                            <Ruler size={14} className="text-blue-300" /> {dimensions}
                        </div>
                    )}
                </div>

                {schematic && (
                    <div className="bg-black/30 border border-blue-800/80 rounded-xl p-4 font-mono text-[10px] text-blue-200 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                        {schematic}
                    </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Materials and cuts */}
                    <div className="space-y-4">
                        {materials.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Package size={12} /> Materials List
                                </h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-blue-100 font-medium">
                                    {materials.map((m, i) => <li key={i}>{m}</li>)}
                                </ul>
                            </div>
                        )}
                        {cuts.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest flex items-center gap-1.5">
                                    <Scissors size={12} /> Cut List
                                </h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-blue-100 font-medium">
                                    {cuts.map((c, i) => <li key={i}>{c}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Assembly steps */}
                    {instructions.length > 0 && (
                        <div className="space-y-2 bg-blue-850/50 p-4 rounded-xl border border-blue-800/50">
                            <h4 className="text-xs font-black text-blue-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                <Hammer size={12} /> Assembly Instructions
                            </h4>
                            <ol className="list-decimal pl-4 space-y-2 text-xs text-blue-100 font-medium">
                                {instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlueprintCard;
