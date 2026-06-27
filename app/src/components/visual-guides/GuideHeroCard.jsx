import React from 'react';
import { Clock } from 'lucide-react';

const GuideHeroCard = ({ title, subtitle, icon, difficulty, estimatedTime, tags = [], seasonalContext, safetyLevel }) => {
    return (
        <div className="bg-gradient-to-br from-sage-800 to-sage-950 text-white rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden mb-6">
            <div className="absolute inset-0 opacity-10 bg-[url('/patterns/topography.svg')] pointer-events-none"></div>
            <div className="relative z-10 space-y-4">
                {icon && <div className="p-3 bg-white/10 rounded-2xl w-fit backdrop-blur-md text-sage-300">{icon}</div>}
                
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-tight">{title}</h1>
                    {subtitle && <p className="text-sage-200 text-sm md:text-base font-medium">{subtitle}</p>}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 text-[10px] font-black uppercase tracking-wider">
                    {difficulty && (
                        <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white">
                            Diff: {difficulty}
                        </span>
                    )}
                    {estimatedTime && (
                        <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white flex items-center gap-1">
                            <Clock size={10} /> {estimatedTime}
                        </span>
                    )}
                    {seasonalContext && (
                        <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full">
                            Season: {seasonalContext}
                        </span>
                    )}
                    {safetyLevel && (
                        <span className={`px-3 py-1 rounded-full border ${safetyLevel === 'High' ? 'bg-red-500/20 border-red-500/30 text-red-300 font-bold' : 'bg-green-500/20 border-green-500/30 text-green-300'}`}>
                            Safety: {safetyLevel}
                        </span>
                    )}
                </div>

                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {tags.map(tag => (
                            <span key={tag} className="text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-sage-300 px-2 py-0.5 rounded border border-white/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideHeroCard;
