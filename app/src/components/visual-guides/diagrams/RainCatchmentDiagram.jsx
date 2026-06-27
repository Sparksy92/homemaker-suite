import React from 'react';

const RainCatchmentDiagram = () => {
    return (
        <div className="w-full bg-sand-50/50 border border-sand-200 rounded-3xl p-4 md:p-6 space-y-4">
            <div className="text-center sm:text-left">
                <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Educational Schematic</span>
                <h4 className="text-sm font-bold text-sage-900">Rain Catchment & First-Flush Diverter</h4>
            </div>

            <div className="relative w-full aspect-[4/3] max-h-[300px] mx-auto bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-inner">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Background sky */}
                    <rect width="400" height="300" fill="#f8fafc" />

                    {/* Rain clouds/lines */}
                    <path d="M 30 20 Q 50 10 70 20 Q 90 10 110 20 Q 130 10 150 20 L 150 30 L 30 30 Z" fill="#cbd5e1" />
                    <line x1="50" y1="40" x2="40" y2="60" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="90" y1="40" x2="80" y2="60" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="130" y1="40" x2="120" y2="60" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Slanted Roof */}
                    <line x1="20" y1="80" x2="160" y2="120" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                    <text x="35" y="70" className="text-[8px] font-black fill-slate-500 uppercase">Metal Roof (Captures Rain)</text>

                    {/* Gutter with Leaf Guard */}
                    <circle cx="165" cy="125" r="7" fill="#94a3b8" />
                    <line x1="158" y1="118" x2="172" y2="118" stroke="#334155" strokeWidth="1.5" />
                    <text x="180" y="125" className="text-[8px] font-black fill-slate-500 uppercase">Leaf Screen Gutter</text>

                    {/* Downspout pipe */}
                    <path d="M 165 132 L 165 160 L 220 160 L 220 250" fill="none" stroke="#64748b" strokeWidth="6" />

                    {/* First Flush Diverter (vertical pipe on left side of cistern) */}
                    <rect x="210" y="160" width="20" height="90" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                    
                    {/* Floating ball inside First Flush */}
                    <circle cx="220" cy="180" r="8" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                    <text x="140" y="200" className="text-[7px] font-black fill-orange-600 uppercase text-right">Diverter Ball Seals<br/>Once Dirty Water Fills Tube</text>

                    {/* Drain valve at bottom of first flush */}
                    <circle cx="220" cy="253" r="3" fill="#ef4444" />
                    <text x="175" y="270" className="text-[7px] font-black fill-red-500 uppercase">Slow Silt Drain</text>

                    {/* Tee Connection to Cistern */}
                    <line x1="220" y1="160" x2="270" y2="160" stroke="#64748b" strokeWidth="6" />

                    {/* Cistern (opaque food grade) */}
                    <rect x="270" y="140" width="110" height="120" rx="10" fill="#0f172a" stroke="#1e293b" strokeWidth="3" />
                    <text x="325" y="195" className="text-[10px] font-black fill-slate-400 uppercase text-center" textAnchor="middle">Opaque Cistern<br/>(Prevents Algae)</text>

                    {/* Water Level inside Cistern */}
                    <rect x="273" y="210" width="104" height="47" rx="4" fill="#38bdf8" opacity="0.6" />
                    <text x="325" y="240" className="text-[8px] font-black fill-white uppercase text-center" textAnchor="middle">Clean Stored Water</text>

                    {/* Spigot / Outlet */}
                    <path d="M 380 230 L 395 230 L 395 240" fill="none" stroke="#ef4444" strokeWidth="3" />
                    <circle cx="395" cy="242" r="3" fill="#b91c1c" />
                </svg>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                <strong>Safety Disclaimer:</strong> A first-flush diverter is critical for trapping bird feces and chemical dust. Always discard the first 10-20 gallons of runoff. Cistern water requires filtration/purification before consumption.
            </div>
        </div>
    );
};

export default RainCatchmentDiagram;
