import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import {
    loadPlan,
    savePlan,
    updatePlan,
    initializePlansFromHomesteadProfile
} from '../services/homesteadPlanningService';
import { generateSeasonalTasks } from '../planners/seasonalTaskEngine';
import { PROJECT_TEMPLATES, createProjectFromTemplate } from '../planners/projectPlanner';
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
    ShieldAlert
} from 'lucide-react';

const HomesteadCommandCenter = () => {
    const navigate = useNavigate();
    const { homesteadProfile, readinessScore, readinessBreakdown, updateHomesteadProfile } = useUser();

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Planning States
    const [homesteadPlan, setHomesteadPlan] = useState({});
    const [gardenPlan, setGardenPlan] = useState({});
    const [pantryPlan, setPantryPlan] = useState({});
    const [waterPlan, setWaterPlan] = useState({});
    const [energyPlan, setEnergyPlan] = useState({});
    const [projectsPlan, setProjectsPlan] = useState({ projects: [] });

    // Load all plans on mount / profile change
    useEffect(() => {
        setHomesteadPlan(loadPlan('homemaker_homestead_plan'));
        setGardenPlan(loadPlan('homemaker_garden_plan'));
        setPantryPlan(loadPlan('homemaker_pantry_plan'));
        setWaterPlan(loadPlan('homemaker_water_plan'));
        setEnergyPlan(loadPlan('homemaker_energy_plan'));
        setProjectsPlan(loadPlan('homemaker_build_projects'));
    }, [homesteadProfile]);

    const handleAddTask = (task) => {
        updatePlan('homemaker_seasonal_tasks', (prev) => {
            const tasks = prev.tasks || [];
            return {
                ...prev,
                tasks: [...tasks, { ...task, id: `task-${Date.now()}`, completed: false }]
            };
        });
    };

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

    const handleUpdateProjectStatus = (projId, status) => {
        updatePlan('homemaker_build_projects', (prev) => {
            const currentProjects = prev.projects || [];
            return {
                ...prev,
                projects: currentProjects.map(proj => {
                    if (proj.id !== projId) return proj;
                    return { ...proj, status };
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

    // Gather today's tasks
    const seasonalTasksList = generateSeasonalTasks({ homesteadProfile });
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
    if (waterPlan.storageContainers && waterPlan.storageContainers.length === 0) {
        pathways.push({
            title: 'Model Water Storage Needs',
            desc: 'Calculate daily drinking volumes, buffer targets, and estimate roof rain catchment.',
            action: () => navigate('/homestead/water-plan'),
            btnText: 'Launch Water Planner',
            icon: <Droplets className="text-blue-600" />
        });
    }
    if (gardenPlan.selectedCrops && gardenPlan.selectedCrops.length === 0) {
        pathways.push({
            title: 'Map Garden Bed Layouts & Crop Calendar',
            desc: 'Calculate total soil space, select container-friendly crops, and generate planting dates.',
            action: () => navigate('/homestead/garden-plan'),
            btnText: 'Configure Garden Plan',
            icon: <Home className="text-emerald-600" />
        });
    }
    if (energyPlan.dailyLoads && energyPlan.dailyLoads.length === 0) {
        pathways.push({
            title: 'Audit Off-Grid Electricity Loads',
            desc: 'Estimate daily Wh energy usage, sizing solar arrays, batteries, and flags safety surges.',
            action: () => navigate('/homestead/energy-plan'),
            btnText: 'Design Energy Setup',
            icon: <Zap className="text-amber-600" />
        });
    }

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
                    {/* Profile Summary Card */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                            <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><User size={18} /></div>
                            <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">Homestead Profile</h3>
                        </div>

                        {homesteadProfile && !homesteadProfile.skipped ? (
                            <ul className="space-y-2.5 text-xs text-charcoal">
                                <li className="flex justify-between border-b border-sand-50 pb-1.5">
                                    <span className="font-semibold text-charcoal-400">Household:</span>
                                    <span className="font-bold">{homesteadProfile.household?.size || 1} people</span>
                                </li>
                                <li className="flex justify-between border-b border-sand-50 pb-1.5">
                                    <span className="font-semibold text-charcoal-400">Climate:</span>
                                    <span className="font-bold capitalize">{homesteadProfile.region?.climate || 'Temperate'}</span>
                                </li>
                                <li className="flex justify-between border-b border-sand-50 pb-1.5">
                                    <span className="font-semibold text-charcoal-400">Water Source:</span>
                                    <span className="font-bold capitalize">{homesteadProfile.water?.primary?.replace('_', ' ') || 'Well'}</span>
                                </li>
                                <li className="flex justify-between border-b border-sand-50 pb-1.5">
                                    <span className="font-semibold text-charcoal-400">Pantry buffer:</span>
                                    <span className="font-bold">{homesteadProfile.pantry?.targetDays || 90} days</span>
                                </li>
                                <li className="flex justify-between border-b border-sand-50 pb-1.5">
                                    <span className="font-semibold text-charcoal-400">Energy setup:</span>
                                    <span className="font-bold capitalize">{homesteadProfile.energy?.setup?.replace('_', ' ') || 'Solar'}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-semibold text-charcoal-400">Skill Level:</span>
                                    <span className="font-bold capitalize">{homesteadProfile.experience?.level || 'Beginner'}</span>
                                </li>
                            </ul>
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

                    {/* Readiness Cards */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                            <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><Activity size={18} /></div>
                            <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">System Readiness</h3>
                        </div>

                        <div className="space-y-3">
                            {/* Water */}
                            <div className="flex items-center justify-between p-3 rounded-2xl border border-sand-100 bg-sand-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xs font-bold text-charcoal-700">Water Security</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.water))}`}>
                                    {getReadinessLabel(readinessBreakdown?.water)}
                                </span>
                            </div>
                            {/* Food */}
                            <div className="flex items-center justify-between p-3 rounded-2xl border border-sand-100 bg-sand-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-xs font-bold text-charcoal-700">Pantry & Storage</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.food))}`}>
                                    {getReadinessLabel(readinessBreakdown?.food)}
                                </span>
                            </div>
                            {/* Energy */}
                            <div className="flex items-center justify-between p-3 rounded-2xl border border-sand-100 bg-sand-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                    <span className="text-xs font-bold text-charcoal-700">Energy & Power</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.energy))}`}>
                                    {getReadinessLabel(readinessBreakdown?.energy)}
                                </span>
                            </div>
                            {/* Garden */}
                            <div className="flex items-center justify-between p-3 rounded-2xl border border-sand-100 bg-sand-50/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-charcoal-700">Crop Production</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getReadinessColor(getReadinessLabel(readinessBreakdown?.garden))}`}>
                                    {getReadinessLabel(readinessBreakdown?.garden)}
                                </span>
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
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-sand-200 hover:border-sage-300 transition-all gap-4">
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

                    {/* Today's Tasks */}
                    <div className="bg-white border border-sand-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-sand-100 pb-3">
                            <div className="p-2 bg-sage-50 rounded-xl text-sage-600"><CheckSquare size={18} /></div>
                            <h3 className="text-sm font-black text-sage-900 uppercase tracking-wider">Today's Operating Checklist</h3>
                        </div>

                        <div className="space-y-3">
                            {/* Seasonal Tasks */}
                            {seasonalTasksList.length > 0 ? (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-sage-500 uppercase tracking-widest pl-1 mb-2">Active Seasonal Tasks</h4>
                                    {seasonalTasksList.map((t, idx) => (
                                        <div key={idx} className="flex gap-3 items-start p-3 bg-sand-50/50 rounded-2xl border border-sand-100 text-xs">
                                            <div className="p-1 bg-white/80 rounded-lg text-sage-600 shrink-0 mt-0.5">
                                                <CheckCircle size={14} />
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-charcoal-800">{t.title}</span>
                                                    <span className="text-[8px] bg-sage-100 text-sage-800 font-bold px-1.5 py-0.25 rounded uppercase tracking-wider">{t.system}</span>
                                                </div>
                                                <p className="text-[10px] text-charcoal-500 font-sans leading-relaxed">{t.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-charcoal-400 italic pl-1">No seasonal tasks generated.</p>
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
                                {activeProjectsList.map((proj) => (
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
                                            <p className="text-[10px] text-charcoal-500 font-sans leading-relaxed line-clamp-2">{proj.notes}</p>
                                        </div>

                                        <div className="space-y-2 pt-2 border-t border-sand-100">
                                            {/* Progress bar */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-bold text-charcoal-400">
                                                    <span>Progress</span>
                                                    <span>
                                                        {Math.round((proj.steps.filter(s => s.completed).length / proj.steps.length) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="h-1 bg-sand-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-sage-600 rounded-full transition-all duration-300"
                                                        style={{ width: `${(proj.steps.filter(s => s.completed).length / proj.steps.length) * 100}%` }}
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
                                                {proj.status !== 'complete' && (
                                                    <button
                                                        onClick={() => {
                                                            const nextStep = proj.steps.find(s => !s.completed);
                                                            if (nextStep) handleToggleProjectStep(proj.id, nextStep.id);
                                                        }}
                                                        className="py-1 px-2.5 bg-sage-600 hover:bg-sage-700 text-white font-bold text-[9px] uppercase tracking-wider rounded-xl shadow-sm transition-all flex-1 min-h-[32px]"
                                                    >
                                                        Next Step
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
