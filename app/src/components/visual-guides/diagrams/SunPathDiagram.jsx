import React from 'react';

const SunPathDiagram = () => {
    return (
        <div className="w-full bg-sand-50/50 border border-sand-200 rounded-3xl p-4 md:p-6 space-y-4">
            <div className="text-center sm:text-left">
                <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Educational Schematic</span>
                <h4 className="text-sm font-bold text-sage-900">Passive Solar Cabin Orientation</h4>
            </div>

            <div className="relative w-full aspect-[4/3] max-h-[300px] mx-auto bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-inner">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Sky Gradient */}
                    <defs>
                        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                        </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="url(#skyGrad)" />

                    {/* Ground line */}
                    <line x1="0" y1="260" x2="400" y2="260" stroke="#a78bfa" strokeWidth="4" />
                    <text x="350" y="280" className="text-[10px] font-bold fill-purple-600 uppercase tracking-wider">South</text>
                    <text x="30" y="280" className="text-[10px] font-bold fill-purple-600 uppercase tracking-wider">North</text>

                    {/* Cabin building */}
                    {/* Back wall */}
                    <rect x="80" y="140" width="160" height="120" fill="#e7e5e4" stroke="#78716c" strokeWidth="2.5" />
                    {/* Floor (Thermal Mass Concrete) */}
                    <rect x="80" y="250" width="160" height="10" fill="#78716c" />
                    <text x="120" y="245" className="text-[8px] font-black fill-stone-500 uppercase">Thermal Mass Floor</text>

                    {/* South window (facing South, which is right in diagram) */}
                    <rect x="200" y="170" width="40" height="60" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" opacity="0.8" />
                    <line x1="220" y1="170" x2="220" y2="230" stroke="#0284c7" strokeWidth="1" />
                    <line x1="200" y1="200" x2="240" y2="200" stroke="#0284c7" strokeWidth="1" />

                    {/* Overhang Roof */}
                    <path d="M 60 140 L 160 100 L 265 130 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
                    {/* Highlight overhang extension */}
                    <circle cx="265" cy="130" r="3" fill="#ef4444" />
                    <text x="272" y="128" className="text-[8px] font-black fill-amber-700">Calculated Overhang</text>

                    {/* Summer Sun (High Angle ~72deg) */}
                    <path d="M 200 20 A 160 160 0 0 1 360 130" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="270" cy="40" r="14" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                    <text x="256" y="20" className="text-[8px] font-black fill-amber-600 uppercase">Summer Sun (75°)</text>

                    {/* Summer Rays - Shaded by overhang */}
                    <line x1="270" y1="40" x2="265" y2="130" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
                    <line x1="270" y1="40" x2="210" y2="260" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" strokeDasharray="3 3" />
                    <text x="260" y="85" className="text-[8px] font-black fill-red-500 uppercase bg-white">Blocked</text>

                    {/* Winter Sun (Low Angle ~30deg) */}
                    <path d="M 280 110 A 180 180 0 0 1 380 220" fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="340" cy="160" r="14" fill="#ffedd5" stroke="#f97316" strokeWidth="2" />
                    <text x="320" y="140" className="text-[8px] font-black fill-orange-600 uppercase">Winter Sun (30°)</text>

                    {/* Winter Rays - Enter under overhang */}
                    <line x1="340" y1="160" x2="265" y2="130" stroke="#f97316" strokeWidth="1.5" opacity="0.3" />
                    <line x1="340" y1="160" x2="110" y2="255" stroke="#f97316" strokeWidth="2" opacity="0.75" />
                    <text x="255" y="195" className="text-[8px] font-black fill-green-600 uppercase">Heats Floor</text>
                </svg>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                <strong>Estimator Disclaimer:</strong> Solar angles vary by latitude. This represents ~40° North latitude. Ensure your cabin overhang is sized so the high summer sun is completely blocked while the low winter sun fully penetrates the south glazing.
            </div>
        </div>
    );
};

export default SunPathDiagram;
