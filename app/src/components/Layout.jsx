import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Wrench, Menu, User, Settings, LogOut, Leaf, Archive, Utensils, MessageSquare, X, Hammer, Compass, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import OfflineIndicator from './OfflineIndicator';
import PwaUpdatePrompt from './PwaUpdatePrompt';
import PageErrorBoundary from './PageErrorBoundary';

const Layout = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const location = useLocation();

    const closeMenu = React.useCallback(() => {
        setIsMenuOpen(false);
        setIsTransitioning(true);
        setTimeout(() => {
            setIsTransitioning(false);
        }, 350);
    }, []);

    const toggleMenu = React.useCallback(() => {
        if (isTransitioning) return;
        setIsMenuOpen(prev => {
            const next = !prev;
            if (!next) {
                setTimeout(() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setIsTransitioning(false);
                    }, 350);
                }, 0);
            }
            return next;
        });
    }, [isTransitioning]);

    const prevPathRef = React.useRef(location.pathname + location.search + location.hash);

    React.useEffect(() => {
        const currentPath = location.pathname + location.search + location.hash;
        if (prevPathRef.current !== currentPath) {
            prevPathRef.current = currentPath;
            closeMenu();
        }
    }, [location.pathname, location.search, location.hash, closeMenu]);

    React.useEffect(() => {
        if (typeof document === 'undefined') return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = isMenuOpen ? 'hidden' : previousOverflow;

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMenuOpen]);

    React.useEffect(() => {
        if (!isMenuOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMenuOpen, closeMenu]);

    return (
        <div className="min-h-[100dvh] flex flex-col max-w-2xl mx-auto bg-sand-50 shadow-2xl overflow-hidden relative border-x border-sand-300 transform translate-x-0">

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        key="menu-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMenu}
                        className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md"
                    />
                )}
                {isMenuOpen && (
                    <motion.div
                        id="mobile-navigation-menu"
                        key="menu-sidebar"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[min(20rem,88vw)] bg-white/95 backdrop-blur-md shadow-2xl z-[110] p-6 flex flex-col gap-4 border-l border-sand-200"
                        style={{
                            paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
                            paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
                            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))'
                        }}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-serif text-sage-800 font-bold">Menu</h2>
                            <button
                                onClick={closeMenu}
                                className="p-3 hover:bg-sand-100 rounded-full text-sage-600 flex items-center justify-center min-w-[44px] min-h-[44px]"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <hr className="border-sand-200" />

                        {/* Navigation Links Grouped */}
                        <div onClick={closeMenu} className="flex-1 overflow-y-auto no-scrollbar py-2 -mx-2 px-2 space-y-6">
                            {/* Section 1: Dashboard */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-sand-400 uppercase tracking-widest block px-3">Dashboard</span>
                                <ul className="space-y-1">
                                    <MenuLink to="/" label="Home" onClick={closeMenu} icon={<Home size={18} />} />
                                    <MenuLink to="/field-binder" label="Field Binder" onClick={closeMenu} icon={<Archive size={18} />} />
                                </ul>
                            </div>

                            {/* Section 2: Planners */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-sand-400 uppercase tracking-widest block px-3">Command & Build</span>
                                <ul className="space-y-1">
                                    <MenuLink to="/homestead" label="Command Center" onClick={closeMenu} icon={<Compass size={18} />} />
                                    <MenuLink to="/homestead/missions" label="Missions" onClick={closeMenu} icon={<ShieldAlert size={18} />} />
                                    <MenuLink to="/homestead/build-projects" label="Build Projects" onClick={closeMenu} icon={<Hammer size={18} />} />
                                </ul>
                            </div>

                            {/* Section 3: Reference */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-sand-400 uppercase tracking-widest block px-3">Reference Library</span>
                                <ul className="space-y-1">
                                    <MenuLink to="/cookbook" label="Recipes" onClick={closeMenu} icon={<Utensils size={18} />} />
                                    <MenuLink to="/library" label="Guides" onClick={closeMenu} icon={<BookOpen size={18} />} />
                                    <MenuLink to="/wildlife" label="Nature" onClick={closeMenu} icon={<Leaf size={18} />} />
                                    <MenuLink to="/tools" label="Toolkit" onClick={closeMenu} icon={<Wrench size={18} />} />
                                </ul>
                            </div>

                            {/* Section 4: System */}
                            <div className="space-y-2">
                                <span className="text-[9px] font-black text-sand-400 uppercase tracking-widest block px-3">System</span>
                                <ul className="space-y-1">
                                    <MenuLink to="/profile" label="Profile" onClick={closeMenu} icon={<User size={18} />} />
                                    <MenuLink to="/settings" label="Settings" onClick={closeMenu} icon={<Settings size={18} />} />
                                    <MenuLink to="/feedback" label="Suggestion Box" onClick={closeMenu} icon={<MessageSquare size={18} />} />
                                </ul>
                            </div>
                        </div>

                        <hr className="border-sand-200" />
                        
                        <ul className="space-y-1">
                            <button
                                onClick={() => {
                                    console.log("Logout clicked");
                                    closeMenu();
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium w-full text-left font-sans text-sm"
                            >
                                <LogOut size={18} />
                                <span className="font-semibold tracking-tight">Logout</span>
                            </button>
                        </ul>

                        <div className="pt-2">
                            <p className="text-[10px] text-center text-sage-400 font-sans tracking-wide">Homemaker Suite v0.1.0</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header
                className="py-2 bg-sage-700 text-white flex justify-between items-center z-10 sticky top-0 shadow-md"
                style={{
                    paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                    paddingRight: 'max(1rem, env(safe-area-inset-right))'
                }}
            >
                <div className="flex items-center gap-2">
                    {/* Simple Logo Placeholder */}
                    <div className="w-8 h-8 bg-terracotta-500 rounded-full flex items-center justify-center font-serif font-bold text-white border-2 border-sand-200">
                        H
                    </div>
                    <h1 className="text-xl tracking-wide text-sand-100 font-serif">Homemaker</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <OfflineIndicator />
                    <button
                        type="button"
                        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-navigation-menu"
                        onClick={toggleMenu}
                        className={cn(
                            "mr-1 min-w-[48px] min-h-[48px] p-3 hover:bg-sage-600 rounded-full transition-colors flex items-center justify-center touch-manipulation",
                            isTransitioning && "pointer-events-none"
                        )}
                    >
                        {isMenuOpen ? (
                            <X size={26} className="text-sand-100" />
                        ) : (
                            <Menu size={26} className="text-sand-100" />
                        )}
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-8 scroll-smooth w-full">
                <AnimatePresence mode="wait">
                    <PageErrorBoundary>
                        <Outlet />
                    </PageErrorBoundary>
                </AnimatePresence>
            </main>
            <PwaUpdatePrompt />
        </div>
    );
};

const MenuLink = ({ to, label, onClick, icon }) => (
    <li>
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-sans text-sm",
                isActive 
                    ? "bg-sage-100/75 text-sage-800 font-bold border-l-4 border-terracotta-500 pl-2 shadow-sm" 
                    : "text-charcoal-light hover:bg-sand-100/50 hover:text-sage-700"
            )}
        >
            {icon}
            <span className="font-semibold tracking-tight">{label}</span>
        </NavLink>
    </li>
);

export default Layout;
