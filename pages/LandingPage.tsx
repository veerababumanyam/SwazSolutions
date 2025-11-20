import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Shield, Clock, HardDrive, Cpu, Zap, Database, Sparkles, Globe, Music, Heart, Wand2, CheckCircle, Activity, Lock, Phone, Server, FileWarning, FileCheck, Feather, Layers, FileCode, Play, Search, Palette, Mic2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
    const [activeHero, setActiveHero] = useState(0);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const durations = [10000, 8000]; // Give a bit more time for the lyric slide
        const timeout = setTimeout(() => {
            setActiveHero((prev) => (prev + 1) % 2);
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
                            Professional Data Recovery & Intelligent AI Innovation.
                        </p>
                        
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card shadow-lg shadow-accent/10 mb-6 border-accent/20">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-sm font-bold text-primary">24/7 Emergency Lab Operations: <span className="text-emerald-600 font-extrabold">ONLINE</span></span>
                        </div>
                    </div>

                    {/* Rotating Hero Cards */}
                    <div className="max-w-7xl mx-auto relative min-h-[700px] lg:min-h-[650px]">
                        {/* Data Recovery Card - CEO/Sales Optimized */}
                        <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 0 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-10 z-0 pointer-events-none'}`}>
                            <div className="group relative glass-card bg-gradient-to-br from-surface/90 to-surface/70 rounded-3xl p-8 md:p-16 hover:shadow-accent/20 overflow-hidden">
                                {/* Decorative Badges */}
                                <div className="absolute top-0 left-0 p-0 md:p-8">
                                     <div className="bg-accent/10 backdrop-blur-md border border-accent/20 text-accent px-6 py-2 rounded-br-2xl font-bold text-xs shadow-sm uppercase tracking-wide flex items-center gap-2">
                                        <Lock className="w-3 h-3" /> ISO 27001 Lab
                                     </div>
                                </div>
                                <div className="absolute top-0 right-0 p-0 md:p-8">
                                     <div className="bg-accent text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-lg uppercase tracking-wide flex items-center gap-2">
                                        <Shield className="w-4 h-4" /> Industry Leader
                                     </div>
                                </div>
                                
                                <div className="grid lg:grid-cols-2 gap-12 items-center mt-8 md:mt-0">
                                    <div>
                                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight mt-8 md:mt-0">
                                            Critical Data Loss?<br/>
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
                                                onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})} 
                                                className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift justify-center"
                                            >
                                                <Activity className="w-5 h-5" /> Start Free Evaluation
                                            </button>
                                            <button onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})} className="btn btn-ghost px-8 py-4 rounded-xl text-lg hover-lift border-2 justify-center">
                                                <Phone className="w-5 h-5" /> Speak to an Expert
                                            </button>
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

                        {/* Lyric Studio Card - Matches Design Screenshot Exactly */}
                        <div className={`absolute inset-0 transition-all duration-1000 ease-in-out ${activeHero === 1 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 translate-x-10 z-0 pointer-events-none'}`}>
                            <div className="group relative glass-card bg-gradient-to-br from-surface/90 to-accent/5 rounded-3xl p-8 md:p-16 hover:shadow-accent/20 overflow-hidden">
                                
                                {/* Badge: Gen AI Innovation (Top Right) */}
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
                                            Write Hit Songs in<br/>
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
                    </div>
                    
                    {/* Carousel Indicators */}
                    <div className="flex justify-center gap-3 mt-8">
                        {[0, 1].map((idx) => (
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

            {/* Why Choose Swaz - Trust & Business Value */}
            <section className="py-16 bg-surface border-b border-border">
                 <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-background transition-colors border border-transparent hover:border-border/50">
                            <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary mb-2">Enterprise Compliance</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    We adhere to SSAE 16 SOC Type II standards. Your data is handled in a secure, biometric-access environment.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-background transition-colors border border-transparent hover:border-border/50">
                            <div className="p-3 bg-accent-orange/10 rounded-xl text-accent-orange">
                                <Lock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary mb-2">No Data, No Fee Guarantee</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    You assume zero financial risk. If we can't recover the data you need, you don't pay a cent. Evaluation is always free.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 rounded-2xl hover:bg-background transition-colors border border-transparent hover:border-border/50">
                            <div className="p-3 bg-accent/10 rounded-xl text-accent">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary mb-2">Emergency Turnaround</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Downtime is costly. Our emergency engineers work 24/7/365 to minimize business interruption and restore access fast.
                                </p>
                            </div>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Enhanced Services Grid - Customer Problem Focused */}
            <section id="services" className="py-20 bg-background scroll-mt-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="max-w-2xl">
                             <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Specialized Recovery Solutions</div>
                             <h2 className="text-4xl font-black text-primary mb-4">What Problem Are You Facing?</h2>
                             <p className="text-lg text-secondary">From simple deletions to complex server failures, we have the proprietary hardware to handle it.</p>
                        </div>
                        <button onClick={() => document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'})} className="btn btn-ghost rounded-xl">
                            View Full Capability List
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {/* Card 1: Physical Damage */}
                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 group border-t-4 border-t-accent bg-surface">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <HardDrive className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-1 rounded-full">URGENT</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Hard Drive Crash</h3>
                            <p className="text-sm text-secondary leading-relaxed mb-4">Clicking, grinding, or not spinning? <strong>Power off immediately.</strong> We perform delicate head swaps in our cleanroom.</p>
                            <ul className="space-y-2">
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Cleanroom Head Swap</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Spindle Motor Repair</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Firmware Repair</li>
                            </ul>
                        </div>

                        {/* Card 2: Logical Errors */}
                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 group border-t-4 border-t-accent-orange bg-surface">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-accent-orange/10 rounded-xl">
                                    <FileWarning className="w-8 h-8 text-accent-orange group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Deleted / Ransomware</h3>
                            <p className="text-sm text-secondary leading-relaxed mb-4">Accidental deletion, formatting, or ransomware encryption? We reconstruct the file system and decrypt your critical files.</p>
                            <ul className="space-y-2">
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Partition Recovery</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> SQL Database Repair</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Crypto-Locker Reversal</li>
                            </ul>
                        </div>

                        {/* Card 3: Enterprise / RAID */}
                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 group border-t-4 border-t-primary bg-surface">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/5 rounded-xl">
                                    <Server className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">BUSINESS</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Server & RAID</h3>
                            <p className="text-sm text-secondary leading-relaxed mb-4">RAID 0, 1, 5, 6, 10 failure? We reconstruct arrays virtually to extract data without risking the original hardware.</p>
                            <ul className="space-y-2">
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Virtual Destriping</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> VMware / Hyper-V Support</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Exchange / SharePoint</li>
                            </ul>
                        </div>

                        {/* Card 4: SSD / Flash */}
                        <div className="glass-card p-8 rounded-3xl hover:-translate-y-2 group border-t-4 border-t-accent bg-surface">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <Cpu className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">SSD & Flash Media</h3>
                            <p className="text-sm text-secondary leading-relaxed mb-4">Controller dead? Device not detected? We use proprietary chip-off technology to read raw memory dumps directly.</p>
                            <ul className="space-y-2">
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> NAND Chip-Off Reads</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> NVMe & M.2 Support</li>
                                <li className="text-xs text-secondary flex items-center gap-2 font-medium"><CheckCircle className="w-3 h-3 text-emerald-500" /> Monolith SD Recovery</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Process - Trust & Transparency */}
            <section id="process" className="py-20 bg-surface border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="text-accent font-bold uppercase tracking-wider text-sm mb-2">Transparent Workflow</div>
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">How We Get Your Data Back</h2>
                        <p className="text-secondary max-w-2xl mx-auto">A simple, secure, and transparent process. You are in control at every step.</p>
                    </div>
                    
                    <div className="relative max-w-6xl mx-auto">
                        {/* Connector Line */}
                        <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent -z-10"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { step: "01", title: "Free Diagnostics", desc: "Send us your device. Our engineers analyze the failure and provide a detailed report—completely free.", icon: FileCheck },
                                { step: "02", title: "Firm Quote", desc: "You receive a fixed price quote and a file list. If you decline, we return your device. No pressure.", icon: FileWarning },
                                { step: "03", title: "Lab Recovery", desc: "We repair the hardware, clone the drive, and extract your data using advanced forensic tools.", icon: Activity },
                                { step: "04", title: "Secure Return", desc: "Your data is encrypted onto a transfer drive and shipped back to you via priority courier.", icon: Lock }
                            ].map((p, i) => (
                                <div key={i} className="bg-surface p-6 md:bg-transparent text-center relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-surface border border-border shadow-xl flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:-translate-y-2 transition-transform duration-300">
                                        <div className="absolute inset-0 bg-accent/5 rounded-2xl transform rotate-3"></div>
                                        <p.icon className="w-10 h-10 text-accent" />
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                                            {p.step}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">{p.title}</h3>
                                    <p className="text-sm text-secondary leading-relaxed">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Lyric Studio Features (New) - Brand Colors Applied */}
            <section id="lyric-studio-features" className="py-24 bg-gradient-to-b from-background to-accent/5 relative overflow-hidden scroll-mt-24">
                <div className="container mx-auto px-4 relative z-10">
                     <div className="text-center mb-20 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span className="text-xs font-bold text-accent uppercase tracking-wider">The Creative Engine</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-primary mb-6">Not Just AI. <span className="text-accent">Cultural Intelligence.</span></h2>
                        <p className="text-lg text-secondary leading-relaxed">
                            Swaz Studio is the only platform powered by the <strong>"Samskara" Engine</strong>—built to understand the deep cultural nuances of rituals, cinema tropes, and human emotion.
                        </p>
                    </div>

                    {/* Feature 1: Samskara & Context */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                         <div className="order-2 lg:order-1">
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-4 mt-8">
                                     <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent/10 hover:-translate-y-1 transition-transform">
                                         <Heart className="w-8 h-8 text-accent mb-4" />
                                         <h4 className="font-bold text-primary">Wedding Rituals</h4>
                                         <p className="text-xs text-secondary mt-2">Context-aware lyrics for Jeelakarra Bellam, Talambralu, & Appagintalu.</p>
                                     </div>
                                     <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent/10 hover:-translate-y-1 transition-transform">
                                         <Music className="w-8 h-8 text-accent-orange mb-4" />
                                         <h4 className="font-bold text-primary">Cinematic Tropes</h4>
                                         <p className="text-xs text-secondary mt-2">Perfectly structured Hero Intros, Item Songs, and 'Love Failure' anthems.</p>
                                     </div>
                                 </div>
                                 <div className="space-y-4">
                                     <div className="bg-surface p-6 rounded-2xl shadow-lg border border-accent/10 hover:-translate-y-1 transition-transform">
                                         <Activity className="w-8 h-8 text-emerald-500 mb-4" />
                                         <h4 className="font-bold text-primary">Life Milestones</h4>
                                         <p className="text-xs text-secondary mt-2">Soulful verses for Sasti Purthi (60th Birthday) and Naming Ceremonies.</p>
                                     </div>
                                     <div className="bg-brand-gradient p-6 rounded-2xl shadow-lg text-white hover:-translate-y-1 transition-transform">
                                         <Sparkles className="w-8 h-8 text-white mb-4" />
                                         <h4 className="font-bold">The Samskara Engine</h4>
                                         <p className="text-xs text-white/80 mt-2">It knows the difference between a party beat and a sacred hymn.</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="order-1 lg:order-2">
                             <h3 className="text-3xl font-bold text-primary mb-4">It Speaks Your Culture.</h3>
                             <p className="text-secondary mb-6 text-lg">
                                 Generic AI hallucinates culture. SWAZ is grounded in a knowledge base of specific traditions. When you ask for a "Sangeet" song, it knows the energy, the instruments, and the family dynamics involved.
                             </p>
                             <ul className="space-y-4">
                                 {[
                                    "Native Script Generation (No transliteration errors)",
                                    "Bhava Vignani: Automated Emotion Analysis",
                                    "Grounded Research for local trends & metaphors"
                                 ].map((item, i) => (
                                     <li key={i} className="flex items-center gap-3">
                                         <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                             <CheckCircle className="w-4 h-4 text-accent" />
                                         </div>
                                         <span className="font-medium text-primary">{item}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>
                    </div>

                    {/* Feature 2: The Agent Workflow */}
                    <div className="mb-24">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-bold text-primary">Multi-Agent Architecture</h3>
                            <p className="text-secondary">Your song is crafted by a team of experts, not a single bot.</p>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-5xl mx-auto relative">
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-accent/20 -z-10"></div>
                            {[
                                { icon: Heart, title: "Emotion Agent", desc: "Analyzes Vibe" },
                                { icon: Search, title: "Research Agent", desc: "Cultural Check" },
                                { icon: Feather, title: "Lyricist Agent", desc: "The Mahakavi" },
                                { icon: Shield, title: "Compliance", desc: "Plagiarism Scan" },
                                { icon: FileCode, title: "Formatter", desc: "Suno Ready" },
                            ].map((step, i) => (
                                <div key={i} className="bg-surface p-6 rounded-2xl shadow-md border border-accent/10 w-full md:w-48 text-center relative hover:-translate-y-1 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 text-accent">
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="font-bold text-sm text-primary">{step.title}</h4>
                                    <p className="text-xs text-secondary mt-1">{step.desc}</p>
                                    {i < 4 && <ArrowRight className="md:hidden w-6 h-6 text-accent/30 mx-auto mt-2 rotate-90" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature 3: Suno & Studio Tools - Updated for Index.css Sync */}
                    <div className="bg-surface rounded-3xl p-8 md:p-16 text-primary relative overflow-hidden shadow-2xl border border-border">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl"></div>
                        <div className="grid md:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <div className="inline-block px-4 py-2 bg-accent/10 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-accent">
                                    Modern Workflow
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-primary">Built for Suno.com & Udio</h3>
                                <p className="text-secondary text-lg mb-8">
                                    We don't just write words; we engineer prompts. Swaz exports lyrics with specific meta-tags like <code className="bg-accent/10 px-1 py-0.5 rounded text-accent">[Verse]</code>, <code className="bg-accent/10 px-1 py-0.5 rounded text-accent">[Chorus]</code>, and <code className="bg-accent/10 px-1 py-0.5 rounded text-accent">[Drop]</code> so you can paste them directly into your favorite music generator.
                                </p>
                                <div className="grid grid-cols-2 gap-6">
                                     <div>
                                         <div className="font-bold text-primary mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /> Style Prompts</div>
                                         <p className="text-sm text-muted">Generates complex descriptors: "Carnatic Dubstep, 140 BPM, Male Vocals"</p>
                                     </div>
                                     <div>
                                         <div className="font-bold text-primary mb-2 flex items-center gap-2"><Wand2 className="w-4 h-4 text-accent-orange" /> Magic Rhymes</div>
                                         <p className="text-sm text-muted">AI phonetics engine instantly fixes weak rhymes (Anthya Prasa).</p>
                                     </div>
                                     <div>
                                         <div className="font-bold text-primary mb-2 flex items-center gap-2"><Palette className="w-4 h-4 text-accent" /> Album Art</div>
                                         <p className="text-sm text-muted">Generates cinematic cover art using Imagen 3 matching the song vibe.</p>
                                     </div>
                                     <div>
                                         <div className="font-bold text-primary mb-2 flex items-center gap-2"><Mic2 className="w-4 h-4 text-accent" /> Rhythmic TTS</div>
                                         <p className="text-sm text-muted">Recites lyrics to help you verify the meter and flow before production.</p>
                                     </div>
                                </div>
                            </div>
                            
                            {/* Dark Theme IDE Mockup - Retaining Dark Look for Code Contrast */}
                            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 font-mono text-sm shadow-2xl text-slate-300">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                                    <div className="w-3 h-3 rounded-full bg-accent-orange"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-slate-500">suno_export.txt</span>
                                </div>
                                <div className="space-y-4 text-slate-300">
                                    <div className="text-accent-orange">// Style Prompt</div>
                                    <div className="bg-slate-900 p-2 rounded text-emerald-400 border border-slate-800">
                                        Cinematic Orchestral, Female Vocals, Melancholic, 90 BPM
                                    </div>
                                    
                                    <div className="text-accent-orange mt-4">// Content</div>
                                    <div>
                                        <span className="text-yellow-400">[Verse 1]</span><br/>
                                        The shadows lengthen on the wall<br/>
                                        I hear your whisper in the hall
                                    </div>
                                    <div>
                                        <span className="text-yellow-400">[Chorus]</span><br/>
                                        Oh, memories fade like morning mist<br/>
                                        A phantom touch, a ghost I kissed
                                    </div>
                                    <div>
                                         <span className="text-yellow-400">[Bridge - Violin Solo]</span><br/>
                                         ...
                                    </div>
                                </div>
                                <div className="mt-6">
                                     <button className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                                         <FileCode className="w-4 h-4" /> Copy to Clipboard
                                     </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Swaz Solutions */}
            <section id="about" className="py-24 bg-surface border-y border-border relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative order-2 lg:order-1">
                            {/* Abstract decorative elements */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-orange/10 rounded-full blur-3xl"></div>
                            
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border/50 group">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-40"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80" 
                                    alt="Swaz Solutions Engineering Team" 
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale hover:grayscale-0"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="flex -space-x-2">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 bg-surface/50 overflow-hidden">
                                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Engineer" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">+40 Experts</span>
                                    </div>
                                    <p className="text-white/90 font-medium text-sm border-l-2 border-accent pl-3">
                                        "We treat every byte of data as if it were our own history."
                                    </p>
                                </div>
                            </div>
                            
                            {/* Floating Badge */}
                            <div className="absolute -right-6 top-10 glass-card p-5 rounded-xl shadow-xl max-w-[200px] hidden md:block animate-slide-up border-l-4 border-l-accent">
                                <div className="text-4xl font-black text-primary mb-1">12+</div>
                                <div className="text-xs text-secondary font-bold uppercase tracking-wide">Years of Excellence</div>
                            </div>
                        </div>
                        
                        <div className="order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 mb-6">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span className="text-xs font-bold text-accent uppercase tracking-wider">Our Mission</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 leading-tight">
                                Restoring the Past.<br />
                                <span className="text-transparent bg-clip-text bg-brand-gradient">Powering the Future.</span>
                            </h2>
                            <p className="text-lg text-secondary mb-6 leading-relaxed">
                                Founded by a coalition of forensic data engineers and AI researchers, Swaz Solutions was built on a single premise: <strong>Technology should serve humanity's most critical needs.</strong>
                            </p>
                            <p className="text-secondary mb-8 leading-relaxed">
                                We operate at the intersection of hardware precision and software intelligence. Whether it's a RAID array holding a decade of corporate history or a creator looking for the perfect culturally-aware lyric, we bring enterprise-grade rigor to every challenge.
                            </p>
                            
                            <div className="space-y-5 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-1 bg-accent/10 rounded-full text-accent shadow-sm">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary">Research First Approach</h4>
                                        <p className="text-sm text-secondary mt-1">We invest 30% of revenue back into R&D, developing proprietary head-swap tools and fine-tuning our Large Language Models.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-1 bg-accent-orange/10 rounded-full text-accent-orange shadow-sm">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-primary">Global Security Standards</h4>
                                        <p className="text-sm text-secondary mt-1">Operating from ISO 27001 certified Cleanroom facilities, ensuring your data remains strictly confidential.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form - High Urgency & Conversion */}
            <section id="contact" className="py-20 bg-surface">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="glass-card p-8 md:p-12 rounded-3xl shadow-2xl border-border bg-background/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-brand-gradient"></div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-primary mb-2">Open Priority Ticket</h2>
                                <p className="text-secondary">Start your free evaluation today. <strong>15 min</strong> average response time for emergency cases.</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 text-accent rounded-lg border border-accent/20 animate-pulse shadow-sm">
                                <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>
                                <span className="text-xs font-bold uppercase">Lab Engineers Online</span>
                            </div>
                        </div>

                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            {/* Emergency Toggle */}
                            <div 
                                onClick={() => setEmergencyMode(!emergencyMode)}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${emergencyMode ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${emergencyMode ? 'border-accent bg-accent' : 'border-muted'}`}>
                                        {emergencyMode && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                        <span className={`font-bold block ${emergencyMode ? 'text-accent-hover' : 'text-primary'}`}>This is an Emergency Case</span>
                                        <span className="text-xs text-secondary">I need 24/7 immediate attention (Weekends/Holidays included).</span>
                                    </div>
                                </div>
                                <Zap className={`w-6 h-6 ${emergencyMode ? 'text-accent' : 'text-muted'}`} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Your Name</label>
                                    <input type="text" className="input rounded-xl" placeholder="John Doe" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Email Address</label>
                                    <input type="email" className="input rounded-xl" placeholder="john@company.com" required />
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Phone Number</label>
                                    <input type="tel" className="input rounded-xl" placeholder="(555) 000-0000" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Device Type</label>
                                    <select className="input rounded-xl">
                                        <option>Laptop / Desktop Drive</option>
                                        <option>External Hard Drive</option>
                                        <option>SSD (Solid State)</option>
                                        <option>RAID Array / Server</option>
                                        <option>Flash Drive / SD Card</option>
                                        <option>MacBook / iMac</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">What Happened? (Symptoms)</label>
                                <textarea rows={3} className="input rounded-xl" placeholder="e.g. Dropped drive, clicking noise, water damage, deleted files..." required></textarea>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl">
                                <input type="checkbox" id="consent" className="mt-1 w-4 h-4 text-accent focus:ring-accent rounded border-gray-300" required />
                                <label htmlFor="consent" className="text-sm text-secondary cursor-pointer">
                                    I agree to the <span className="text-accent font-medium">No Data, No Charge</span> policy. I understand the initial evaluation is 100% free and risk-free.
                                </label>
                            </div>

                            <button className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-lg ${emergencyMode ? 'bg-accent hover:bg-accent-hover shadow-accent/20' : 'btn-primary'}`}>
                                <Activity className="w-5 h-5" /> {emergencyMode ? 'Start EMERGENCY Recovery' : 'Start Free Evaluation'}
                            </button>
                            <p className="text-center text-xs text-muted flex justify-center items-center gap-4">
                                <span><Lock className="w-3 h-3 inline" /> 256-bit Encryption</span>
                                <span><Shield className="w-3 h-3 inline" /> HIPAA Compliant</span>
                            </p>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
};