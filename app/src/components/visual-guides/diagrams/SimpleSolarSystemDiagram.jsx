import React from 'react';

const SimpleSolarSystemDiagram = () => {
    return (
        <div className="w-full bg-sand-50/50 border border-sand-200 rounded-3xl p-4 md:p-6 space-y-4">
            <div className="text-center sm:text-left">
                <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Educational Schematic</span>
                <h4 className="text-sm font-bold text-sage-900">Off-Grid Solar Electrical Components</h4>
            </div>

            <div className="relative w-full aspect-[4/3] max-h-[300px] mx-auto bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-inner">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Background */}
                    <rect width="400" height="300" fill="#f8fafc" />

                    {/* Solar Panel (Top Left) */}
                    <rect x="20" y="30" width="80" height="60" rx="4" fill="#1e3a8a" stroke="#1e40af" strokeWidth="2.5" />
                    {/* Solar grid lines */}
                    <line x1="20" y1="50" x2="100" y2="50" stroke="#3b82f6" strokeWidth="1" />
                    <line x1="20" y1="70" x2="100" y2="70" stroke="#3b82f6" strokeWidth="1" />
                    <line x1="40" y1="30" x2="40" y2="90" stroke="#3b82f6" strokeWidth="1" />
                    <line x1="60" y1="30" x2="60" y2="90" stroke="#3b82f6" strokeWidth="1" />
                    <line x1="80" y1="30" x2="80" y2="90" stroke="#3b82f6" strokeWidth="1" />
                    <text x="60" y="105" className="text-[8px] font-black fill-blue-800 text-center" textAnchor="middle">Solar Panel Array</text>

                    {/* Wiring paths */}
                    {/* Panel to Controller via Fuse */}
                    <path d="M 100 60 L 140 60" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                    
                    {/* Fuse/Breaker */}
                    <rect x="140" y="52" width="20" height="16" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
                    <text x="150" y="80" className="text-[7px] font-black fill-amber-700 text-center" textAnchor="middle">DC Fuse</text>

                    <path d="M 160 60 L 200 60" fill="none" stroke="#ef4444" strokeWidth="2.5" />

                    {/* Solar Charge Controller (Middle) */}
                    <rect x="200" y="35" width="70" height="50" rx="6" fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
                    {/* Display indicators */}
                    <rect x="210" y="43" width="50" height="12" fill="#22c55e" />
                    <text x="235" y="52" className="text-[7px] font-mono fill-black text-center font-bold" textAnchor="middle">13.6V</text>
                    <text x="235" y="100" className="text-[8px] font-black fill-slate-700 text-center" textAnchor="middle">Charge Controller</text>

                    {/* Controller to Battery */}
                    <path d="M 235 85 L 235 150" fill="none" stroke="#ef4444" strokeWidth="2.5" />
                    
                    {/* Battery Bank (Bottom Middle) */}
                    <rect x="195" y="150" width="80" height="55" rx="6" fill="#374151" stroke="#1f2937" strokeWidth="2" />
                    {/* Battery terminals */}
                    <rect x="205" y="145" width="10" height="5" fill="#ef4444" />
                    <rect x="255" y="145" width="10" height="5" fill="#3b82f6" />
                    <text x="235" y="220" className="text-[8px] font-black fill-stone-700 text-center" textAnchor="middle">Battery Bank (LiFePO4)</text>

                    {/* Battery to Inverter via Main Fuse */}
                    <path d="M 195 180 L 100 180" fill="none" stroke="#ef4444" strokeWidth="3" />
                    <rect x="130" y="172" width="22" height="16" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
                    <text x="141" y="200" className="text-[7px] font-black fill-amber-700 text-center" textAnchor="middle">Main Fuse</text>

                    {/* Inverter (Bottom Left) */}
                    <rect x="20" y="150" width="80" height="55" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                    <line x1="30" y1="165" x2="30" y2="190" stroke="#bae6fd" strokeWidth="1.5" />
                    <line x1="40" y1="165" x2="40" y2="190" stroke="#bae6fd" strokeWidth="1.5" />
                    <text x="60" y="220" className="text-[8px] font-black fill-blue-800 text-center" textAnchor="middle">Inverter (DC to AC)</text>

                    {/* AC Outlet from Inverter */}
                    <path d="M 60 205 L 60 250" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <rect x="40" y="250" width="40" height="30" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                    <circle cx="50" cy="265" r="3" fill="#475569" />
                    <circle cx="70" cy="265" r="3" fill="#475569" />
                    <text x="60" y="295" className="text-[8px] font-black fill-slate-700 text-center" textAnchor="middle">120V AC Outlet</text>

                    {/* Direct DC loads from Controller */}
                    <path d="M 270 60 L 330 60 L 330 150" fill="none" stroke="#ef4444" strokeWidth="2" />
                    <rect x="310" y="150" width="40" height="35" rx="3" fill="#15803d" stroke="#166534" strokeWidth="1.5" />
                    <text x="330" y="200" className="text-[8px] font-black fill-green-800 text-center" textAnchor="middle">12V DC Fusebox</text>
                </svg>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                <strong>Safety Disclaimer:</strong> High-voltage warnings apply. This is an educational diagram of basic off-grid linkages. Fuses/breakers are absolutely critical to prevent cable fires. Always follow safety standards.
            </div>
        </div>
    );
};

export default SimpleSolarSystemDiagram;
