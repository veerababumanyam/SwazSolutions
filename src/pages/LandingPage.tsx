import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Shield, Clock, HardDrive, Cpu, Zap, Database, Sparkles, Globe, Music, Heart, Wand2, CheckCircle, Activity, Lock, Phone, Server, FileWarning, FileCheck, Feather, Layers, FileCode, Play, Search, Palette, Mic2, Bot, Network, Brain, Radio, Camera, IdCard, QrCode, Users, Share2, Download, Eye, BarChart3, Smartphone, Link2, Mail, UserCheck, Settings } from 'lucide-react';
import { Schema, localBusinessSchema, dataRecoveryFAQSchema } from '../components/Schema';
import { UnifiedContactForm } from '../components/UnifiedContactForm';

export const LandingPage: React.FC = () => {
    const [activeHero, setActiveHero] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const durations = [5000, 5000, 5000, 5000, 5000]; // Durations for each hero card (5 cards) - 5s each
        const timeout = setTimeout(() => {
            setActiveHero((prev) => (prev + 1) % 5);
        }, durations[activeHero]);
        return () => clearTimeout(timeout);
    }, [activeHero]);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <>
            {/* Schema Markup for SEO */}
            <Schema type="LocalBusiness" data={localBusinessSchema} />
            <Schema type="FAQPage" data={dataRecoveryFAQSchema} />

            <main className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500">
                {/* Background Gradient Mesh */}
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/5 via-background to-background"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent-orange/5 via-transparent to-transparent"></div>
                    <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse"></div>
                </div>

                {/* Hero Section */}
                <section className="relative pt-12 pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="text-center mb-12 max-w-6xl mx-auto animate-fade-in">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary mb-6 tracking-tight leading-none">
                                <span className="bg-brand-gradient bg-clip-text text-transparent">
                                    Swaz Solutions
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-secondary max-w-4xl mx-auto leading-relaxed mb-8 font-medium">
                                Professional Data Recovery, Intelligent AI Solutions & Copyright-Free Music.
                            </p>

                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card shadow-lg shadow-accent/10 mb-6 border-accent/20">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-sm font-bold text-primary">24/7 Emergency Lab Operations: <span className="text-emerald-600 font-extrabold">ONLINE</span></span>
                            </div>
                        </div>

                        {/* Rotating Hero Cards - STANDARDIZED */}
                        <div className="max-w-7xl mx-auto relative min-h-[680px]">
                            {/* Card 1: Data Recovery - Industry Leader */}
                            <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 0 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-10 z-0 pointer-events-none'}`}>
                                <div className="group relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden min-h-[680px]">
                                    {/* Top-Right Badge - STANDARDIZED */}
                                    <div className="absolute top-0 right-0 p-0 md:p-8">
                                        <div className="bg-accent text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg uppercase tracking-wide flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Industry Leader
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-12 items-center mt-8 md:mt-0">
                                        <div>
                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight mt-8 md:mt-0">
                                                Critical Data Loss?<br />
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary text-3xl md:text-4xl block mt-2 font-bold">We Recover What Others Can't.</span>
                                            </h2>
                                            <p className="text-lg text-secondary mb-8 leading-relaxed border-l-4 border-accent pl-4">
                                                Business or Personal—your data is retrievable. Our elite engineers specialize in recovering data from crashed servers, damaged drives, and ransomware attacks.
                                            </p>
                                            <div className="flex flex-wrap gap-3 mb-10">
                                                {[{ icon: HardDrive, label: 'Mechanical' }, { icon: Zap, label: 'Logical' }, { icon: Server, label: 'Enterprise RAID' }].map((f, i) => (
                                                    <div key={i} className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm hover:border-accent transition-colors cursor-default">
                                                        <f.icon className="w-4 h-4 text-accent" /> {f.label}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <button
                                                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                                    className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift justify-center"
                                                >
                                                    <Activity className="w-5 h-5" /> Start Free Evaluation
                                                </button>
                                                <a href="tel:+919701087446" className="btn btn-ghost px-8 py-4 rounded-xl text-lg hover-lift border-2 justify-center">
                                                    <Phone className="w-5 h-5" /> +91-9701087446
                                                </a>
                                            </div>
                                            <p className="mt-6 text-xs text-muted font-medium flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-emerald-500" /> 100% Confidential • HIPAA & GDPR Compliant
                                            </p>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="glass-card p-6 rounded-2xl text-center border-accent/10 bg-surface/50 hover:border-accent/30">
                                                    <div className="text-5xl font-black text-primary mb-2 tracking-tighter">98%</div>
                                                    <div className="text-xs font-bold text-secondary uppercase tracking-wide">Success Rate</div>
                                                </div>
                                                <div className="glass-card p-6 rounded-2xl text-center border-accent/10 bg-surface/50 hover:border-accent/30">
                                                    <div className="text-5xl font-black text-primary mb-2 tracking-tighter">0%</div>
                                                    <div className="text-xs font-bold text-secondary uppercase tracking-wide">Financial Risk</div>
                                                </div>
                                            </div>
                                            <div className="bg-surface/60 backdrop-blur-sm p-8 rounded-2xl border border-border shadow-lg">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                        <Shield className="w-7 h-7 text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-primary">Secure Chain of Custody</div>
                                                        <div className="text-sm text-secondary">Your data never leaves our secure biometric lab.</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-xs font-bold uppercase text-secondary">
                                                        <span>Evaluation Speed</span>
                                                        <span className="text-accent animate-pulse">Priority: Immediate</span>
                                                    </div>
                                                    <div className="w-full bg-border/50 h-2 rounded-full overflow-hidden">
                                                        <div className="bg-brand-gradient h-full w-[95%] animate-pulse"></div>
                                                    </div>
                                                    <p className="text-xs text-muted pt-2 text-center">
                                                        Standard evaluations completed within 4-6 hours.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 5: Agentic AI Solutions - INTEGRATED FROM SEPARATE PAGE */}
                            <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 4 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0 pointer-events-none'}`}>
                                <div className="group relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden min-h-[680px]">
                                    {/* Top-Right Badge - STANDARDIZED */}
                                    <div className="absolute top-0 right-0 p-0 md:p-8">
                                        <div className="bg-accent text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg uppercase tracking-wide flex items-center gap-2">
                                            <Bot className="w-4 h-4" /> AI INNOVATION
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-12 items-center mt-8 md:mt-0">
                                        <div>
                                            {/* Top Badge */}
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/30 mb-6">
                                                <Brain className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-bold text-accent uppercase tracking-wider">Enterprise Autonomous Agents</span>
                                            </div>

                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight">
                                                AI That Thinks,<br />
                                                Decides & Acts
                                                <span className="text-transparent bg-clip-text bg-brand-gradient text-3xl md:text-4xl block mt-2 font-bold">Autonomous Intelligence for Business</span>
                                            </h2>

                                            <p className="text-lg text-secondary mb-8 leading-relaxed border-l-4 border-accent pl-4">
                                                Build intelligent systems that automate complex workflows, make decisions, and orchestrate multi-step tasks—all with minimal human intervention.
                                            </p>

                                            <div className="flex flex-wrap gap-3 mb-10">
                                                {[{ icon: Bot, label: 'Autonomous Agents' }, { icon: Network, label: 'Multi-Agent Teams' }, { icon: Shield, label: 'Enterprise Security' }].map((f, i) => (
                                                    <div key={i} className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm hover:border-accent transition-colors cursor-default">
                                                        <f.icon className="w-4 h-4 text-accent" /> {f.label}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <button
                                                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                                    className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift justify-center"
                                                >
                                                    <Bot className="w-5 h-5" /> Explore Agentic AI
                                                </button>
                                                <a href="tel:+919701087446" className="btn btn-ghost px-8 py-4 rounded-xl text-lg hover-lift border-2 justify-center">
                                                    <Phone className="w-5 h-5" /> Schedule Call
                                                </a>
                                            </div>
                                        </div>

                                        <div className="space-y-6 relative">
                                            {/* Code Block Demo */}
                                            <div className="bg-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-accent/20 relative shadow-2xl">
                                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                                                        <div className="w-3 h-3 rounded-full bg-accent-orange"></div>
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                    </div>
                                                    <span className="text-xs font-mono text-muted">agent_system.py</span>
                                                </div>
                                                <div className="space-y-3 font-mono text-xs leading-relaxed">
                                                    <div className="flex gap-2">
                                                        <span className="text-accent font-bold min-w-[80px]">Task:</span>
                                                        <span className="text-white/90">"Analyze Q4 Sales & Generate Report"</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-accent font-bold min-w-[80px]">Agent_Plan:</span>
                                                        <span className="text-white/70">Breaking into 4 sub-tasks...</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-emerald-400 font-bold min-w-[80px]">Tool_Call:</span>
                                                        <span className="text-white/70">query_database(table='sales')</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-accent-orange font-bold min-w-[80px]">Analysis:</span>
                                                        <span className="text-white/70">Computing trends, insights...</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-accent font-bold min-w-[80px]">Output:</span>
                                                        <span className="text-accent font-bold">✓ Report Generated & Emailed</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><Network className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">Multi-Agent</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Orchestration</div>
                                                    </div>
                                                </div>
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><Shield className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">Secure</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Enterprise-Ready</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Lyric Studio - GEN-AI Innovation */}
                            <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 3 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0 pointer-events-none'}`}>
                                <div className="group relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden min-h-[680px]">
                                    {/* Top-Right Badge - STANDARDIZED */}
                                    <div className="absolute top-0 right-0 p-0 md:p-8">
                                        <div className="bg-accent text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg uppercase tracking-wide flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> GEN-AI INNOVATION
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-12 items-center mt-8 md:mt-0">
                                        <div>
                                            {/* Badge: Suno.com Ready (Above Title) */}
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/30 mb-6">
                                                <Music className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-bold text-accent uppercase tracking-wider">SUNO.COM & UDIO READY</span>
                                            </div>

                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight">
                                                Write Hit Songs in<br />
                                                {/* Solid Gradient Block for Subheadline */}
                                                <div className="relative inline-block mt-3">
                                                    <div className="absolute inset-0 bg-brand-gradient transform -rotate-1 rounded-lg shadow-lg shadow-accent/20"></div>
                                                    <span className="relative z-10 text-3xl md:text-4xl font-bold text-white px-4 py-2 block">Seconds, Not Days.</span>
                                                </div>
                                            </h2>

                                            <p className="text-lg text-secondary mb-8 leading-relaxed border-l-4 border-accent pl-4">
                                                The world's first <strong>"Samskara" Context Engine</strong>. Whether it's a Wedding Ritual or a Cinematic Mass Beat, we generate production-ready lyrics with cultural depth.
                                            </p>

                                            <div className="flex flex-wrap gap-3 mb-10">
                                                {[{ icon: Feather, label: 'Native Script' }, { icon: Layers, label: 'Multi-Agent' }, { icon: FileCode, label: 'Auto-Tagging' }].map((f, i) => (
                                                    <div key={i} className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm hover:border-accent transition-colors cursor-default">
                                                        <f.icon className="w-4 h-4 text-accent" /> {f.label}
                                                    </div>
                                                ))}
                                            </div>

                                            <Link to="/studio" className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex">
                                                <Play className="w-5 h-5" /> Open Lyric Studio
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>

                                        <div className="space-y-6 relative">
                                            {/* Background Glow */}
                                            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-accent-orange/10 rounded-full blur-3xl animate-pulse"></div>

                                            {/* Code Block - Dark Theme Style to pop */}
                                            <div className="bg-primary/80 backdrop-blur-xl p-6 rounded-2xl border border-accent/20 relative shadow-2xl">
                                                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                                                        <div className="w-3 h-3 rounded-full bg-accent-orange"></div>
                                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                    </div>
                                                    <span className="text-xs font-mono text-muted">agent_core.ts</span>
                                                </div>
                                                <div className="space-y-3 font-mono text-xs leading-relaxed">
                                                    <div className="flex gap-2">
                                                        <span className="text-accent-orange font-bold min-w-[80px]">Prompt:</span>
                                                        <span className="text-white/90">"Energetic Sangeet Song"</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-accent font-bold min-w-[80px]">Analysis:</span>
                                                        <span className="text-white/70">Detecting 'Sangeet' Ritual...</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-emerald-400 font-bold min-w-[80px]">Agent_Bhava:</span>
                                                        <span className="text-white/70">Injecting 'Joyful' Navarasa</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="text-accent-orange font-bold min-w-[80px]">Output:</span>
                                                        <span className="text-accent font-bold">Generating [Chorus] with AABB Rhyme...</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><Globe className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">15+</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Languages</div>
                                                    </div>
                                                </div>
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent-orange/10 rounded-lg text-accent-orange"><Wand2 className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">100%</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Originality</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: Copyright-Free Music - STANDARDIZED */}
                            <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 2 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0 pointer-events-none'}`}>
                                <div className="group relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden min-h-[680px]">
                                    {/* Top-Right Badge - STANDARDIZED */}
                                    <div className="absolute top-0 right-0 p-0 md:p-8">
                                        <div className="bg-accent text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg uppercase tracking-wide flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> 100% COPYRIGHT-FREE
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-12 items-center mt-8 md:mt-0">
                                        <div>
                                            {/* Badge: Streaming Ready (Above Title) */}
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/30 mb-6">
                                                <Radio className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-bold text-accent uppercase tracking-wider">YOUTUBE • TWITCH • KICK READY</span>
                                            </div>

                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight">
                                                Stream Without<br />
                                                Fear of Strikes
                                                {/* Brand Gradient Subheadline */}
                                                <span className="text-transparent bg-clip-text bg-brand-gradient text-3xl md:text-4xl block mt-2 font-bold">Original Music for Content Creators</span>
                                            </h2>

                                            <p className="text-lg text-secondary mb-8 leading-relaxed border-l-4 border-accent pl-4">
                                                <strong>Zero copyright claims. Zero takedowns. Zero royalties.</strong> Our entire music library is original, professionally produced, and 100% cleared for live streaming, YouTube videos, podcasts, and commercial use.
                                            </p>

                                            <div className="flex flex-wrap gap-3 mb-10">
                                                {[{ icon: Radio, label: 'Live Stream Safe' }, { icon: Shield, label: 'No Copyright ID' }, { icon: CheckCircle, label: 'Monetization OK' }].map((f, i) => (
                                                    <div key={i} className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm hover:border-accent transition-colors cursor-default">
                                                        <f.icon className="w-4 h-4 text-accent" /> {f.label}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <Link to="/music" className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex">
                                                    <Music className="w-5 h-5" /> Explore Music Library
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>

                                            <p className="mt-6 text-xs text-muted font-medium flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-accent" /> Safe for YouTube Partner Program • Twitch Affiliate • All Platforms
                                            </p>
                                        </div>

                                        <div className="space-y-6 relative">
                                            {/* Background Music Glow */}
                                            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-accent-orange/10 rounded-full blur-3xl animate-pulse"></div>

                                            {/* Music Stats Card */}
                                            <div className="bg-surface/60 backdrop-blur-sm p-8 rounded-2xl border border-accent/20 shadow-lg relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                        <Music className="w-7 h-7 text-accent" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-primary">Original Compositions</div>
                                                        <div className="text-sm text-secondary">Created by professional musicians</div>
                                                    </div>
                                                </div>

                                                {/* Animated Soundwave */}
                                                <div className="flex items-center justify-center gap-1 h-20 mb-6">
                                                    {[...Array(12)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="frequency-bar"
                                                            style={{
                                                                height: `${30 + Math.random() * 70}%`,
                                                                animationDelay: `${i * 0.1}s`,
                                                                animation: `music-wave-${(i % 5) + 1} 0.8s ease-in-out infinite`
                                                            }}
                                                        ></div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div className="bg-surface/80 p-3 rounded-xl">
                                                        <div className="text-2xl font-black text-accent">100%</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Safe</div>
                                                    </div>
                                                    <div className="bg-surface/80 p-3 rounded-xl">
                                                        <div className="text-2xl font-black text-accent">0</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Claims</div>
                                                    </div>
                                                    <div className="bg-surface/80 p-3 rounded-xl">
                                                        <div className="text-2xl font-black text-accent">∞</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Uses</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Platform Support */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><Radio className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">YouTube</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Content ID Safe</div>
                                                    </div>
                                                </div>
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent-orange/10 rounded-lg text-accent-orange"><Zap className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">Twitch</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">DMCA Free</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 2: vCard - Digital Business Card */}
                            <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 1 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0 pointer-events-none'}`}>
                                <div className="group relative glass-card rounded-3xl p-8 md:p-16 overflow-hidden min-h-[680px]">
                                    {/* Top-Right Badge - STANDARDIZED */}
                                    <div className="absolute top-0 right-0 p-0 md:p-8">
                                        <div className="bg-accent text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg uppercase tracking-wide flex items-center gap-2">
                                            <Users className="w-4 h-4" /> PROFESSIONAL NETWORKING
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-12 items-center mt-8 md:mt-0">
                                        <div>
                                            {/* Badge: Digital Identity (Above Title) */}
                                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/30 mb-6">
                                                <IdCard className="w-4 h-4 text-accent" />
                                                <span className="text-xs font-bold text-accent uppercase tracking-wider">DIGITAL VISITING CARD</span>
                                            </div>

                                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-4 leading-tight">
                                                Your Digital<br />
                                                Visiting Card
                                                {/* Brand Gradient Subheadline */}
                                                <span className="text-transparent bg-clip-text bg-brand-gradient text-2xl md:text-3xl block mt-2 font-bold">Share on WhatsApp, Instagram & More!</span>
                                            </h2>

                                            {/* Social Media Logos Strip */}
                                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                                {['whatsapp', 'instagram', 'youtube', 'facebook', 'x', 'tiktok', 'linkedin', 'telegram'].map((platform) => (
                                                    <div key={platform} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-surface border border-border p-2 hover:border-accent hover:scale-110 transition-all shadow-sm">
                                                        <img 
                                                            src={`/assets/social-logos/${platform}.svg`} 
                                                            alt={platform} 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <p className="text-lg text-secondary mb-6 leading-relaxed border-l-4 border-accent pl-4">
                                                <strong>One link for all your contacts!</strong> Create your card, share via QR code or link. Add to phone contacts instantly.
                                            </p>

                                            <div className="flex flex-wrap gap-3 mb-8">
                                                {[{ icon: QrCode, label: 'Scan & Save' }, { icon: Share2, label: 'Share Anywhere' }, { icon: Download, label: 'Add to Contacts' }].map((f, i) => (
                                                    <div key={i} className="px-4 py-2 rounded-xl bg-surface border border-border text-sm font-semibold text-secondary flex items-center gap-2 shadow-sm hover:border-accent transition-colors cursor-default">
                                                        <f.icon className="w-4 h-4 text-accent" /> {f.label}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <Link to={isAuthenticated ? "/profile/dashboard" : "/vcard"} className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex">
                                                    <IdCard className="w-5 h-5" /> {isAuthenticated ? 'Manage Your vCard' : 'Create Your vCard'}
                                                    <ArrowRight className="w-5 h-5" />
                                                </Link>
                                            </div>

                                            <p className="mt-6 text-xs text-muted font-medium flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-emerald-500" /> Privacy-First • Customizable Themes • Analytics Dashboard
                                            </p>
                                        </div>

                                        <div className="space-y-6 relative">
                                            {/* Background Glow */}
                                            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 to-accent-orange/10 rounded-full blur-3xl animate-pulse"></div>

                                            {/* vCard Preview Card */}
                                            <div className="bg-surface/60 backdrop-blur-sm p-8 rounded-2xl border border-accent/20 shadow-lg relative">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                                                        <IdCard className="w-7 h-7 text-accent" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-primary">Digital Visiting Card</div>
                                                        <div className="text-sm text-secondary">Share with Anyone, Anywhere</div>
                                                    </div>
                                                </div>

                                                {/* Social Media Icons Row */}
                                                <div className="mb-6">
                                                    <div className="text-xs font-bold text-secondary uppercase mb-3">Connect on All Platforms</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['whatsapp', 'instagram', 'youtube', 'facebook', 'linkedin', 'x'].map((platform) => (
                                                            <div key={platform} className="w-10 h-10 rounded-lg bg-white border border-border p-2 hover:scale-110 transition-transform shadow-sm">
                                                                <img src={`/assets/social-logos/${platform}.svg`} alt={platform} className="w-full h-full object-contain" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Theme Color Swatches */}
                                                <div className="mb-6">
                                                    <div className="text-xs font-bold text-secondary uppercase mb-3">12+ Professional Themes</div>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {['#667EEA', '#F56565', '#48BB78', '#ED8936', '#9F7AEA', '#38B2AC', '#ECC94B', '#ED64A6', '#4299E1', '#FC8181', '#68D391', '#F6AD55'].map((color, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer"
                                                                style={{ backgroundColor: color }}
                                                                title={`Theme ${i + 1}`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div className="bg-surface/80 p-3 rounded-xl">
                                                        <div className="text-2xl font-black text-accent">QR</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Scannable</div>
                                                    </div>
                                                    <div className="bg-surface/80 p-3 rounded-xl">
                                                        <div className="text-2xl font-black text-accent">12+</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Themes</div>
                                                    </div>
                                                    <div className="bg-surface/80 p-3 rounded-xl">
                                                        <div className="text-2xl font-black text-accent">.vcf</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Export</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Features Grid */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent/10 rounded-lg text-accent"><QrCode className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">Instant</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Sharing</div>
                                                    </div>
                                                </div>
                                                <div className="bg-surface p-4 rounded-xl shadow-sm border border-accent/10 flex items-center gap-3">
                                                    <div className="p-2 bg-accent-orange/10 rounded-lg text-accent-orange"><Activity className="w-5 h-5" /></div>
                                                    <div>
                                                        <div className="font-bold text-primary">Analytics</div>
                                                        <div className="text-[10px] uppercase text-secondary font-bold">Track Views</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Carousel Indicators */}
                        <div className="flex justify-center gap-3 mt-8">
                            {[0, 1, 2, 3, 4].map((idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveHero(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${activeHero === idx ? 'w-8 bg-accent' : 'w-2 bg-border'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* FEATURE SECTIONS - Modern Apple/Vercel Style */}

                {/* Feature 1: Data Recovery - Comprehensive Section */}
                <section id="data-recovery" className="py-32 bg-background relative overflow-hidden scroll-mt-24">
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        {/* Hero Content */}
                        <div className="max-w-7xl mx-auto mb-32">
                            <div className="grid lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-8 animate-fade-in">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                                        <HardDrive className="w-4 h-4 text-accent" />
                                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Emergency Data Recovery</span>
                                    </div>

                                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary leading-tight">
                                        Your Data.<br />
                                        <span className="text-gradient">Always Recoverable.</span>
                                    </h2>

                                    <p className="text-xl text-secondary leading-relaxed">
                                        From crashed hard drives to ransomware attacks, we recover what others can't.
                                        With a 98% success rate and ISO-certified cleanroom facilities, your critical data is in expert hands.
                                    </p>

                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift"
                                        >
                                            <Activity className="w-5 h-5" /> Start Free Evaluation
                                        </button>
                                        <a href="tel:+919701087446" className="btn btn-ghost px-8 py-4 rounded-xl text-lg hover-lift border-2">
                                            <Phone className="w-5 h-5" /> Call Now
                                        </a>
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-4">
                                        {[
                                            { label: '98%', sublabel: 'Success Rate' },
                                            { label: '24/7', sublabel: 'Emergency Lab' },
                                            { label: '0%', sublabel: 'Risk Guarantee' }
                                        ].map((stat, i) => (
                                            <div key={i} className="text-center">
                                                <div className="text-4xl font-black text-accent">{stat.label}</div>
                                                <div className="text-xs text-secondary uppercase tracking-wide font-bold">{stat.sublabel}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="relative animate-slide-left">
                                    <div className="glass-card p-8 rounded-3xl border border-border shadow-2xl">
                                        <div className="space-y-6">
                                            {[
                                                { icon: HardDrive, label: 'Mechanical Failures', desc: 'Head crashes, motor failures' },
                                                { icon: Zap, label: 'Logical Recovery', desc: 'Deleted files, corruption' },
                                                { icon: Server, label: 'RAID & Enterprise', desc: 'Server arrays, SAN/NAS' },
                                                { icon: Cpu, label: 'SSD & Flash', desc: 'Chip-off recovery' }
                                            ].map((service, i) => (
                                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface transition-all group cursor-default">
                                                    <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent group-hover:scale-110 transition-all">
                                                        <service.icon className="w-6 h-6 text-accent group-hover:text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-primary mb-1">{service.label}</div>
                                                        <div className="text-sm text-secondary">{service.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recovery Process - 4 Steps */}
                        <div className="max-w-7xl mx-auto mb-32">
                            <div className="text-center mb-16 animate-fade-in">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
                                    <Shield className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Transparent Workflow</span>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-primary mb-4">How We Get Your Data Back</h3>
                                <p className="text-xl text-secondary max-w-3xl mx-auto">
                                    A simple, secure, and transparent process. You are in control at every step.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        step: '01',
                                        icon: FileCheck,
                                        title: 'Free Diagnostics',
                                        desc: 'Send us your device. Our engineers analyze the failure and provide a detailed report—completely free.'
                                    },
                                    {
                                        step: '02',
                                        icon: FileWarning,
                                        title: 'Firm Quote',
                                        desc: 'You receive a fixed price quote and a file list. If you decline, we return your device. No pressure.'
                                    },
                                    {
                                        step: '03',
                                        icon: Activity,
                                        title: 'Lab Recovery',
                                        desc: 'We repair the hardware, clone the drive, and extract your data using advanced forensic tools.'
                                    },
                                    {
                                        step: '04',
                                        icon: Lock,
                                        title: 'Secure Return',
                                        desc: 'Your data is encrypted onto a transfer drive and shipped back to you via priority courier.'
                                    }
                                ].map((process, i) => (
                                    <div key={i} className="glass-card p-8 rounded-3xl border border-border hover:-translate-y-2 transition-all group animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                        <div className="relative mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto group-hover:bg-accent group-hover:scale-110 transition-all">
                                                <process.icon className="w-8 h-8 text-accent group-hover:text-white" />
                                            </div>
                                            <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                                {process.step}
                                            </div>
                                        </div>
                                        <h4 className="text-xl font-bold text-primary mb-3 text-center">{process.title}</h4>
                                        <p className="text-sm text-secondary leading-relaxed text-center">{process.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team & Mission */}
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-16 items-center">
                                <div className="relative order-2 lg:order-1 animate-slide-right">
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-orange/10 rounded-full blur-3xl"></div>

                                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-40"></div>
                                        <img
                                            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
                                            alt="Professional data recovery engineers working in cleanroom facility with advanced recovery tools"
                                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                            width="1632"
                                            height="1088"
                                            loading="lazy"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white/30 bg-surface/50 overflow-hidden">
                                                            <img
                                                                src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                                                alt={`Data recovery engineer team member ${i}`}
                                                                className="w-full h-full object-cover"
                                                                width="100"
                                                                height="100"
                                                                loading="lazy"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-white text-sm font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">+40 Experts</span>
                                            </div>
                                            <p className="text-white font-bold text-lg border-l-4 border-accent pl-4">
                                                "We treat every byte of data as if it were our own history."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="absolute -right-6 top-10 glass-card p-6 rounded-2xl shadow-xl max-w-[200px] hidden lg:block animate-float border border-accent/20">
                                        <div className="text-5xl font-black text-accent mb-2">12+</div>
                                        <div className="text-xs text-secondary font-bold uppercase tracking-wide">Years of Excellence</div>
                                    </div>
                                </div>

                                <div className="order-1 lg:order-2 space-y-6 animate-fade-in">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                                        <Sparkles className="w-4 h-4 text-accent" />
                                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Our Mission</span>
                                    </div>

                                    <h3 className="text-4xl md:text-5xl font-black text-primary leading-tight">
                                        Restoring the Past.<br />
                                        <span className="text-gradient">Powering the Future.</span>
                                    </h3>

                                    <p className="text-lg text-secondary leading-relaxed">
                                        Founded by a coalition of forensic data engineers and AI researchers, Swaz Solutions was built on a single premise:
                                        <strong> Technology should serve humanity's most critical needs.</strong>
                                    </p>

                                    <p className="text-secondary leading-relaxed">
                                        We operate at the intersection of hardware precision and software intelligence. Whether it's a RAID array
                                        holding a decade of corporate history or a creator looking for the perfect culturally-aware lyric,
                                        we bring enterprise-grade rigor to every challenge.
                                    </p>

                                    <div className="glass-card p-6 rounded-2xl border border-accent/20 bg-accent/5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-accent/10 rounded-xl flex-shrink-0">
                                                <Database className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary mb-2">Research First Approach</h4>
                                                <p className="text-sm text-secondary leading-relaxed">
                                                    We invest 30% of revenue back into R&D, developing proprietary head-swap tools
                                                    and fine-tuning our Large Language Models.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-4">
                                        {[
                                            { icon: Shield, label: 'SSAE 16 SOC Type II' },
                                            { icon: Lock, label: 'Biometric Security' },
                                            { icon: CheckCircle, label: 'ISO Certified' }
                                        ].map((badge, i) => (
                                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border text-sm font-semibold">
                                                <badge.icon className="w-4 h-4 text-emerald-500" />
                                                <span className="text-secondary">{badge.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 2: AI Agent Development - Dark Theme Card */}
                <section className="py-32 bg-surface relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-16 items-center">
                                <div className="order-2 lg:order-1 relative animate-slide-right">
                                    <div className="bg-primary/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-accent"></div>
                                                <div className="w-3 h-3 rounded-full bg-accent-orange"></div>
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            </div>
                                            <span className="text-xs font-mono text-white/50">autonomous_agent.py</span>
                                        </div>

                                        <div className="font-mono text-sm space-y-4">
                                            <div><span className="text-accent-orange">class</span> <span className="text-white">EnterpriseAgent</span>:</div>
                                            <div className="pl-4">
                                                <span className="text-accent-orange">def</span> <span className="text-emerald-400">analyze_and_execute</span>(<span className="text-white">task</span>):
                                            </div>
                                            <div className="pl-8 text-white/70"># Plan multi-step workflow</div>
                                            <div className="pl-8 text-white/70"># Execute with tools</div>
                                            <div className="pl-8 text-white/70"># Self-correct & optimize</div>
                                            <div className="pl-8"><span className="text-accent-orange">return</span> <span className="text-emerald-400">results</span></div>
                                        </div>

                                        <div className="mt-8 grid grid-cols-2 gap-4">
                                            {[
                                                { icon: Network, label: 'Multi-Agent' },
                                                { icon: Shield, label: 'Enterprise Secure' },
                                                { icon: Zap, label: 'Auto-Execute' },
                                                { icon: Brain, label: 'Self-Learning' }
                                            ].map((f, i) => (
                                                <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                    <f.icon className="w-5 h-5 text-accent mb-2" />
                                                    <div className="text-xs text-white/90 font-bold">{f.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="order-1 lg:order-2 space-y-8 animate-fade-in">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                                        <Bot className="w-4 h-4 text-accent" />
                                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Agentic AI Development</span>
                                    </div>

                                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary leading-tight">
                                        AI That Thinks.<br />
                                        <span className="text-gradient">Decides. Acts.</span>
                                    </h2>

                                    <p className="text-xl text-secondary leading-relaxed">
                                        Build autonomous AI agents that orchestrate complex workflows, make intelligent decisions,
                                        and execute tasks end-to-end. Enterprise-grade security with multi-agent collaboration.
                                    </p>

                                    <div className="space-y-4">
                                        {[
                                            { icon: Bot, text: 'Autonomous task execution with planning & reasoning' },
                                            { icon: Network, text: 'Multi-agent teams that communicate & coordinate' },
                                            { icon: Shield, text: 'Enterprise security with audit logging & controls' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="p-2 bg-accent/10 rounded-lg mt-1">
                                                    <item.icon className="w-5 h-5 text-accent" />
                                                </div>
                                                <p className="text-lg text-secondary">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift"
                                    >
                                        <Bot className="w-5 h-5" /> Build Your AI Agent
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 3: Copyright-Free Music - Gradient Card */}
                <section id="music" className="py-32 bg-background relative overflow-hidden scroll-mt-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 to-accent/5"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-16 items-center">
                                <div className="space-y-8 animate-fade-in">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-orange/10 border border-accent-orange/20">
                                        <Music className="w-4 h-4 text-accent-orange" />
                                        <span className="text-xs font-bold text-accent-orange uppercase tracking-wider">Copyright-Free Music</span>
                                    </div>

                                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary leading-tight">
                                        Stream Fearlessly.<br />
                                        <span className="text-gradient">Create Freely.</span>
                                    </h2>

                                    <p className="text-xl text-secondary leading-relaxed">
                                        Original music for content creators. Zero copyright claims. Zero strikes.
                                        Perfect for YouTube, Twitch, podcasts, and commercial projects.
                                    </p>

                                    <div className="space-y-4">
                                        {[
                                            { icon: Shield, text: 'YouTube Content ID Safe - No claims ever' },
                                            { icon: Radio, text: 'DMCA-free for live streaming on all platforms' },
                                            { icon: CheckCircle, text: 'Commercial use allowed - We retain full copyright' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="p-2 bg-accent-orange/10 rounded-lg mt-1">
                                                    <item.icon className="w-5 h-5 text-accent-orange" />
                                                </div>
                                                <p className="text-lg text-secondary">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <Link to="/music" className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex">
                                        <Music className="w-5 h-5" /> Browse Music Library
                                    </Link>
                                </div>

                                <div className="relative animate-slide-left">
                                    <div className="glass-card p-8 rounded-3xl border border-border shadow-2xl bg-gradient-to-br from-surface to-accent-orange/5">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-16 h-16 rounded-2xl bg-accent-orange/10 flex items-center justify-center">
                                                <Music className="w-8 h-8 text-accent-orange" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xl text-primary">Original Compositions</div>
                                                <div className="text-sm text-secondary">Professional musicians</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 h-32 mb-8">
                                            {[...Array(12)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-2 bg-brand-gradient rounded-full"
                                                    style={{
                                                        height: `${30 + Math.random() * 70}%`,
                                                        animation: `music-wave-${(i % 5) + 1} 0.8s ease-in-out infinite`,
                                                        animationDelay: `${i * 0.1}s`
                                                    }}
                                                ></div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { value: '100%', label: 'Safe' },
                                                { value: '0', label: 'Claims' },
                                                { value: '∞', label: 'Uses' }
                                            ].map((stat, i) => (
                                                <div key={i} className="text-center p-4 bg-surface rounded-xl">
                                                    <div className="text-3xl font-black text-accent-orange">{stat.value}</div>
                                                    <div className="text-xs text-secondary uppercase tracking-wide font-bold">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 4: Lyric Studio - Showcase Style */}
                <section id="studio" className="py-32 bg-surface relative overflow-hidden scroll-mt-24">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16 animate-fade-in">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                                    <Sparkles className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent uppercase tracking-wider">GEN-AI Lyric Studio</span>
                                </div>

                                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary leading-tight mb-6">
                                    Write Hit Songs in<br />
                                    <span className="text-gradient">Seconds, Not Days.</span>
                                </h2>

                                <p className="text-xl text-secondary leading-relaxed max-w-3xl mx-auto">
                                    The world's first AI lyric generator with cultural intelligence.
                                    Generate production-ready lyrics in 15+ languages with Suno.com & Udio support.
                                </p>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8 mb-12">
                                <div className="glass-card p-8 rounded-3xl border border-border hover:-translate-y-2 transition-all animate-slide-up">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="p-3 bg-accent/10 rounded-xl">
                                            <Feather className="w-8 h-8 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-primary mb-2">Cultural Intelligence</h3>
                                            <p className="text-secondary">
                                                "Samskara" engine understands rituals, cinema tropes, and emotional context across cultures.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {['Native script generation', 'Multi-language support', 'Context-aware lyrics'].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-secondary">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-3xl border border-border hover:-translate-y-2 transition-all animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="p-3 bg-accent/10 rounded-xl">
                                            <Wand2 className="w-8 h-8 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-primary mb-2">Production Ready</h3>
                                            <p className="text-secondary">
                                                Export with [Verse], [Chorus], [Bridge] tags for instant Suno.com & Udio compatibility.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {['Auto-formatting', 'Style prompts', 'Rhyme optimization'].map((f, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-secondary">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-primary/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-scale-in">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                                            <div className="w-3 h-3 rounded-full bg-accent"></div>
                                            <div className="w-3 h-3 rounded-full bg-accent-orange"></div>
                                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            <span className="text-xs font-mono text-white/50 ml-auto">suno_export.txt</span>
                                        </div>

                                        <div className="font-mono text-sm space-y-3 text-white/90">
                                            <div className="text-accent-orange">// Style Prompt</div>
                                            <div className="bg-white/5 p-3 rounded text-emerald-400 border border-white/10">
                                                Cinematic Orchestral, Female Vocals, 90 BPM
                                            </div>
                                            <div className="text-accent-orange mt-4">// Content</div>
                                            <div>
                                                <span className="text-yellow-400">[Verse 1]</span><br />
                                                <span className="text-white/70">The shadows lengthen on the wall</span><br />
                                                <span className="text-white/70">I hear your whisper in the hall</span>
                                            </div>
                                            <div>
                                                <span className="text-yellow-400">[Chorus]</span><br />
                                                <span className="text-white/70">Oh, memories fade like morning mist...</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-4">Built for Suno.com & Udio</h3>
                                            <p className="text-white/70 mb-6">
                                                Copy and paste directly into your favorite music generator.
                                                All formatting done automatically.
                                            </p>
                                        </div>

                                        <Link to="/studio" className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex">
                                            <Play className="w-5 h-5" /> Open Lyric Studio
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 5: vCard - Digital Business Card */}
                <section id="vcard" className="py-32 bg-background relative overflow-hidden scroll-mt-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent-orange/5"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            {/* Section Header */}
                            <div className="text-center mb-16 animate-fade-in">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                                    <IdCard className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Virtual Visiting Card</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight">
                                    Connect Instantly.<br />
                                    <span className="text-gradient">Share Professionally.</span>
                                </h2>
                                <p className="text-xl text-secondary leading-relaxed max-w-3xl mx-auto">
                                    Your digital identity, reimagined. Create stunning digital business cards with QR codes, 
                                    customizable themes, and built-in analytics. Perfect for networking events, conferences, and professional connections.
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                {[
                                    { icon: QrCode, title: 'Instant QR Code Sharing', desc: 'Generate scannable QR codes that work on iOS & Android. No app required for recipients.' },
                                    { icon: Palette, title: '12+ Professional Themes', desc: 'Choose from beautiful pre-designed themes or customize colors to match your brand.' },
                                    { icon: Download, title: 'One-Click vCard Export', desc: 'Download your profile as a .vcf file. Recipients can save you to contacts instantly.' },
                                    { icon: Share2, title: 'Multi-Channel Sharing', desc: 'Share via copy link, WhatsApp, or native system share. Reach anyone, anywhere.' },
                                    { icon: BarChart3, title: 'Built-in Analytics', desc: 'Track profile views, vCard downloads, and share events. Know who\'s engaging.' },
                                    { icon: Eye, title: 'Public Profile URL', desc: 'Get a custom URL like /u/yourname. Always accessible, always professional.' },
                                    { icon: Link2, title: 'Social Media Links', desc: 'Add all your social profiles - Instagram, LinkedIn, Twitter, YouTube & more.' },
                                    { icon: Smartphone, title: 'Mobile-First Design', desc: 'Optimized for mobile viewing. Lightning fast load times on any device.' },
                                    { icon: Shield, title: 'Privacy Controls', desc: 'Choose what to show: email, phone, bio. Full control over your public presence.' },
                                    { icon: UserCheck, title: 'Contact Information', desc: 'Display professional details: headline, company, website, and contact info.' },
                                    { icon: Settings, title: 'Customizable Appearance', desc: 'Button styles, corner radius, shadows - fine-tune every visual detail.' },
                                    { icon: Globe, title: 'SEO Optimized', desc: 'Opt-in to public indexing for search engine discoverability.' }
                                ].map((feature, i) => (
                                    <div key={i} className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                        <div className="p-3 bg-accent/10 rounded-xl w-fit mb-4 group-hover:bg-accent/20 transition-colors">
                                            <feature.icon className="w-6 h-6 text-accent" />
                                        </div>
                                        <h3 className="font-bold text-lg text-primary mb-2">{feature.title}</h3>
                                        <p className="text-sm text-secondary leading-relaxed">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom CTA Card */}
                            <div className="glass-card p-8 md:p-12 rounded-3xl border border-border shadow-2xl bg-gradient-to-br from-surface to-accent/5">
                                <div className="grid lg:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <h3 className="text-3xl md:text-4xl font-black text-primary">
                                            Ready to Go Digital?
                                        </h3>
                                        <p className="text-lg text-secondary leading-relaxed">
                                            Join professionals who've upgraded their networking game. Create your virtual visiting card in minutes - 
                                            completely free, no hidden costs.
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <Link to="/login" className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex">
                                                <IdCard className="w-5 h-5" /> Create Your vCard
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                        <p className="text-xs text-muted flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" /> 100% Free • No Credit Card Required • Instant Setup
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                                                <QrCode className="w-7 h-7 text-accent" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg text-primary">Scan to Connect</div>
                                                <div className="text-sm text-secondary">Works on iOS & Android</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center mb-6 p-6 bg-white rounded-2xl shadow-inner max-w-[200px] mx-auto">
                                            <QrCode className="w-32 h-32 text-black" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { value: '12+', label: 'Themes' },
                                                { value: '100%', label: 'Free' },
                                                { value: '24/7', label: 'Online' }
                                            ].map((stat, i) => (
                                                <div key={i} className="text-center p-3 bg-surface rounded-xl">
                                                    <div className="text-2xl font-black text-accent">{stat.value}</div>
                                                    <div className="text-[10px] text-secondary uppercase tracking-wide font-bold">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature 6: Camera Updates - Simple Card */}
                <section className="py-32 bg-background relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto">
                            <div className="glass-card p-12 md:p-16 rounded-3xl border border-border shadow-2xl text-center animate-fade-in">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                                    <Camera className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Live Updates</span>
                                </div>

                                <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">
                                    Daily Camera updates
                                </h2>

                                <p className="text-xl text-secondary leading-relaxed mb-8 max-w-2xl mx-auto">
                                    Real-time updates from multiple locations worldwide. Equipment reviews,
                                    photography news, and live scanner feeds updated daily.
                                </p>

                                <div className="flex flex-wrap justify-center gap-6 mb-8">
                                    {[
                                        { icon: Activity, label: 'Live Feeds' },
                                        { icon: Camera, label: 'Photo Updates' },
                                        { icon: Radio, label: 'Scanner News' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-surface rounded-xl border border-border">
                                            <item.icon className="w-5 h-5 text-accent" />
                                            <span className="font-semibold text-primary">{item.label}</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => {
                                        window.scrollTo(0, 0);
                                        navigate('/news');
                                    }}
                                    className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex"
                                >
                                    <Camera className="w-5 h-5" /> View Live Updates
                                </button>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Contact Form - Unified with Toggle */}
                <section id="contact" className="py-20 bg-surface">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <UnifiedContactForm defaultType="data-recovery" />
                    </div>
                </section>
            </main>
        </>
    );
};
