import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan, savePlan, resetPlan, updatePlan } from '../../services/homesteadPlanningService';
import { PROJECT_TEMPLATES, createProjectFromTemplate, calculateProjectProgress, getNextProjectStep } from '../../planners/projectPlanner';
import PlannerConfidenceIndicator from '../../components/PlannerConfidenceIndicator';
import { Wrench, ArrowLeft, Plus, Trash2, CheckCircle, Clock, Shield, AlertTriangle, Search, X } from 'lucide-react';

const BuildProjectsPage = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    const [projectsPlan, setProjectsPlan] = useState({ projects: [] });
    const [selectedProject, setSelectedProject] = useState(null);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [message, setMessage] = useState('');

    // Dynamic Blueprints Library states
    const [blueprints, setBlueprints] = useState([]);
    const [blueprintsLoading, setBlueprintsLoading] = useState(true);
    const [blueprintsError, setBlueprintsError] = useState(null);
    const [blueprintSearch, setBlueprintSearch] = useState('');
    const [blueprintSystemFilter, setBlueprintSystemFilter] = useState('All');
    const [visibleBlueprintCount, setVisibleBlueprintCount] = useState(6);
    const [selectedBlueprint, setSelectedBlueprint] = useState(null);
    const [isOfflineFallback, setIsOfflineFallback] = useState(false);

    // Custom project form states
    const [customProj, setCustomProj] = useState({
        title: '',
        system: 'Infrastructure',
        difficulty: 'Easy',
        safetyLevel: 'Low',
        estimatedTime: '2 hours',
        materialsText: '',
        toolsText: '',
        stepsText: '',
        notes: ''
    });

    useEffect(() => {
        setProjectsPlan(loadPlan('homemaker_build_projects'));

        const fetchBlueprints = async () => {
            try {
                const res = await fetch('/data/blueprints.json');
                if (!res.ok) throw new Error('Failed to load blueprints database');
                const data = await res.json();
                if (data && Array.isArray(data.blueprints)) {
                    setBlueprints(data.blueprints);
                } else {
                    throw new Error('Invalid blueprints data structure');
                }
            } catch (err) {
                console.warn('Using offline fallback templates:', err.message);
                setBlueprints(PROJECT_TEMPLATES);
                setIsOfflineFallback(true);
                setBlueprintsError(err.message);
            } finally {
                setBlueprintsLoading(false);
            }
        };

        fetchBlueprints();
    }, []);

    // Reset pagination when search or filters change
    useEffect(() => {
        setVisibleBlueprintCount(6);
    }, [blueprintSearch, blueprintSystemFilter]);

    const handleSave = (updatedPlan = projectsPlan) => {
        savePlan('homemaker_build_projects', updatedPlan);
        setProjectsPlan({ ...updatedPlan });
        setMessage('Projects saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleAddBlueprint = (blueprint) => {
        const newProj = createProjectFromTemplate(blueprint);
        if (newProj) {
            const updated = {
                ...projectsPlan,
                projects: [...(projectsPlan.projects || []), newProj]
            };
            handleSave(updated);
            setSelectedBlueprint(null);
            setMessage(`Added "${blueprint.title}" to active builds!`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleAddCustomProject = (e) => {
        e.preventDefault();
        if (!customProj.title) return;

        const newProj = {
            id: `project-custom-${Date.now()}`,
            title: customProj.title,
            system: customProj.system,
            status: 'planned',
            priority: 'medium',
            difficulty: customProj.difficulty,
            safetyLevel: customProj.safetyLevel,
            estimatedTime: customProj.estimatedTime,
            materials: customProj.materialsText.split(',').map(m => m.trim()).filter(Boolean),
            tools: customProj.toolsText.split(',').map(t => t.trim()).filter(Boolean),
            steps: customProj.stepsText.split('\n').map((s, i) => ({ id: i + 1, text: s.trim(), completed: false })).filter(s => s.text),
            notes: customProj.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const updated = {
            ...projectsPlan,
            projects: [...(projectsPlan.projects || []), newProj]
        };

        setCustomProj({
            title: '',
            system: 'Infrastructure',
            difficulty: 'Easy',
            safetyLevel: 'Low',
            estimatedTime: '2 hours',
            materialsText: '',
            toolsText: '',
            stepsText: '',
            notes: ''
        });
        setShowCustomForm(false);
        handleSave(updated);
    };

    const handleToggleStep = (projId, stepId) => {
        const updatedProjects = projectsPlan.projects.map(proj => {
            if (proj.id !== projId) return proj;
            const steps = proj.steps.map(s => {
                if (s.id !== stepId) return s;
                return { ...s, completed: !s.completed };
            });
            const allCompleted = steps.every(s => s.completed);
            return {
                ...proj,
                steps,
                status: allCompleted ? 'complete' : proj.status === 'planned' ? 'active' : proj.status
            };
        });

        const updated = { ...projectsPlan, projects: updatedProjects };
        handleSave(updated);
        if (selectedProject && selectedProject.id === projId) {
            setSelectedProject(updatedProjects.find(p => p.id === projId));
        }
    };

    const handleUpdateStatus = (projId, status) => {
        const updatedProjects = projectsPlan.projects.map(proj => {
            if (proj.id !== projId) return proj;
            return { ...proj, status };
        });

        const updated = { ...projectsPlan, projects: updatedProjects };
        handleSave(updated);
        if (selectedProject && selectedProject.id === projId) {
            setSelectedProject(updatedProjects.find(p => p.id === projId));
        }
    };

    const handleDeleteProject = (projId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            const updatedProjects = projectsPlan.projects.filter(proj => proj.id !== projId);
            const updated = { ...projectsPlan, projects: updatedProjects };
            handleSave(updated);
            setSelectedProject(null);
        }
    };

    const handleUpdateNotes = (projId, notes) => {
        const updatedProjects = projectsPlan.projects.map(proj => {
            if (proj.id !== projId) return proj;
            return { ...proj, notes };
        });

        const updated = { ...projectsPlan, projects: updatedProjects };
        savePlan('homemaker_build_projects', updated);
        setProjectsPlan(updated);
        if (selectedProject && selectedProject.id === projId) {
            setSelectedProject(updatedProjects.find(p => p.id === projId));
        }
    };

    // Client-side search and filtering
    const filteredBlueprints = useMemo(() => {
        return blueprints.filter(bp => {
            const query = blueprintSearch.toLowerCase();
            const matchesSearch = !blueprintSearch || 
                bp.title.toLowerCase().includes(query) ||
                bp.system.toLowerCase().includes(query) ||
                bp.difficulty.toLowerCase().includes(query) ||
                (bp.notes && bp.notes.toLowerCase().includes(query)) ||
                (bp.summary && bp.summary.toLowerCase().includes(query)) ||
                bp.materials.some(m => m.toLowerCase().includes(query)) ||
                bp.tools.some(t => t.toLowerCase().includes(query));
            
            const matchesSystem = blueprintSystemFilter === 'All' || bp.system === blueprintSystemFilter;
            
            return matchesSearch && matchesSystem;
        });
    }, [blueprints, blueprintSearch, blueprintSystemFilter]);

    const visibleBlueprints = filteredBlueprints.slice(0, visibleBlueprintCount);
    const activeList = projectsPlan.projects || [];

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-200 pb-5 gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/homestead')}
                        className="p-2.5 bg-white border border-sand-200 text-charcoal hover:bg-sand-100 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Builds & Projects</h2>
                        <p className="text-xs text-charcoal-500 font-medium">Plan raised beds, cistern stands, solar racks, and woodsheds.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCustomForm(!showCustomForm)}
                        className="py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                        <Plus size={14} />
                        <span>Custom Project</span>
                    </button>
                </div>
            </div>

            <PlannerConfidenceIndicator lastSaved={projectsPlan.updatedAt} />

            {message && (
                <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-semibold text-xs animate-pulse">
                    {message}
                </div>
            )}

            {/* Safety disclaimer */}
            <div className="p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-3xl flex gap-3 items-start shadow-sm text-xs text-amber-900">
                <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                <p className="leading-relaxed">
                    <strong>DIY builds are non-engineered structures.</strong> Always use protective gear. Ensure foundation soil is completely settled and compacted before setting heavy tanks. Consult local structural engineers for building approvals.
                </p>
            </div>

            {/* Custom Project Form */}
            {showCustomForm && (
                <form onSubmit={handleAddCustomProject} className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-md space-y-4">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                        Create Custom Project Blueprint
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Project Title</label>
                            <input
                                type="text" required
                                value={customProj.title}
                                onChange={e => setCustomProj({ ...customProj, title: e.target.value })}
                                className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-bold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">System Category</label>
                            <select
                                value={customProj.system}
                                onChange={e => setCustomProj({ ...customProj, system: e.target.value })}
                                className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-bold"
                            >
                                <option value="Garden">Garden</option>
                                <option value="Water">Water</option>
                                <option value="Energy">Energy</option>
                                <option value="Preservation">Preservation</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Shelter">Shelter</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Materials (comma separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. 2x4 Lumber, Nails, Screws"
                                value={customProj.materialsText}
                                onChange={e => setCustomProj({ ...customProj, materialsText: e.target.value })}
                                className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-semibold"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Tools (comma separated)</label>
                            <input
                                type="text"
                                placeholder="e.g. Hammer, Saw, Drill"
                                value={customProj.toolsText}
                                onChange={e => setCustomProj({ ...customProj, toolsText: e.target.value })}
                                className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-semibold"
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider">Project Steps (one per line)</label>
                        <textarea
                            rows="3"
                            placeholder="Step 1: Cut materials&#10;Step 2: Dry fit assembly&#10;Step 3: Secure joints..."
                            value={customProj.stepsText}
                            onChange={e => setCustomProj({ ...customProj, stepsText: e.target.value })}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-semibold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-charcoal-400 uppercase tracking-wider font-bold">Notes</label>
                        <input
                            type="text"
                            placeholder="Add safety constraints, alignment comments, or sizing notes..."
                            value={customProj.notes}
                            onChange={e => setCustomProj({ ...customProj, notes: e.target.value })}
                            className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-semibold"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
                        >
                            Save Blueprint
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowCustomForm(false)}
                            className="py-2.5 px-4 bg-sand-200 hover:bg-sand-300 text-charcoal font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Template Catalog */}
            <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-100 pb-3 gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Wrench size={18} className="text-sage-700" />
                        <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">
                            Project Blueprints Library
                        </h3>
                        {isOfflineFallback && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                                Offline blueprint fallback loaded.
                            </span>
                        )}
                    </div>
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-2.5 text-sand-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search blueprints..."
                            value={blueprintSearch}
                            onChange={(e) => setBlueprintSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-sand-50 border border-sand-200 rounded-xl focus:ring-1 focus:ring-sage-500 outline-none text-xs transition-all placeholder:text-sand-400"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 pb-1">
                    {['All', 'Garden', 'Water', 'Energy', 'Preservation', 'Infrastructure', 'Sanitation', 'Shelter'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setBlueprintSystemFilter(cat)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                blueprintSystemFilter === cat
                                    ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                                    : 'bg-sand-50 text-sand-400 border-sand-200 hover:border-sand-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {blueprintsLoading ? (
                    <div className="text-center py-12 text-xs text-charcoal-400 italic">
                        Loading blueprints database...
                    </div>
                ) : visibleBlueprints.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {visibleBlueprints.map(temp => (
                            <div 
                                key={temp.id} 
                                onClick={() => setSelectedBlueprint(temp)}
                                className="p-4 bg-sand-50/50 hover:bg-white border border-sand-100 hover:border-sage-300 hover:shadow-md cursor-pointer rounded-3xl space-y-3 flex flex-col justify-between transition-all"
                            >
                                <div className="space-y-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-charcoal-400">{temp.system}</span>
                                        <span className={`text-[8px] font-black px-1.5 py-0.25 rounded uppercase ${
                                            temp.safetyLevel === 'High' ? 'bg-terracotta-50 text-terracotta-700 border border-terracotta-100' :
                                            temp.safetyLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-sand-200 text-charcoal-700'
                                        }`}>
                                            Safety: {temp.safetyLevel}
                                        </span>
                                    </div>
                                    <h4 className="font-serif font-black text-sm text-sage-950 leading-tight">{temp.title}</h4>
                                    <p className="text-[10px] text-charcoal-500 font-sans leading-relaxed line-clamp-2 mt-1">{temp.summary || temp.notes}</p>
                                    <div className="flex flex-wrap gap-1 text-[8px] pt-1">
                                        <span className="bg-sand-200 text-charcoal-700 px-1.5 py-0.5 rounded font-bold">{temp.difficulty}</span>
                                        <span className="bg-sand-200 text-charcoal-700 px-1.5 py-0.5 rounded font-bold">{temp.estimatedTime}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBlueprint(temp);
                                    }}
                                    className="w-full py-2 px-3 bg-white border border-sand-300 hover:bg-sand-100 text-charcoal font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-sm transition-all text-center min-h-[36px]"
                                >
                                    Inspect & Add
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-xs text-charcoal-400 italic">
                        No blueprints found matching search criteria.
                    </div>
                )}

                {/* Load More Button */}
                {!blueprintsLoading && filteredBlueprints.length > visibleBlueprintCount && (
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={() => setVisibleBlueprintCount(prev => prev + 6)}
                            className="py-2 px-4 bg-white border border-sand-300 hover:bg-sand-50 text-charcoal font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all text-center"
                        >
                            Load More Blueprints
                        </button>
                    </div>
                )}
            </div>

            {/* Active projects list */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-3">
                    <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider pl-1 border-b border-sand-100 pb-2">
                        Active Builds List
                    </h3>
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                        {activeList.length > 0 ? (
                            activeList.map(proj => {
                                const progress = calculateProjectProgress(proj);
                                const nextStep = getNextProjectStep(proj);
                                return (
                                    <button
                                        key={proj.id}
                                        onClick={() => setSelectedProject(proj)}
                                        className={`w-full text-left p-4 rounded-3xl border transition-all ${
                                            selectedProject && selectedProject.id === proj.id
                                                ? 'bg-sage-50 border-sage-400 shadow-sm'
                                                : 'bg-white border-sand-200 hover:border-sand-300 shadow-xs'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1">
                                            <span>{proj.system}</span>
                                            <span className={`px-1.5 py-0.25 rounded ${
                                                proj.safetyLevel === 'High' ? 'bg-terracotta-50 text-terracotta-700' :
                                                proj.safetyLevel === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-sand-200 text-charcoal-700'
                                            }`}>
                                                Safety: {proj.safetyLevel}
                                            </span>
                                        </div>
                                        <h4 className="font-serif font-black text-xs text-sage-950 leading-tight mb-2">{proj.title}</h4>
                                        
                                        {nextStep && (
                                            <p className="text-[9px] text-charcoal-500 font-sans leading-relaxed line-clamp-1 mb-2 bg-sand-50 px-2 py-1 rounded border border-sand-100">
                                                Next: {nextStep.text}
                                            </p>
                                        )}

                                        <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-sage-600 transition-all" style={{ width: `${progress}%` }} />
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-xs text-charcoal-400 italic pl-1">No build trackers initialized.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    {selectedProject ? (
                        <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-6">
                            <div className="flex justify-between items-start border-b border-sand-100 pb-4">
                                <div>
                                    <span className="text-[9px] font-black uppercase text-charcoal-400 tracking-widest">{selectedProject.system}</span>
                                    <h3 className="font-serif font-black text-lg text-sage-950 leading-tight">{selectedProject.title}</h3>
                                </div>
                                <button
                                    onClick={() => handleDeleteProject(selectedProject.id)}
                                    className="p-2.5 text-terracotta-600 hover:bg-terracotta-50 rounded-xl transition-all min-w-[44px] min-h-[44px]"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 text-xs">
                                <div className="p-3 bg-sand-50 rounded-2xl flex items-center gap-2">
                                    <Clock size={16} className="text-sage-600" />
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase">Est. Time</div>
                                        <span className="font-bold">{selectedProject.estimatedTime}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-sand-50 rounded-2xl flex items-center gap-2">
                                    <Shield size={16} className="text-sage-600" />
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase">Difficulty</div>
                                        <span className="font-bold">{selectedProject.difficulty}</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-sand-50 rounded-2xl flex items-center gap-2">
                                    <Shield size={16} className="text-sage-600" />
                                    <div>
                                        <div className="text-[9px] font-black text-charcoal-400 uppercase">Safety Level</div>
                                        <span className="font-bold">{selectedProject.safetyLevel}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Materials and Tools */}
                            <div className="grid gap-4 sm:grid-cols-2 text-xs">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-sage-900 border-b border-sand-50 pb-1">Materials Needed</h4>
                                    <ul className="list-disc pl-4 space-y-1 text-charcoal-600 font-sans">
                                        {selectedProject.materials?.map((m, idx) => <li key={idx}>{m}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-sage-900 border-b border-sand-50 pb-1">Tools Required</h4>
                                    <ul className="list-disc pl-4 space-y-1 text-charcoal-600 font-sans">
                                        {selectedProject.tools?.map((t, idx) => <li key={idx}>{t}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {/* Steps checklist */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-sage-950 border-b border-sand-50 pb-1 text-xs">Milestone Steps</h4>
                                <div className="space-y-2">
                                    {selectedProject.steps?.map(step => (
                                        <button
                                            key={step.id}
                                            onClick={() => handleToggleStep(selectedProject.id, step.id)}
                                            className="w-full text-left p-3.5 bg-sand-50/50 hover:bg-sand-100/50 rounded-2xl border border-sand-100 text-xs flex gap-3 items-start transition-all"
                                        >
                                            <div className="mt-0.5 shrink-0 text-sage-600">
                                                {step.completed ? <CheckSquare size={16} /> : <div className="w-4 h-4 rounded border-2 border-sand-300" />}
                                            </div>
                                            <span className={`font-sans leading-relaxed ${step.completed ? 'line-through text-charcoal-400' : 'text-charcoal-800'}`}>
                                                {step.text}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes editing */}
                            <div className="space-y-2 text-xs">
                                <h4 className="font-bold text-sage-950 border-b border-sand-50 pb-1">Project Notes & Custom Adaptations</h4>
                                <textarea
                                    rows="3"
                                    value={selectedProject.notes || ''}
                                    onChange={e => handleUpdateNotes(selectedProject.id, e.target.value)}
                                    placeholder="Add dimensions adjustments, wood treatment ideas, assembly dates, or purchase sources..."
                                    className="w-full p-3 bg-sand-50 rounded-xl border border-sand-200 outline-none text-xs font-semibold leading-relaxed"
                                />
                            </div>

                            {/* Status dropdown */}
                            <div className="flex items-center gap-3 text-xs pt-2 border-t border-sand-100">
                                <span className="font-bold text-charcoal-600">Status:</span>
                                <select
                                    value={selectedProject.status}
                                    onChange={e => handleUpdateStatus(selectedProject.id, e.target.value)}
                                    className="p-2 bg-sand-50 rounded-lg border border-sand-200 outline-none font-bold"
                                >
                                    <option value="planned">Planned</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="complete">Complete</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[300px] border-2 border-dashed border-sand-200 rounded-[2rem] flex flex-col items-center justify-center text-charcoal-400 p-6">
                            <Wrench size={32} className="text-sand-300 mb-2" />
                            <p className="text-xs italic text-center">Select an active build from the left sidebar to track progress details, materials, and steps checklist.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedBlueprint && (
                <div 
                    onClick={() => setSelectedBlueprint(null)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto"
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[2rem] border border-sand-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl p-6 relative space-y-6 my-8"
                    >
                        <button
                            onClick={() => setSelectedBlueprint(null)}
                            className="absolute top-6 right-6 p-2 text-sand-400 hover:text-charcoal hover:bg-sand-100 rounded-full transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                        >
                            <X size={20} />
                        </button>

                        <div className="border-b border-sand-100 pb-4 pr-8">
                            <span className="text-[10px] font-black uppercase text-charcoal-400 tracking-widest">{selectedBlueprint.system}</span>
                            <h3 className="font-serif font-black text-xl text-sage-950 leading-tight">{selectedBlueprint.title}</h3>
                            <p className="text-xs text-charcoal-500 font-sans mt-1.5 leading-relaxed">{selectedBlueprint.summary}</p>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-xs">
                            <div className="p-3 bg-sand-50 rounded-2xl">
                                <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-wider">Difficulty</div>
                                <span className="font-bold text-sage-900">{selectedBlueprint.difficulty}</span>
                            </div>
                            <div className="p-3 bg-sand-50 rounded-2xl">
                                <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-wider">Safety Level</div>
                                <span className="font-bold text-sage-900">{selectedBlueprint.safetyLevel}</span>
                            </div>
                            <div className="p-3 bg-sand-50 rounded-2xl">
                                <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-wider">Est. Time</div>
                                <span className="font-bold text-sage-900">{selectedBlueprint.estimatedTime}</span>
                            </div>
                            <div className="p-3 bg-sand-50 rounded-2xl">
                                <div className="text-[9px] font-black text-charcoal-400 uppercase tracking-wider">Source</div>
                                <span className="font-bold text-sage-900 capitalize">{selectedBlueprint.source || 'internal'}</span>
                            </div>
                        </div>

                        {/* Materials and Tools */}
                        <div className="grid gap-6 sm:grid-cols-2 text-xs">
                            <div className="p-4 bg-sand-50/50 rounded-2xl border border-sand-100 space-y-2">
                                <h4 className="font-bold text-sage-900 border-b border-sand-100 pb-1">Materials Needed</h4>
                                <ul className="list-disc pl-4 space-y-1 text-charcoal-600 font-sans">
                                    {selectedBlueprint.materials?.map((m, idx) => <li key={idx}>{m}</li>)}
                                </ul>
                            </div>
                            <div className="p-4 bg-sand-50/50 rounded-2xl border border-sand-100 space-y-2">
                                <h4 className="font-bold text-sage-900 border-b border-sand-100 pb-1">Tools Required</h4>
                                <ul className="list-disc pl-4 space-y-1 text-charcoal-600 font-sans">
                                    {selectedBlueprint.tools?.map((t, idx) => <li key={idx}>{t}</li>)}
                                </ul>
                            </div>
                        </div>

                        {/* Steps list */}
                        <div className="space-y-2 text-xs">
                            <h4 className="font-bold text-sage-955 border-b border-sand-100 pb-1">Milestone Steps Checklist</h4>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                {selectedBlueprint.steps?.map((step, idx) => (
                                    <div key={step.id || idx} className="p-3 bg-sand-50 rounded-xl flex gap-3 items-start border border-sand-100/50">
                                        <div className="w-5 h-5 rounded-full bg-sage-50 border border-sage-200 text-[10px] font-bold text-sage-700 flex items-center justify-center shrink-0 mt-0.5">
                                            {step.id}
                                        </div>
                                        <span className="font-sans text-charcoal-700 leading-relaxed">{step.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedBlueprint.notes && (
                            <div className="p-4 bg-sand-50 rounded-2xl text-xs space-y-1 border border-sand-100">
                                <h4 className="font-bold text-sage-950">Design Notes</h4>
                                <p className="text-charcoal-600 font-sans leading-relaxed">{selectedBlueprint.notes}</p>
                            </div>
                        )}

                        {/* Safety Notes */}
                        {selectedBlueprint.safetyNotes && selectedBlueprint.safetyNotes.length > 0 && (
                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                    <AlertTriangle size={14} />
                                    <span>Critical Safety Guidelines</span>
                                </div>
                                <ul className="list-disc pl-4 space-y-1 font-sans text-amber-800">
                                    {selectedBlueprint.safetyNotes.map((sn, idx) => <li key={idx}>{sn}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Modal Action Buttons */}
                        <div className="flex gap-3 pt-3 border-t border-sand-100">
                            <button
                                onClick={() => handleAddBlueprint(selectedBlueprint)}
                                className="flex-1 py-3 px-4 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all text-center min-h-[44px]"
                            >
                                + Add to Active Builds
                            </button>
                            <button
                                onClick={() => setSelectedBlueprint(null)}
                                className="py-3 px-5 bg-sand-100 hover:bg-sand-200 text-charcoal font-bold text-xs uppercase tracking-wider rounded-2xl transition-all min-h-[44px]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple custom inline helper to render checkbox since Lucide CheckSquare was conflicting
const CheckSquare = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-square">
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
);

export default BuildProjectsPage;
