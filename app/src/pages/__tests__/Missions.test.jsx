import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';
import { UserProvider } from '../../context/UserContext';
import { MissionsProvider } from '../../context/MissionsContext';
import Missions from '../Missions';

const renderComponent = () => {
    return render(
        <ToastProvider>
            <PwaLifecycleProvider>
                <UserProvider>
                    <MissionsProvider>
                        <MemoryRouter>
                            <Missions />
                        </MemoryRouter>
                    </MissionsProvider>
                </UserProvider>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('Missions Page & Components', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        
        // Mock fetch for offline library index
        global.fetch = vi.fn().mockImplementation((url) => {
            if (url.includes('offline_survival_index.json')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        "Appropriate Technology Library (ATL)": [
                            {
                                name: "agriculture_guide.pdf",
                                path: "ATL/05 Agriculture/agriculture_guide.pdf",
                                size: 1024,
                                type: "pdf"
                            }
                        ]
                    })
                });
            }
            return Promise.reject(new Error("Unknown fetch"));
        });
    });

    it('should render the Mission Control dashboard', async () => {
        renderComponent();
        expect(screen.getByText('Mission Control')).toBeInTheDocument();
        expect(screen.getByText('Start Mission')).toBeInTheDocument();
    });

    it('should launch start mission modal and initialize a template', async () => {
        renderComponent();
        
        // Click start mission
        const startBtn = screen.getByText('Start Mission');
        fireEvent.click(startBtn);

        // Check if modal title is present
        expect(screen.getByText('Start Survival Mission')).toBeInTheDocument();

        // Click launch
        const launchBtn = screen.getByText('Launch Mission');
        fireEvent.click(launchBtn);

        // Active session header should appear
        expect(screen.getByText('Complete Session')).toBeInTheDocument();
    });
});
