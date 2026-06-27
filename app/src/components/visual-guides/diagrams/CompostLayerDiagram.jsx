import React from 'react';

const CompostLayerDiagram = () => {
    return (
        <div className="w-full bg-sand-50/50 border border-sand-200 rounded-3xl p-4 md:p-6 space-y-4">
            <div className="text-center sm:text-left">
                <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Educational Schematic</span>
                <h4 className="text-sm font-bold text-sage-900">Aerobic Compost Pile Layering</h4>
            </div>

            <div className="relative w-full aspect-[4/3] max-h-[300px] mx-auto bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-inner">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Background */}
                    <rect width="400" height="300" fill="#f5f5f4" />

                    {/* Bin Walls (wooden slats with gaps for air) */}
                    <rect x="50" y="80" width="12" height="180" fill="#a16207" stroke="#713f12" strokeWidth="1.5" />
                    <rect x="338" y="80" width="12" height="180" fill="#a16207" stroke="#713f12" strokeWidth="1.5" />
                    {/* Slat Lines */}
                    <line x1="50" y1="120" x2="62" y2="120" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="50" y1="160" x2="62" y2="160" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="50" y1="200" x2="62" y2="200" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="338" y1="120" x2="350" y2="120" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="338" y1="160" x2="350" y2="160" stroke="#451a03" strokeWidth="1.5" />
                    <line x1="338" y1="200" x2="350" y2="200" stroke="#451a03" strokeWidth="1.5" />
                    
                    <text x="35" y="275" className="text-[7px] font-black fill-amber-800">Air Slat</text>
                    <text x="345" y="275" className="text-[7px] font-black fill-amber-800">Air Slat</text>

                    {/* Pile layers inside bin */}
                    {/* Layer 5: Browns (Carbon) */}
                    <rect x="62" y="80" width="276" height="25" fill="#a16207" opacity="0.9" />
                    <text x="200" y="96" className="text-[8px] font-black fill-white uppercase text-center" textAnchor="middle">5: BROWNS (Carbon) - Straw / Dry Leaves (3")</text>

                    {/* Layer 4: Greens (Nitrogen) */}
                    <rect x="62" y="105" width="276" height="25" fill="#16a34a" opacity="0.9" />
                    <text x="200" y="121" className="text-[8px] font-black fill-white uppercase text-center" textAnchor="middle">4: GREENS (Nitrogen) - Kitchen Scraps (3")</text>

                    {/* Layer 3: Soil/Starter layer */}
                    <rect x="62" y="130" width="276" height="15" fill="#451a03" />
                    <text x="200" y="140" className="text-[7px] font-black fill-amber-100 uppercase text-center" textAnchor="middle">3: Soil / Old Active Compost (1") - microbial inoculum</text>

                    {/* Layer 2: Browns (Carbon) */}
                    <rect x="62" y="145" width="276" height="35" fill="#a16207" opacity="0.9" />
                    <text x="200" y="166" className="text-[8px] font-black fill-white uppercase text-center" textAnchor="middle">2: BROWNS - Shredded Cardboard / Sawdust (4")</text>

                    {/* Layer 1: Greens (Nitrogen) */}
                    <rect x="62" y="180" width="276" height="35" fill="#16a34a" opacity="0.9" />
                    <text x="200" y="201" className="text-[8px] font-black fill-white uppercase text-center" textAnchor="middle">1: GREENS - Fresh Grass Clippings (4")</text>

                    {/* Base Layer: Twigs (Aeration base) */}
                    <rect x="62" y="215" width="276" height="45" fill="#d97706" opacity="0.4" />
                    <line x1="70" y1="235" x2="120" y2="245" stroke="#713f12" strokeWidth="2" />
                    <line x1="140" y1="240" x2="200" y2="235" stroke="#713f12" strokeWidth="2.5" />
                    <line x1="230" y1="242" x2="310" y2="238" stroke="#713f12" strokeWidth="2" />
                    <text x="200" y="252" className="text-[8px] font-black fill-amber-950 uppercase text-center" textAnchor="middle">Base Layer: Twigs & Straw (6") - bottom aeration</text>
                </svg>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                <strong>Compost Ratio:</strong> Aim for a carbon-to-nitrogen ratio of roughly 30:1. In practice, this means layering 2 parts dry "brown" materials for every 1 part wet "green" scraps. Keep damp like a wrung-out sponge.
            </div>
        </div>
    );
};

export default CompostLayerDiagram;
