import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import { ToastProvider } from '../../context/ToastContext';
import { PwaLifecycleProvider } from '../../context/PwaLifecycleContext';

describe('Layout component', () => {
    it('should open and close the mobile menu successfully', async () => {
        const { container } = render(
            <ToastProvider>
                <PwaLifecycleProvider>
                    <MemoryRouter>
                        <Layout />
                    </MemoryRouter>
                </PwaLifecycleProvider>
            </ToastProvider>
        );

        // Menu should be closed initially
        expect(screen.queryByText('Menu')).toBeNull();

        // Click the hamburger menu button in the header
        const menuBtn = screen.getByRole('button', { name: '' }); // The only button in header is Menu
        fireEvent.click(menuBtn);

        // Menu should be open
        expect(screen.getByText('Menu')).toBeInTheDocument();

        // Find the close "X" button by its close icon class
        const closeBtn = container.querySelector('.lucide-x').closest('button');
        
        // Let's click the close button
        fireEvent.click(closeBtn);

        // Wait for the menu to close
        await waitFor(() => {
            expect(screen.queryByText('Menu')).toBeNull();
        });
    });
});
