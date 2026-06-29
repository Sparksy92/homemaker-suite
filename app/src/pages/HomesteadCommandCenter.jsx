import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
    loadPlan,
    savePlan,
    updatePlan
} from '../services/homesteadPlanningService';
import { generateSeasonalTasks } from '../planners/seasonalTaskEngine';
import { PROJECT_TEMPLATES, createProjectFromTemplate, getNextProjectStep, calculateProjectProgress } from '../planners/projectPlanner';
import HomesteadOnboarding from '../components/onboarding/HomesteadOnboarding';
import {
    Home,
    User,
    Droplets,
    Archive,
    Zap,
    Compass,
    Wrench,
    CheckSquare,
    Square,
    Plus,
    Activity,
    Printer,
    CheckCircle,
    ArrowRight,
    AlertTriangle,
    ShieldAlert,
    Trash2,
    Check,
    Users,
    Cloud,
    BookOpen,
    Sparkles,
    Flame
} from 'lucide-react';

const HomesteadCommandCenter = () => {
    const navigate = useNavigate();
    const { homesteadProfile, readinessScore, readinessBreakdown, updateHomesteadProfile, sustainability, toggleTask, addCustomTask, removeTask } = useUser();

    const [showOnboarding, setShowOnboarding] = useState(false);

    // Planning States
    const [projectsPlan, setProjectsPlan] = useState({ projects: [] });

    // Checklist filtering & form states
    const [filterStatus, setFilterStatus] = useState('All'); // All, Active, Completed
    const [filterSystem, setFilterSystem] = useState('All');
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newSystem, setNewSystem] = useState('Garden');
    const [formOpen, setFormOpen] = useState(false);

    // Load projects plan on mount / profile change
    useEffect(() => {
        setProjectsPlan(loadPlan('homemaker_build_projects'));
    }, [homesteadProfile]);

    // Safe seasonal-task import helper
    useEffect(() => {
        if (!sustainability || !sustainability.tasks || !homesteadProfile) return;
        
        const seasonalTasks = generateSeasonalTasks({ homesteadProfile });
        
        seasonalTasks.forEach(st => {
            const exists = sustainability.tasks.some(
                t => t.sourceId === st.id || t.id === `seasonal-${st.id}`
            );
            if (!exists) {
                addCustomTask({
                    id: `seasonal-${st.id}`,
                    sourceId: st.id,
                    title: st.title,
                    desc: st.desc || '',
                    system: st.system,
                    priority: st.priority || 'medium',
                    completed: false,
                    type: 'seasonal'
                });
            }
        });
    }, [sustainability?.tasks, homesteadProfile, addCustomTask]);

    const handleCreateProjectFromTemplate = (templateId) => {
        const newProj = createProjectFromTemplate(templateId);
        if (newProj) {
            updatePlan('homemaker_build_projects', (prev) => {
                const currentProjects = prev.projects || [];
                return {
                    ...prev,
                    projects: [...currentProjects, newProj]
                };
            });
            // Reload projects state
            setProjectsPlan(loadPlan('homemaker_build_projects'));
        }
    };

    const handleToggleProjectStep = (projId, stepId) => {
        updatePlan('homemaker_build_projects', (prev) => {
            const currentProjects = prev.projects || [];
            return {
                ...prev,
                projects: currentProjects.map(proj => {
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
                })
            };
        });
        setProjectsPlan(loadPlan('homemaker_build_projects'));
    };

    // Calculate dynamic readiness labels (Avoid fake precision)
    const getReadinessLabel = (score) => {
        if (!score && score !== 0) return 'Needs setup';
        if (score <= 25) return 'Needs setup';
        if (score <= 50) return 'Starter';
        if (score <= 75) return 'Improving';
        return 'Strong';
    };

    const getReadinessColor = (label) => {
        switch (label) {
            case 'Strong': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
            case 'Improving': return 'text-blue-700 bg-blue-50 border-blue-200';
            case 'Starter': return 'text-amber-700 bg-amber-50 border-amber-200';
            default: return 'text-terracotta-700 bg-terracotta-50 border-terracotta-200';
        }
    };

    const getBarColor = (score) => {
        if (!score && score !== 0) return 'bg-sand-300';
        if (score <= 25) return 'bg-terracotta-500';
        if (score <= 50) return 'bg-amber-500';
        if (score <= 75) return 'bg-blue-500';
        return 'bg-emerald-600';
    };

    // Gather active projects
    const activeProjectsList = projectsPlan.projects || [];

    // Start Here Pathways
    const pathways = [];
    if (!homesteadProfile || homesteadProfile.skipped) {
        pathways.push({
            title: 'Complete Homestead Profile Wizard',
            desc: 'Map your local climate, frost dates, and family size to unlock specialized planners.',
            action: () => setShowOnboarding(true),
            btnText: 'Set Up Now',
            icon: <User className="text-terracotta-600" />
        });
    }

    // Filtered tasks for checklist
    const allTasks = sustainability?.tasks || [];
    
    const filteredTasks = useMemo(() => {
        return allTasks.filter(t => {
            const matchesStatus = 
                filterStatus === 'All' ? true :
                filterStatus === 'Active' ? !t.completed :
                t.completed;
            
            const matchesSystem = 
                filterSystem === 'All' ? true :
                t.system === filterSystem;
            
            return matchesStatus && matchesSystem;
        });
    }, [allTasks, filterStatus, filterSystem]);

    // Checklist metrics
    const totalCount = allTasks.length;
    const completedCount = allTasks.filter(t => t.completed).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleAddCustom = (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        addCustomTask({
            title: newTitle,
            desc: newDesc,
            system: newSystem,
            completed: false,
            type: 'manual'
        });

        setNewTitle('');
        setNewDesc('');
        setNewSystem('Garden');
        setFormOpen(false);
    };

    const getSystemIcon = (system) => {
        switch (system) {
            case 'Water': return <Droplets size={12} className="text-blue-500" />;
            case 'Energy': return <Zap size={12} className="text-yellow-500" />;
            case 'Garden': return <Home size={12} className="text-emerald-500" />;
            case 'Preservation': return <Archive size={12} className="text-amber-600" />;
            case 'Sanitation': return <CheckCircle size={12} className="text-teal-600" />;
            default: return <Wrench size={12} className="text-sand-500" />;
        }
    };

    return (
        <div className="space-y-8 pb-16 px-4 sm:px-0">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-200 pb-5 gap-4">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-serif font-bold text-sage-900 leading-tight">Homestead Command Center</h2>
                    <p className="text-sm text-charcoal-500 font-medium">Your personalized, off-grid homestead operating system.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/field-binder')}
                        className="py-2.5 px-4 bg-white border border-sand-300 text-charcoal font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm hover:bg-sand-50 transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                        <Printer size={16} />
                        <span>Print Field Binder</span>
                    </button>
                </div>
            </div>

            {/* Profile check banner */}
            {(!homesteadProfile || homesteadProfile.skipped) && (
                <div className="p-5 bg-terracotta-50 border-l-4 border-terracotta-500 rounded-r-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-terracotta-800 font-bold text-sm">
                            <AlertTriangle size={18} />
                            <span>Homestead Profile Incomplete</span>
                        </div>
                        <p className="text-xs text-terracotta-700 leading-relaxed max-w-xl">
                            You are running on default values. Complete the 5-step profile questionnaire to customize calendars, water estimators, and safety checklists.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowOnboarding(true)}
                        className="py-2.5 px-4 bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all self-start sm:self-center shrink-0 min-h-[44px]"
                    >
                        Configure Profile
                    </button>
                </div>
            )}

            {/* Main grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left col: Profile & Readiness Radar */}
                <div className="space-y-6 md:col-span-1">
                    
                    {/* Tidy Profile Metrics Grid */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                            <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><User size={18} /></div>
                            <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">Homestead Profile</h3>
                        </div>

                        {homesteadProfile && !homesteadProfile.skipped ? (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-sand-50/50 rounded-2xl border border-sand-100/50 flex flex-col">
                                    <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Users size={10} /> Household
                                    </span>
                                    <span className="font-serif font-black text-xs text-sage-950 leading-tight">
                                        {homesteadProfile.household?.size || 1} People
                                    </span>
                                </div>
                                <div className="p-3 bg-sand-50/50 rounded-2xl border border-sand-100/50 flex flex-col">
                                    <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Cloud size={10} /> Climate
                                    </span>
                                    <span className="font-serif font-black text-xs text-sage-950 leading-tight capitalize">
                                        {homesteadProfile.region?.climate || 'Temperate'}
                                    </span>
                                </div>
                                <div className="p-3 bg-sand-50/50 rounded-2xl border border-sand-100/50 flex flex-col">
                                    <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Droplets size={10} /> Water Source
                                    </span>
                                    <span className="font-serif font-black text-xs text-sage-950 leading-tight capitalize truncate">
                                        {homesteadProfile.water?.primary?.replace('_', ' ') || 'Well'}
                                    </span>
                                </div>
                                <div className="p-3 bg-sand-50/50 rounded-2xl border border-sand-100/50 flex flex-col">
                                    <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Archive size={10} /> Pantry Buffer
                                    </span>
                                    <span className="font-serif font-black text-xs text-sage-950 leading-tight">
                                        {homesteadProfile.pantry?.targetDays || 90} Days
                                    </span>
                                </div>
                                <div className="p-3 bg-sand-50/50 rounded-2xl border border-sand-100/50 flex flex-col">
                                    <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Zap size={10} /> Energy Setup
                                    </span>
                                    <span className="font-serif font-black text-xs text-sage-950 leading-tight capitalize truncate">
                                        {homesteadProfile.energy?.setup?.replace('_', ' ') || 'Solar'}
                                    </span>
                                </div>
                                <div className="p-3 bg-sand-50/50 rounded-2xl border border-sand-100/50 flex flex-col">
                                    <span className="text-[8px] font-black text-charcoal-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <Sparkles size={10} /> Skill Level
                                    </span>
                                    <span className="font-serif font-black text-xs text-sage-950 leading-tight capitalize">
                                        {homesteadProfile.experience?.level || 'Beginner'}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 space-y-2">
                                <p className="text-xs text-charcoal-400 italic">No custom profile configured yet.</p>
                                <button
                                    onClick={() => setShowOnboarding(true)}
                                    className="text-xs text-terracotta-600 hover:text-terracotta-800 font-bold underline"
                                >
                                    Start Setup Wizard
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Readiness Cards with Security Status Progress Bars */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                            <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><Activity size={18} /></div>
                            <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">System Readiness</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Water */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                        Water Security
                                    </span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.water))}`}>
                                        {getReadinessLabel(readinessBreakdown?.water)}
                                    </span>
                                </div>
                                <div className="h-2 bg-sand-100 rounded-full overflow-hidden border border-sand-200/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(readinessBreakdown?.water)}`}
                                        style={{ width: `${readinessBreakdown?.water || 10}%` }}
                                    />
                                </div>
                            </div>
                            {/* Food */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        Pantry & Storage
                                    </span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.food))}`}>
                                        {getReadinessLabel(readinessBreakdown?.food)}
                                    </span>
                                </div>
                                <div className="h-2 bg-sand-100 rounded-full overflow-hidden border border-sand-200/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(readinessBreakdown?.food)}`}
                                        style={{ width: `${readinessBreakdown?.food || 10}%` }}
                                    />
                                </div>
                            </div>
                            {/* Energy */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                        Energy & Power
                                    </span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.energy))}`}>
                                        {getReadinessLabel(readinessBreakdown?.energy)}
                                    </span>
                                </div>
                                <div className="h-2 bg-sand-100 rounded-full overflow-hidden border border-sand-200/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(readinessBreakdown?.energy)}`}
                                        style={{ width: `${readinessBreakdown?.energy || 10}%` }}
                                    />
                                </div>
                            </div>
                            {/* Garden */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        Crop Production
                                    </span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.garden))}`}>
                                        {getReadinessLabel(readinessBreakdown?.garden)}
                                    </span>
                                </div>
                                <div className="h-2 bg-sand-100 rounded-full overflow-hidden border border-sand-200/50">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(readinessBreakdown?.garden)}`}
                                        style={{ width: `${readinessBreakdown?.garden || 10}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right col: Pathways & Today's tasks / Projects */}
                <div className="space-y-6 md:col-span-2">
                    
                    {/* Start Here Pathway */}
                    {pathways.length > 0 && (
                        <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                                <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><Compass size={18} /></div>
                                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">Start Here Pathway</h3>
                            </div>

                            <div className="space-y-3">
                                {pathways.map((p, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-sand-200 hover:border-sage-400 hover:shadow-md transition-all gap-4">
                                        <div className="flex gap-3 items-start">
                                            <div className="p-2 bg-sand-50 rounded-xl shrink-0 mt-0.5">{p.icon}</div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-xs font-black text-charcoal-800 uppercase tracking-wider">{p.title}</h4>
                                                <p className="text-[10px] text-charcoal-500 leading-relaxed font-sans">{p.desc}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={p.action}
                                            className="py-2 px-3.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-start sm:self-center shrink-0 flex items-center gap-1"
                                        >
                                            <span>{p.btnText}</span>
                                            <ArrowRight size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Redesigned Interactive Checklist */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-sand-100 pb-3 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><CheckSquare size={18} /></div>
                                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">Today's Operating Checklist</h3>
                            </div>
                            
                            <button
                                onClick={() => setFormOpen(!formOpen)}
                                className="text-xs text-sage-600 hover:text-sage-800 font-bold flex items-center gap-1 self-start sm:self-center"
                            >
                                <Plus size={14} /> Add Task
                            </button>
                        </div>

                        {/* Progress Bar Header */}
                        {totalCount > 0 && (
                            <div className="space-y-2 p-4 bg-sand-50/50 rounded-2xl border border-sand-100">
                                <div className="flex justify-between text-xs font-bold text-charcoal-700">
                                    <span>Operating Progress</span>
                                    <span>{completedCount} of {totalCount} tasks completed ({progressPercent}%)</span>
                                </div>
                                <div className="h-2.5 bg-sand-200 rounded-full overflow-hidden border border-sand-300/30">
                                    <div 
                                        className="h-full bg-sage-600 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Checklist Filters */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex gap-1">
                                {['All', 'Active', 'Completed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
                                            filterStatus === status 
                                                ? 'bg-sage-600 text-white border-sage-600 shadow-xs' 
                                                : 'bg-white text-sand-400 border-sand-200 hover:border-sand-300'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            
                            <select
                                value={filterSystem}
                                onChange={(e) => setFilterSystem(e.target.value)}
                                className="p-1.5 bg-sand-50 rounded-xl border border-sand-200 outline-none text-[10px] font-bold text-charcoal-600"
                            >
                                <option value="All">All Systems</option>
                                <option value="Garden">Garden</option>
                                <option value="Water">Water</option>
                                <option value="Energy">Energy</option>
                                <option value="Preservation">Preservation</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Inline Task Form */}
                        {formOpen && (
                            <form onSubmit={handleAddCustom} className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-3 animate-fadeIn">
                                <h4 className="text-[10px] font-black text-sage-900 uppercase tracking-wider">New Custom Task</h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Task Title..."
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full p-2.5 bg-white border border-sand-200 rounded-xl text-xs font-semibold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <select
                                            value={newSystem}
                                            onChange={(e) => setNewSystem(e.target.value)}
                                            className="w-full p-2.5 bg-white border border-sand-200 rounded-xl text-xs font-semibold outline-none"
                                        >
                                            <option value="Garden">Garden</option>
                                            <option value="Water">Water</option>
                                            <option value="Energy">Energy</option>
                                            <option value="Preservation">Preservation</option>
                                            <option value="Infrastructure">Infrastructure</option>
                                            <option value="Sanitation">Sanitation</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Optional description (e.g. details, tools needed)..."
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full p-2.5 bg-white border border-sand-200 rounded-xl text-xs font-medium outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="py-1.5 px-3.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm"
                                    >
                                        Add Task
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormOpen(false)}
                                        className="py-1.5 px-3.5 bg-sand-200 hover:bg-sand-300 text-charcoal font-bold text-xs uppercase tracking-wider rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Checklist items list */}
                        <div className="space-y-2">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((t) => (
                                    <div 
                                        key={t.id} 
                                        className={`flex gap-3 items-center justify-between p-3.5 rounded-2xl border transition-all ${
                                            t.completed 
                                                ? 'bg-sand-50/50 border-sand-100 text-charcoal-400' 
                                                : 'bg-white border-sand-200 hover:border-sand-300 text-charcoal-800'
                                        }`}
                                    >
                                        <button
                                            onClick={() => toggleTask(t.id)}
                                            className="flex gap-3 items-start flex-1 text-left"
                                        >
                                            <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                t.completed ? 'bg-sage-600 border-sage-600 text-white' : 'border-sand-400 hover:border-sage-500'
                                            }`}>
                                                {t.completed && <Check size={10} strokeWidth={4} />}
                                            </div>
                                            
                                            <div className="space-y-0.5">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className={`font-bold text-xs ${t.completed ? 'line-through text-charcoal-400' : ''}`}>{t.title}</span>
                                                    <span className="text-[7px] bg-sand-150 text-charcoal-500 font-bold px-1.5 py-0.25 rounded uppercase tracking-wider flex items-center gap-1">
                                                        {getSystemIcon(t.system)}
                                                        {t.system}
                                                    </span>
                                                    {t.priority === 'high' && !t.completed && (
                                                        <span className="text-[7px] bg-terracotta-50 text-terracotta-700 font-bold px-1 rounded uppercase">High Priority</span>
                                                    )}
                                                </div>
                                                {t.desc && (
                                                    <p className={`text-[10px] font-sans leading-relaxed ${t.completed ? 'text-charcoal-400 line-through' : 'text-charcoal-500'}`}>{t.desc}</p>
                                                )}
                                            </div>
                                        </button>
                                        
                                        {t.type === 'manual' && (
                                            <button
                                                onClick={() => removeTask(t.id)}
                                                className="p-1 text-sand-400 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-charcoal-400 italic pl-1 py-4 text-center">No tasks match your filter parameters.</p>
                            )}
                        </div>
                    </div>

                    {/* Active Build Projects */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-sand-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><Wrench size={18} /></div>
                                <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">Active Build Projects</h3>
                            </div>
                            <button
                                onClick={() => navigate('/homestead/build-projects')}
                                className="text-xs text-sage-600 hover:text-sage-800 font-bold flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Project
                            </button>
                        </div>

                        {activeProjectsList.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {activeProjectsList.map((proj) => {
                                    const progress = calculateProjectProgress(proj);
                                    const nextStep = getNextProjectStep(proj);
                                    return (
                                        <div key={proj.id} className="p-4 bg-sand-50/50 border border-sand-200 rounded-3xl space-y-3 shadow-sm flex flex-col justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-charcoal-400">{proj.system}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                        proj.status === 'complete' ? 'bg-emerald-100 text-emerald-800' :
                                                        proj.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-sand-200 text-charcoal-600'
                                                    }`}>{proj.status}</span>
                                                </div>
                                                <h4 className="font-serif font-black text-sm text-sage-900 leading-tight">{proj.title}</h4>
                                                
                                                {nextStep && (
                                                    <p className="text-[9px] text-charcoal-500 font-sans leading-relaxed line-clamp-1 mb-2 bg-white px-2 py-1 rounded border border-sand-100">
                                                        Next: {nextStep.text}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 pt-2 border-t border-sand-100">
                                                {/* Progress bar */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[8px] font-bold text-charcoal-400">
                                                        <span>Progress</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-sage-600 rounded-full transition-all duration-300"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between gap-2 pt-1">
                                                    <button
                                                        onClick={() => navigate('/homestead/build-projects')}
                                                        className="py-1 px-2.5 bg-white border border-sand-300 text-charcoal font-bold text-[9px] uppercase tracking-wider rounded-xl hover:bg-sand-100 transition-all flex-1 min-h-[32px]"
                                                    >
                                                        View Details
                                                    </button>
                                                    {proj.status !== 'complete' && nextStep && (
                                                        <button
                                                            onClick={() => handleToggleProjectStep(proj.id, nextStep.id)}
                                                            className="py-1 px-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-sm transition-all flex-1 min-h-[32px]"
                                                        >
                                                            Next Step
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-sand-200 rounded-3xl space-y-3">
                                <p className="text-xs text-charcoal-400 italic">No active projects planned.</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <button
                                        onClick={() => handleCreateProjectFromTemplate('raised_bed')}
                                        className="py-1.5 px-3 bg-white border border-sand-200 text-charcoal font-semibold text-[10px] rounded-xl hover:bg-sand-50 transition-all shadow-sm"
                                    >
                                        + Raised Bed Frame
                                    </button>
                                    <button
                                        onClick={() => handleCreateProjectFromTemplate('rain_catchment')}
                                        className="py-1.5 px-3 bg-white border border-sand-200 text-charcoal font-semibold text-[10px] rounded-xl hover:bg-sand-50 transition-all shadow-sm"
                                    >
                                        + Rain Barrel Stand
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Onboarding Wizard Modal */}
            {showOnboarding && (
                <HomesteadOnboarding onClose={() => setShowOnboarding(false)} />
            )}
        </div>
    );
};

export default HomesteadCommandCenter;
