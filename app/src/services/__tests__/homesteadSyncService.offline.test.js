import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    getSyncConfig,
    saveSyncConfig,
    pushQueueWithRetry,
    initializeSyncReconnectHandler
} from '../homesteadSyncService';
import { mockQuery } from '../../test/setup';

describe('homesteadSyncService offline & retry resilience', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.useFakeTimers();
        
        // Reset mockQuery then to default success
        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should successfully push immediately if network is online and stable', async () => {
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            syncRetryCount: 0,
            userEmail: null
        });

        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: [], updatedAt: new Date().toISOString(), schemaVersion: 1 }));

        const promise = pushQueueWithRetry({ maxAttempts: 3, delayMs: 1000 });
        
        // Resolve immediately
        const res = await promise;
        expect(res.status).toBe('success');
        expect(getSyncConfig().syncStatus).toBe('idle');
        expect(getSyncConfig().syncRetryCount).toBe(0);
    });

    it('should transition to retrying and retry up to capped attempts on failure', async () => {
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            syncRetryCount: 0,
            userEmail: null
        });

        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: [], updatedAt: new Date().toISOString(), schemaVersion: 1 }));

        // Mock error on upsert
        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: null, error: new Error('Network Timeout') }).then(onFulfilled);
        });

        const promise = pushQueueWithRetry({ maxAttempts: 3, delayMs: 1000 });

        // Let the first attempt run and fail
        await vi.advanceTimersByTimeAsync(100);

        // syncStatus should now be 'retrying' and retry count should be 1
        expect(getSyncConfig().syncStatus).toBe('retrying');
        expect(getSyncConfig().syncRetryCount).toBe(1);

        // Advance to 2nd attempt
        await vi.advanceTimersByTimeAsync(1000);
        expect(getSyncConfig().syncStatus).toBe('retrying');
        expect(getSyncConfig().syncRetryCount).toBe(2);

        // Advance to 3rd attempt, which fails and marks status as 'error'
        await vi.advanceTimersByTimeAsync(1000);
        
        const finalResult = await promise;
        expect(finalResult.status).toBe('error');
        expect(getSyncConfig().syncStatus).toBe('error');
        expect(getSyncConfig().syncRetryCount).toBe(0);
    });

    it('reconnect handler should trigger pushQueueWithRetry when queue is dirty', async () => {
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            syncRetryCount: 0,
            userEmail: null
        });

        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: [], updatedAt: new Date().toISOString(), schemaVersion: 1 }));

        const showToastSpy = vi.fn();
        
        // Register reconnect handler
        initializeSyncReconnectHandler({ showToast: showToastSpy });

        // Simulate going online
        window.dispatchEvent(new Event('online'));

        // Wait for asynchronous reconnect routines
        await vi.advanceTimersByTimeAsync(100);

        expect(showToastSpy).toHaveBeenCalledWith(expect.stringContaining('Network reconnected. Syncing'), 'info');
    });
});
