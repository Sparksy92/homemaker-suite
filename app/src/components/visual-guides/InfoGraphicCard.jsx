import React from 'react';
import { HelpCircle, Wrench, Package, AlertOctagon, Lightbulb } from 'lucide-react';

const InfoGraphicCard = ({ why, how, when, where, tools = [], materials = [], mistakes = [], tips = [] }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-sand-200 shadow-sm p-6 space-y-6 my-8">
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Left Column: Context */}
                <div className="space-y-4">
                    {why && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-sage-500 uppercase tracking-widest block">Why we do this</span>
                            <p className="text-sm text-charcoal font-medium leading-relaxed">{why}</p>
                        </div>
                    )}
                    {how && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-sage-500 uppercase tracking-widest block">How it works</span>
                            <p className="text-sm text-charcoal font-medium leading-relaxed">{how}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {when && (
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-sage-500 uppercase tracking-widest block">When</span>
                                <span className="text-xs font-bold text-sage-800">{when}</span>
                            </div>
                        )}
                        {where && (
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-sage-500 uppercase tracking-widest block">Where</span>
                                <span className="text-xs font-bold text-sage-800">{where}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Requirements */}
                <div className="space-y-4 bg-sand-50/50 p-4 rounded-2xl border border-sand-100">
                    {tools.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-sage-700 uppercase tracking-widest flex items-center gap-1">
                                <Wrench size={12} /> Tools Needed
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {tools.map(t => (
                                    <span key={t} className="text-[10px] bg-white border border-sand-200 text-charcoal px-2 py-0.5 rounded-md font-medium shadow-sm">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {materials.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black text-sage-700 uppercase tracking-widest flex items-center gap-1">
                                <Package size={12} /> Materials Needed
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                {materials.map(m => (
                                    <span key={m} className="text-[10px] bg-white border border-sand-200 text-charcoal px-2 py-0.5 rounded-md font-medium shadow-sm">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row: Tips and Mistakes */}
            <div className="grid gap-6 sm:grid-cols-2 border-t border-sand-100 pt-6">
                {mistakes.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-1">
                            <AlertOctagon size={12} /> Common Mistakes
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-charcoal font-medium">
                            {mistakes.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                    </div>
                )}
                {tips.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-sage-700 uppercase tracking-widest flex items-center gap-1">
                            <Lightbulb size={12} /> Pro Tips
                        </h4>
                        <ul className="list-disc pl-4 space-y-1 text-xs text-charcoal font-medium">
                            {tips.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InfoGraphicCard;
