import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan, savePlan, resetPlan, updatePlan } from '../../services/homesteadPlanningService';
import { PROJECT_TEMPLATES, createProjectFromTemplate, calculateProjectProgress } from '../../planners/projectPlanner';
import PlannerConfidenceIndicator from '../../components/PlannerConfidenceIndicator';
import { Wrench, ArrowLeft, Plus, Trash2, CheckCircle, Clock, Shield, AlertTriangle } from 'lucide-react';

const BuildProjectsPage = () => {
    const navigate = useNavigate();
    const { homesteadProfile } = useUser();

    const [projectsPlan, setProjectsPlan] = useState({ projects: [] });
    const [selectedProject, setSelectedProject] = useState(null);
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [message, setMessage] = useState('');

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
    }, []);

    const handleSave = (updatedPlan = projectsPlan) => {
        savePlan('homemaker_build_projects', updatedPlan);
        setProjectsPlan({ ...updatedPlan });
        setMessage('Projects saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleAddTemplate = (templateId) => {
        const newProj = createProjectFromTemplate(templateId);
        if (newProj) {
            const updated = {
                ...projectsPlan,
                projects: [...(projectsPlan.projects || []), newProj]
            };
            handleSave(updated);
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
                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider border-b border-sand-100 pb-2">
                    Project Blueprints Library
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {PROJECT_TEMPLATES.map(temp => (
                        <div key={temp.id} className="p-4 bg-sand-50/50 border border-sand-100 rounded-3xl space-y-3 flex flex-col justify-between">
                            <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-charcoal-400">{temp.system}</span>
                                <h4 className="font-serif font-black text-sm text-sage-950 leading-tight">{temp.title}</h4>
                                <div className="flex flex-wrap gap-1 text-[8px] pt-1">
                                    <span className="bg-sand-200 text-charcoal-700 px-1.5 py-0.5 rounded font-bold">{temp.difficulty}</span>
                                    <span className="bg-sand-200 text-charcoal-700 px-1.5 py-0.5 rounded font-bold">Safety: {temp.safetyLevel}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAddTask(temp.id) || handleAddTemplate(temp.id)}
                                className="w-full py-2 px-3 bg-white border border-sand-300 hover:bg-sand-100 text-charcoal font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-sm transition-all text-center min-h-[36px]"
                            >
                                + Add to Active Builds
                            </button>
                        </div>
                    ))}
                </div>
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
                                            <span>{proj.status}</span>
                                        </div>
                                        <h4 className="font-serif font-black text-xs text-sage-950 leading-tight mb-2">{proj.title}</h4>
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
                                        {selectedProject.materials.map((m, idx) => <li key={idx}>{m}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-sage-900 border-b border-sand-50 pb-1">Tools Required</h4>
                                    <ul className="list-disc pl-4 space-y-1 text-charcoal-600 font-sans">
                                        {selectedProject.tools.map((t, idx) => <li key={idx}>{t}</li>)}
                                    </ul>
                                </div>
                            </div>

                            {/* Steps checklist */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-sage-950 border-b border-sand-50 pb-1 text-xs">Milestone Steps</h4>
                                <div className="space-y-2">
                                    {selectedProject.steps.map(step => (
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
