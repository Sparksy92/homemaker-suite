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

    // Persist changes
    useEffect(() => {
        localStorage.setItem('homemaker_user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem('homemaker_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const updateProfile = (newData) => {
        setUser(prev => ({ ...prev, ...newData }));
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

    const value = {
        user,
        favorites,
        updateProfile,
        toggleFavorite,
        isFavorite
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
