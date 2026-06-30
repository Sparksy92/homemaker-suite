import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';

const TestNavigator = () => {
    const navigate = useNavigate();
    return (
        <button data-testid="nav-btn" onClick={() => navigate('/other')}>
            Go to Other
        </button>
    );
};

const renderLayout = (initialRoute = '/') => {
    return render(
        <ToastProvider>
            <PwaLifecycleProvider>
                <MemoryRouter initialEntries={[initialRoute]}>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<TestNavigator />} />
                            <Route path="other" element={<div>Other Page</div>} />
                        </Route>
                    </Routes>
                </MemoryRouter>
            </PwaLifecycleProvider>
        </ToastProvider>
    );
};

describe('Layout Mobile Menu & Spacing', () => {
    it('1. Menu button opens the drawer', async () => {
        renderLayout();
        expect(screen.queryByText('Menu')).toBeNull();

        const menuBtn = screen.getByRole('button', { name: 'Open navigation menu' });
        fireEvent.click(menuBtn);

        expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('2. Backdrop click closes the drawer', async () => {
        const { container } = renderLayout();
        
        // Open menu
        const menuBtn = screen.getByRole('button', { name: 'Open navigation menu' });
        fireEvent.click(menuBtn);
        expect(screen.getByText('Menu')).toBeInTheDocument();

        // Find backdrop and click it
        const backdrop = container.querySelector('div.fixed.inset-0.bg-black\\/60');
        expect(backdrop).toBeDefined();
        fireEvent.click(backdrop);

        await waitFor(() => {
            expect(screen.queryByText('Menu')).toBeNull();
        });
    });

    it('3. Menu link closes the drawer', async () => {
        renderLayout();
        
        // Open menu
        const menuBtn = screen.getByRole('button', { name: 'Open navigation menu' });
        fireEvent.click(menuBtn);
        expect(screen.getByText('Menu')).toBeInTheDocument();

        // Click on a menu link (e.g., Home)
        const homeLink = screen.getByRole('link', { name: 'Home' });
        fireEvent.click(homeLink);

        await waitFor(() => {
            expect(screen.queryByText('Menu')).toBeNull();
        });
    });

    it('4. Route change closes the drawer even if the link handler did not fire', async () => {
        renderLayout();
        
        // Open menu
        const menuBtn = screen.getByRole('button', { name: 'Open navigation menu' });
        fireEvent.click(menuBtn);
        expect(screen.getByText('Menu')).toBeInTheDocument();

        // Click nav-btn in content (outside menu links)
        const navBtn = screen.getByTestId('nav-btn');
        fireEvent.click(navBtn);

        // Verify routing happened and menu closed automatically
        expect(screen.getByText('Other Page')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText('Menu')).toBeNull();
        });
    });

    it('5. Menu button has aria-label, aria-expanded, and at least 48px touch target classes', () => {
        renderLayout();
        const menuBtn = screen.getByRole('button', { name: 'Open navigation menu' });

        expect(menuBtn).toHaveAttribute('aria-label', 'Open navigation menu');
        expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
        expect(menuBtn).toHaveAttribute('aria-controls', 'mobile-navigation-menu');
        
        // Check touch target classes min-w-[48px] and min-h-[48px]
        const classList = Array.from(menuBtn.classList);
        expect(classList).toContain('min-w-[48px]');
        expect(classList).toContain('min-h-[48px]');
    });
});
