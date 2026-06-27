import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const SYNC_CONFIG_KEY = 'homemaker_sync_config';
const SYNC_QUEUE_KEY = 'homemaker_sync_queue';

const DEFAULT_SYNC_CONFIG = {
    enabled: false,
    lastSyncAt: null,
    accountUpgradeStatus: 'local', // local, anonymous, upgraded
    syncStatus: 'idle', // idle, syncing, error, offline
    userEmail: null
};

// Allowlisted keys to sync
const SYNC_KEYS = [
    'homemaker_homestead_profile',
    'homemaker_homestead_plan',
    'homemaker_garden_plan',
    'homemaker_pantry_plan',
    'homemaker_water_plan',
    'homemaker_energy_plan',
    'homemaker_build_projects',
    'homemaker_seasonal_tasks',
    'homemaker_field_binder_settings'
];

let syncTimeout = null;

// Read config
export const getSyncConfig = () => {
    try {
        const val = localStorage.getItem(SYNC_CONFIG_KEY);
        return val ? { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(val) } : DEFAULT_SYNC_CONFIG;
    } catch {
        return DEFAULT_SYNC_CONFIG;
    }
};

// Write config
const saveSyncConfig = (config) => {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
};

// Queue helper
const getSyncQueue = () => {
    try {
        const val = localStorage.getItem(SYNC_QUEUE_KEY);
        return val ? JSON.parse(val) : [];
    } catch {
        return [];
    }
};

const addToSyncQueue = (key) => {
    const queue = getSyncQueue();
    if (!queue.includes(key)) {
        queue.push(key);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
};

const clearSyncQueue = () => {
    localStorage.removeItem(SYNC_QUEUE_KEY);
};

// Check if sync is opt-in active
export const isSyncEnabled = () => {
    return isSupabaseConfigured && getSyncConfig().enabled;
};

// Trigger debounced push
export const triggerSyncPush = (key) => {
    if (!isSyncEnabled()) return;
    if (!SYNC_KEYS.includes(key)) return;

    addToSyncQueue(key);

    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
        pushQueue();
    }, 3000); // 3 seconds debounce
};

// Push all queued items
export const pushQueue = async () => {
    if (!isSyncEnabled()) return;
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    const config = getSyncConfig();
    saveSyncConfig({ ...config, syncStatus: 'syncing' });

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        for (const key of queue) {
            const rawVal = localStorage.getItem(key);
            if (rawVal === null) continue;

            const parsed = JSON.parse(rawVal);
            
            // Upsert planning/profile row
            const { error } = await supabase
                .from('homestead_plans')
                .upsert({
                    user_id: user.id,
                    module_key: key,
                    plan_data: parsed,
                    updated_at: parsed.updatedAt || new Date().toISOString(),
                    sync_updated_at: new Date().toISOString(),
                    schema_version: parsed.schemaVersion || 1
                }, { onConflict: 'user_id,module_key' });

            if (error) throw error;
        }

        clearSyncQueue();
        saveSyncConfig({
            ...config,
            enabled: true,
            lastSyncAt: new Date().toISOString(),
            syncStatus: 'idle'
        });
    } catch (err) {
        console.error('Push sync error:', err.message);
        saveSyncConfig({
            ...config,
            syncStatus: 'error'
        });
    }
};

// Pull all remote data
export const pullNow = async () => {
    if (!isSyncEnabled()) return { status: 'error', message: 'Sync not enabled' };

    const config = getSyncConfig();
    saveSyncConfig({ ...config, syncStatus: 'syncing' });

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('homestead_plans')
            .select('module_key, plan_data, updated_at')
            .eq('user_id', user.id);

        if (error) throw error;

        let mergedCount = 0;

        (data || []).forEach(row => {
            const localRaw = localStorage.getItem(row.module_key);
            let shouldOverwrite = false;

            if (!localRaw) {
                shouldOverwrite = true;
            } else {
                try {
                    const localData = JSON.parse(localRaw);
                    const localTime = new Date(localData.updatedAt || 0).getTime();
                    const remoteTime = new Date(row.updated_at).getTime();

                    if (remoteTime > localTime) {
                        shouldOverwrite = true;
                    }
                } catch {
                    shouldOverwrite = true;
                }
            }

            if (shouldOverwrite) {
                localStorage.setItem(row.module_key, JSON.stringify(row.plan_data));
                mergedCount++;
            }
        });

        saveSyncConfig({
            ...config,
            lastSyncAt: new Date().toISOString(),
            syncStatus: 'idle'
        });

        return { status: 'success', mergedCount };
    } catch (err) {
        console.error('Pull sync error:', err.message);
        saveSyncConfig({ ...config, syncStatus: 'error' });
        return { status: 'error', message: err.message };
    }
};

