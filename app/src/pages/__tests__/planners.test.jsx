import React from 'react';
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';
import { UserProvider } from '../../context/UserContext';
import EnergyPlannerPage from '../planners/EnergyPlannerPage';
import GardenPlannerPage from '../planners/GardenPlannerPage';
import WaterPlannerPage from '../planners/WaterPlannerPage';
import PantryPlannerPage from '../planners/PantryPlannerPage';
import BuildProjectsPage from '../planners/BuildProjectsPage';

describe('Planner Pages', () => {
    it('renders EnergyPlannerPage without crashing', () => {
        render(
            <ToastProvider>
                <PwaLifecycleProvider>
                    <UserProvider>
                        <MemoryRouter>
                            <EnergyPlannerPage />
                        </MemoryRouter>
                    </UserProvider>
                </PwaLifecycleProvider>
            </ToastProvider>
        );
    });

    it('renders GardenPlannerPage without crashing', () => {
        render(
            <ToastProvider>
                <PwaLifecycleProvider>
                    <UserProvider>
                        <MemoryRouter>
                            <GardenPlannerPage />
                        </MemoryRouter>
                    </UserProvider>
                </PwaLifecycleProvider>
            </ToastProvider>
        );
    });

    it('renders WaterPlannerPage without crashing', () => {
        render(
            <ToastProvider>
                <PwaLifecycleProvider>
                    <UserProvider>
                        <MemoryRouter>
                            <WaterPlannerPage />
                        </MemoryRouter>
                    </UserProvider>
                </PwaLifecycleProvider>
            </ToastProvider>
        );
    });

    it('renders PantryPlannerPage without crashing', () => {
        render(
            <ToastProvider>
                <PwaLifecycleProvider>
                    <UserProvider>
                        <MemoryRouter>
                            <PantryPlannerPage />
                        </MemoryRouter>
                    </UserProvider>
                </PwaLifecycleProvider>
            </ToastProvider>
        );
    });

    it('renders BuildProjectsPage without crashing', () => {
        render(
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
    });
});
