import React from 'react';
import { useUser } from '../context/UserContext';
import { User, Heart, Leaf, Book, Settings, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user, favorites, toggleFavorite } = useUser();

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
                    value={favorites.length * 3} // Placeholder logic
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
                                className="bg-white p-4 rounded-xl shadow-sm border border-sand-100 flex justify-between items-center"
                            >
                                <div>
                                    <h3 className="font-medium text-sage-900">{fav.title}</h3>
                                    <p className="text-xs text-sage-500 capitalize">{fav.category}</p>
                                </div>
                                <button
                                    onClick={() => toggleFavorite(fav)}
                                    className="p-2 text-terracotta-500 hover:bg-terracotta-50 rounded-full transition-colors"
                                >
                                    <Heart size={20} fill="currentColor" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Account Actions */}
            <section className="pt-4 border-t border-sand-200">
                <Link to="/settings" className="flex items-center gap-3 w-full p-4 hover:bg-white rounded-xl transition-colors text-charcoal-600">
                    <Settings size={20} />
                    <span>Account Settings</span>
                </Link>
                <button className="flex items-center gap-3 w-full p-4 hover:bg-red-50 rounded-xl transition-colors text-red-600">
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
