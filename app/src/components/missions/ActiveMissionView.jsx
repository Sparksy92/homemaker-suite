import React, { useState } from 'react';
import { 
  ShieldAlert, Clock, Play, Pause, CheckCircle, Circle, 
  Plus, Trash2, Send, FileText, Download, Volume2, ExternalLink,
  ChevronRight, ClipboardList, BookOpen, AlertTriangle
} from 'lucide-react';
import { useMissions } from '../../context/MissionsContext.jsx';
import MissionSourceFinder from './MissionSourceFinder.jsx';
import MissionBriefingPanel from './MissionBriefingPanel.jsx';

const ActiveMissionView = ({ onBack }) => {
  const { 
    activeMission, 
    completeActiveMission, 
    pauseActiveMission, 
    toggleObjective,
    addTaskToActiveMission,
    toggleTask,
    addManualNotes,
    attachSourceToActiveMission,
    removeSourceFromActiveMission
  } = useMissions();

  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist', 'briefing', 'sources', 'timeline'
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  if (!activeMission) return null;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskLabel.trim()) return;
    addTaskToActiveMission(newTaskLabel.trim(), newTaskPriority);
    setNewTaskLabel('');
    setNewTaskPriority('medium');
  };

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case 'critical': return 'border-red-500 text-red-700 bg-red-50';
      case 'high': return 'border-orange-400 text-orange-700 bg-orange-50';
      case 'medium': return 'border-sand-300 text-sand-700 bg-sand-100/50';
      default: return 'border-sand-200 text-sand-500 bg-sand-50';
    }
  };

  return (
    <div className="space-y-6 font-sans text-sm text-sand-800">
      
      {/* Header Info Panel */}
      <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border ${
                activeMission.status === 'active' ? 'border-green-300 bg-green-50 text-green-700' : 'border-orange-300 bg-orange-50 text-orange-600'
              }`}>
                {activeMission.status}
              </span>
              <span className="text-xs font-mono text-sand-500">Callsign: {activeMission.callsign || 'Operator'}</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-sand-900 mt-1 leading-tight">{activeMission.title}</h2>
            {activeMission.locationLabel && (
              <p className="text-xs text-sand-500 mt-1 font-mono">Location Sector: {activeMission.locationLabel}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button 
              onClick={completeActiveMission}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-md transition-colors flex items-center gap-1.5 text-xs"
            >
              <CheckCircle size={14} /> Complete Session
            </button>
            <button 
              onClick={onBack}
              className="px-4 py-2 border border-sand-300 hover:bg-sand-100 rounded-xl font-semibold text-xs transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>

        {activeMission.overview && (
          <p className="text-xs text-sand-600 bg-sand-50 p-3 rounded-xl border border-sand-200/60 leading-relaxed italic">
            {activeMission.overview}
          </p>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-sand-300 gap-1 overflow-x-auto no-scrollbar shrink-0">
        <TabButton id="checklist" label="Tasks Checklist" active={activeTab} onClick={setActiveTab} />
        <TabButton id="briefing" label="Intel Briefing" active={activeTab} onClick={setActiveTab} />
        <TabButton id="sources" label="Reference Materials" active={activeTab} onClick={setActiveTab} />
        <TabButton id="timeline" label="Timeline Log" active={activeTab} onClick={setActiveTab} />
      </div>

      {/* Tab Contents */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          
          {/* Objectives Grid */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest">Core Mission Objectives</h3>
            <div className="space-y-2">
              {(activeMission.objectives || []).map(obj => (
                <div 
                  key={obj.id} 
                  onClick={() => toggleObjective(obj.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    obj.status === 'done' 
                      ? 'border-green-200 bg-green-50/20 text-green-700' 
                      : 'border-sand-200 bg-white hover:bg-sand-50 text-sand-700'
                  }`}
                >
                  {obj.status === 'done' ? (
                    <CheckCircle size={18} className="text-green-600 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-sand-400 shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${obj.status === 'done' ? 'line-through text-green-700/65' : ''}`}>
                    {obj.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist Tasks */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest">Operational Checklist Tasks</h3>
            
            <div className="space-y-2.5">
              {/* Template Tasks */}
              {(activeMission.checklist || []).map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id, false)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    task.status === 'done' 
                      ? 'border-green-200 bg-green-50/20 text-green-700/65' 
                      : 'border-sand-200 bg-white hover:bg-sand-50 text-sand-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.status === 'done' ? (
                      <CheckCircle size={16} className="text-green-600 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-sand-400 shrink-0" />
                    )}
                    <span className={`text-xs ${task.status === 'done' ? 'line-through text-green-700/55' : 'font-semibold'}`}>
                      {task.label}
                    </span>
                  </div>
                  {task.priority !== 'medium' && (
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 border rounded uppercase ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}

              {/* Custom Tasks */}
              {(activeMission.tasks || []).map(task => (
                <div 
                  key={task.id}
                  onClick={() => toggleTask(task.id, true)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    task.status === 'done' 
                      ? 'border-green-200 bg-green-50/20 text-green-700/65' 
                      : 'border-sand-200 bg-white hover:bg-sand-50 text-sand-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {task.status === 'done' ? (
                      <CheckCircle size={16} className="text-green-600 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-sand-400 shrink-0" />
                    )}
                    <span className={`text-xs ${task.status === 'done' ? 'line-through text-green-700/55' : 'font-semibold'}`}>
                      {task.label}
                    </span>
                  </div>
                  <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 border rounded uppercase ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 pt-2 border-t border-sand-200">
              <input
                type="text"
                value={newTaskLabel}
                onChange={e => setNewTaskLabel(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-sand-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 bg-sand-50"
                placeholder="Add custom task objective..."
              />
              <select
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value)}
                className="px-2 py-1.5 border border-sand-300 rounded-xl text-xs bg-white text-sand-700 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-sage-700 hover:bg-sage-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Notes Log Scratchpad */}
          <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest">Operator Session log / notes</h3>
            <textarea
              value={activeMission.manualNotes || ''}
              onChange={e => addManualNotes(e.target.value)}
              className="w-full px-3 py-2 border border-sand-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sage-500 h-32 resize-none text-xs leading-relaxed"
              placeholder="Record notes, logistics updates, actions taken, or calculations..."
            />
          </div>

        </div>
      )}

      {activeTab === 'briefing' && (
        <MissionBriefingPanel mission={activeMission} />
      )}

      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* List of currently attached sources */}
          {(activeMission.attachedSources || []).length > 0 && (
            <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest">Attached Citations</h3>
              <div className="space-y-2">
                {activeMission.attachedSources.map(src => (
                  <div key={src.sourcePath} className="flex justify-between items-center p-3 rounded-xl border border-sand-200 bg-sand-50/50">
                    <div>
                      <span className="text-xs font-bold text-sand-800">{src.title}</span>
                      <p className="text-[10px] text-sand-500 font-mono mt-0.5">{src.category}</p>
                    </div>
                    <button 
                      onClick={() => removeSourceFromActiveMission(src.sourcePath)}
                      className="text-red-500 hover:text-red-700 p-1.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <MissionSourceFinder 
            mission={activeMission} 
            onAttachSource={attachSourceToActiveMission} 
            onDetachSource={removeSourceFromActiveMission}
          />
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white border border-sand-300 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest">Operational Session timeline</h3>
          
          <div className="relative border-l-2 border-sand-200 pl-4 ml-2 space-y-4">
            {(activeMission.timeline || []).map((event, idx) => (
              <div key={event.id || idx} className="relative">
                <span className="absolute -left-[21px] top-1 bg-white border-2 border-sand-300 rounded-full w-2.5 h-2.5"></span>
                <div className="text-xs font-semibold text-sand-800 leading-tight">{event.label}</div>
                <div className="text-[10px] text-sand-400 mt-1 font-mono">
                  {new Date(event.createdAt).toLocaleTimeString()} // {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

const TabButton = ({ id, label, active, onClick }) => {
  const isSelected = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2.5 text-xs font-semibold transition-all shrink-0 border-b-2 outline-none ${
        isSelected 
          ? 'border-sage-600 text-sage-800 font-bold' 
          : 'border-transparent text-sand-500 hover:text-sand-700'
      }`}
    >
      {label}
    </button>
  );
};

export default ActiveMissionView;
