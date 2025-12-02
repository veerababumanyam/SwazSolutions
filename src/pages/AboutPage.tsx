
import React from 'react';
import { Shield, Users, Globe, Award, Clock, HardDrive, Brain, ChevronRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
    return (
        <main className="min-h-screen bg-background pt-20 pb-20">
            {/* Hero Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 mb-6">
                        <Shield className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Since 2012</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
                        Restoring the Past.<br />
                        <span className="bg-brand-gradient bg-clip-text text-transparent">Powering the Future.</span>
                    </h1>
                    <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
                        We are a hybrid engineering firm operating at the intersection of forensic hardware recovery and Generative AI innovation.
                    </p>
                </div>
            </section>

            {/* Mission Grid */}
            <section className="container mx-auto px-4 mb-24">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <div className="glass-card p-10 rounded-3xl bg-surface/50 border border-border relative overflow-hidden group hover:border-accent/30 transition-colors">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <HardDrive className="w-12 h-12 text-accent mb-6" />
                        <h3 className="text-2xl font-bold text-primary mb-4">The Hardware Legacy</h3>
                        <p className="text-secondary leading-relaxed mb-6">
                            Swaz Solutions began as a specialized cleanroom facility for enterprise data recovery. We built our reputation recovering mission-critical data from physically damaged RAID arrays and server infrastructures when others failed.
                        </p>
                        <ul className="space-y-3">

                            <li className="flex items-center gap-3 text-sm text-primary font-medium">
                                <div className="w-2 h-2 rounded-full bg-accent"></div> Class 100 Cleanroom
                            </li>
                        </ul>
                    </div>

                    <div className="glass-card p-10 rounded-3xl bg-surface/50 border border-border relative overflow-hidden group hover:border-accent-orange/30 transition-colors">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-orange/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <Brain className="w-12 h-12 text-accent-orange mb-6" />
                        <h3 className="text-2xl font-bold text-primary mb-4">The AI Evolution</h3>
                        <p className="text-secondary leading-relaxed mb-6">
                            In 2023, we applied our deep engineering discipline to Large Language Models. The result was the <span className="font-bold text-primary">Samskara Engine</span>—an AI architecture designed to understand cultural nuance, not just translate text.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm text-primary font-medium">
                                <div className="w-2 h-2 rounded-full bg-accent-orange"></div> Cultural Context Analysis
                            </li>
                            <li className="flex items-center gap-3 text-sm text-primary font-medium">
                                <div className="w-2 h-2 rounded-full bg-accent-orange"></div> Multi-Agent Reasoning
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* History Timeline */}
            <section className="py-20 bg-surface border-y border-border mb-24">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-primary mb-4">Our Journey</h2>
                        <p className="text-secondary">From a garage lab to a global AI innovator.</p>
                    </div>

                    <div className="space-y-12 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border md:left-1/2 md:-ml-[1px]"></div>

                        {[
                            { year: "2012", title: "The Beginning", desc: "Founded as 'Swaz Recovery' in San Francisco, focusing on mechanical HDD repairs." },
                            { year: "2015", title: "Enterprise Expansion", desc: "Opened first certified cleanroom facility. Secured contracts with Fortune 500 tech firms." },
                            { year: "2019", title: "Forensic Security", desc: "Expanded into digital forensics and ransomware reversal services for legal and healthcare sectors." },
                            { year: "2023", title: "Project Samskara", desc: "Internal R&D team develops the 'Samskara' context engine to solve cultural hallucinations in LLMs." },
                            { year: "2025", title: "Swaz Solutions 2.0", desc: "Rebranded to integrate Data Recovery services with the public launch of our Lyric Studio AI." }
                        ].map((milestone, i) => (
                            <div key={i} className={`flex flex-col md:flex-row gap-8 relative ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="md:w-1/2"></div>
                                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-4 border-background bg-accent text-white flex items-center justify-center font-bold text-[10px] z-10 shadow-md">
                                    {milestone.year}
                                </div>
                                <div className={`md:w-1/2 pl-12 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                                    <div className="bg-background p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                        <h3 className="font-bold text-lg text-primary mb-2">{milestone.title}</h3>
                                        <p className="text-sm text-secondary leading-relaxed">{milestone.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="container mx-auto px-4 mb-24">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-primary mb-4">Meet the Leadership</h2>
                        <p className="text-secondary">A fusion of Hardware Engineers, Linguists, and AI Researchers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Dr. Aristha", role: "Chief Engineer", img: "https://i.pravatar.cc/150?img=11" },
                            { name: "Sarah Chen", role: "Head of AI Research", img: "https://i.pravatar.cc/150?img=5" },
                            { name: "Marcus V.", role: "Director of Operations", img: "https://i.pravatar.cc/150?img=3" },
                            { name: "Priya R.", role: "Cultural Linguist", img: "https://i.pravatar.cc/150?img=9" }
                        ].map((member, i) => (
                            <div key={i} className="glass-card p-6 rounded-2xl text-center hover:-translate-y-2 transition-transform">
                                <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden border-2 border-accent/20">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-lg text-primary">{member.name}</h3>
                                <p className="text-xs font-bold text-accent uppercase tracking-wider mt-1">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values / Stats */}
            <section className="container mx-auto px-4 mb-12">
                <div className="bg-brand-gradient rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
                        {[
                            { icon: Users, label: "Clients Served", val: "15k+" },
                            { icon: Globe, label: "Countries", val: "42" },
                            { icon: Award, label: "Patents Held", val: "07" },
                            { icon: Clock, label: "Uptime", val: "99.9%" }
                        ].map((stat, i) => (
                            <div key={i}>
                                <stat.icon className="w-8 h-8 mx-auto mb-4 opacity-80" />
                                <div className="text-4xl font-black mb-2">{stat.val}</div>
                                <div className="text-xs font-bold uppercase opacity-70">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};
