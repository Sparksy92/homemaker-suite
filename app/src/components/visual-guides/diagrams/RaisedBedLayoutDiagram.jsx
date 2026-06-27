import React from 'react';

const RaisedBedLayoutDiagram = () => {
    return (
        <div className="w-full bg-sand-50/50 border border-sand-200 rounded-3xl p-4 md:p-6 space-y-4">
            <div className="text-center sm:text-left">
                <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Educational Schematic</span>
                <h4 className="text-sm font-bold text-sage-900">Raised Bed Layering (Hugelkultur Style)</h4>
            </div>

            <div className="relative w-full aspect-[4/3] max-h-[300px] mx-auto bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-inner">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Background */}
                    <rect width="400" height="300" fill="#fcfbf7" />

                    {/* Raised Bed Wooden Walls */}
                    <rect x="40" y="80" width="20" height="180" fill="#854d0e" stroke="#451a03" strokeWidth="2" />
                    <rect x="340" y="80" width="20" height="180" fill="#854d0e" stroke="#451a03" strokeWidth="2" />
                    <text x="50" y="275" className="text-[8px] font-black fill-amber-800 text-center" textAnchor="middle">Wood Wall</text>
                    <text x="350" y="275" className="text-[8px] font-black fill-amber-800 text-center" textAnchor="middle">Wood Wall</text>

                    {/* Layer 5: Mulch (Top layer, thin) */}
                    <rect x="60" y="80" width="280" height="12" fill="#78350f" opacity="0.9" />
                    <text x="200" y="89" className="text-[7px] font-black fill-white uppercase text-center" textAnchor="middle">Layer 5: Straw/Mulch (2") - Prevents Water Evaporation</text>

                    {/* Layer 4: Planting Soil (Rich topsoil + compost) */}
                    <rect x="60" y="92" width="280" height="48" fill="#451a03" />
                    <text x="200" y="120" className="text-[8px] font-black fill-amber-100 uppercase text-center" textAnchor="middle">Layer 4: Topsoil & Compost (6-8")</text>

                    {/* Layer 3: Nitrogen Green Compost (leaves, scraps) */}
                    <rect x="60" y="140" width="280" height="35" fill="#15803d" opacity="0.8" />
                    <text x="200" y="160" className="text-[8px] font-black fill-green-100 uppercase text-center" textAnchor="middle">Layer 3: Green Compost & Leaves (4")</text>

                    {/* Layer 2: Small branches & Twigs */}
                    <rect x="60" y="175" width="280" height="40" fill="#b45309" opacity="0.6" />
                    {/* Tiny branch SVGs inside layer */}
                    <line x1="80" y1="195" x2="130" y2="195" stroke="#78350f" strokeWidth="3" />
                    <line x1="160" y1="190" x2="210" y2="200" stroke="#78350f" strokeWidth="2.5" />
                    <line x1="250" y1="195" x2="310" y2="190" stroke="#78350f" strokeWidth="3" />
                    <text x="200" y="210" className="text-[8px] font-black fill-amber-900 uppercase text-center" textAnchor="middle">Layer 2: Twigs & Small Branches (4")</text>

                    {/* Layer 1: Heavy Logs (Bottom layer, moisture wick) */}
                    <rect x="60" y="215" width="280" height="45" fill="#7c2d12" />
                    {/* Big log drawings */}
                    <circle cx="100" cy="238" r="16" fill="#a16207" stroke="#451a03" strokeWidth="2" />
                    <circle cx="200" cy="238" r="16" fill="#a16207" stroke="#451a03" strokeWidth="2" />
                    <circle cx="300" cy="238" r="16" fill="#a16207" stroke="#451a03" strokeWidth="2" />
                    <text x="200" y="242" className="text-[8px] font-black fill-amber-100 uppercase text-center" textAnchor="middle">Layer 1: Hardwood Logs - Water Sponge</text>
                </svg>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                <strong>Gardening Tip:</strong> This Hugelkultur style raised bed retains moisture at the bottom via rotting logs, requiring up to 50% less watering in summer heat while providing long-term nutrients.
            </div>
        </div>
    );
};

export default RaisedBedLayoutDiagram;
