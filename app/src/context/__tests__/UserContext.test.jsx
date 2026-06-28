import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';
import { mockClient } from '../../test/setup';

// Test consumer component
const TestConsumer = () => {
    const { clearAppData } = useUser();
    return (
        <button onClick={clearAppData} data-testid="clear-btn">
            Clear Data
        </button>
    );
};

describe('UserContext Integration (True Regression Guard)', () => {
    const reloadSpy = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();

        // Mock window.location.reload
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: reloadSpy },
            writable: true
        });
    });

    it('should coordinate the full sign-out and local data reset flow when clearAppData is invoked', async () => {
        render(
            <UserProvider>
                <TestConsumer />
            </UserProvider>
        );

        const btn = screen.getByTestId('clear-btn');
        fireEvent.click(btn);

        // Wait for the async chain to execute completely
        await waitFor(() => {
            // 1. Verify the real disableCloudBackup invoked supabase.auth.signOut()
            expect(mockClient.auth.signOut).toHaveBeenCalled();

            // 2. Verify post-reload toast flag was set in sessionStorage
            expect(sessionStorage.getItem('homemaker_post_reload_toast')).toBe('local_only_restored');

            // 3. Verify window reload was triggered
            expect(reloadSpy).toHaveBeenCalled();
        });
    });
});
