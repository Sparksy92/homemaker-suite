import React, { useState } from 'react';
import { 
  Plus, Search, Filter, BookOpen, Clock, FileText, ArrowLeft, 
  Trash2, ShieldAlert, CheckCircle, RotateCcw, Compass, Calendar
} from 'lucide-react';
import { useMissions } from '../context/MissionsContext.jsx';
import StartMissionModal from '../components/missions/StartMissionModal.jsx';
import ActiveMissionView from '../components/missions/ActiveMissionView.jsx';

const Missions = () => {
  const { 
    missions, 
    activeMission, 
    startMission, 
    addCustomMission,
    resumeMission, 
    deleteMission 
  } = useMissions();

  const [showStartModal, setShowStartModal] = useState(false);
  const [viewingActive, setViewingActive] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'completed', 'paused'

  const handleStartMission = (newMission) => {
    addCustomMission(newMission);
    setShowStartModal(false);
    setViewingActive(true);
  };

  const handleResumeMission = (m) => {
    resumeMission(m);
    setViewingActive(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("CRITICAL: Permanently delete this offline mission log? This cannot be undone.")) {
      deleteMission(id);
    }
  };

  const getFilteredMissions = () => {
    return missions.filter(m => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        m.title.toLowerCase().includes(query) ||
        m.missionType.toLowerCase().includes(query) ||
        (m.overview && m.overview.toLowerCase().includes(query));

      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = m.status === 'active' || m.status === 'paused';
      } else if (statusFilter === 'completed') {
        matchesStatus = m.status === 'completed';
      } else if (statusFilter === 'paused') {
        matchesStatus = m.status === 'paused';
      }

      return matchesSearch && matchesStatus;
    });
  };

  const filteredMissions = getFilteredMissions();

  if (activeMission && viewingActive) {
    return (
      <div className="py-6 px-4 max-w-2xl mx-auto space-y-6">
        <ActiveMissionView 
          onBack={() => setViewingActive(false)} 
        />
      </div>
    );
  }

  const getPriorityStyle = (prio) => {
    switch (prio) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-sand-50 text-sand-700 border-sand-200';
      default: return 'bg-sand-50/50 text-sand-500 border-sand-100';
    }
  };

  return (
    <div className="py-6 px-4 max-w-2xl mx-auto space-y-6 font-sans text-sm text-sand-800">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center bg-white border border-sand-300 rounded-2xl p-5 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl font-bold text-sand-900 leading-tight">Mission Control</h2>
          <p className="text-xs text-sand-500 font-sans mt-1">Manage local emergency responses and guided survival drills.</p>
        </div>
        <button
          onClick={() => setShowStartModal(true)}
          className="px-4 py-2.5 bg-sage-700 hover:bg-sage-800 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5 text-xs transition-colors shrink-0"
        >
          <Plus size={16} /> Start Mission
        </button>
      </div>

      {/* Active Mission Banner if paused/paused elsewhere */}
      {activeMission && !viewingActive && (
        <div 
          onClick={() => setViewingActive(true)}
          className="bg-sage-50 border border-sage-300 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:bg-sage-100/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Compass className="text-sage-700 animate-spin-slow shrink-0" size={24} />
            <div>
              <span className="text-[10px] font-bold font-mono text-sage-600 uppercase">Active Session Running</span>
              <h4 className="font-serif font-bold text-sand-900 leading-tight mt-0.5">{activeMission.title}</h4>
            </div>
          </div>
          <span className="text-xs font-bold text-sage-700 flex items-center gap-1 font-sans">
            Resume View <ArrowLeft size={14} className="rotate-180" />
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 border border-sand-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 bg-white"
            placeholder="Search logs by title, overview..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-sand-300 rounded-xl text-xs bg-white text-sand-700 focus:outline-none"
        >
          <option value="all">Status: All</option>
          <option value="active">Active/Paused</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused Only</option>
        </select>
      </div>

      {/* Mission Logs list */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-sand-500 uppercase tracking-widest px-1">Mission Log Archive</h3>
        
        {filteredMissions.length === 0 ? (
          <div className="bg-white border border-sand-300 rounded-2xl p-8 text-center text-sand-500">
            <Clock size={24} className="mx-auto mb-2 text-sand-400" />
            No logged missions match your search filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMissions.map(m => {
              const dateStr = new Date(m.createdAt).toLocaleDateString();
              
              return (
                <div 
                  key={m.id}
                  onClick={() => handleResumeMission(m)}
                  className="bg-white hover:bg-sand-50/50 border border-sand-300 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all shadow-sm group"
                >
                  <div className="space-y-2 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded uppercase ${getPriorityStyle(m.priority)}`}>
                        {m.priority}
                      </span>
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${
                        m.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                      }`}>
                        {m.status}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sand-900 text-base leading-tight group-hover:text-sage-800 transition-colors">
                      {m.title}
                    </h4>

                    <div className="flex items-center gap-4 text-[10px] text-sand-400 font-mono">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {dateStr}</span>
                      <span>Callsign: {m.callsign || 'Operator'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, m.id)}
                      className="p-2 border border-transparent hover:border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-xl transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Mission Modal overlay */}
      {showStartModal && (
        <StartMissionModal
          onStart={handleStartMission}
          onCancel={() => setShowStartModal(false)}
        />
      )}

    </div>
  );
};

export default Missions;
