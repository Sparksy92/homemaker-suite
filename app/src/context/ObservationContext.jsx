import React, { createContext, useContext, useState, useEffect } from 'react';

const ObservationContext = createContext();

export const useObservations = () => {
    const context = useContext(ObservationContext);
    if (!context) {
        throw new Error('useObservations must be used within an ObservationProvider');
    }
    return context;
};

const DB_NAME = 'homemaker_observations_db';
const STORE_NAME = 'observations';
const DB_VERSION = 1;

export const ObservationProvider = ({ children }) => {
    const [observations, setObservations] = useState([]);
    const [db, setDb] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize IndexedDB
    useEffect(() => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            const database = event.target.result;
            setDb(database);
            loadObservations(database);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            setIsLoading(false);
        };
    }, []);

    const loadObservations = (database) => {
        const transaction = database.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            setObservations(request.result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            setIsLoading(false);
        };
    };

    const addObservation = (observation) => {
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not initialized');

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const newEntry = {
                ...observation,
                timestamp: new Date().toISOString()
            };

            const request = store.add(newEntry);

            request.onsuccess = () => {
                loadObservations(db);
                resolve(request.result);
            };

            request.onerror = () => reject(request.error);
        });
    };

    const deleteObservation = (id) => {
        return new Promise((resolve, reject) => {
            if (!db) return reject('Database not initialized');

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                loadObservations(db);
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    };

    const getObservationsBySpecies = (speciesId) => {
        return observations.filter(obs => obs.speciesId === speciesId);
    };

    const value = {
        observations,
        addObservation,
        deleteObservation,
        getObservationsBySpecies,
        isLoading
    };

    return (
        <ObservationContext.Provider value={value}>
            {children}
        </ObservationContext.Provider>
    );
};
