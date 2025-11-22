
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Music, Database, Sparkles, ChevronRight, Search, Book, Zap, Globe, Shield, Clock, Phone, Mail, CheckCircle, FileText, Play, Download, Settings, Lock } from 'lucide-react';
import { Schema } from '../components/Schema';

export const HelpPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const helpFAQSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'How do I use the Lyric Studio?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Navigate to the Lyric Studio page, describe your song requirements in Telugu, Hindi, English or other supported languages, and our AI will generate culturally-aware lyrics with proper structure and meta-tags ready for Suno.com or Udio.'
                }
            },
            {
                '@type': 'Question',
                name: 'What data recovery services do you offer?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'We provide professional data recovery for hard drives, SSDs, RAID arrays, flash media, and NVMe drives. Services include mechanical repairs, logical recovery, ransomware reversal, and emergency 24/7 recovery.'
                }
            },
            {
                '@type': 'Question',
                name: 'Is the data recovery evaluation really free?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, absolutely. We provide a free diagnostic evaluation within 4-6 hours.'
                }
            },
            {
                '@type': 'Question',
                name: 'What languages does Lyric Studio support?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Lyric Studio supports 15+ languages including Telugu, Hindi, Tamil, Kannada, Malayalam, English, and more. Our Samskara Engine understands cultural context in each language.'
                }
            }
        ]
    };

    return (
        <>
            <Schema type="FAQPage" data={helpFAQSchema} />

            <main className="min-h-screen bg-background pt-20 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-4 mb-20">
                    <div className="max-w-4xl mx-auto text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 mb-6">
                            <HelpCircle className="w-4 h-4 text-accent" />
                            <span className="text-xs font-bold text-accent uppercase tracking-wider">Help Center</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
                            How Can We <span className="bg-brand-gradient bg-clip-text text-transparent">Help You?</span>
                        </h1>
                        <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed mb-8">
                            Find answers about our AI-powered Lyric Studio and professional Data Recovery Services.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto mb-12">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                            <input
                                type="text"
                                placeholder="Search for help articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input rounded-2xl pl-12 pr-4 py-4 w-full text-lg shadow-lg"
                            />
                        </div>

                        {/* Quick Links */}
                        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                            <button
                                onClick={() => document.getElementById('lyric-studio')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all border border-border hover:border-accent/30 group cursor-pointer"
                            >
                                <Music className="w-8 h-8 text-accent mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-primary mb-2">Lyric Studio Guide</h3>
                                <p className="text-sm text-secondary">Learn how to create amazing lyrics with AI</p>
                            </button>
                            <button
                                onClick={() => document.getElementById('data-recovery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-all border border-border hover:border-accent/30 group cursor-pointer"
                            >
                                <Database className="w-8 h-8 text-accent-orange mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-primary mb-2">Data Recovery Services</h3>
                                <p className="text-sm text-secondary">Professional data recovery information</p>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Lyric Studio Guide Section */}
                <section id="lyric-studio" className="py-20 bg-surface border-y border-border scroll-mt-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center gap-3 mb-12">
                                <div className="p-3 bg-accent/10 rounded-xl">
                                    <Music className="w-8 h-8 text-accent" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-primary">Lyric Studio Guide</h2>
                                    <p className="text-secondary">Master the art of AI-powered songwriting</p>
                                </div>
                            </div>

                            {/* Setup & Configuration */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-gradient-to-br from-accent/5 to-accent-orange/5 border-accent/20">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                        <Settings className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-primary mb-4">Setup & Configuration</h3>
                                        <p className="text-secondary mb-6">
                                            Before you start creating lyrics, you'll need to set up your Google Gemini API key. Follow these simple steps:
                                        </p>

                                        <div className="bg-background/80 rounded-2xl p-6 mb-6">
                                            <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">1</span>
                                                Get Your Gemini API Key
                                            </h4>
                                            <ol className="space-y-3 ml-8">
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm text-primary font-medium">Visit Google AI Studio</p>
                                                        <a
                                                            href="https://aistudio.google.com/app/apikey"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-accent hover:underline inline-flex items-center gap-1 mt-1"
                                                        >
                                                            https://aistudio.google.com/app/apikey
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Sign in with your Google account</p>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Click "Create API Key" button</p>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Select an existing Google Cloud project or create a new one</p>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Copy your API key (keep it secure!)</p>
                                                </li>
                                            </ol>
                                        </div>

                                        <div className="bg-background/80 rounded-2xl p-6 mb-6">
                                            <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">2</span>
                                                Configure Lyric Studio
                                            </h4>
                                            <ol className="space-y-3 ml-8">
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Open the Lyric Studio settings (gear icon in the sidebar)</p>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Paste your Gemini API key in the configuration field</p>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-secondary">Save your settings</p>
                                                </li>
                                            </ol>
                                        </div>

                                        <div className="bg-background/80 rounded-2xl p-6">
                                            <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs">3</span>
                                                Create Music with Suno.com
                                            </h4>
                                            <p className="text-sm text-secondary mb-3 ml-8">
                                                Once you've generated lyrics, export them to Suno.com to create full music tracks:
                                            </p>
                                            <div className="ml-8">
                                                <a
                                                    href="https://suno.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors shadow-lg"
                                                >
                                                    <Music className="w-5 h-5" />
                                                    Visit Suno.com
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>

                                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 mt-6">
                                            <p className="text-sm text-primary flex items-start gap-2">
                                                <Lock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                <span><strong className="text-accent">Security Note:</strong> Your API key is stored locally in your browser and never sent to our servers. Keep it confidential and don't share it with others.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Getting Started */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-background/50">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Play className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary mb-4">Getting Started</h3>
                                        <ol className="space-y-4">
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                                <div>
                                                    <p className="font-semibold text-primary">Navigate to Lyric Studio</p>
                                                    <p className="text-sm text-secondary mt-1">Click "Lyric Studio" in the header or visit <Link to="/studio" className="text-accent hover:underline">/studio</Link></p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                                <div>
                                                    <p className="font-semibold text-primary">Describe Your Song</p>
                                                    <p className="text-sm text-secondary mt-1">Tell our AI what kind of song you want in natural language. Be as specific or creative as you like!</p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                                <div>
                                                    <p className="font-semibold text-primary">Generate & Refine</p>
                                                    <p className="text-sm text-secondary mt-1">Review the generated lyrics, make adjustments, and regenerate sections as needed</p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                                <div>
                                                    <p className="font-semibold text-primary">Export to Suno/Udio</p>
                                                    <p className="text-sm text-secondary mt-1">Copy the formatted lyrics with meta-tags directly to <a href="https://suno.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Suno.com</a> or Udio</p>
                                                </div>
                                            </li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            {/* Language Options */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-background/50">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                                        <Globe className="w-5 h-5 text-accent-orange" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-primary mb-4">Language Support</h3>
                                        <p className="text-secondary mb-4">
                                            Lyric Studio supports <strong>15+ languages</strong> with native script generation and cultural context understanding:
                                        </p>
                                        <div className="grid md:grid-cols-3 gap-3 mb-6">
                                            {['Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'English', 'Marathi', 'Bengali', 'Punjabi', 'Gujarati', 'Urdu', 'Sanskrit'].map((lang, i) => (
                                                <div key={i} className="flex items-center gap-2 p-3 bg-surface rounded-xl">
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-sm font-medium text-primary">{lang}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                                            <p className="text-sm text-primary">
                                                <strong className="text-accent">Pro Tip:</strong> Use the language sidebar to set primary, secondary, and tertiary languages. Telugu is set as default.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Music Styles & Meta-tags */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-background/50">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-primary mb-4">Understanding Music Styles & Meta-tags</h3>
                                        <p className="text-secondary mb-6">
                                            Our AI automatically generates proper structure tags for Suno.com and Udio:
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-bold text-primary mb-3">Structure Tags</h4>
                                                <ul className="space-y-2">
                                                    {['[Verse]', '[Chorus]', '[Bridge]', '[Intro]', '[Outro]', '[Drop]', '[Instrumental]'].map((tag, i) => (
                                                        <li key={i} className="flex items-center gap-2">
                                                            <code className="bg-primary/80 text-white px-2 py-1 rounded text-xs font-mono">{tag}</code>
                                                            <span className="text-sm text-secondary">Auto-generated</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary mb-3">Audio Quality Tags</h4>
                                                <p className="text-sm text-secondary mb-3">Default high-quality tags applied:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Deep Bass', 'Dolby Atmos', 'Hi-Fi', 'Studio Quality', '320kbps'].map((tag, i) => (
                                                        <span key={i} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Samskara Engine */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-gradient-to-br from-accent/5 to-accent-orange/5 border-accent/20">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-primary mb-4">The Samskara Engine</h3>
                                        <p className="text-secondary mb-4">
                                            Unlike generic AI, our <strong className="text-accent">Samskara Engine</strong> understands deep cultural context:
                                        </p>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-primary">Cultural Context Analysis</p>
                                                    <p className="text-sm text-secondary">Knows the difference between a Sangeet celebration and a sacred ritual</p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-primary">Emotional Intelligence (Bhava Vignani)</p>
                                                    <p className="text-sm text-secondary">Injects appropriate Navarasa (9 emotions) based on context</p>
                                                </div>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-primary">Cinematic Trope Understanding</p>
                                                    <p className="text-sm text-secondary">Perfect for Hero Intros, Item Songs, and Mass Beats</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Tips for Best Results */}
                            <div className="glass-card p-8 rounded-3xl bg-background/50">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Book className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-primary mb-4">Tips for Best Results</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {[
                                                { tip: 'Be Specific', desc: 'Mention the occasion, mood, and target audience' },
                                                { tip: 'Provide Context', desc: 'Include cultural references, rituals, or movie scenarios' },
                                                { tip: 'Set Language Preferences', desc: 'Use the sidebar to choose primary and secondary languages' },
                                                { tip: 'Iterate & Refine', desc: 'Regenerate sections until you get the perfect fit' },
                                                { tip: 'Review Meta-tags', desc: 'Ensure style prompts align with your vision' },
                                                { tip: 'Save Regularly', desc: 'Your lyrics are automatically saved to the library' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-start gap-3 p-4 bg-surface rounded-xl">
                                                    <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-bold text-primary">{item.tip}</p>
                                                        <p className="text-sm text-secondary mt-1">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Recovery Services Section */}
                <section id="data-recovery" className="py-20 bg-background scroll-mt-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center gap-3 mb-12">
                                <div className="p-3 bg-accent-orange/10 rounded-xl">
                                    <Database className="w-8 h-8 text-accent-orange" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-primary">Data Recovery Services</h2>
                                    <p className="text-secondary">Professional recovery solutions for critical data loss</p>
                                </div>
                            </div>

                            {/* What We Recover */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-surface/50">
                                <h3 className="text-2xl font-bold text-primary mb-6">What We Recover</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[
                                        { icon: Database, title: 'Hard Drives (HDD)', desc: 'Mechanical failures, head crashes, spindle motor issues, firmware corruption' },
                                        { icon: Zap, title: 'Solid State Drives (SSD)', desc: 'Controller failures, NAND chip-off reads, NVMe & M.2 drives' },
                                        { icon: Shield, title: 'RAID Arrays & Servers', desc: 'RAID 0, 1, 5, 6, 10 reconstruction, VMware, Hyper-V, Exchange' },
                                        { icon: Database, title: 'Flash Media', desc: 'SD cards, USB drives, memory cards, monolith chip recovery' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-6 bg-background rounded-2xl border border-border hover:border-accent/30 transition-colors">
                                            <div className="p-3 bg-accent/10 rounded-xl flex-shrink-0">
                                                <item.icon className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-primary mb-2">{item.title}</h4>
                                                <p className="text-sm text-secondary">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* The Recovery Process */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-surface/50">
                                <h3 className="text-2xl font-bold text-primary mb-6">The Recovery Process</h3>
                                <div className="grid md:grid-cols-4 gap-6">
                                    {[
                                        { step: '1', title: 'Free Diagnostics', desc: 'Send us your device. We analyze and provide detailed report—completely free.', icon: FileText },
                                        { step: '2', title: 'Firm Quote', desc: 'Receive fixed price quote and file list. Decline anytime with no charge.', icon: CheckCircle },
                                        { step: '3', title: 'Lab Recovery', desc: 'We repair hardware and extract data using advanced forensic tools.', icon: Settings },
                                        { step: '4', title: 'Secure Return', desc: 'Data encrypted onto transfer drive and shipped via priority courier.', icon: Lock }
                                    ].map((item, i) => (
                                        <div key={i} className="text-center">
                                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 relative">
                                                <item.icon className="w-8 h-8 text-accent" />
                                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                                                    {item.step}
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-primary mb-2">{item.title}</h4>
                                            <p className="text-sm text-secondary">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>



                            {/* Emergency Services */}
                            <div className="glass-card p-8 rounded-3xl mb-8 bg-surface/50">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-primary mb-4">24/7 Emergency Services</h3>
                                        <p className="text-secondary mb-6">
                                            Critical business data loss? Our emergency engineers work around the clock to minimize downtime.
                                        </p>
                                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div>
                                                    <p className="font-bold text-primary mb-1">Emergency Hotline</p>
                                                    <p className="text-sm text-secondary">Available 24/7/365 - Weekends & Holidays</p>
                                                </div>
                                                <a href="tel:+919701087446" className="btn btn-primary px-6 py-3 rounded-xl">
                                                    <Phone className="w-5 h-5" />
                                                    +91-9701087446
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preparing Your Device */}
                            <div className="glass-card p-8 rounded-3xl bg-background/50">
                                <h3 className="text-2xl font-bold text-primary mb-6">Preparing Your Device</h3>
                                <div className="space-y-4">
                                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
                                        <p className="text-sm font-bold text-accent mb-2">⚠️ IMPORTANT: If you hear clicking or grinding sounds</p>
                                        <p className="text-sm text-secondary">Power off the device immediately. Continued use can cause permanent damage.</p>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {[
                                            'Do not attempt DIY recovery software on physically damaged drives',
                                            'Keep the device in a safe, dry place',
                                            'Do not open the drive or expose it to dust',
                                            'Note any symptoms: clicking, beeping, not detected',
                                            'Document what happened: drop, water damage, power surge',
                                            'Contact us for shipping instructions and free evaluation'
                                        ].map((tip, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-secondary">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* General Help & FAQs */}
                <section id="general-help" className="py-20 bg-surface border-t border-border">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">General Help & FAQs</h2>
                                <p className="text-secondary">Additional information and common questions</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-12">
                                {/* Privacy & Security */}
                                <div className="glass-card p-8 rounded-3xl bg-background/50">
                                    <Lock className="w-10 h-10 text-accent mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-3">Privacy & Security</h3>
                                    <p className="text-sm text-secondary mb-4">
                                        Your data is protected with enterprise-grade security:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            256-bit encryption for all communications
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            HIPAA & GDPR compliant
                                        </li>

                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Biometric access control
                                        </li>
                                    </ul>
                                </div>

                                {/* Browser Compatibility */}
                                <div className="glass-card p-8 rounded-3xl bg-background/50">
                                    <Globe className="w-10 h-10 text-accent-orange mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-3">Browser Compatibility</h3>
                                    <p className="text-sm text-secondary mb-4">
                                        Swaz Solutions works best on modern browsers:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Chrome 90+ (Recommended)
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Firefox 88+
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Safari 14+ (macOS/iOS)
                                        </li>
                                        <li className="flex items-center gap-2 text-sm text-secondary">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            Edge 90+
                                        </li>
                                    </ul>
                                </div>

                                {/* Keyboard Shortcuts */}
                                <div className="glass-card p-8 rounded-3xl bg-background/50">
                                    <Zap className="w-10 h-10 text-accent mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-3">Keyboard Shortcuts</h3>
                                    <p className="text-sm text-secondary mb-4">Work faster with these shortcuts:</p>
                                    <div className="space-y-2">
                                        {[
                                            { keys: 'Ctrl/Cmd + K', action: 'Focus search' },
                                            { keys: 'Ctrl/Cmd + Enter', action: 'Generate lyrics' },
                                            { keys: 'Ctrl/Cmd + S', action: 'Save to library' },
                                            { keys: 'Esc', action: 'Close modals' }
                                        ].map((shortcut, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <code className="bg-surface px-2 py-1 rounded text-xs font-mono text-primary">{shortcut.keys}</code>
                                                <span className="text-sm text-secondary">{shortcut.action}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="glass-card p-8 rounded-3xl bg-background/50">
                                    <Phone className="w-10 h-10 text-accent-orange mb-4" />
                                    <h3 className="text-xl font-bold text-primary mb-3">Still Need Help?</h3>
                                    <p className="text-sm text-secondary mb-4">
                                        Our support team is here to assist you:
                                    </p>
                                    <div className="space-y-3">
                                        <a href="tel:+919701087446" className="flex items-center gap-3 p-3 bg-surface rounded-xl hover:bg-accent/5 transition-colors">
                                            <Phone className="w-5 h-5 text-accent" />
                                            <div>
                                                <p className="font-semibold text-primary text-sm">Phone Support</p>
                                                <p className="text-xs text-secondary">+91-9701087446</p>
                                            </div>
                                        </a>
                                        <a href="mailto:support@swazsolutions.com" className="flex items-center gap-3 p-3 bg-surface rounded-xl hover:bg-accent/5 transition-colors">
                                            <Mail className="w-5 h-5 text-accent" />
                                            <div>
                                                <p className="font-semibold text-primary text-sm">Email Support</p>
                                                <p className="text-xs text-secondary">support@swazsolutions.com</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Section */}
                            <div className="bg-brand-gradient rounded-3xl p-8 md:p-12 text-white text-center">
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h3>
                                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                                    Whether you need to create amazing lyrics or recover critical data, we're here to help.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link to="/studio" className="btn bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-xl shadow-xl inline-flex items-center justify-center gap-2">
                                        <Music className="w-5 h-5" />
                                        Try Lyric Studio
                                    </Link>
                                    <button
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="btn bg-white/10 text-white hover:bg-white/20 border-2 border-white/30 px-8 py-3 rounded-xl inline-flex items-center justify-center gap-2"
                                    >
                                        <Database className="w-5 h-5" />
                                        Get Data Recovery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};
