const DB_NAME = 'homemaker_observations_db';
const STORE_NAME = 'observations';

const LOCAL_STORAGE_ALLOWLIST = [
    'homemaker_user',
    'homemaker_favorites',
    'homemaker_read_guides',
    'homemaker_last_accessed',
    'homemaker_settings',
    'homemaker_home_widgets',
    'homemaker_sustainability',
    'homemaker_water_inventory',
    'weather_enabled',
    'homemaker_beta_notice_dismissed'
];

export const exportAppData = () => {
    return new Promise((resolve) => {
        const backup = {
            appName: 'Homemaker Suite',
            schemaVersion: 1,
            exportedAt: new Date().toISOString(),
            localStorage: {},
            indexedDB: {
                observations: []
            }
        };

        // 1. Export localStorage allowlisted keys
        LOCAL_STORAGE_ALLOWLIST.forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) {
                try {
                    backup.localStorage[key] = JSON.parse(val);
                } catch {
                    backup.localStorage[key] = val;
                }
            }
        });

        // 2. Export IndexedDB observations
        const request = indexedDB.open(DB_NAME);
        request.onerror = () => {
            resolve(backup);
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.close();
                resolve(backup);
                return;
            }

            try {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const getRequest = store.getAll();

                getRequest.onsuccess = () => {
                    backup.indexedDB.observations = getRequest.result || [];
                    db.close();
                    resolve(backup);
                };
                getRequest.onerror = () => {
                    db.close();
                    resolve(backup);
                };
            } catch (e) {
                db.close();
                resolve(backup);
            }
        };
    });
};

export const importAppData = (backup) => {
    return new Promise((resolve, reject) => {
        if (!backup || typeof backup !== 'object') {
            return reject('Invalid backup format');
        }
        if (backup.appName !== 'Homemaker Suite') {
            return reject('Not a Homemaker Suite backup file');
        }
        if (backup.schemaVersion !== 1) {
            return reject(`Unsupported backup schema version: ${backup.schemaVersion}. Current supported version is 1.`);
        }

        // 1. Restore localStorage allowlisted keys
        if (backup.localStorage) {
            LOCAL_STORAGE_ALLOWLIST.forEach(key => {
                const val = backup.localStorage[key];
                if (val !== undefined) {
                    if (typeof val === 'object') {
                        localStorage.setItem(key, JSON.stringify(val));
                    } else {
                        localStorage.setItem(key, val);
                    }
                }
            });
        }

        // 2. Restore IndexedDB observations
        const request = indexedDB.open(DB_NAME);
        request.onerror = () => reject('Failed to open observations database during restore');
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = (event) => {
            const db = event.target.result;
            try {
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // Clear observations first to ensure no stale data remains
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => {
                    const observations = backup.indexedDB?.observations || [];
                    if (observations.length === 0) {
                        db.close();
                        resolve();
                        return;
                    }

                    let addedCount = 0;
                    let hasError = false;

                    observations.forEach(obs => {
                        const addRequest = store.put(obs);
                        addRequest.onsuccess = () => {
                            addedCount++;
                            if (addedCount === observations.length) {
                                db.close();
                                if (hasError) {
                                    reject('Some observations could not be restored');
                                } else {
                                    resolve();
                                }
                            }
                        };
                        addRequest.onerror = () => {
                            hasError = true;
                            addedCount++;
                            if (addedCount === observations.length) {
                                db.close();
                                reject('Failed to write some observations to database');
                            }
                        };
                    });
                };
                clearRequest.onerror = () => {
                    db.close();
                    reject('Failed to clear database before restore');
                };
            } catch (e) {
                db.close();
                reject(`Database transaction error: ${e.message}`);
            }
        };
    });
};

export const clearAllAppData = () => {
    return new Promise((resolve) => {
        // 1. Remove localStorage allowlisted keys only
        LOCAL_STORAGE_ALLOWLIST.forEach(key => {
            localStorage.removeItem(key);
        });

        // 2. Delete the IndexedDB observations database
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        deleteRequest.onsuccess = () => {
            resolve();
        };
        deleteRequest.onerror = () => {
            console.error('Failed to delete observations database');
            resolve();
        };
        deleteRequest.onblocked = () => {
            console.warn('Delete observations database blocked');
            resolve();
        };
    });
};
