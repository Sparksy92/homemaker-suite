import React, { createContext, useContext, useState, useEffect } from 'react';
import { missionTemplates } from '../modules/missions/missionTemplates';
import { createMissionFromTemplate, transitionMissionStatus, createMissionTask, addTimelineEvent } from '../modules/missions/missionUtils';

const MissionsContext = createContext();

export const useMissions = () => {
    const context = useContext(MissionsContext);
    if (!context) {
        throw new Error('useMissions must be used within a MissionsProvider');
    }
    return context;
};

export const MissionsProvider = ({ children }) => {
    const [missions, setMissions] = useState(() => {
        try {
            const saved = localStorage.getItem('homemaker_missions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to load missions:", e);
            return [];
        }
    });

    const [activeMission, setActiveMission] = useState(() => {
        try {
            const saved = localStorage.getItem('homemaker_active_mission');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to load active mission:", e);
            return null;
        }
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('homemaker_missions', JSON.stringify(missions));
    }, [missions]);

    useEffect(() => {
        if (activeMission) {
            localStorage.setItem('homemaker_active_mission', JSON.stringify(activeMission));
        } else {
            localStorage.removeItem('homemaker_active_mission');
        }
    }, [activeMission]);

    const startMission = (templateId, fields = {}) => {
        const template = missionTemplates.find(t => t.id === templateId);
        if (!template) return null;

        const newMission = createMissionFromTemplate(template, fields);
        setMissions(prev => [...prev, newMission]);
        setActiveMission(newMission);
        return newMission;
    };

    const addCustomMission = (newMission) => {
        setMissions(prev => [...prev, newMission]);
        setActiveMission(newMission);
        return newMission;
    };

    const updateActiveMission = (patch) => {
        if (!activeMission) return;

        const now = new Date().toISOString();
        const updated = {
            ...activeMission,
            ...patch,
            updatedAt: now
        };

        // Sync to state
        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const addTimelineToActive = (type, label, details = {}) => {
        if (!activeMission) return;
        const updated = addTimelineEvent(activeMission, type, label, details);
        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const completeActiveMission = () => {
        if (!activeMission) return;
        const updated = transitionMissionStatus(activeMission, 'completed');
        
        // Sync to list first, then clear active pointer
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
        setActiveMission(null);
    };

    const pauseActiveMission = () => {
        if (!activeMission) return;
        const updated = transitionMissionStatus(activeMission, 'paused');
        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const resumeMission = (missionToResume) => {
        // If there's an existing active mission, pause it first
        if (activeMission && activeMission.id !== missionToResume.id) {
            pauseActiveMission();
        }

        const updated = transitionMissionStatus(missionToResume, 'active');
        setMissions(prev => {
            const exists = prev.some(m => m.id === updated.id);
            if (exists) {
                return prev.map(m => m.id === updated.id ? updated : m);
            } else {
                return [...prev, updated];
            }
        });
        setActiveMission(updated);
    };

    const deleteMission = (id) => {
        setMissions(prev => prev.filter(m => m.id !== id));
        if (activeMission && activeMission.id === id) {
            setActiveMission(null);
        }
    };

    const toggleObjective = (objId) => {
        if (!activeMission) return;

        const now = new Date().toISOString();
        const objectives = (activeMission.objectives || []).map(o => {
            if (o.id === objId) {
                const nextStatus = o.status === 'done' ? 'todo' : 'done';
                return { ...o, status: nextStatus, updatedAt: now };
            }
            return o;
        });

        const completedCount = objectives.filter(o => o.status === 'done').length;
        const totalCount = objectives.length;
        const label = `Objective status toggled: [${completedCount}/${totalCount} complete]`;

        const updated = addTimelineEvent({
            ...activeMission,
            objectives,
            updatedAt: now
        }, 'objective_toggled', label, { objectiveId: objId });

        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const addTaskToActiveMission = (label, priority = 'medium', riskCategory = null) => {
        if (!activeMission) return;

        const taskObj = createMissionTask(label, priority, riskCategory);
        const updatedTasks = [...(activeMission.tasks || []), taskObj];
        const now = new Date().toISOString();

        const updated = addTimelineEvent({
            ...activeMission,
            tasks: updatedTasks,
            updatedAt: now
        }, 'task_updated', `Custom task added: "${label}"`, { taskId: taskObj.id });

        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const toggleTask = (taskId, isCustomTask = false) => {
        if (!activeMission) return;

        const now = new Date().toISOString();
        let updatedChecklist = [...(activeMission.checklist || [])];
        let updatedTasks = [...(activeMission.tasks || [])];
        let taskLabel = '';
        let newStatus = 'todo';

        if (isCustomTask) {
            updatedTasks = updatedTasks.map(t => {
                if (t.id === taskId) {
                    newStatus = t.status === 'done' ? 'todo' : 'done';
                    taskLabel = t.label;
                    return { 
                        ...t, 
                        status: newStatus, 
                        updatedAt: now,
                        completedAt: newStatus === 'done' ? now : null 
                    };
                }
                return t;
            });
        } else {
            updatedChecklist = updatedChecklist.map(t => {
                if (t.id === taskId) {
                    newStatus = t.status === 'done' ? 'todo' : 'done';
                    taskLabel = t.label;
                    return { 
                        ...t, 
                        status: newStatus, 
                        updatedAt: now,
                        completedAt: newStatus === 'done' ? now : null 
                    };
                }
                return t;
            });
        }

        const logMsg = `Task "${taskLabel}" marked as ${newStatus.toUpperCase()}`;
        const updated = addTimelineEvent({
            ...activeMission,
            checklist: updatedChecklist,
            tasks: updatedTasks,
            updatedAt: now
        }, 'task_updated', logMsg, { taskId });

        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const addManualNotes = (val) => {
        if (!activeMission) return;
        const now = new Date().toISOString();
        const updated = {
            ...activeMission,
            manualNotes: val,
            updatedAt: now
        };
        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    const attachSourceToActiveMission = (source) => {
        if (!activeMission) return;
        const attachedSources = [...(activeMission.attachedSources || [])];
        const exists = attachedSources.some(s => s.sourcePath === source.sourcePath);
        if (!exists) {
            const updatedSources = [...attachedSources, source];
            const now = new Date().toISOString();
            const updated = addTimelineEvent({
                ...activeMission,
                attachedSources: updatedSources,
                updatedAt: now
            }, 'source_added', `Reference manual attached: "${source.title}"`, { sourcePath: source.sourcePath });
            setActiveMission(updated);
            setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
        }
    };

    const removeSourceFromActiveMission = (sourcePath) => {
        if (!activeMission) return;
        const attachedSources = (activeMission.attachedSources || []).filter(s => s.sourcePath !== sourcePath);
        const now = new Date().toISOString();
        const updated = addTimelineEvent({
            ...activeMission,
            attachedSources,
            updatedAt: now
        }, 'source_removed', `Reference manual detached from session.`, { sourcePath });
        setActiveMission(updated);
        setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
    };

    return (
        <MissionsContext.Provider value={{
            missions,
            activeMission,
            startMission,
            addCustomMission,
            updateActiveMission,
            completeActiveMission,
            pauseActiveMission,
            resumeMission,
            deleteMission,
            toggleObjective,
            addTaskToActiveMission,
            toggleTask,
            addManualNotes,
            addTimelineToActive,
            attachSourceToActiveMission,
            removeSourceFromActiveMission
        }}>
            {children}
        </MissionsContext.Provider>
    );
};
