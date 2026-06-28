import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const SYNC_CONFIG_KEY = 'homemaker_sync_config';
const SYNC_QUEUE_KEY = 'homemaker_sync_queue';

const DEFAULT_SYNC_CONFIG = {
    enabled: false,
    lastSyncAt: null,
    accountUpgradeStatus: 'local', // local, anonymous, upgraded
    syncStatus: 'idle', // idle, syncing, retrying, error, offline, conflict
    syncRetryCount: 0,
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
export const saveSyncConfig = (config) => {
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
        pushQueueWithRetry();
    }, 3000); // 3 seconds debounce
};

// Push all queued items


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
                    deleted_at: parsed.deletedAt || null,
                    schema_version: parsed.schemaVersion || 1
                }, { onConflict: 'user_id,module_key' });

            if (error) throw error;
        }

        clearSyncQueue();
        saveSyncConfig({
            ...config,
            enabled: true,
            lastSyncAt: new Date().toISOString(),
            syncStatus: 'idle',
            syncRetryCount: 0
        });
    } catch (err) {
        console.error('Push sync error:', err.message);
        saveSyncConfig({
            ...config,
            syncStatus: 'error',
            syncRetryCount: 0
        });
    }
};

// Retry wrapper for pushQueue
export const pushQueueWithRetry = async ({ maxAttempts = 3, delayMs = 15000 } = {}) => {
    if (!isSyncEnabled()) return { status: 'error', message: 'Sync not enabled' };
    const queue = getSyncQueue();
    if (queue.length === 0) return { status: 'success', message: 'Queue empty' };

    return new Promise((resolve) => {
        let attempts = 0;
        const runAttempt = async () => {
            attempts++;
            const config = getSyncConfig();
            
            saveSyncConfig({
                ...config,
                syncStatus: 'syncing'
            });

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                for (const key of queue) {
                    const rawVal = localStorage.getItem(key);
                    if (rawVal === null) continue;
                    const parsed = JSON.parse(rawVal);

                    const { error } = await supabase
                        .from('homestead_plans')
                        .upsert({
                            user_id: user.id,
                            module_key: key,
                            plan_data: parsed,
                            updated_at: parsed.updatedAt || new Date().toISOString(),
                            sync_updated_at: new Date().toISOString(),
                            deleted_at: parsed.deletedAt || null,
                            schema_version: parsed.schemaVersion || 1
                        }, { onConflict: 'user_id,module_key' });

                    if (error) throw error;
                }

                clearSyncQueue();
                saveSyncConfig({
                    ...getSyncConfig(),
                    lastSyncAt: new Date().toISOString(),
                    syncStatus: 'idle',
                    syncRetryCount: 0
                });
                resolve({ status: 'success' });
            } catch (err) {
                console.warn(`Sync attempt ${attempts} failed: ${err.message}`);
                if (attempts < maxAttempts) {
                    saveSyncConfig({
                        ...getSyncConfig(),
                        syncStatus: 'retrying',
                        syncRetryCount: attempts
                    });
                    setTimeout(runAttempt, delayMs);
                } else {
                    saveSyncConfig({
                        ...getSyncConfig(),
                        syncStatus: 'error',
                        syncRetryCount: 0
                    });
                    resolve({ status: 'error', message: err.message });
                }
            }
        };

        runAttempt();
    });
};

let reconnectHandlerRegistered = false;

export const initializeSyncReconnectHandler = ({ showToast } = {}) => {
    if (reconnectHandlerRegistered || typeof window === 'undefined') return;
    reconnectHandlerRegistered = true;

    window.addEventListener('online', async () => {
        if (!isSyncEnabled()) return;

        const queue = getSyncQueue();
        if (queue.length > 0) {
            if (showToast) showToast('Network reconnected. Syncing pending changes...', 'info');
            await pushQueueWithRetry();
        } else {
            // No dirty local keys, run pullNow silently
            const res = await pullNow(false); // force = false
            if (res.status === 'conflict') {
                if (showToast) showToast('Cloud changes available — review in Settings.', 'warning');
            } else if (res.status === 'success' && res.mergedCount > 0) {
                if (showToast) showToast(`Network reconnected. Merged ${res.mergedCount} cloud updates.`, 'success');
            }
        }
    });
};

