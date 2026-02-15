import React from 'react';
import { useUser } from '../context/UserContext';
import { User, Heart, Leaf, Book, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, favorites, readGuides, toggleFavorite, updateProfile, clearAppData } = useUser();

    const avatars = [
        { id: 'av1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
        { id: 'av2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Willow' },
        { id: 'av3', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=River' },
        { id: 'av4', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sage' },
    ];

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8">
            {/* Header Section */}
            <header className="flex flex-col items-center gap-4 py-8 relative">
                <div className="w-24 h-24 bg-sage-200 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden relative">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={48} className="text-sage-600" />
                    )}
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-serif font-bold text-sage-900">{user.name}</h1>
                    <p className="text-sage-500 text-sm">Member since {user.memberSince}</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    icon={<Heart className="text-terracotta-500" />}
                    label="Favorites"
                    value={favorites.length}
                />
                <StatCard
                    icon={<Book className="text-blue-500" />}
                    label="Read Guides"
                    value={readGuides.length}
                />
            </div>

            {/* Favorites Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold text-sage-800">My Favorites</h2>
                    <span className="text-xs font-bold bg-sage-100 text-sage-700 px-2 py-1 rounded-full">{favorites.length}</span>
                </div>

                {favorites.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-sage-200">
                        <Leaf className="mx-auto text-sage-200 mb-2" size={32} />
                        <p className="text-sage-500">No favorites yet.</p>
                        <p className="text-xs text-sage-400 mt-1">Explore recipes and guides to add some!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {favorites.map((fav) => (
                            <motion.div
                                key={fav.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-4 rounded-2xl shadow-sm border border-sand-100 flex justify-between items-center group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-sage-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                                <div className="pl-2">
                                    <h3 className="font-bold text-sage-900">{fav.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest bg-sand-100 text-sage-600 px-2 py-0.5 rounded-md">
                                            {fav.category}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleFavorite(fav)}
                                    className="p-3 text-terracotta-500 hover:bg-terracotta-50 rounded-full transition-colors shrink-0"
                                    title="Remove from favorites"
                                >
                                    <Heart size={20} fill="currentColor" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Avatar Selection */}
            <section className="bg-white p-6 rounded-3xl border border-sand-100 shadow-sm relative overflow-hidden">
                <h3 className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-4">Choose Your Avatar</h3>
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {avatars.map(av => (
                        <button
                            key={av.id}
                            onClick={() => updateProfile({ avatar: av.url })}
                            className={`w-16 h-16 rounded-full border-2 transition-all shrink-0 p-1 ${user.avatar === av.url ? 'border-terracotta-500 bg-terracotta-50' : 'border-transparent hover:border-sage-300'
                                }`}
                        >
                            <img src={av.url} alt="avatar" className="w-full h-full rounded-full bg-sage-100" />
                        </button>
                    ))}
                </div>
            </section>

            {/* Account Actions */}
            <section className="pt-4 border-t border-sand-200">
                <Link to="/settings" className="flex items-center gap-3 w-full p-4 hover:bg-white rounded-xl transition-colors text-charcoal-600">
                    <Settings icon size={20} />
                    <span>Account Settings</span>
                </Link>
                <button
                    onClick={() => {
                        if (window.confirm('For this demo, logging out will reset your session. Continue?')) {
                            clearAppData();
                        }
                    }}
                    className="flex items-center gap-3 w-full p-4 hover:bg-red-50 rounded-xl transition-colors text-red-600"
                >
                    <LogOut size={20} />
                    <span>Log Out</span>
                </button>
            </section>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-sand-100 flex flex-col items-center justify-center gap-1">
        <div className="mb-1">{icon}</div>
        <span className="text-2xl font-bold text-charcoal-800">{value}</span>
        <span className="text-xs text-sage-500 uppercase tracking-wilder">{label}</span>
    </div>
);

export default Profile;
