import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';
import { useUser } from '../../context/UserContext';
import Library from '../Library';

// Mock context hook
vi.mock('../../context/UserContext', () => ({
    useUser: vi.fn()
}));

// Mock window.caches
const mockCache = {
    match: vi.fn(() => Promise.resolve(null)),
    put: vi.fn(() => Promise.resolve()),
    keys: vi.fn(() => Promise.resolve([]))
};

window.caches = {
    has: vi.fn(() => Promise.resolve(true)),
    open: vi.fn(() => Promise.resolve(mockCache)),
    delete: vi.fn(() => Promise.resolve(true))
};

const renderComponent = () => {
    return render(
        <ToastProvider>
            <PwaLifecycleProvider>
                <MemoryRouter>
                    <Library />
                </MemoryRouter>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('Library Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        useUser.mockReturnValue({
            homesteadProfile: { skipped: false },
            readinessScore: 75,
            readinessBreakdown: { water: 50, food: 60, energy: 70, garden: 80 },
            recordAccess: vi.fn(),
            sustainability: { tasks: [] },
            lastAccessedItem: null,
            readGuides: []
        });

        // Mock window.fetch for library index and metadata
        window.fetch = vi.fn((url) => {
            if (url.includes('library_index.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        "5 Gardening": ["5.1 Crop Profiles.md"],
                        "0 Foundations": ["0.1 Welcome.md"]
                    }),
                    clone: function() { return this; }
                });
            }
            if (url.includes('guides_metadata.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([
                        {
                            title: "Crop Profiles",
                            path: "content/5 Gardening/5.1 Crop Profiles.md",
                            category: "5 Gardening",
                            tags: ["visual", "gardening"],
                            word_count: 500
                        },
                        {
                            title: "Welcome Guide",
                            path: "content/0 Foundations/0.1 Welcome.md",
                            category: "0 Foundations",
                            tags: ["beginner"],
                            word_count: 300
                        }
                    ]),
                    clone: function() { return this; }
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
                clone: function() { return this; }
            });
        });
    });

    it('renders the library main title and elements', async () => {
        renderComponent();
        expect(screen.getByText('Library')).toBeDefined();
        expect(screen.getByPlaceholderText('Search across all modules...')).toBeDefined();
    });

    it('displays categories grid in default "All Categories" view', async () => {
        renderComponent();
        // Check standard category headings
        await waitFor(() => {
            expect(screen.getByText('01 Foundations')).toBeDefined();
            expect(screen.getByText('05 Gardening & Soil')).toBeDefined();
        });
    });

    it('switches to filtered results list when a category pill is clicked', async () => {
        renderComponent();
        
        // Find and click the "Visual Guides" button
        const visualButton = screen.getByText('Visual Guides');
        fireEvent.click(visualButton);

        // Verify that it renders the filtered results header and shows the mapped guide title
        await waitFor(() => {
            expect(screen.getByText('Filtered Results (1)')).toBeDefined();
            expect(screen.getByText('Crop Profiles')).toBeDefined();
        });

        // Click "Start Here" button
        const startHereButton = screen.getByText('Start Here');
        fireEvent.click(startHereButton);

        // Verify that it switches filter results
        await waitFor(() => {
            expect(screen.getByText('Filtered Results (1)')).toBeDefined();
            expect(screen.getByText('Welcome')).toBeDefined();
        });
    });
});
