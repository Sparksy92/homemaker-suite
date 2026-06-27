import React from 'react';
import { Info, AlertTriangle, ShieldAlert, Lightbulb, CheckSquare, Wrench } from 'lucide-react';

const CalloutBlock = ({ type = 'note', title, children }) => {
    const configs = {
        note: {
            bg: 'bg-blue-50 border-blue-500 text-blue-900',
            iconBg: 'bg-blue-500',
            icon: <Info size={16} />,
            label: 'Observation / Note'
        },
        warning: {
            bg: 'bg-amber-50 border-amber-500 text-amber-900',
            iconBg: 'bg-amber-500',
            icon: <AlertTriangle size={16} />,
            label: 'Cautionary Advice'
        },
        danger: {
            bg: 'bg-red-50 border-red-500 text-red-950',
            iconBg: 'bg-red-600 animate-pulse',
            icon: <ShieldAlert size={16} />,
            label: 'Critical Safety Danger'
        },
        tip: {
            bg: 'bg-lime-50 border-lime-500 text-lime-950',
            iconBg: 'bg-lime-600',
            icon: <Lightbulb size={16} />,
            label: 'Homestead Pro Tip'
        },
        checklist: {
            bg: 'bg-purple-50 border-purple-500 text-purple-950',
            iconBg: 'bg-purple-600',
            icon: <CheckSquare size={16} />,
            label: 'Action Checklist'
        },
        'required-tools': {
            bg: 'bg-slate-50 border-slate-500 text-slate-950',
            iconBg: 'bg-slate-600',
            icon: <Wrench size={16} />,
            label: 'Required Equipment'
        }
    };

    const cfg = configs[type] || configs.note;

    return (
        <div className={`my-6 p-4 border-l-4 rounded-r-2xl shadow-sm flex gap-3.5 items-start ${cfg.bg}`}>
            <div className={`p-2 rounded-xl text-white shrink-0 shadow-sm ${cfg.iconBg}`}>
                {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest block mb-0.5 opacity-80">
                    {title || cfg.label}
                </span>
                <div className="text-xs md:text-sm font-medium leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CalloutBlock;
