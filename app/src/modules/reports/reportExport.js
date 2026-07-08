export const generateMissionMarkdownReport = (mission, relatedData = {}) => {
  const title = mission.title || 'UNNAMED MISSION';
  const type = mission.missionType || 'general';
  const timestamp = mission.createdAt || new Date().toISOString();
  const author = mission.callsign || 'OPERATOR';
  const summary = mission.overview || 'No overview summary provided.';
  const manualNotes = mission.manualNotes || '';
  
  const status = mission.status || 'active';
  const priority = mission.priority || 'medium';

  let md = `# HOMEMAKER SUITE MISSION REPORT: ${title.toUpperCase()}\n\n`;
  md += `**MISSION TYPE:** ${type.toUpperCase()}\n`;
  md += `**MISSION STATUS:** ${status.toUpperCase()}\n`;
  md += `**PRIORITY:** ${priority.toUpperCase()}\n`;
  md += `**STARTED ON:** ${new Date(timestamp).toLocaleString()}\n`;
  if (mission.completedAt) {
    md += `**COMPLETED ON:** ${new Date(mission.completedAt).toLocaleString()}\n`;
  }
  md += `**OPERATOR CALLSIGN:** ${author.toUpperCase()}\n`;
  if (mission.locationLabel) {
    md += `**LOCATION/SECTOR:** ${mission.locationLabel.toUpperCase()}\n`;
  }
  md += `\n`;

  md += `## SECTION 1: MISSION OVERVIEW\n`;
  md += `${summary}\n\n`;

  // Objectives
  md += `## SECTION 2: OBJECTIVES STATUS\n`;
  const objectives = mission.objectives || [];
  if (objectives.length === 0) {
    md += `*No objectives defined for this mission.*\n\n`;
  } else {
    objectives.forEach(obj => {
      const check = obj.status === 'done' ? '[x]' : '[ ]';
      md += `- ${check} ${obj.label}\n`;
    });
    md += `\n`;
  }

  // Checklist / Tasks
  md += `## SECTION 3: CHECKLIST & LOGISTICS TASKS\n`;
  const tasks = [...(mission.checklist || []), ...(mission.tasks || [])];
  if (tasks.length === 0) {
    md += `*No tasks or checklist items defined.*\n\n`;
  } else {
    tasks.forEach(task => {
      const check = task.status === 'done' ? '[x]' : '[ ]';
      const prio = task.priority !== 'medium' ? ` (${task.priority.toUpperCase()})` : '';
      md += `- ${check} ${task.label}${prio}\n`;
    });
    md += `\n`;
  }

  // Timeline
  md += `## SECTION 4: MISSION TIMELINE LOGS\n`;
  const timeline = mission.timeline || [];
  if (timeline.length === 0) {
    md += `*No timeline events logged.*\n\n`;
  } else {
    timeline.forEach(event => {
      md += `*   \`[${new Date(event.createdAt).toLocaleTimeString()}]\` ${event.label}\n`;
    });
    md += `\n`;
  }

  if (manualNotes.trim()) {
    md += `## SECTION 5: OPERATOR SCRATCHPAD LOGS\n`;
    md += `${manualNotes}\n\n`;
  }

  // Recommended Sources from Manifest
  const recommended = relatedData.recommendedSources || [];
  if (recommended.length > 0) {
    md += `## SECTION 6: RECOMMENDED REFERENCE MANUALS\n`;
    recommended.forEach((item) => {
      const risk = item.riskCategory ? ` [Risk: ${item.riskCategory.toUpperCase()}]` : '';
      const ind = item.indexed ? 'Indexed' : 'Unindexed';
      md += `*   **${item.title}** (${item.matchLabel}, ${ind})${risk}\n`;
      md += `    *Path:* \`${item.sourcePath}\`\n`;
      if (item.reasons && item.reasons.length > 0) {
        md += `    *Reasons:* ${item.reasons.join(', ')}\n`;
      }
    });
    md += `\n`;
  }

  // Safety Warnings
  md += `## SECTION 7: DIRECTIVES & SAFETY WARNINGS\n`;
  const highRiskItems = [];
  if (mission.riskCategory) {
    highRiskItems.push(mission.riskCategory);
  }
  tasks.forEach(t => {
    if (t.riskCategory) highRiskItems.push(t.riskCategory);
  });
  recommended.forEach(r => {
    if (r.riskCategory) highRiskItems.push(r.riskCategory);
  });

  const uniqueCats = [...new Set(highRiskItems)].filter(Boolean);

  if (uniqueCats.length > 0) {
    md += `> [!WARNING]\n`;
    md += `> **CRITICAL SECURITY RISK WARNING**\n`;
    md += `> This mission report logs active procedures in high-risk categories:\n`;
    uniqueCats.forEach(cat => {
      md += `> - **${cat.toUpperCase()}**\n`;
    });
    md += `> \n`;
    md += `> Cross-verify all technical, electrical, chemical, mechanical, and first-aid checklists with physically printed reference material. AI predictions must not be used as live instructions in hazard contexts.\n\n`;
  } else {
    md += `*No high-risk operations were identified during this mission.*\n\n`;
  }

  md += `---\n*END OF REPORT // LOCAL HOMESTEAD ARCHIVE*\n`;
  return md;
};

export const generateMissionJSONReport = (mission) => {
  return JSON.stringify(mission, null, 2);
};

export const downloadFile = (content, filename, contentType) => {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
