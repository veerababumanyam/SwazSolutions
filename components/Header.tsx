
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Music, HelpCircle, Database, Sun, Moon, Headphones, Menu, X, Info, Camera, Bot } from 'lucide-react';
import { VisitorCounter } from './VisitorCounter';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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
                        <nav className="hidden md:flex items-center gap-1 bg-surface/50 rounded-2xl px-2 py-2 border border-border shadow-sm backdrop-blur-md">
                            <button
                                onClick={() => scrollToSection('services')}
                                className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm text-accent bg-accent/10 border border-accent/30 hover:bg-accent hover:text-white hover:border-accent hover:shadow-lg hover:shadow-accent/20 flex items-center gap-2 group"
                            >
                                <Database className="w-4 h-4 transition-colors group-hover:text-white" />
                                <span>Data Recovery Services</span>
                            </button>

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

                            <Link
                                to="/camera-updates"
                                className={`group relative px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${isActive('/camera-updates')
                                    ? 'bg-brand-gradient text-white shadow-lg shadow-accent/30'
                                    : 'text-secondary hover:text-primary hover:bg-surface hover:shadow-md'
                                    }`}
                            >
                                <Camera className="w-4 h-4" />
                                <span>Camera updates</span>
                            </Link>

                            <Link
                                to="/help"
                                className={`group relative px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm flex items-center gap-2 ${isActive('/help')
                                    ? 'bg-brand-gradient text-white shadow-lg shadow-accent/30'
                                    : 'text-secondary hover:text-primary hover:bg-surface hover:shadow-md'
                                    }`}
                            >
                                <HelpCircle className="w-4 h-4" />
                                <span>Help</span>
                            </Link>

                            <button
                                onClick={() => scrollToSection('contact')}
                                className="px-3 md:px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-sm text-secondary hover:text-primary hover:bg-surface hover:shadow-md flex items-center gap-2 group"
                            >
                                <Info className="w-4 h-4" />
                                <span>Contact Us</span>
                            </button>
                        </nav>

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

                            <Link
                                to="/studio"
                                className="btn btn-primary px-5 md:px-6 py-2.5 rounded-xl text-sm hover-lift hidden sm:flex"
                            >
                                <Sparkles className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">Lyric Studio</span>
                            </Link>

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
                        <button
                            onClick={() => scrollToSection('services')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                        >
                            <Database className="w-6 h-6" /> Data Recovery Services
                        </button>

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

                        <Link
                            to="/camera-updates"
                            onClick={() => handleMobileNavClick()}
                            className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${isActive('/camera-updates') ? 'bg-accent/10 text-accent border border-accent/20' : 'text-secondary hover:bg-surface border border-transparent'}`}
                        >
                            <Camera className="w-6 h-6" /> Camera Updates
                        </Link>

                        <Link
                            to="/help"
                            onClick={() => handleMobileNavClick()}
                            className={`flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${isActive('/help') ? 'bg-accent/10 text-accent border border-accent/20' : 'text-secondary hover:bg-surface border border-transparent'}`}
                        >
                            <HelpCircle className="w-6 h-6" /> Help
                        </Link>

                        <button
                            onClick={() => scrollToSection('contact')}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-secondary hover:bg-surface hover:text-primary text-left transition-all border border-transparent"
                        >
                            <Info className="w-6 h-6" /> Contact Us
                        </button>

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6"></div>

                        <Link
                            to="/studio"
                            onClick={() => handleMobileNavClick()}
                            className="btn btn-primary w-full justify-center py-4 text-lg rounded-2xl shadow-xl shadow-accent/20"
                        >
                            <Sparkles className="w-5 h-5" /> Lyric Studio
                        </Link>

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
