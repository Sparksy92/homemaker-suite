import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    // Load initial state from localStorage if available
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('homemaker_user');
        return savedUser ? JSON.parse(savedUser) : {
            name: 'Guest Homemaker',
            email: 'guest@example.com',
            memberSince: new Date().getFullYear(),
            avatar: null // Could be a URL or predefined avatar ID
        };
    });

    const [favorites, setFavorites] = useState(() => {
        const savedFavorites = localStorage.getItem('homemaker_favorites');
        return savedFavorites ? JSON.parse(savedFavorites) : [];
    });

    const [readGuides, setReadGuides] = useState(() => {
        const savedRead = localStorage.getItem('homemaker_read_guides');
        return savedRead ? JSON.parse(savedRead) : [];
    });

    const [lastAccessedItem, setLastAccessedItem] = useState(() => {
        const savedLast = localStorage.getItem('homemaker_last_accessed');
        return savedLast ? JSON.parse(savedLast) : null;
    });

    const [settings, setSettings] = useState(() => {
        const savedSettings = localStorage.getItem('homemaker_settings');
        return savedSettings ? JSON.parse(savedSettings) : {
            notifications: true,
            darkMode: false,
            language: 'English (US)'
        };
    });

    const [sustainability, setSustainability] = useState(() => {
        const savedStats = localStorage.getItem('homemaker_sustainability');
        return savedStats ? JSON.parse(savedStats) : {
            water: { current: 15, goal: 100, unit: 'Gallons', consumptionPerDay: 2 },
            food: { current: 12, goal: 50, unit: 'Jars', consumptionPerDay: 0.25 },
            garden: { current: 65, goal: 100, unit: '%' },
            energy: { current: 80, goal: 100, unit: '%' }
        };
    });

    // Persist changes
    useEffect(() => {
        localStorage.setItem('homemaker_user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem('homemaker_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem('homemaker_read_guides', JSON.stringify(readGuides));
    }, [readGuides]);

    useEffect(() => {
        localStorage.setItem('homemaker_last_accessed', JSON.stringify(lastAccessedItem));
    }, [lastAccessedItem]);

    useEffect(() => {
        localStorage.setItem('homemaker_settings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('homemaker_sustainability', JSON.stringify(sustainability));
    }, [sustainability]);

    const updateProfile = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
    };

    const updateSustainability = (key, value) => {
        setSustainability(prev => ({
            ...prev,
            [key]: { ...prev[key], current: value }
        }));
    };

    const updateSustainabilityRate = (key, rate) => {
        setSustainability(prev => ({
            ...prev,
            [key]: { ...prev[key], consumptionPerDay: rate }
        }));
    };

    const getSurvivalDurations = () => {
        return {
            water: sustainability.water.consumptionPerDay > 0 ? (sustainability.water.current / sustainability.water.current) : 0, // Placeholder, will fix below
            food: sustainability.food.consumptionPerDay > 0 ? (sustainability.food.current / sustainability.food.consumptionPerDay) : 0
        };
    };

    // Fixed logic for durations
    const durations = {
        water: sustainability.water.consumptionPerDay > 0 ? Math.floor(sustainability.water.current / sustainability.water.consumptionPerDay) : Infinity,
        food: sustainability.food.consumptionPerDay > 0 ? Math.floor(sustainability.food.current / sustainability.food.consumptionPerDay) : Infinity
    };

    // Calculate Readiness Score (0-100)
    // Formula: (Current/Goal weighted parity)
    const calculateReadinessScore = () => {
        const waterScore = Math.min((sustainability.water.current / (sustainability.water.consumptionPerDay * 14)) * 100, 100); // 14 day target
        const foodScore = Math.min((sustainability.food.current / (sustainability.food.consumptionPerDay * 30)) * 100, 100); // 30 day target
        return Math.floor((waterScore + foodScore) / 2);
    };

    const recordAccess = (item) => {
        setLastAccessedItem({
            ...item,
            accessedAt: new Date().toISOString()
        });
    };

    const toggleFavorite = (item) => {
        setFavorites(prev => {
            const exists = prev.find(f => f.id === item.id);
            if (exists) {
                return prev.filter(f => f.id !== item.id);
            }
            return [...prev, { ...item, savedAt: new Date().toISOString() }];
        });
    };

    const isFavorite = (itemId) => {
        return favorites.some(f => f.id === itemId);
    };

    const markAsRead = (guideId) => {
        if (!readGuides.includes(guideId)) {
            setReadGuides(prev => [...prev, guideId]);
        }
    };

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const clearAppData = () => {
        localStorage.clear();
        window.location.reload();
    };

    const value = {
        user,
        favorites,
        readGuides,
        lastAccessedItem,
        settings,
        sustainability,
        durations,
        readinessScore: calculateReadinessScore(),
        updateProfile,
        updateSustainability,
        updateSustainabilityRate,
        recordAccess,
        toggleFavorite,
        isFavorite,
        markAsRead,
        updateSettings,
        clearAppData
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
