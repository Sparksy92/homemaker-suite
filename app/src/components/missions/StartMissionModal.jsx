import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, X, Play } from 'lucide-react';
import { missionTemplates } from '../../modules/missions/missionTemplates.js';
import { createMissionFromTemplate } from '../../modules/missions/missionUtils.js';

const StartMissionModal = ({ onStart, onCancel }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(missionTemplates[0].id);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [locationLabel, setLocationLabel] = useState('');
  const [callsign, setCallsign] = useState('Operator');
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [checklist, setChecklist] = useState([]);

  const selectedTemplate = missionTemplates.find(t => t.id === selectedTemplateId) || missionTemplates[0];

  useEffect(() => {
    if (selectedTemplate) {
      setTitle(selectedTemplate.title);
      setPriority(selectedTemplate.defaultPriority || 'medium');
      setOverview(selectedTemplate.description || '');
      setObjectives([...(selectedTemplate.objectives || [])]);
      setChecklist([...(selectedTemplate.checklist || [])]);
    }
  }, [selectedTemplateId]);

  const handleStart = () => {
    if (!title.trim()) {
      alert("Please provide a mission title.");
      return;
    }
    const templateCopy = {
      ...selectedTemplate,
      objectives,
      checklist
    };
    const fields = {
      title: title.trim(),
      priority,
      locationLabel: locationLabel.trim(),
      callsign: callsign.trim(),
      overview: overview.trim()
    };
    const mission = createMissionFromTemplate(templateCopy, fields);
    onStart(mission);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-sand-300 w-full max-w-lg overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-sage-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-serif text-xl font-bold tracking-tight">Start Survival Mission</h3>
            <p className="text-xs text-sage-200 font-sans tracking-wide">Configure local operational field session</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-sage-700 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 font-sans text-sm text-sand-800">
          {/* Template Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-sand-600 uppercase tracking-wider block">Mission Template</label>
            <select
              value={selectedTemplateId}
              onChange={e => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-sand-300 rounded-xl bg-sand-50 focus:outline-none focus:ring-2 focus:ring-sage-500 font-semibold"
            >
              {missionTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <hr className="border-sand-200" />

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider block">Mission Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 font-semibold"
                placeholder="e.g. Winter Freeze Preparedness"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider block">Operator Callsign</label>
              <input
                type="text"
                value={callsign}
                onChange={e => setCallsign(e.target.value)}
                className="w-full px-3 py-2 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider block">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-sand-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 font-semibold"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider block">Location / Sector</label>
              <input
                type="text"
                value={locationLabel}
                onChange={e => setLocationLabel(e.target.value)}
                className="w-full px-3 py-2 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500"
                placeholder="e.g. Sector 4, Homestead Barn"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider block">Situation Overview</label>
              <textarea
                value={overview}
                onChange={e => setOverview(e.target.value)}
                className="w-full px-3 py-2 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 h-20 resize-none"
                placeholder="Describe current emergency/logistical scenario details..."
              />
            </div>
          </div>

          {/* Objectives */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider">Objectives</label>
              <button
                type="button"
                onClick={() => setObjectives(prev => [...prev, 'New Objective'])}
                className="text-xs font-bold text-sage-600 hover:text-sage-800 flex items-center gap-1"
              >
                <Plus size={14} /> Add Objective
              </button>
            </div>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={obj}
                    onChange={e => {
                      const copy = [...objectives];
                      copy[idx] = e.target.value;
                      setObjectives(copy);
                    }}
                    className="flex-1 px-3 py-1.5 border border-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setObjectives(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist Tasks */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-sand-600 uppercase tracking-wider">Operational Tasks Checklist</label>
              <button
                type="button"
                onClick={() => setChecklist(prev => [...prev, 'New checklist task'])}
                className="text-xs font-bold text-sage-600 hover:text-sage-800 flex items-center gap-1"
              >
                <Plus size={14} /> Add Task
              </button>
            </div>
            <div className="space-y-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const copy = [...checklist];
                      copy[idx] = e.target.value;
                      setChecklist(copy);
                    }}
                    className="flex-1 px-3 py-1.5 border border-sand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sage-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setChecklist(prev => prev.filter((_, i) => i !== idx))}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-sand-100 border-t border-sand-200 px-6 py-4 flex justify-between items-center shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white hover:bg-sand-200 border border-sand-300 rounded-xl transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-5 py-2 bg-sage-700 hover:bg-sage-800 text-white rounded-xl shadow-md transition-all flex items-center gap-2 font-semibold"
          >
            <Play size={16} fill="white" /> Launch Mission
          </button>
        </div>

      </div>
    </div>
  );
};

export default StartMissionModal;