// Pull all remote data
// Pull all remote data with conflict detection
export const pullNow = async (force = false) => {
    if (!isSyncEnabled()) return { status: 'error', message: 'Sync not enabled' };

    const config = getSyncConfig();
    saveSyncConfig({ ...config, syncStatus: 'syncing' });

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('homestead_plans')
            .select('module_key, plan_data, updated_at, deleted_at')
            .eq('user_id', user.id);

        if (error) throw error;

        const queue = getSyncQueue();
        const conflicts = [];
        const nonConflictingRows = [];

        (data || []).forEach(row => {
            const localRaw = localStorage.getItem(row.module_key);
            if (!localRaw) {
                nonConflictingRows.push(row);
                return;
            }

            let localData;
            try {
                localData = JSON.parse(localRaw);
            } catch {
                nonConflictingRows.push(row);
                return;
            }

            const localIsDirty = queue.includes(row.module_key);
            const remoteTime = new Date(row.updated_at).getTime();
            const localTime = new Date(localData.updatedAt || 0).getTime();
            const timestampsDiffer = Math.abs(remoteTime - localTime) > 1000; // 1s tolerance

            const remoteIsDeleted = !!row.deleted_at;
            const localIsDeleted = !!localData.deletedAt;
            const tombstoneConflict = (remoteIsDeleted && !localIsDeleted) || (!remoteIsDeleted && localIsDeleted);

            // Flag conflict if dirty locally AND (timestamps differ OR tombstone status differs)
            if (!force && localIsDirty && (timestampsDiffer || tombstoneConflict)) {
                conflicts.push({
                    key: row.module_key,
                    localData,
                    remoteData: {
                        ...row.plan_data,
                        updatedAt: row.updated_at,
                        deletedAt: row.deleted_at || undefined
                    }
                });
            } else {
                nonConflictingRows.push(row);
            }
        });

        if (conflicts.length > 0) {
            saveSyncConfig({
                ...config,
                syncStatus: 'conflict'
            });
            return { status: 'conflict', conflicts };
        }

        // Apply non-conflicting updates
        let mergedCount = 0;
        nonConflictingRows.forEach(row => {
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
                const mergedData = row.plan_data || {};
                if (row.deleted_at) {
                    mergedData.deletedAt = row.deleted_at;
                    mergedData.updatedAt = row.updated_at;
                }
                localStorage.setItem(row.module_key, JSON.stringify(mergedData));
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

// Resolve conflict for a single key
export const resolveConflict = async (key, resolution) => {
    if (!isSyncEnabled()) return { status: 'error', message: 'Sync not enabled' };

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const localRaw = localStorage.getItem(key);
        if (!localRaw) throw new Error('Local data missing');
        const localData = JSON.parse(localRaw);

        // Fetch remote data
        const { data: remoteRows, error: fetchErr } = await supabase
            .from('homestead_plans')
            .select('plan_data, updated_at, deleted_at')
            .eq('user_id', user.id)
            .eq('module_key', key);

        if (fetchErr) throw fetchErr;
        const remoteRow = remoteRows?.[0];
        if (!remoteRow) throw new Error('Remote data missing');

        let winner = 'local'; // default

        if (resolution === 'use_remote') {
            winner = 'remote';
        } else if (resolution === 'latest_timestamp') {
            const localTime = new Date(localData.updatedAt || 0).getTime();
            const remoteTime = new Date(remoteRow.updated_at).getTime();
            if (remoteTime > localTime) {
                winner = 'remote';
            }
        }

        if (winner === 'remote') {
            // Apply remote locally
            const mergedData = remoteRow.plan_data || {};
            if (remoteRow.deleted_at) {
                mergedData.deletedAt = remoteRow.deleted_at;
                mergedData.updatedAt = remoteRow.updated_at;
            }
            localStorage.setItem(key, JSON.stringify(mergedData));
        } else {
            // Push local to remote
            const { error: upsertErr } = await supabase
                .from('homestead_plans')
                .upsert({
                    user_id: user.id,
                    module_key: key,
                    plan_data: localData,
                    updated_at: localData.updatedAt || new Date().toISOString(),
                    sync_updated_at: new Date().toISOString(),
                    deleted_at: localData.deletedAt || null,
                    schema_version: localData.schemaVersion || 1
                }, { onConflict: 'user_id,module_key' });

            if (upsertErr) throw upsertErr;
        }

        // Remove from local sync queue
        const queue = getSyncQueue().filter(k => k !== key);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));

        // Restore sync status to idle if queue is clear
        const config = getSyncConfig();
        saveSyncConfig({
            ...config,
            syncStatus: queue.length === 0 ? 'idle' : 'syncing'
        });

        return { status: 'success' };
    } catch (err) {
        console.error('Resolve conflict error:', err.message);
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
            syncRetryCount: 0,
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
        syncRetryCount: 0,
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
