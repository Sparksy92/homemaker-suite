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
            peopleCount: 4,
            water: { current: 15, goal: 100, unit: 'Gallons', consumptionPerDay: 2 },
            food: { current: 12, goal: 200, unit: 'lbs', consumptionPerDay: 0.25 },
            garden: { current: 65, goal: 100, unit: '%' },
            energy: { current: 80, goal: 100, unit: '%' },
            pantry: {
                grains_starch: 0,
                proteins_legumes: 0,
                dairy: 0,
                fats_oils: 0,
                sugars_fruits: 0,
                fuel_cooking: 0,
                hygiene_sanitation: 0,
                water_filtration: 0
            },
            tasks: [
                { id: 1, title: 'Winter Fuel Check', desc: 'Audit remaining wood and propane stocks.', time: '20 mins', completed: false, type: 'manual' },
                { id: 2, title: 'Greenhouse Ventilation', desc: 'Ensure morning temps are stable.', time: '10 mins', completed: false, type: 'manual' }
            ]
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

    const updatePantryItem = (category, amount) => {
        setSustainability(prev => {
            const newPantry = { ...prev.pantry, [category]: amount };
            const foodTotal = (newPantry.grains_starch || 0) + (newPantry.proteins_legumes || 0) + (newPantry.sugars_fruits || 0);

            let updatedTasks = [...prev.tasks];

            // Smart Task Integration: Auto-add tasks if critical
            if (foodTotal < 20 && !updatedTasks.some(t => t.id === 'auto-food')) {
                updatedTasks.push({ id: 'auto-food', title: 'Emergency Food Audit', desc: 'Pantry levels are critical. Map out rationing.', time: '15 mins', completed: false, type: 'auto' });
            }

            return {
                ...prev,
                pantry: newPantry,
                food: { ...prev.food, current: foodTotal },
                tasks: updatedTasks
            };
        });
    };

    const toggleTask = (taskId) => {
        setSustainability(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        }));
    };

    const addCustomTask = (task) => {
        setSustainability(prev => ({
            ...prev,
            tasks: [...prev.tasks, { ...task, id: Date.now(), completed: false, type: 'manual' }]
        }));
    };

    const removeTask = (taskId) => {
        setSustainability(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== taskId)
        }));
    };

    const updateSustainabilityRate = (key, rate) => {
        setSustainability(prev => ({
            ...prev,
            [key]: { ...prev[key], consumptionPerDay: rate }
        }));
    };

    const updatePeopleCount = (count) => {
        setSustainability(prev => ({
            ...prev,
            peopleCount: Math.max(1, count)
        }));
    };

    const getSurvivalDurations = () => {
        return {
            water: sustainability.water.consumptionPerDay > 0 ? (sustainability.water.current / sustainability.water.current) : 0, // Placeholder, will fix below
            food: sustainability.food.consumptionPerDay > 0 ? (sustainability.food.current / sustainability.food.consumptionPerDay) : 0
        };
    };

    // Fixed logic for durations (People-aware)
    const durations = {
        water: (sustainability.peopleCount || 1) > 0 ? Math.floor(sustainability.water.current / (sustainability.peopleCount * 1)) : Infinity,
        food: (sustainability.peopleCount || 1) > 0 ? Math.floor(sustainability.food.current / (sustainability.peopleCount * 0.7)) : Infinity // Approx 0.7lbs per person per day for survival
    };

    // Calculate Readiness Score (0-100)
    const calculateReadinessScore = () => {
        const people = sustainability.peopleCount || 4;
        const waterScore = Math.min((sustainability.water.current / (people * 14)) * 100, 100); // 14 day target
        const foodScore = Math.min((sustainability.food.current / (people * 0.7 * 14)) * 100, 100); // 14 day target
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
        updatePantryItem,
        updatePeopleCount,
        toggleTask,
        addCustomTask,
        removeTask,
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
