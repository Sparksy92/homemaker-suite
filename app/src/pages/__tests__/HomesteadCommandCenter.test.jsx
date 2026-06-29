import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';
import { useUser } from '../../context/UserContext';
import HomesteadCommandCenter from '../HomesteadCommandCenter';

// Mock context hook
vi.mock('../../context/UserContext', () => ({
    useUser: vi.fn()
}));

// Mock plans loading
vi.mock('../../services/homesteadPlanningService', () => ({
    loadPlan: vi.fn(() => ({ projects: [] })),
    savePlan: vi.fn(),
    resetPlan: vi.fn(),
    updatePlan: vi.fn()
}));

const renderComponent = () => {
    return render(
        <ToastProvider>
            <PwaLifecycleProvider>
                <MemoryRouter>
                    <HomesteadCommandCenter />
                </MemoryRouter>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('HomesteadCommandCenter Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders command center correctly', () => {
        useUser.mockReturnValue({
            homesteadProfile: null,
            readinessScore: 50,
            readinessBreakdown: { water: 50, food: 50, energy: 50, garden: 50 },
            updateHomesteadProfile: vi.fn(),
            sustainability: { tasks: [] },
            toggleTask: vi.fn(),
            addCustomTask: vi.fn(),
            removeTask: vi.fn()
        });

        renderComponent();
        expect(screen.getByText('Homestead Command Center')).toBeDefined();
        expect(screen.getByText("Today's Operating Checklist")).toBeDefined();
    });

    it('imports seasonal tasks and does not duplicate them upon toggling or re-render', async () => {
        let addCustomTaskSpy = vi.fn();
        let toggleTaskSpy = vi.fn();

        const TestWrapper = () => {
            const [tasks, setTasks] = useState([
                { id: 1, title: 'Winter Fuel Check', completed: false, type: 'manual' },
                { id: 2, title: 'Greenhouse Ventilation', completed: false, type: 'manual' }
            ]);

            addCustomTaskSpy.mockImplementation((t) => {
                setTasks(prev => {
                    const exists = prev.some(x => x.id === t.id);
                    if (exists) return prev;
                    return [...prev, { ...t, id: t.id || Date.now(), completed: false }];
                });
            });

            toggleTaskSpy.mockImplementation((id) => {
                setTasks(prev => prev.map(x => x.id === id ? { ...x, completed: !x.completed } : x));
            });

            useUser.mockReturnValue({
                homesteadProfile: {
                    skipped: false,
                    household: { size: 4 },
                    region: { climate: 'temperate' },
                    water: { primary: 'well' },
                    pantry: { targetDays: 90 },
                    energy: { setup: 'solar' },
                    experience: { level: 'beginner' }
                },
                readinessScore: 75,
                readinessBreakdown: { water: 50, food: 60, energy: 70, garden: 80 },
                updateHomesteadProfile: vi.fn(),
                sustainability: { tasks },
                toggleTask: toggleTaskSpy,
                addCustomTask: addCustomTaskSpy,
                removeTask: vi.fn()
            });

            return <HomesteadCommandCenter />;
        };

        render(
            <ToastProvider>
                <PwaLifecycleProvider>
                    <MemoryRouter>
                        <TestWrapper />
                    </MemoryRouter>
                </PwaLifecycleProvider>
            </ToastProvider>
        );

        // Wait for seasonal tasks to be imported (e.g. "Deep watering schedule" for summer season)
        const taskTitle = 'Deep watering schedule';
        await screen.findByText(taskTitle);

        // Verify that addCustomTask was called to import the seasonal task
        expect(addCustomTaskSpy).toHaveBeenCalled();

        // The task is now part of the task elements, verify it appears exactly once
        const taskElementsBefore = screen.getAllByText(taskTitle);
        expect(taskElementsBefore).toHaveLength(1);

        // Clear mock calls history to measure further calls
        addCustomTaskSpy.mockClear();

        // Simulate toggling the task by clicking
        const toggleButton = screen.getByText(taskTitle);
        fireEvent.click(toggleButton);

        // Toggling calls toggleTask
        expect(toggleTaskSpy).toHaveBeenCalled();

        // Confirm that the task has NOT been imported again (addCustomTask should not be called again)
        expect(addCustomTaskSpy).not.toHaveBeenCalled();

        // Ensure task elements count is still exactly 1
        const taskElementsAfter = screen.getAllByText(taskTitle);
        expect(taskElementsAfter).toHaveLength(1);
    });
});
