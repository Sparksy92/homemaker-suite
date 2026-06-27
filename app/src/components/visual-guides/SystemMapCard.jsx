import React from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';

const SystemMapCard = ({ title, nodes = [] }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-sand-200 shadow-sm p-6 my-8">
            <h3 className="text-lg font-serif font-black text-sage-950 mb-6 border-b border-sand-100 pb-3">{title}</h3>
            
            {/* Visual flow layout - horizontal on desktop, vertical on mobile */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
                {nodes.map((node, idx) => {
                    const isLast = idx === nodes.length - 1;
                    return (
                        <React.Fragment key={idx}>
                            {/* Node Block */}
                            <div className="flex flex-col items-center p-4 bg-sand-50 rounded-2xl border border-sand-100 w-full md:w-48 text-center shadow-sm relative group hover:border-sage-400 transition-colors">
                                {node.stepNumber && (
                                    <span className="absolute -top-2 -left-2 w-6 h-6 bg-sage-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                        {node.stepNumber}
                                    </span>
                                )}
                                <div className="text-sage-600 mb-2">
                                    {node.icon || <div className="w-8 h-8 rounded-full bg-sage-50 border border-sage-200 flex items-center justify-center font-serif text-sm font-bold">{idx + 1}</div>}
                                </div>
                                <h4 className="text-sm font-bold text-sage-900 leading-tight mb-1">{node.name}</h4>
                                {node.desc && <p className="text-[10px] text-charcoal-500 leading-relaxed font-medium">{node.desc}</p>}
                            </div>

                            {/* Arrow connector */}
                            {!isLast && (
                                <>
                                    {/* Desktop Arrow */}
                                    <div className="hidden md:flex text-sand-300 animate-pulse-slow">
                                        <ArrowRight size={20} />
                                    </div>
                                    {/* Mobile Arrow */}
                                    <div className="flex md:hidden text-sand-300 my-1 animate-pulse-slow">
                                        <ArrowDown size={20} />
                                    </div>
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default SystemMapCard;
