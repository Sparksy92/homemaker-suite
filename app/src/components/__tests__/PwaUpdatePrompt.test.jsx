import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PwaUpdatePrompt from '../PwaUpdatePrompt';
import * as pwaContext from '../../context/PwaLifecycleContext';

vi.mock('../../context/PwaLifecycleContext', () => ({
    usePwaLifecycle: vi.fn()
}));

describe('PwaUpdatePrompt component', () => {
    let mockUsePwaLifecycle;

    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePwaLifecycle = vi.spyOn(pwaContext, 'usePwaLifecycle');
    });

    it('should not render anything when needRefresh and offlineReady are both false', () => {
        mockUsePwaLifecycle.mockReturnValue({
            needRefresh: false,
            setNeedRefresh: vi.fn(),
            offlineReady: false,
            setOfflineReady: vi.fn(),
            updateServiceWorker: vi.fn()
        });

        const { container } = render(<PwaUpdatePrompt />);
        expect(container.firstChild).toBeNull();
    });

    it('should render offline ready message and allow dismissal', () => {
        const setOfflineReadyMock = vi.fn();
        mockUsePwaLifecycle.mockReturnValue({
            needRefresh: false,
            setNeedRefresh: vi.fn(),
            offlineReady: true,
            setOfflineReady: setOfflineReadyMock,
            updateServiceWorker: vi.fn()
        });

        render(<PwaUpdatePrompt />);

        expect(screen.getByText(/ready to work offline/i)).toBeInTheDocument();

        // Locate close button (the one with close icon)
        const closeBtn = screen.getByRole('button');
        fireEvent.click(closeBtn);

        expect(setOfflineReadyMock).toHaveBeenCalledWith(false);
    });

    it('should render update available prompt and handle user actions', () => {
        const setNeedRefreshMock = vi.fn();
        const updateServiceWorkerMock = vi.fn();
        mockUsePwaLifecycle.mockReturnValue({
            needRefresh: true,
            setNeedRefresh: setNeedRefreshMock,
            offlineReady: false,
            setOfflineReady: vi.fn(),
            updateServiceWorker: updateServiceWorkerMock
        });

        render(<PwaUpdatePrompt />);

        expect(screen.getByText(/New Update Available/i)).toBeInTheDocument();

        // Check Dismiss ("Later")
        const laterBtn = screen.getByRole('button', { name: /later/i });
        fireEvent.click(laterBtn);
        expect(setNeedRefreshMock).toHaveBeenCalledWith(false);

        // Check Update ("Update Now")
        const updateBtn = screen.getByRole('button', { name: /update now/i });
        fireEvent.click(updateBtn);
        expect(updateServiceWorkerMock).toHaveBeenCalledWith(true);
    });
});
