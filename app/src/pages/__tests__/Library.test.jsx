import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
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

const LocationDisplay = () => {
    const location = useLocation();
    return <div data-testid="location-display">{location.pathname}{location.search}</div>;
};

const renderComponent = (initialRoute = '/library') => {
    return render(
        <ToastProvider>
            <PwaLifecycleProvider>
                <MemoryRouter initialEntries={[initialRoute]}>
                    <Routes>
                        <Route path="/library" element={
                            <>
                                <Library />
                                <LocationDisplay />
                            </>
                        } />
                    </Routes>
                </MemoryRouter>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('Library Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        window.alert = vi.fn();
        if (typeof window.URL.createObjectURL === 'undefined') {
            window.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
        }
        if (typeof window.URL.revokeObjectURL === 'undefined') {
            window.URL.revokeObjectURL = vi.fn();
        }

        useUser.mockReturnValue({
            homesteadProfile: { skipped: false },
            readinessScore: 75,
            readinessBreakdown: { water: 50, food: 60, energy: 70, garden: 80 },
            recordAccess: vi.fn(),
            sustainability: { tasks: [] },
            lastAccessedItem: null,
            readGuides: [],
            isFavorite: vi.fn(() => false),
            toggleFavorite: vi.fn()
        });

        // Mock window.fetch for library index and metadata
        window.fetch = vi.fn((url) => {
            if (url.includes('library_index.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        "5 Gardening": ["5.1 Crop Profiles.md"],
                        "0 Foundations": ["0.1 Welcome.md"],
                        "14 Health & First Aid": ["14.1 Herbal Medicine.md"]
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
                        },
                        {
                            title: "Herbal Medicine",
                            path: "content/14 Health & First Aid/14.1 Herbal Medicine.md",
                            category: "14 Health & First Aid",
                            tags: ["safety"],
                            word_count: 400
                        }
                    ]),
                    clone: function() { return this; }
                });
            }
            if (url.includes('external_pdfs.json')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        "Survival-Manuals": [
                            {
                                "name": "SAS-Survival.pdf",
                                "title": "SAS Survival",
                                "url": "https://raw.githubusercontent.com/PR0M3TH3AN/Survival-Data/master/HOME/Survival-Manuals/SAS-Survival.pdf",
                                "size": 1048576
                            }
                        ]
                    }),
                    clone: function() { return this; }
                });
            }
            if (url.includes('/content/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                    text: () => Promise.resolve('# Mock Guide Title\nThis is mock guide content.'),
                    clone: function() { return this; }
                });
            }
            if (url.includes('raw.githubusercontent.com')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({}),
                    blob: () => Promise.resolve(new Blob()),
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

    it('clicking a category updates the URL to /library?folder=...', async () => {
        renderComponent();
        
        // Wait for folder cards to render
        const foundationsCard = await screen.findByText('Foundations');
        fireEvent.click(foundationsCard.closest('button'));

        // Check updated URL location
        await waitFor(() => {
            const loc = screen.getByTestId('location-display').textContent;
            expect(loc).toContain('folder=0');
        });
    });

    it('deep-link folder URL renders folder view', async () => {
        renderComponent('/library?folder=0%20Foundations');
        
        // Should show folder layout (e.g. Back button and folder title)
        await waitFor(() => {
            expect(screen.getByText('Back to Library')).toBeInTheDocument();
            expect(screen.getByText('Foundations')).toBeInTheDocument();
        });
    });

    it('deep-link file URL loads guide content once without rendering loop', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch');
        renderComponent('/library?folder=0%20Foundations&file=0.1%20Welcome.md');
        
        // Should load the guide viewer
        await waitFor(() => {
            expect(screen.getByText('Mock Guide Title')).toBeInTheDocument();
        });

        // Verify content fetch was called exactly once
        const fileCalls = fetchSpy.mock.calls.filter(call => call[0].includes('/content/0%20Foundations/0.1%20Welcome.md'));
        expect(fileCalls.length).toBe(1);
    });

    it('File Back returns to /library?folder=...', async () => {
        renderComponent('/library?folder=0%20Foundations&file=0.1%20Welcome.md');

        await waitFor(() => {
            expect(screen.getByText('Mock Guide Title')).toBeInTheDocument();
        });

        const backBtn = screen.getByRole('button', { name: /Back/i });
        fireEvent.click(backBtn);

        await waitFor(() => {
            const loc = screen.getByTestId('location-display').textContent;
            expect(loc).toContain('folder=0');
        });
    });

    it('search result click navigates with both folder and file params', async () => {
        renderComponent();

        const searchInput = screen.getByPlaceholderText('Search across all modules...');
        fireEvent.change(searchInput, { target: { value: 'Welcome' } });

        const searchResult = await screen.findByText('Welcome');
        fireEvent.click(searchResult.closest('button'));

        await waitFor(() => {
            const loc = screen.getByTestId('location-display').textContent;
            expect(loc).toContain('folder=0');
            expect(loc).toContain('file=0.1');
        });
    });

    it('lethal-risk deep-link shows safety modal first and loads guide on confirmation', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch');
        sessionStorage.clear();

        renderComponent('/library?folder=14%20Health%20%26%20First%20Aid&file=14.1%20Herbal%20Medicine.md');

        // Verify safety modal is visible
        await waitFor(() => {
            expect(screen.getByText('Lethal Hazard Warning')).toBeInTheDocument();
        });

        // Verify file content has NOT been fetched yet
        let fileCalls = fetchSpy.mock.calls.filter(call => call[0].includes('14.1%20Herbal%20Medicine.md'));
        expect(fileCalls.length).toBe(0);

        // Confirm safety warning
        const confirmBtn = screen.getByRole('button', { name: 'I Understand the Risks' });
        fireEvent.click(confirmBtn);

        // Verify file is loaded
        await waitFor(() => {
            expect(screen.getByText('Mock Guide Title')).toBeInTheDocument();
        });

        // Verify content fetch was called
        fileCalls = fetchSpy.mock.calls.filter(call => call[0].includes('14.1%20Herbal%20Medicine.md'));
        expect(fileCalls.length).toBe(1);
        
        // Verify URL remains intact
        const loc = screen.getByTestId('location-display').textContent;
        expect(loc).toContain('folder=14');
        expect(loc).toContain('file=14.1');
    });

    it('pdf filter displays external PDF categories', async () => {
        renderComponent();

        // Click on "Civilization PDF Archive" filter button
        const pdfFilterBtn = await screen.findByText('Civilization PDF Archive');
        fireEvent.click(pdfFilterBtn);

        // Should display the "Survival Manuals" category browse card
        await waitFor(() => {
            expect(screen.getByText('Survival Manuals')).toBeInTheDocument();
            expect(screen.getByText('Browse Guides')).toBeInTheDocument();
            expect(screen.getByText('1 PDF Manuals')).toBeInTheDocument();
        });
    });

    it('clicking an external PDF folder lists its files, and clicking a file loads it in viewer', async () => {
        renderComponent('/library?pdfFolder=Survival-Manuals');

        // Verify the PDF list renders and displays file title
        await waitFor(() => {
            expect(screen.getByText('SAS Survival')).toBeInTheDocument();
            expect(screen.getByText('1.0 MB • Offline-Ready')).toBeInTheDocument();
        });

        // Click on the PDF item
        const pdfItem = screen.getByText('SAS Survival');
        fireEvent.click(pdfItem.closest('button'));

        // Verify the URL updates to the file path
        await waitFor(() => {
            const loc = screen.getByTestId('location-display').textContent;
            expect(loc).toContain('pdfFolder=Survival-Manuals');
            expect(loc).toContain('pdfFile=SAS-Survival.pdf');
        });
    });
});
