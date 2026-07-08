import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ShieldAlert, CheckCircle, Circle, 
  ExternalLink, Bookmark, Plus, Clock, Cpu, RefreshCw
} from 'lucide-react';
import { getMissionSourceRecommendations } from '../../modules/search/missionSourceRecommendations.js';
import { buildMissionSearchSummary } from '../../modules/search/missionSearchUtils.js';

const MissionSourceFinder = ({ 
  mission, 
  onAttachSource,
  onDetachSource
}) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterQuery, setFilterQuery] = useState('');
  const [indexFilter, setIndexFilter] = useState('all'); // 'all', 'indexed', 'unindexed'
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'safe', 'electrical', 'water_treatment', etc.
  const [extFilter, setExtFilter] = useState('all'); // 'all', 'pdf', 'txt', 'epub'

  // Load offline library materials list directly
  useEffect(() => {
    fetch('/offline_survival_index.json')
      .then(res => res.json())
      .then(data => {
        const flattened = [];
        Object.entries(data || {}).forEach(([catName, filesList]) => {
          filesList.forEach(file => {
            flattened.push({
              name: file.name,
              path: file.path,
              category: catName,
              indexed: true // Mark as indexed in our local static setup
            });
          });
        });
        setMaterials(flattened);
      })
      .catch(err => console.error("Failed to load local offline index:", err));
  }, []);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const results = getMissionSourceRecommendations({
        mission,
        materials,
        metadata: {},
        template: null,
        limit: 50,
      });
      setRecommendations(results.recommendations);
      setLoading(false);
    }, 400);
  };

  // Run automatically when materials list or mission changes
  useEffect(() => {
    if (materials.length > 0 && mission) {
      handleSearch();
    }
  }, [materials, mission.id]);

  const getFilteredRecs = () => {
    if (!recommendations) return [];
    return recommendations.filter(r => {
      // Query search
      const q = filterQuery.toLowerCase();
      const matchesQuery = r.title.toLowerCase().includes(q) || r.sourcePath.toLowerCase().includes(q);

      // Index status
      let matchesIndex = true;
      if (indexFilter === 'indexed') matchesIndex = r.indexed === true;
      if (indexFilter === 'unindexed') matchesIndex = r.indexed !== true;

      // Risk category
      let matchesRisk = true;
      if (riskFilter === 'safe') matchesRisk = !r.riskCategory;
      else if (riskFilter !== 'all') matchesRisk = r.riskCategory === riskFilter;

      // File extension
      let matchesExt = true;
      if (extFilter !== 'all') matchesExt = r.extension === extFilter;

      return matchesQuery && matchesIndex && matchesRisk && matchesExt;
    });
  };

  const filtered = getFilteredRecs();
  const summary = recommendations ? buildMissionSearchSummary(filtered) : null;

  const handleOpenDocument = (rec) => {
    navigate(`/library?offlineFolder=${encodeURIComponent(rec.category)}&offlineFile=${encodeURIComponent(rec.title)}`);
  };

  const isAttached = (rec) => {
    return (mission.attachedSources || []).some(s => s.sourcePath === rec.sourcePath);
  };

  const handleToggleAttach = (rec) => {
    if (isAttached(rec)) {
      onDetachSource(rec.sourcePath);
    } else {
      onAttachSource(rec);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-sand-300 p-5 space-y-4 shadow-sm font-sans">
      
      <div className="flex justify-between items-center border-b border-sand-200 pb-3 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-serif font-bold text-sage-800 tracking-tight">
            Reference Guide Recommendations
          </h3>
          <p className="text-xs text-sand-500 font-sans mt-0.5">
            Matching offline manuals to mission objectives and checklist vectors.
          </p>
        </div>

        <button 
          onClick={handleSearch} 
          disabled={loading || materials.length === 0}
          className="px-3 py-1.5 border border-sage-600 text-sage-700 hover:bg-sage-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Re-scan Library
        </button>
      </div>

      {loading && (
        <div className="py-8 text-center text-xs text-sand-500 font-mono tracking-wide animate-pulse">
          SCANNING OFFLINE DIRECTORY MANIFEST...
        </div>
      )}

      {recommendations && !loading && (
        <>
          {/* Summary stats HUD */}
          <div className="grid grid-cols-3 gap-2 bg-sand-50 p-3 rounded-xl border border-sand-200 text-center">
            <div>
              <div className="text-[10px] font-bold text-sand-500 uppercase">Evaluated</div>
              <strong className="text-sm text-sand-800 font-serif">{summary.total}</strong>
            </div>
            <div>
              <div className="text-[10px] font-bold text-sand-500 uppercase">Strong Matches</div>
              <strong className="text-sm text-green-600 font-serif">{summary.strongMatches}</strong>
            </div>
            <div>
              <div className="text-[10px] font-bold text-sand-500 uppercase">Citations</div>
              <strong className="text-sm text-sage-700 font-serif">{(mission.attachedSources || []).length}</strong>
            </div>
          </div>

          {/* Filters toolbar */}
          <div className="flex gap-2 flex-wrap">
            <div className="flex-1 min-w-[150px] relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" />
              <input 
                type="text" 
                className="w-full pl-9 pr-3 py-1.5 border border-sand-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sage-500 bg-sand-50" 
                placeholder="Filter results..."
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
              />
            </div>
            
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="px-2 py-1.5 border border-sand-300 rounded-xl text-xs bg-white text-sand-700 focus:outline-none focus:ring-1 focus:ring-sage-500"
            >
              <option value="all">Risk: All</option>
              <option value="safe">Safe Only</option>
              <option value="electrical">Electrical</option>
              <option value="water_treatment">Water Treatment</option>
              <option value="medical">Medical</option>
              <option value="mechanical">Mechanical</option>
              <option value="chemical">Chemical</option>
              <option value="food_preservation">Food Preservation</option>
            </select>

            <select
              value={extFilter}
              onChange={e => setExtFilter(e.target.value)}
              className="px-2 py-1.5 border border-sand-300 rounded-xl text-xs bg-white text-sand-700 focus:outline-none focus:ring-1 focus:ring-sage-500"
            >
              <option value="all">Type: All</option>
              <option value="pdf">PDF</option>
              <option value="txt">TXT</option>
              <option value="epub">EPUB</option>
            </select>
          </div>

          {/* Scored Recommendations Cards Grid */}
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-xs text-sand-500">
              No offline library recommendations found matching the specified filters.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
              {filtered.map(rec => {
                const getLabelStyle = (label) => {
                  if (label === 'Strong Match') return 'border-green-600 bg-green-50/20 text-green-700';
                  if (label === 'Related') return 'border-sage-500 bg-sage-50/20 text-sage-700';
                  return 'border-sand-300 bg-sand-50/30 text-sand-500';
                };

                const attached = isAttached(rec);

                return (
                  <div 
                    key={rec.sourcePath} 
                    className={`border rounded-xl p-3.5 flex flex-col gap-2 transition-all ${getLabelStyle(rec.matchLabel)}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-serif font-bold text-sand-800 text-xs leading-tight">
                            {rec.title.replace(/\.(pdf|zip|epub|txt|mp4)$/i, '')}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-sand-300 bg-white text-sand-600 uppercase">
                            {rec.extension}
                          </span>
                          {rec.riskCategory && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-600 font-bold uppercase">
                              RISK: {rec.riskCategory.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-sand-500 font-mono mt-1 leading-none">
                          {rec.category} // {rec.sourcePath.split('/').pop()}
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {rec.matchLabel}
                        </div>
                        <div className="text-[9px] text-sand-500 font-mono mt-0.5">
                          Score: {rec.score}
                        </div>
                      </div>
                    </div>

                    {rec.metadataSummary && (
                      <p className="text-xs text-sand-600 leading-relaxed margin-0">
                        {rec.metadataSummary}
                      </p>
                    )}

                    {/* Match Reasons */}
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {rec.reasons.map((reason, idx) => (
                        <span key={idx} className="text-[9px] font-mono text-sand-500 bg-sand-100/50 px-2 py-0.5 rounded">
                          {reason}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-1 border-t border-sand-200/40 pt-2 shrink-0">
                      <button 
                        onClick={() => handleOpenDocument(rec)}
                        className="px-2.5 py-1 bg-white hover:bg-sand-100 border border-sand-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors text-sand-700"
                      >
                        <ExternalLink size={10} /> Open
                      </button>
                      <button 
                        onClick={() => handleToggleAttach(rec)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          attached 
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                            : 'bg-sage-600 text-white border-sage-700 hover:bg-sage-700'
                        }`}
                      >
                        {attached ? 'Detach Reference' : 'Attach Reference'}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default MissionSourceFinder;
