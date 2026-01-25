
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Music, HelpCircle, Database, Sun, Moon, Headphones, Menu, X, Info, Camera, Bot, User, LogOut, IdCard } from 'lucide-react';
import { VisitorCounter } from './VisitorCounter';
import { useAuth } from '../contexts/AuthContext';
import { LazyImage } from './LazyImage';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Initialize Theme
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isMobileMenuOpen]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const isActive = (path: string) => location.pathname === path;

    const scrollToSection = (sectionId: string) => {
        setIsMobileMenuOpen(false);
        if (location.pathname !== '/') {
            navigate({ pathname: '/', hash: `#${sectionId}` });
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const handleMobileNavClick = (path?: string) => {
        setIsMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <header className={`glass-nav ${isScrolled ? 'scrolled' : 'bg-background/50 border-transparent shadow-none'}`}>
                <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent transition-opacity duration-500 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}></div>

                <div className="container mx-auto">
                    <div className="flex items-center justify-between h-20 px-4 lg:px-6 relative z-50">
                        {/* Logo Section */}
                        <Link to="/" onClick={() => handleMobileNavClick()} className="flex items-center gap-3 group flex-shrink-0">
                            <div className="relative w-12 h-12 flex items-center justify-center rounded-xl shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                                <img
                                    src="/assets/SwazLogo.webp"
                                    alt="Swaz Solutions Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="block">
                                <h1 className="text-base sm:text-lg lg:text-xl font-black text-primary group-hover:text-accent transition-all duration-300">
                                    Swaz Solutions
                                </h1>
                                <p className="hidden lg:block text-xs text-muted font-medium">Data Recovery & AI Solutions</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        {user ? (
                            <nav className="hidden md:flex items-center gap-1 bg-surface/50 rounded-2xl px-2 py-2 border border-border shadow-sm backdrop-blur-md">
                                <button
                                    onClick={() => scrollToSection('data-recovery')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm text-accent bg-accent/10 border border-accent/30 hover:bg-accent hover:text-white hover:border-accent hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 group"
                                >
                                    <Database className="w-4 h-4 transition-colors group-hover:text-white" />
                                    <span>Data Recovery</span>
                                </button>

                                <Link
                                    to="/profile/dashboard"
                                    className={`group relative px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${isActive('/profile/dashboard') || isActive('/profile/edit') || isActive('/profile/analytics')
                                        ? 'bg-brand-gradient text-white shadow-lg shadow-accent/30'
                                        : 'text-secondary hover:text-primary hover:bg-surface hover:shadow-md'
                                        }`}
                                >
                                    <IdCard className="w-4 h-4" />
                                    <span>vCard</span>
                                </Link>

                                <Link
                                    to="/music"
                                    className={`group relative px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${isActive('/music')
                                        ? 'bg-brand-gradient text-white shadow-lg shadow-accent/30'
                                        : 'text-secondary hover:text-primary hover:bg-surface hover:shadow-md'
                                        }`}
                                >
                                    <Headphones className="w-4 h-4" />
                                    <span>Music</span>
                                </Link>

                                <Link
                                    to="/studio"
                                    className={`group relative px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${isActive('/studio')
                                        ? 'bg-brand-gradient text-white shadow-lg shadow-accent/30'
                                        : 'text-secondary hover:text-primary hover:bg-surface hover:shadow-md'
                                        }`}
                                >
                                    <Music className="w-4 h-4" />
                                    <span>Lyric Studio</span>
                                </Link>

                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm text-secondary hover:text-primary hover:bg-surface hover:shadow-md flex items-center gap-2 group"
                                >
                                    <Info className="w-4 h-4" />
                                    <span>Contact</span>
                                </button>
                            </nav>
                        ) : (
                            <nav className="hidden md:flex items-center gap-1 bg-surface/50 rounded-2xl px-2 py-2 border border-border shadow-sm backdrop-blur-md">
                                <button
                                    onClick={() => scrollToSection('data-recovery')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm text-accent bg-accent/10 border border-accent/30 hover:bg-accent hover:text-white hover:border-accent hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 group"
                                >
                                    <Database className="w-4 h-4 transition-colors group-hover:text-white" />
                                    <span>Data Recovery</span>
                                </button>

                                <button
                                    onClick={() => scrollToSection('vcard')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm text-secondary hover:text-primary hover:bg-surface hover:shadow-md flex items-center gap-2 group"
                                >
                                    <IdCard className="w-4 h-4" />
                                    <span>vCard</span>
                                </button>

                                <button
                                    onClick={() => scrollToSection('music')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm text-secondary hover:text-primary hover:bg-surface hover:shadow-md flex items-center gap-2 group"
                                >
                                    <Headphones className="w-4 h-4" />
                                    <span>Music Player</span>
                                </button>

                                <button
                                    onClick={() => scrollToSection('studio')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm text-secondary hover:text-primary hover:bg-surface hover:shadow-md flex items-center gap-2 group"
                                >
                                    <Music className="w-4 h-4" />
                                    <span>Lyric Studio</span>
                                </button>

                                <Link
                                    to="/news"
                                    className={`group relative px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${isActive('/news')
                                        ? 'bg-brand-gradient text-white shadow-lg shadow-accent/30'
                                        : 'text-secondary hover:text-primary hover:bg-surface hover:shadow-md'
                                        }`}
                                >
                                    <Camera className="w-4 h-4" />
                                    <span>News</span>
                                </Link>

                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm text-secondary hover:text-primary hover:bg-surface hover:shadow-md flex items-center gap-2 group"
                                >
                                    <Info className="w-4 h-4" />
                                    <span>Contact</span>
                                </button>
                            </nav>
                        )}

                        {/* CTA Button & Theme Toggle */}
                        <div className="flex items-center gap-3">
                            <div>
                                <VisitorCounter />
                            </div>
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl text-secondary hover:text-primary hover:bg-surface border border-transparent hover:border-border transition-all"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                            </button>

                            {user ? (
                                <div className="flex items-center gap-3 pl-3 border-l border-border">
                                    <div className="hidden md:flex flex-col items-end">
                                        <span className="text-sm font-bold text-foreground">{user.username}</span>
                                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                                    </div>
                                    {user.picture ? (
                                        <LazyImage src={user.picture} alt={user.username} className="w-9 h-9 rounded-full border border-border" priority />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                            <User className="w-5 h-5" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => logout()}
                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="hidden md:flex btn btn-primary text-sm"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Sign In</span>
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className="md:hidden p-2.5 text-secondary hover:text-primary hover:bg-surface rounded-xl transition-colors z-50"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle Menu"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-background/98 backdrop-blur-3xl z-40 md:hidden overflow-y-auto animate-fade-in flex flex-col pt-20">
                    <div className="flex-1 p-6 space-y-4">
                        {user ? (
                            <>
                                <button
                                    onClick={() => scrollToSection('data-recovery')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-accent bg-accent/10 border border-accent/20 text-left transition-all"
                                >
                                    <Database className="w-6 h-6" /> Data Recovery
                                </button>

                                <Link
                                    to="/profile/dashboard"
                                    onClick={() => handleMobileNavClick()}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${isActive('/profile/dashboard') || isActive('/profile/edit') || isActive('/profile/analytics') ? 'bg-accent/10 text-accent border border-accent/20' : 'text-secondary hover:bg-surface border border-transparent'}`}
                                >
                                    <IdCard className="w-6 h-6" /> vCard
                                </Link>

                                <Link
                                    to="/music"
                                    onClick={() => handleMobileNavClick()}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${isActive('/music') ? 'bg-accent/10 text-accent border border-accent/20' : 'text-secondary hover:bg-surface border border-transparent'}`}
                                >
                                    <Headphones className="w-6 h-6" /> Music
                                </Link>

                                <Link
                                    to="/studio"
                                    onClick={() => handleMobileNavClick()}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${isActive('/studio') ? 'bg-accent/10 text-accent border border-accent/20' : 'text-secondary hover:bg-surface border border-transparent'}`}
                                >
                                    <Music className="w-6 h-6" /> Lyric Studio
                                </Link>

                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                                >
                                    <Info className="w-6 h-6" /> Contact
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => scrollToSection('data-recovery')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-accent bg-accent/10 border border-accent/20 text-left transition-all"
                                >
                                    <Database className="w-6 h-6" /> Data Recovery
                                </button>

                                <button
                                    onClick={() => scrollToSection('vcard')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                                >
                                    <IdCard className="w-6 h-6" /> Digital vCard
                                </button>

                                <button
                                    onClick={() => scrollToSection('music')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                                >
                                    <Headphones className="w-6 h-6" /> Music Player
                                </button>

                                <button
                                    onClick={() => scrollToSection('studio')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                                >
                                    <Music className="w-6 h-6" /> Lyric Studio
                                </button>

                                <Link
                                    to="/news"
                                    onClick={() => handleMobileNavClick()}
                                    className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${isActive('/news') ? 'bg-accent/10 text-accent border border-accent/20' : 'text-secondary hover:bg-surface border border-transparent'}`}
                                >
                                    <Camera className="w-6 h-6" /> News
                                </Link>

                                <button
                                    onClick={() => scrollToSection('contact')}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                                >
                                    <Info className="w-6 h-6" /> Contact
                                </button>
                            </>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-2"></div>

                        {user ? (
                            <div className="p-4 bg-surface/50 rounded-2xl border border-border">
                                <div className="flex items-center gap-3 mb-4">
                                    {user.picture ? (
                                        <LazyImage src={user.picture} alt={user.username} className="w-10 h-10 rounded-full" priority />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-foreground">{user.username}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20 transition-colors font-medium"
                                >
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors font-bold text-lg"
                            >
                                <User className="w-6 h-6" /> Sign In
                            </Link>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6"></div>

                        <div className="mt-8 p-6 bg-surface/50 rounded-2xl border border-border text-center">
                            <p className="text-xs text-muted font-medium">
                                © 2025 Swaz Solutions
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