// Enable cloud backup (opt-in trigger)
export const enableCloudBackup = async (method, email = '', password = '') => {
    if (!isSupabaseConfigured) {
        return { status: 'error', message: 'Supabase configuration missing' };
    }

    try {
        let authUser = null;

        if (method === 'anonymous') {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) throw error;
            authUser = data.user;
        } else if (method === 'email') {
            // Sign in or Sign up
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                // Try registering new user if login fails
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { display_name: 'Homesteader' } }
                });
                if (signUpError) throw signUpError;
                authUser = signUpData.user;
            } else {
                authUser = data.user;
            }
        }

        if (!authUser) throw new Error('Authentication failed');

        // Create profile in Supabase profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authUser.id,
                display_name: 'Homesteader',
                sync_enabled: true,
                last_sync_at: new Date().toISOString(),
                account_upgrade_status: authUser.email ? 'upgraded' : 'anonymous'
            });

        if (profileError) console.warn('Profile sync warning:', profileError.message);

        // Turn on sync locally
        const newConfig = {
            enabled: true,
            lastSyncAt: new Date().toISOString(),
            accountUpgradeStatus: authUser.email ? 'upgraded' : 'anonymous',
            syncStatus: 'idle',
            userEmail: authUser.email || null
        };
        saveSyncConfig(newConfig);

        // Queue all existing local data for initial upload
        SYNC_KEYS.forEach(key => addToSyncQueue(key));
        await pushQueue();

        return { status: 'success', email: authUser.email };
    } catch (err) {
        console.error('Enable backup error:', err.message);
        return { status: 'error', message: err.message };
    }
};

// Upgrade anonymous user
export const upgradeAnonymousAccount = async (email, password) => {
    if (!isSupabaseConfigured) return { status: 'error', message: 'Not configured' };

    try {
        const { data, error } = await supabase.auth.updateUser({
            email,
            password
        });
        if (error) throw error;

        const config = getSyncConfig();
        const updatedConfig = {
            ...config,
            accountUpgradeStatus: 'upgraded',
            userEmail: email
        };
        saveSyncConfig(updatedConfig);

        // Update profile upgrade status
        await supabase
            .from('profiles')
            .update({ account_upgrade_status: 'upgraded' })
            .eq('id', data.user.id);

        return { status: 'success' };
    } catch (err) {
        return { status: 'error', message: err.message };
    }
};

// Disable cloud backup
export const disableCloudBackup = async () => {
    try {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
    } catch (err) {
        console.warn('Supabase signout warning:', err.message);
    }

    saveSyncConfig({
        enabled: false,
        lastSyncAt: null,
        accountUpgradeStatus: 'local',
        syncStatus: 'idle',
        userEmail: null
    });
    clearSyncQueue();
};

// Delete all remote backup data
export const deleteRemoteBackup = async () => {
    if (!isSyncEnabled()) return { status: 'error', message: 'Sync is not enabled' };

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        // Delete plans
        const { error: plansErr } = await supabase
            .from('homestead_plans')
            .delete()
            .eq('user_id', user.id);

        if (plansErr) throw plansErr;

        // Delete profile
        const { error: profileErr } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (profileErr) throw profileErr;

        // Sign out and clear locally
        await disableCloudBackup();
        return { status: 'success' };
    } catch (err) {
        console.error('Delete remote data error:', err.message);
        return { status: 'error', message: err.message };
    }
};
