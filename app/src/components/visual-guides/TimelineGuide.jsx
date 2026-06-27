import React from 'react';

const TimelineGuide = ({ items = [] }) => {
    return (
        <div className="relative border-l-2 border-sand-200 ml-4 my-8 pl-6 space-y-8">
            {items.map((item, idx) => (
                <div key={idx} className="relative">
                    {/* Node circle */}
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-sage-600 shadow-sm" />
                    
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-sage-500 bg-sage-50 px-2 py-0.5 rounded border border-sage-100">
                                {item.dateRange}
                            </span>
                            {item.status && (
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.status === 'Critical' ? 'bg-red-500/10 text-red-600 border border-red-200' : 'bg-sand-100 text-sand-500'}`}>
                                    {item.status}
                                </span>
                            )}
                        </div>
                        <h4 className="text-base font-serif font-black text-sage-950">{item.title}</h4>
                        {item.desc && <p className="text-xs text-charcoal leading-relaxed">{item.desc}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TimelineGuide;
