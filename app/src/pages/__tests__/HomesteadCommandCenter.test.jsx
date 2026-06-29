import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';
import { UserProvider, useUser } from '../../context/UserContext';
import HomesteadCommandCenter from '../HomesteadCommandCenter';

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
                <UserProvider>
                    <MemoryRouter>
                        <HomesteadCommandCenter />
                    </MemoryRouter>
                </UserProvider>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('HomesteadCommandCenter Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear storage
        localStorage.clear();
    });

    it('renders command center correctly', () => {
        renderComponent();
        expect(screen.getByText('Homestead Command Center')).toBeDefined();
        expect(screen.getByText("Today's Operating Checklist")).toBeDefined();
    });

    it('displays seasonal and manual tasks correctly in the list', () => {
        renderComponent();
        // Default tasks are loaded from UserContext (Winter Fuel Check and Greenhouse Ventilation)
        expect(screen.getByText('Winter Fuel Check')).toBeDefined();
        expect(screen.getByText('Greenhouse Ventilation')).toBeDefined();
    });
});
