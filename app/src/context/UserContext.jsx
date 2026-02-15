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

    const updateProfile = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
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
        updateProfile,
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
