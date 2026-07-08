import React, { useState } from 'react';
import { 
  buildMissionBrief 
} from '../../modules/missions/missionBriefing.js';
import { 
  generateMissionMarkdownReport, 
  generateMissionJSONReport, 
  downloadFile 
} from '../../modules/reports/reportExport.js';
import { 
  Clipboard, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  HelpCircle,
  Shield,
  Info
} from 'lucide-react';

export default function MissionBriefingPanel({ 
  mission
}) {
  const [copied, setCopied] = useState(false);

  if (!mission) {
    return (
      <div className="bg-white rounded-2xl border border-sand-300 p-6 text-center text-sand-500 font-sans shadow-sm">
        <HelpCircle size={24} className="mx-auto mb-2 text-sand-400" />
        Select or start a mission to load briefing intel.
      </div>
    );
  }

  // Related data calculations
  const brief = buildMissionBrief(
    mission, 
    [], // saved answers
    mission.attachedSources || [], // saved sources
    [], // field notes
    [] // review queue
  );

  // Handle Copy Brief
  const handleCopyBrief = () => {
    let text = `HOMEMAKER SUITE MISSION BRIEF: ${brief.title.toUpperCase()}\n`;
    text += `Type: ${brief.missionType?.toUpperCase()} | Status: ${brief.status?.toUpperCase()}\n`;
    text += `Organization Score: ${brief.readiness.score}% (${brief.readiness.label})\n`;
    text += `Overview: ${brief.overview || 'None'}\n\n`;
    
    text += `Objectives:\n`;
    if (brief.openObjectives.length === 0) {
      text += `- All objectives completed.\n`;
    } else {
      brief.openObjectives.forEach(o => {
        text += `- [ ] ${o.label}\n`;
      });
    }
    
    text += `\nOpen Checklist/Tasks:\n`;
    if (brief.openTasks.length === 0) {
      text += `- All tasks completed.\n`;
    } else {
      brief.openTasks.forEach(t => {
        text += `- [ ] ${t.label} (${t.priority})\n`;
      });
    }

    if (brief.safetyChecklist.length > 0) {
      text += `\nSafety Directives:\n`;
      brief.safetyChecklist.forEach(c => {
        text += `[${c.category.toUpperCase()} WARNING] ${c.warning}\n`;
        c.directives.forEach(d => {
          text += `- ${d}\n`;
        });
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    const relatedData = {
      recommendedSources: mission.attachedSources || []
    };
    const md = generateMissionMarkdownReport(mission, relatedData);
    const filename = `mission_${mission.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_briefing.md`;
    downloadFile(md, filename, 'text/markdown');
  };

  // Export JSON Report
  const handleExportJSON = () => {
    const json = generateMissionJSONReport(mission);
    const filename = `mission_${mission.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_briefing.json`;
    downloadFile(json, filename, 'application/json');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-sage-700';
    return 'text-red-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-sand-300 p-5 space-y-5 shadow-sm font-sans">
      
      {/* HUD Header */}
      <div className="flex justify-between items-start border-b border-sand-200 pb-3 flex-wrap gap-3">
        <div>
          <span className="text-[10px] font-mono text-sand-500 uppercase tracking-widest block">Operational Briefing</span>
          <h3 className="font-serif text-base font-bold text-sand-800 tracking-tight leading-tight">
            {brief.title}
          </h3>
        </div>
        
        {/* Score Ring */}
        <div className="text-right flex items-center gap-3">
          <div>
            <div className="text-[9px] font-bold text-sand-400 uppercase tracking-wider">Readiness Index</div>
            <div className={`text-base font-serif font-black ${getScoreColor(brief.readiness.score)}`}>
              {brief.readiness.score}% <span className="text-[10px] font-sans font-medium text-sand-500">({brief.readiness.label})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={handleCopyBrief}
          className="px-2.5 py-1.5 border border-sand-300 hover:bg-sand-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-sand-700 transition-colors"
        >
          <Clipboard size={12} />
          {copied ? 'Copied Brief' : 'Copy Brief'}
        </button>
        <button 
          onClick={handleExportMarkdown}
          className="px-2.5 py-1.5 border border-sand-300 hover:bg-sand-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-sand-700 transition-colors"
        >
          <Download size={12} />
          Export MD
        </button>
        <button 
          onClick={handleExportJSON}
          className="px-2.5 py-1.5 border border-sand-300 hover:bg-sand-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-sand-700 transition-colors"
        >
          <FileText size={12} />
          Export JSON
        </button>
      </div>

      {/* Safety warnings list */}
      {brief.safetyChecklist.length > 0 && (
        <div className="space-y-3 bg-red-50/35 border border-red-200/60 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={14} /> Critical Safety Warnings
          </div>
          <div className="space-y-3 divide-y divide-red-200/40">
            {brief.safetyChecklist.map((c, idx) => (
              <div key={idx} className={`text-xs text-sand-800 ${idx > 0 ? 'pt-3' : ''}`}>
                <p className="font-semibold text-red-700 mb-1 leading-normal">
                  [{c.category.toUpperCase()}] {c.warning}
                </p>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-sand-600 leading-relaxed">
                  {c.directives.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Objectives remaining */}
        <div className="space-y-2">
          <h4 className="font-bold text-sand-600 uppercase tracking-wide flex items-center gap-1.5">
            <CheckCircle size={12} className="text-sage-600" /> Pending Objectives
          </h4>
          {brief.openObjectives.length === 0 ? (
            <p className="text-green-600 font-semibold italic">✓ All objectives completed!</p>
          ) : (
            <ul className="list-disc pl-4 space-y-1 text-sand-700 leading-normal">
              {brief.openObjectives.map(o => (
                <li key={o.id}>{o.label}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Tasks remaining */}
        <div className="space-y-2">
          <h4 className="font-bold text-sand-600 uppercase tracking-wide flex items-center gap-1.5">
            <Shield size={12} className="text-sage-600" /> Pending Tasks
          </h4>
          {brief.openTasks.length === 0 ? (
            <p className="text-green-600 font-semibold italic">✓ All checklist items completed!</p>
          ) : (
            <ul className="list-disc pl-4 space-y-1 text-sand-700 leading-normal">
              {brief.openTasks.map(t => {
                const prioColor = t.priority === 'high' || t.priority === 'critical' ? 'text-red-500 font-semibold' : '';
                return (
                  <li key={t.id} className={prioColor}>
                    {t.label} {t.priority !== 'medium' && `(${t.priority})`}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
