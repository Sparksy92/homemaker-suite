import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
    isSyncEnabled, 
    getSyncConfig, 
    saveSyncConfig, 
    pushQueue, 
    pullNow, 
    resolveConflict 
} from '../homesteadSyncService';
import { supabase } from '../../utils/supabaseClient';
import { mockQuery } from '../../test/setup';

describe('homesteadSyncService & Conflict Engine', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        // Reset mockQuery then to default
        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: [], error: null }).then(onFulfilled);
        });
    });

    const getLocalSyncQueue = () => {
        const val = localStorage.getItem('homemaker_sync_queue');
        return val ? JSON.parse(val) : [];
    };

    it('should be disabled by default', () => {
        expect(isSyncEnabled()).toBe(false);
        const config = getSyncConfig();
        expect(config.enabled).toBe(false);
        expect(config.accountUpgradeStatus).toBe('local');
        expect(config.syncStatus).toBe('idle');
    });

    it('should not push anything to remote when sync is disabled', async () => {
        // Queue an item
        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: [], updatedAt: new Date().toISOString() }));

        await pushQueue();

        // Supabase from() should NOT have been called because sync is disabled
        expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should push queued changes to remote when sync is enabled', async () => {
        // Enable sync
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            userEmail: null
        });

        // Queue a dirty plan
        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        const planData = { beds: [], updatedAt: new Date().toISOString(), schemaVersion: 1 };
        localStorage.setItem('homemaker_garden_plan', JSON.stringify(planData));

        await pushQueue();

        // Assert it fetched user and upserted to table
        expect(supabase.from).toHaveBeenCalledWith('homestead_plans');
        
        // Assert queue was cleared and sync status updated to idle
        expect(getLocalSyncQueue()).toHaveLength(0);
        expect(getSyncConfig().syncStatus).toBe('idle');
        expect(getSyncConfig().lastSyncAt).not.toBeNull();
    });

    it('should return conflict when local plan has dirty changes and remote updated_at differs', async () => {
        // Enable sync
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            userEmail: null
        });

        // Setup local dirty plan
        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        const localTime = new Date('2026-06-28T00:00:00Z').toISOString();
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: ['local'], updatedAt: localTime }));

        // Mock remote plan with different updatedAt/data
        const remoteTime = new Date('2026-06-28T01:00:00Z').toISOString();
        const mockRows = [{
            module_key: 'homemaker_garden_plan',
            plan_data: { beds: ['remote'] },
            updated_at: remoteTime,
            deleted_at: null
        }];

        // Override thenable to return mock rows
        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: mockRows, error: null }).then(onFulfilled);
        });

        const result = await pullNow();

        // Assert conflict was returned
        expect(result.status).toBe('conflict');
        expect(result.conflicts).toHaveLength(1);
        expect(result.conflicts[0].key).toBe('homemaker_garden_plan');
        expect(result.conflicts[0].localData.beds).toEqual(['local']);
        expect(result.conflicts[0].remoteData.beds).toEqual(['remote']);
        expect(getSyncConfig().syncStatus).toBe('conflict');
    });

    it('should pull remote tombstone properly and apply to local storage', async () => {
        // Enable sync
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            userEmail: null
        });

        // Setup local clean plan (not in sync queue)
        const localTime = new Date('2026-06-28T00:00:00Z').toISOString();
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: ['local'], updatedAt: localTime }));

        // Remote has a tombstone with a newer updated_at timestamp
        const remoteTime = new Date('2026-06-28T01:00:00Z').toISOString();
        const mockRows = [{
            module_key: 'homemaker_garden_plan',
            plan_data: {},
            updated_at: remoteTime,
            deleted_at: remoteTime
        }];

        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: mockRows, error: null }).then(onFulfilled);
        });

        const result = await pullNow();

        expect(result.status).toBe('success');
        expect(result.mergedCount).toBe(1);

        // Local plan should now be tombstoned
        const local = JSON.parse(localStorage.getItem('homemaker_garden_plan'));
        expect(local.deletedAt).toBe(remoteTime);
        expect(local.updatedAt).toBe(remoteTime);
    });

    it('should resolve conflict by Keep Local (pushing local data to remote)', async () => {
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'conflict',
            userEmail: null
        });

        // Setup local plan and queue
        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: ['local'], updatedAt: new Date().toISOString() }));

        // Mock remote check
        const mockRemote = [{
            plan_data: { beds: ['remote'] },
            updated_at: new Date().toISOString(),
            deleted_at: null
        }];

        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: mockRemote, error: null }).then(onFulfilled);
        });

        const result = await resolveConflict('homemaker_garden_plan', 'keep_local');

        expect(result.status).toBe('success');
        expect(supabase.from).toHaveBeenCalled();
        expect(getLocalSyncQueue()).toHaveLength(0);
        expect(getSyncConfig().syncStatus).toBe('idle');
    });

    it('should resolve conflict by Use Remote (overwriting local data)', async () => {
        saveSyncConfig({
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'conflict',
            userEmail: null
        });

        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['homemaker_garden_plan']));
        localStorage.setItem('homemaker_garden_plan', JSON.stringify({ beds: ['local'], updatedAt: new Date().toISOString() }));

        const remoteTime = new Date().toISOString();
        const mockRemote = [{
            plan_data: { beds: ['remote'] },
            updated_at: remoteTime,
            deleted_at: null
        }];

        mockQuery.then = vi.fn((onFulfilled) => {
            return Promise.resolve({ data: mockRemote, error: null }).then(onFulfilled);
        });

        const result = await resolveConflict('homemaker_garden_plan', 'use_remote');

        expect(result.status).toBe('success');
        const local = JSON.parse(localStorage.getItem('homemaker_garden_plan'));
        expect(local.beds).toEqual(['remote']);
        expect(getLocalSyncQueue()).toHaveLength(0);
        expect(getSyncConfig().syncStatus).toBe('idle');
    });
});
