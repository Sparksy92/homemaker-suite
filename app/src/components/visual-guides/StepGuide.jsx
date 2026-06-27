import React, { useState } from 'react';
import { AlertTriangle, Info, CheckSquare, Square } from 'lucide-react';

const StepGuide = ({ steps = [] }) => {
    // Keep check state locally for interactive list checks
    const [checkedItems, setCheckedItems] = useState({});

    const toggleCheck = (stepIdx, checkIdx) => {
        const key = `${stepIdx}-${checkIdx}`;
        setCheckedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="space-y-8 my-8">
            {steps.map((step, sIdx) => (
                <div key={sIdx} className="bg-white rounded-3xl border border-sand-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                    {/* Number block */}
                    <div className="bg-sage-600 text-white font-serif font-black text-3xl px-6 py-4 md:py-6 flex items-center justify-center md:w-20 shrink-0">
                        {sIdx + 1}
                    </div>
                    
                    {/* Content block */}
                    <div className="p-6 flex-1 space-y-4">
                        <h3 className="text-xl font-serif font-black text-sage-900 leading-tight">
                            {step.title}
                        </h3>
                        
                        <p className="text-charcoal leading-relaxed text-sm md:text-base">
                            {step.body}
                        </p>

                        {/* Checklist */}
                        {step.checklist && step.checklist.length > 0 && (
                            <div className="pt-2 space-y-2 border-t border-sand-100 mt-4">
                                <span className="text-[10px] font-black text-sage-500 uppercase tracking-widest block mb-2">Required Actions</span>
                                {step.checklist.map((item, cIdx) => {
                                    const isChecked = !!checkedItems[`${sIdx}-${cIdx}`];
                                    return (
                                        <button
                                            key={cIdx}
                                            onClick={() => toggleCheck(sIdx, cIdx)}
                                            className="flex items-start gap-2.5 text-left text-xs font-semibold text-charcoal hover:text-sage-800 transition-colors w-full py-1"
                                        >
                                            <div className="shrink-0 text-sage-600 mt-0.5">
                                                {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </div>
                                            <span className={isChecked ? 'line-through text-sand-400' : ''}>{item}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Note callout */}
                        {step.note && (
                            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl flex gap-3 items-start text-xs text-blue-900 font-medium">
                                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                <span>{step.note}</span>
                            </div>
                        )}

                        {/* Warning callout */}
                        {step.warning && (
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex gap-3 items-start text-xs text-amber-900 font-bold">
                                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <span>{step.warning}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StepGuide;
