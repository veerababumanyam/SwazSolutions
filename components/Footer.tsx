
import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Mic2, Camera, HelpCircle, Info, Home, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 border-t border-border bg-surface transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg overflow-hidden">
                                    <img
                                        src="/assets/SwazLogo.webp"
                                        alt="Swaz Solutions Logo"
                                        className="w-full h-full object-contain p-1"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-primary">SWAZ Solutions</h3>
                                    <p className="text-xs text-muted">Innovation in Data & AI</p>
                                </div>
                            </div>
                            <p className="text-sm text-secondary leading-relaxed mb-4">
                                Professional data recovery services and cutting-edge AI-powered tools for music creators worldwide.
                            </p>
                            <p className="text-xs text-muted italic">
                                Empowering creativity through technology since 2025
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                Navigate
                            </h4>
                            <nav aria-label="Footer primary navigation">
                                <ul className="space-y-2.5 list-none">
                                    <li>
                                        <Link to="/" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/about" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <Info className="w-3 h-3" />
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/agentic-ai" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Agentic AI
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/studio" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <Mic2 className="w-3 h-3" />
                                            Lyric Studio
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/music" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <Music className="w-3 h-3" />
                                            Music Player
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/news" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <Camera className="w-3 h-3" />
                                            News
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/help" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <HelpCircle className="w-3 h-3" />
                                            Help & Support
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide">Our Services</h4>
                            <nav aria-label="Footer services navigation">
                                <ul className="space-y-2.5 list-none">
                                    <li>
                                        <a href="/#services" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Data Recovery
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/#services" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Hard Drive Recovery
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/#services" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            SSD Recovery
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/#services" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            RAID Recovery
                                        </a>
                                    </li>
                                    <li>
                                        <Link to="/agentic-ai" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Agentic AI Solutions
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/studio" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            AI Lyric Generation
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/music" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Music Streaming
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/news" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            Camera News & Updates
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="/#process" className="text-sm text-secondary hover:text-accent transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-accent/50 group-hover:bg-accent transition-colors"></span>
                                            How It Works
                                        </a>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h4 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contact Us
                            </h4>
                            <ul className="space-y-3 list-none">
                                <li>
                                    <h5 className="text-xs font-semibold text-primary mb-1">General Inquiries</h5>
                                    <a
                                        href="mailto:contactus@swazdatarecovery.com"
                                        className="text-sm text-secondary hover:text-accent transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <Mail className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                        contactus@swazdatarecovery.com
                                    </a>
                                </li>
                                <li>
                                    <h5 className="text-xs font-semibold text-primary mb-1">Technical Support</h5>
                                    <a
                                        href="mailto:support@swazdatarecovery.com"
                                        className="text-sm text-secondary hover:text-accent transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <Mail className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                        support@swazdatarecovery.com
                                    </a>
                                </li>
                                <li>
                                    <h5 className="text-xs font-semibold text-primary mb-1">Information</h5>
                                    <a
                                        href="mailto:info@swazdatarecovery.com"
                                        className="text-sm text-secondary hover:text-accent transition-colors duration-200 flex items-center gap-2 group"
                                    >
                                        <Mail className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                        info@swazdatarecovery.com
                                    </a>
                                </li>
                                <li className="pt-2 border-t border-border/30">
                                    <a
                                        href="tel:+919701087446"
                                        className="text-sm text-secondary hover:text-accent transition-colors duration-200 flex items-center gap-2 group font-semibold"
                                    >
                                        <Phone className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                        +91-9701087446
                                    </a>
                                </li>
                                <li className="pt-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3 h-3 mt-1 text-accent flex-shrink-0" />
                                        <address className="text-xs text-secondary not-italic leading-relaxed">
                                            <strong className="text-primary">Swaz Data Recovery Lab</strong><br />
                                            Ajay Vihar Apartment<br />
                                            Sheela Nagar, Adapalli Colony<br />
                                            Rajamahendravaram<br />
                                            Andhra Pradesh 533103, India
                                        </address>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 mt-8 border-t border-border/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-center md:text-left">
                                <p className="text-sm text-secondary">
                                    © {currentYear} SWAZ Solutions. All rights reserved.
                                </p>
                                <p className="text-xs mt-1 text-muted">
                                    Professional Data Recovery • AI-Powered Music Tools • WCAG 2.1 AA Compliant
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted">
                                <a 
                                    href="https://github.com/veerababumanyam/SwazSolutions" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-accent transition-colors duration-200 flex items-center gap-1 group"
                                >
                                    <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                                    GitHub
                                </a>
                                <span className="text-border">•</span>
                                <span>v2.0 Production</span>
                                <span className="text-border">•</span>
                                <span className="flex items-center gap-1">
                                    Made with <span className="text-red-500 animate-pulse">❤️</span> in India
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
