import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';
import { UserProvider } from '../../context/UserContext';
import BuildProjectsPage from '../planners/BuildProjectsPage';

// Mock planning service methods
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
                <UserProvider>
                    <MemoryRouter>
                        <BuildProjectsPage />
                    </MemoryRouter>
                </UserProvider>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('BuildProjectsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should fetch blueprints from json and render them', async () => {
        const mockBlueprints = {
            blueprints: [
                {
                    id: 'mock_bp_1',
                    title: 'Mock Solar Panel Stand',
                    system: 'Energy',
                    difficulty: 'Medium',
                    safetyLevel: 'Low',
                    estimatedTime: '3 hours',
                    summary: 'A test stand description',
                    materials: ['Wood'],
                    tools: ['Saw'],
                    steps: [{ id: 1, text: 'Step one', completed: false }]
                }
            ]
        };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockBlueprints
        });

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Mock Solar Panel Stand')).toBeDefined();
        });
        expect(screen.queryByText('Offline blueprint fallback loaded.')).toBeNull();
    });

    it('should render fallback embedded templates on fetch error', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        await act(async () => {
            renderComponent();
        });

        await waitFor(() => {
            expect(screen.getByText('Offline blueprint fallback loaded.')).toBeDefined();
            expect(screen.getByText('Raised Bed Frame')).toBeDefined();
        });
    });
});
