import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clearAllAppData } from '../appDataService';
import { disableCloudBackup } from '../homesteadSyncService';
import { supabase } from '../../utils/supabaseClient';



describe('appDataService & Clear App Data reset flow', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should include sync config and sync queue in clearAllAppData target keys', async () => {
        // Set dummy items
        localStorage.setItem('homemaker_user', JSON.stringify({ name: 'Test' }));
        localStorage.setItem('homemaker_sync_config', JSON.stringify({ enabled: true }));
        localStorage.setItem('homemaker_sync_queue', JSON.stringify(['key1']));

        expect(localStorage.getItem('homemaker_sync_config')).not.toBeNull();
        expect(localStorage.getItem('homemaker_sync_queue')).not.toBeNull();

        await clearAllAppData();

        // Check they are removed
        expect(localStorage.getItem('homemaker_user')).toBeNull();
        expect(localStorage.getItem('homemaker_sync_config')).toBeNull();
        expect(localStorage.getItem('homemaker_sync_queue')).toBeNull();
    });

    it('should call supabase.auth.signOut() and reset config when disableCloudBackup() is run', async () => {
        // Setup config
        const testConfig = {
            enabled: true,
            accountUpgradeStatus: 'anonymous',
            syncStatus: 'idle',
            userEmail: null
        };
        localStorage.setItem('homemaker_sync_config', JSON.stringify(testConfig));

        await disableCloudBackup();

        // 1. Assert Supabase Auth signOut was triggered
        expect(supabase.auth.signOut).toHaveBeenCalled();

        // 2. Assert local config was reverted to disabled/local default
        const currentConfig = JSON.parse(localStorage.getItem('homemaker_sync_config'));
        expect(currentConfig.enabled).toBe(false);
        expect(currentConfig.accountUpgradeStatus).toBe('local');
        expect(currentConfig.userEmail).toBeNull();
    });

    it('should successfully execute the full reset flow (sign out first, then clear localStorage)', async () => {
        // Simulating the exact steps from clearAppData() in UserContext
        localStorage.setItem('homemaker_user', JSON.stringify({ name: 'Bob' }));
        localStorage.setItem('homemaker_sync_config', JSON.stringify({ enabled: true }));

        // Step 1: Sign out of Supabase
        await disableCloudBackup();
        expect(supabase.auth.signOut).toHaveBeenCalled();

        // Step 2: Clear all LocalStorage data
        await clearAllAppData();

        // Assert full clean state
        expect(localStorage.getItem('homemaker_user')).toBeNull();
        expect(localStorage.getItem('homemaker_sync_config')).toBeNull();
    });
});
