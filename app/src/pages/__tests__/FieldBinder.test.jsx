import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { loadPlan } from '../../services/homesteadPlanningService';
import FieldBinder from '../FieldBinder';

// Mock UserContext hook
vi.mock('../../context/UserContext', () => ({
    useUser: vi.fn()
}));

// Mock homesteadPlanningService
vi.mock('../../services/homesteadPlanningService', () => ({
    loadPlan: vi.fn()
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <FieldBinder />
        </MemoryRouter>
    );
};

describe('FieldBinder Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useUser.mockReturnValue({
            homesteadProfile: {
                household: { size: 4 },
                region: { climate: 'temperate' },
                water: { primary: 'well' },
                pantry: { targetDays: 90 },
                sanitation: { setup: 'composting' },
                energy: { setup: 'solar' }
            }
        });

        loadPlan.mockImplementation((key) => {
            if (key === 'homemaker_water_plan') {
                return {
                    householdSize: 4,
                    dailyGallonsPerPerson: 2,
                    targetDays: 90,
                    treatmentMethods: ['filtration']
                };
            }
            if (key === 'homemaker_pantry_plan') {
                return {
                    householdSize: 4,
                    targetDays: 90,
                    caloriesPerPerson: 2000,
                    inventoryNotes: 'Lots of beans'
                };
            }
            if (key === 'homemaker_garden_plan') {
                return {
                    frostDates: { lastSpringFrost: 'May 15', firstFallFrost: 'Oct 15' },
                    cropCalendar: [{ cropName: 'Tomatoes', action: 'Transplant', timing: 'After frost' }]
                };
            }
            if (key === 'homemaker_energy_plan') {
                return {
                    dailyLoads: [{ name: 'LED Lights', watts: 10, hoursPerDay: 5 }]
                };
            }
            if (key === 'homemaker_build_projects') {
                return {
                    projects: [{ title: 'Rain Barrel Setup', status: 'In Progress', steps: [{ text: 'Place barrel', completed: true }] }]
                };
            }
            return {};
        });
    });

    it('renders the page header and main title', () => {
        renderComponent();
        expect(screen.getByText('Offline Field Binder')).toBeDefined();
        expect(screen.getByText('HOMESTEAD OPERATING BINDER')).toBeDefined();
    });

    it('renders the profile details correctly in the print view', () => {
        renderComponent();
        expect(screen.getByText('1. Homestead Profile')).toBeDefined();
        expect(screen.getByText('4 People')).toBeDefined();
        expect(screen.getByText('temperate')).toBeDefined();
    });

    it('successfully calls suggestStorageContainers and renders water storage recommendations without crashing', () => {
        renderComponent();
        expect(screen.getByText('2. Water Security Plan')).toBeDefined();
        expect(screen.getByText('8 Gallons/day')).toBeDefined();
        // Check for IBC Tote recommendations from suggestStorageContainers
        expect(screen.getByText('IBC Tote')).toBeDefined();
    });

    it('renders the seasonal checklist and emergency protocols', () => {
        renderComponent();
        expect(screen.getByText('8. Seasonal Homestead Checklist')).toBeDefined();
        expect(screen.getByText('9. Emergency Protocols & Contacts')).toBeDefined();
        expect(screen.getByText('Neighborhood & Radio Setup')).toBeDefined();
    });
});
