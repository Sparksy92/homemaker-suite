import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Wrench, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col max-w-md mx-auto bg-sand-50 shadow-2xl overflow-hidden relative border-x border-sand-300">

            {/* Header */}
            <header className="px-6 py-4 bg-sage-700 text-white flex justify-between items-center z-10 sticky top-0 shadow-md">
                <div className="flex items-center gap-2">
                    {/* Simple Logo Placeholder */}
                    <div className="w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center font-serif font-bold text-white border-2 border-sand-200">
                        H
                    </div>
                    <h1 className="text-xl tracking-wide text-sand-100">Homemaker</h1>
                </div>
                <button className="p-2 hover:bg-sage-600 rounded-full transition-colors">
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
                    <NavItem to="/" icon={<Home size={24} />} label="Home" />
                    <NavItem to="/library" icon={<BookOpen size={24} />} label="Library" />
                    <NavItem to="/tools" icon={<Wrench size={24} />} label="Tools" />
                </ul>
            </nav>
        </div>
    );
};

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
