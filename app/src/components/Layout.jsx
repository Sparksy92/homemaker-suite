import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Wrench, Menu, User, Settings, LogOut, Leaf, Archive, Utensils } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen flex flex-col max-w-md mx-auto bg-sand-50 shadow-2xl overflow-hidden relative border-x border-sand-300">

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-50 p-6 flex flex-col gap-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-serif text-sage-800 font-bold">Menu</h2>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 hover:bg-sand-100 rounded-full text-sage-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <hr className="border-sand-200" />

                            <ul className="flex flex-col gap-4">
                                <MenuLink to="/profile" label="Profile" onClick={() => setIsMenuOpen(false)} icon={<User size={20} />} />
                                <MenuLink to="/settings" label="Settings" onClick={() => setIsMenuOpen(false)} icon={<Settings size={20} />} />
                                <hr className="border-sand-200 my-2" />
                                <button
                                    onClick={() => {
                                        console.log("Logout clicked");
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium w-full text-left"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </button>
                            </ul>

                            <div className="mt-auto">
                                <p className="text-xs text-center text-sage-400">Homemaker Suite v0.1.0</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="px-6 py-4 bg-sage-700 text-white flex justify-between items-center z-10 sticky top-0 shadow-md">
                <div className="flex items-center gap-2">
                    {/* Simple Logo Placeholder */}
                    <div className="w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center font-serif font-bold text-white border-2 border-sand-200">
                        H
                    </div>
                    <h1 className="text-xl tracking-wide text-sand-100">Homemaker</h1>
                </div>
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 hover:bg-sage-600 rounded-full transition-colors"
                >
                    <Menu size={20} className="text-sand-100" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
                <AnimatePresence mode="wait">
                    <Outlet />
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-sage-200 pb-safe pt-2 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <ul className="flex justify-around items-center">
                    <NavItem to="/" icon={<Home size={22} />} label="Home" />
                    <NavItem to="/cookbook" icon={<Utensils size={22} />} label="Recipes" />
                    <NavItem to="/library" icon={<BookOpen size={22} />} label="Guides" />
                    <NavItem to="/wildlife" icon={<Leaf size={22} />} label="Nature" />
                    <NavItem to="/tools" icon={<Wrench size={22} />} label="Tools" />
                    <NavItem to="/reference" icon={<Archive size={22} />} label="Ref" />
                </ul>
            </nav>
        </div>
    );
};

const MenuLink = ({ to, label, onClick, icon }) => (
    <li>
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
                isActive ? "bg-sage-50 text-sage-700" : "text-charcoal-600 hover:bg-sand-50"
            )}
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    </li>
);

const NavItem = ({ to, icon, label }) => {
    return (
        <li>
            <NavLink
                to={to}
                className={({ isActive }) => cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 w-20",
                    isActive
                        ? "text-sage-700 bg-sage-50 translate-y-[-4px]"
                        : "text-charcoal-light hover:text-sage-600 hover:bg-sand-50"
                )}
            >
                {icon}
                <span className="text-[10px] font-medium tracking-wider uppercase">{label}</span>
            </NavLink>
        </li>
    );
};

export default Layout;
