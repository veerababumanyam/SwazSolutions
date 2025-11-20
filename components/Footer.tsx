
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
    return (
        <footer className="py-12 border-t border-border bg-surface transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Brand Section */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg text-white font-black text-xl">
                                    S
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-primary">SWAZ</h3>
                                    <p className="text-xs text-secondary">Data Recovery & AI Lyrics</p>
                                </div>
                            </div>
                            <p className="text-sm text-secondary leading-relaxed">
                                Professional data recovery services and AI-powered lyric creation for creators worldwide.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide">Quick Links</h4>
                            <nav aria-label="Footer navigation">
                                <ul className="space-y-2 list-none">
                                    <li>
                                        <a href="/#services" className="text-sm text-secondary hover:text-accent transition-colors duration-200 hover:translate-x-1 inline-block">
                                            Services
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/#process" className="text-sm text-secondary hover:text-accent transition-colors duration-200 hover:translate-x-1 inline-block">
                                            How It Works
                                        </a>
                                    </li>
                                    <li>
                                        <Link to="/about" className="text-sm text-secondary hover:text-accent transition-colors duration-200 hover:translate-x-1 inline-block">
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/studio" className="text-sm text-secondary hover:text-accent transition-colors duration-200 hover:translate-x-1 inline-block">
                                            Lyric Studio
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        {/* Contact & Accessibility */}
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide">Support</h4>
                            <ul className="space-y-2 list-none">
                                <li>
                                    <a 
                                        href="mailto:support@swaz.com" 
                                        className="text-sm text-secondary hover:text-accent transition-colors duration-200"
                                    >
                                        support@swaz.com
                                    </a>
                                </li>
                                <li>
                                    <span className="text-sm text-secondary">
                                        24/7 Emergency Line
                                    </span>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => alert('Accessibility features active. This site is WCAG 2.1 AA Compliant.')}
                                        className="text-sm text-secondary hover:text-accent transition-colors duration-200 text-left"
                                    >
                                        Accessibility Statement
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-border/50 text-center">
                        <p className="text-sm text-secondary">
                            © 2025 SWAZ Solutions. All rights reserved.
                        </p>
                        <p className="text-xs mt-2 text-muted">
                            WCAG 2.1 AA Compliant • Professional Data Recovery & AI-Powered Lyric Creation
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
