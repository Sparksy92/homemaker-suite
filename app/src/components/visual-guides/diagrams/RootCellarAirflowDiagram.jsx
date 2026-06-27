import React from 'react';

const RootCellarAirflowDiagram = () => {
    return (
        <div className="w-full bg-sand-50/50 border border-sand-200 rounded-3xl p-4 md:p-6 space-y-4">
            <div className="text-center sm:text-left">
                <span className="text-[9px] font-black text-sage-500 uppercase tracking-widest block">Educational Schematic</span>
                <h4 className="text-sm font-bold text-sage-900">Passive Root Cellar Ventilation & Airflow</h4>
            </div>

            <div className="relative w-full aspect-[4/3] max-h-[300px] mx-auto bg-white rounded-2xl border border-sand-100 overflow-hidden shadow-inner">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                    {/* Sky / Ground Surface split */}
                    <rect width="400" height="90" fill="#f1f5f9" />
                    <rect y="90" width="400" height="210" fill="#7c2d12" opacity="0.8" />
                    <line x1="0" y1="90" x2="400" y2="90" stroke="#15803d" strokeWidth="4" />
                    <text x="350" y="80" className="text-[8px] font-black fill-green-800 uppercase">Ground Level</text>

                    {/* Underground Cellar Room */}
                    <rect x="80" y="120" width="240" height="150" fill="#e7e5e4" stroke="#44403c" strokeWidth="3" />
                    <text x="200" y="140" className="text-[10px] font-black fill-stone-700 text-center" textAnchor="middle">Underground Cellar (Stable 32°F-40°F)</text>

                    {/* Fresh Cool Air Intake (Low pipe, enters from outside right, drops to cellar floor) */}
                    <path d="M 370 70 L 300 70 L 300 240 L 280 240" fill="none" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                    {/* Blue arrows showing cool air input */}
                    <path d="M 270 240 L 260 240" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <text x="350" y="55" className="text-[7px] font-black fill-blue-700 uppercase text-center" textAnchor="middle">Cool Air Intake</text>
                    <text x="312" y="260" className="text-[7px] font-black fill-blue-800 uppercase">Pipe Ends 12" From Floor</text>

                    {/* Warm Moist Air Exhaust (High pipe, exits cellar ceiling on left, goes up to sky) */}
                    <path d="M 100 200 L 100 125 L 100 50 L 70 50" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
                    <text x="60" y="38" className="text-[7px] font-black fill-red-700 uppercase text-center" textAnchor="middle">Warm Air Exhaust</text>
                    <text x="110" y="115" className="text-[7px] font-black fill-red-800 uppercase">Pipe Starts Near Ceiling</text>

                    {/* Internal Air Flow curve */}
                    <path d="M 250 240 Q 200 200 120 180" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />

                    {/* Storage Shelves (Center) */}
                    <line x1="140" y1="160" x2="220" y2="160" stroke="#78350f" strokeWidth="3" />
                    <line x1="140" y1="200" x2="220" y2="200" stroke="#78350f" strokeWidth="3" />
                    <line x1="140" y1="240" x2="220" y2="240" stroke="#78350f" strokeWidth="3" />
                    <text x="180" y="195" className="text-[7px] font-black fill-amber-900 uppercase text-center" textAnchor="middle">Produce Racks</text>

                    {/* Bins of vegetables */}
                    <rect x="150" y="222" width="20" height="15" fill="#f59e0b" rx="2" />
                    <rect x="180" y="222" width="20" height="15" fill="#f59e0b" rx="2" />
                    <text x="160" y="232" className="text-[6px] font-mono fill-white">Pot</text>
                    <text x="190" y="232" className="text-[6px] font-mono fill-white">Car</text>
                </svg>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] text-amber-900 font-medium leading-relaxed">
                <strong>Physics Principle:</strong> Cold air is denser and naturally flows down the intake pipe, displacing lighter warm moist air (containing ripening ethylene gas) which rises out of the exhaust pipe.
            </div>
        </div>
    );
};

export default RootCellarAirflowDiagram;
