import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    HardDrive,
    Shield,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Phone,
    Mail,
    ChevronRight,
    Wrench,
    Database,
    Zap,
    Lock,
    TrendingUp,
    Award,
    FileText,
    Server,
    Disc,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import { Schema } from '../../components/Schema';

interface FAQItemProps {
    question: string;
    answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-surface/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-surface/50 transition-colors"
            >
                <span className="font-semibold text-primary pr-4">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="px-6 pb-5 pt-2 text-secondary leading-relaxed border-t border-border/50">
                    {answer}
                </div>
            )}
        </div>
    );
};

export const HardDriveRecovery: React.FC = () => {
    const hardDriveFAQs: FAQItemProps[] = [
        {
            question: "Why is my hard drive making clicking or beeping sounds?",
            answer: "Clicking sounds (often called the 'click of death') indicate mechanical read/write head failure. The heads are stuck or damaged and repeatedly attempting to read data from the platters. Beeping sounds typically mean the motor spindle has seized or the heads are parked incorrectly. Both situations require immediate shutdown to prevent permanent platter damage. Our cleanroom technicians can replace failed heads and recover your data in 85-95% of cases when drives are powered off quickly."
        },
        {
            question: "What's the difference between mechanical and logical hard drive failure?",
            answer: "Mechanical failures involve physical component damage: failed read/write heads, seized motors, damaged platters, or circuit board failures. These require cleanroom repairs and cannot be fixed with software. Logical failures are software-based: corrupted file systems, deleted partitions, formatted drives, or virus damage. Logical recovery is faster (1-3 days) and less expensive (₹8,000-₹15,000) than mechanical recovery (3-7 days, ₹18,000-₹45,000). Our free diagnostic identifies the exact failure type within 4-6 hours."
        },
        {
            question: "How much does hard drive data recovery cost?",
            answer: "Pricing depends on failure type and complexity. Simple logical recovery (accidentally deleted files, formatted drives) starts at ₹8,000. Mechanical failures requiring cleanroom work range from ₹18,000 for circuit board replacement to ₹45,000 for multi-platter head swaps. Firmware corruption recovery costs ₹25,000-₹35,000. High-capacity drives (8TB+) and enterprise models may incur 20-30% surcharges due to specialized parts. We provide exact pricing after our free diagnostic evaluation. No recovery = no fee guarantee applies to all cases."
        },
        {
            question: "How long does hard drive recovery take?",
            answer: "Standard turnaround is 3-5 business days after approval for logical recovery, 5-7 days for mechanical failures. Emergency 24-hour service is available for critical business data at 2x standard pricing. Complex cases involving severe platter damage or multi-drive RAID failures may require 7-10 days. Our free diagnostic is completed within 4-6 hours of receiving your drive, giving you a detailed timeline and success probability before any work begins."
        },
        {
            question: "Can you recover data from a water-damaged or fire-damaged hard drive?",
            answer: "Yes, in most cases. Water damage requires immediate professional treatment. Do NOT power on wet drives or attempt to dry them yourself. We disassemble drives in our cleanroom, clean platters with specialized solutions, and transplant them to new mechanisms. Fire-damaged drives are more challenging but recoverable if platters aren't warped beyond tolerance (±0.1mm). We've successfully recovered data from drives submerged for weeks and drives exposed to 300°C+ heat. Success rates: water damage 75-85%, fire damage 50-70% depending on exposure duration."
        },
        {
            question: "Should I try freezer tricks or DIY data recovery software?",
            answer: "Absolutely not for mechanical failures. The 'freezer trick' temporarily contracts metal components but causes condensation that accelerates platter corrosion. Every power-on attempt of a mechanically failed drive risks permanent damage. DIY software is safe ONLY for logical failures (accidental deletion, formatting) on drives that spin up normally. If you hear clicking, grinding, or beeping, power off immediately and contact professionals. Attempting DIY recovery on mechanical failures reduces our success rate from 90% to 50-60%."
        },
        {
            question: "What's your success rate for hard drive recovery?",
            answer: "Our overall hard drive recovery success rate is 92% across all failure types. Breakdown by category: Logical failures (deleted files, formatting): 98% success. Mechanical failures (head crashes, motor seizure): 88% success. Firmware corruption: 85% success. Severe physical damage (fire, flood, multi-platter crashes): 65% success. These rates assume the drive is powered off promptly after failure and not tampered with. Drives that have been opened outside a cleanroom or subjected to repeated power-on attempts see success rates drop to 40-60%."
        }
    ];

    const hardDriveFAQSchema = {
        mainEntity: hardDriveFAQs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
            }
        }))
    };

    const hardDriveServiceSchema = {
        '@type': 'Service',
        name: 'Hard Drive Data Recovery Services',
        description: 'Professional hard drive data recovery for mechanical failures, logical corruption, and firmware issues. 92% success rate with Class 100 cleanroom facility in Hyderabad.',
        provider: {
            '@type': 'LocalBusiness',
            name: 'Swaz Solutions',
            telephone: '+91-9701087446',
            email: 'support@swazsolutions.com',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Hyderabad',
                addressRegion: 'Telangana',
                addressCountry: 'IN'
            }
        },
        areaServed: {
            '@type': 'Country',
            name: 'India'
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Hard Drive Recovery Services',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Mechanical Hard Drive Recovery',
                        description: 'Cleanroom head swaps, platter repairs, motor replacement for clicking or seized drives'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Logical Hard Drive Recovery',
                        description: 'File system repair, partition recovery, formatted drive restoration'
                    }
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Service',
                        name: 'Firmware Corruption Recovery',
                        description: 'Service area repair, translator corruption, and bad sector management'
                    }
                }
            ]
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '284',
            bestRating: '5',
            worstRating: '1'
        }
    };

    return (
        <>
            <Helmet>
                <title>Hard Drive Data Recovery Services - 92% Success Rate | Swaz Solutions</title>
                <meta
                    name="description"
                    content="Professional hard drive recovery for clicking drives, head crashes, motor failures. Class 100 cleanroom facility. Free diagnostics in 4-6 hours. Call +91-9701087446"
                />
                <meta
                    name="keywords"
                    content="hard drive recovery, HDD recovery, clicking hard drive, mechanical failure, head crash, cleanroom recovery, data recovery Hyderabad"
                />
                <link rel="canonical" href="https://swazdatarecovery.com/services/hard-drive-recovery" />

                {/* Open Graph */}
                <meta property="og:title" content="Hard Drive Data Recovery - Mechanical & Logical Failures" />
                <meta property="og:description" content="92% success rate for clicking drives, head crashes, and firmware issues. Class 100 cleanroom facility in Hyderabad." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://swazdatarecovery.com/services/hard-drive-recovery" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Hard Drive Data Recovery Services - Swaz Solutions" />
                <meta name="twitter:description" content="Professional cleanroom recovery for mechanical failures. Free diagnostics, 92% success rate." />
            </Helmet>

            <Schema type="FAQPage" data={hardDriveFAQSchema} />
            <Schema type="LocalBusiness" data={hardDriveServiceSchema} />

            <main className="min-h-screen bg-background">
                {/* Hero Section with Answer-First Block */}
                <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
                    <div className="absolute inset-0 hero-gradient opacity-10"></div>
                    <div className="container relative z-10 mx-auto px-4">
                        <div className="max-w-5xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-sm text-secondary mb-8">
                                <a href="/#/" className="hover:text-accent transition-colors">Home</a>
                                <ChevronRight className="w-4 h-4" />
                                <a href="/#/services" className="hover:text-accent transition-colors">Services</a>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-primary font-medium">Hard Drive Recovery</span>
                            </nav>

                            {/* Hero Content */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/20 mb-6">
                                    <HardDrive className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent uppercase tracking-wider">Class 100 Cleanroom Facility</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 leading-tight">
                                    Hard Drive Data Recovery Services
                                </h1>
                                <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto leading-relaxed">
                                    Professional mechanical and logical hard drive recovery with 92% success rate. Clicking drives, head crashes, and firmware corruption recovered in our certified cleanroom.
                                </p>
                            </div>

                            {/* Answer-First Block */}
                            <div className="glass-card bg-gradient-to-br from-accent/5 to-accent-orange/5 border-2 border-accent/20 rounded-2xl p-8 md:p-10 mb-12">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                                            What is Hard Drive Data Recovery?
                                        </h2>
                                        <div className="text-secondary leading-relaxed space-y-4">
                                            <p>
                                                Hard drive data recovery is the specialized process of retrieving inaccessible data from failed or damaged hard disk drives (HDDs). Unlike solid-state drives, traditional hard drives contain delicate mechanical components—spinning magnetic platters, precision read/write heads floating microns above the surface, and servo motors—all of which are vulnerable to physical failure.
                                            </p>
                                            <p>
                                                When a hard drive fails, it's often catastrophic: clicking sounds indicate head crashes, beeping signals motor seizure, and complete silence suggests circuit board failure. These aren't issues you can fix with software. Professional recovery requires opening the drive in a Class 100 cleanroom environment where a single dust particle could destroy the platters, replacing damaged heads with donor parts, and using proprietary tools to extract data directly from the magnetic surfaces.
                                            </p>
                                            <p>
                                                At Swaz Solutions, we've invested in enterprise-grade cleanroom infrastructure and maintain an extensive donor drive inventory covering 1,200+ hard drive models from Western Digital, Seagate, Toshiba, and HGST. Our 92% success rate across mechanical failures stems from treating each recovery as a precision engineering challenge, not a commodity service.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-accent/10">
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-accent mb-1">92%</div>
                                        <div className="text-xs text-secondary uppercase tracking-wide">Success Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-accent mb-1">4-6hr</div>
                                        <div className="text-xs text-secondary uppercase tracking-wide">Free Diagnostics</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-accent mb-1">1,200+</div>
                                        <div className="text-xs text-secondary uppercase tracking-wide">Donor Drives</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-accent mb-1">15,000+</div>
                                        <div className="text-xs text-secondary uppercase tracking-wide">Drives Recovered</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Failure Types Section */}
                <section className="py-16 md:py-20 bg-surface/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                    Hard Drive Failure Types We Recover
                                </h2>
                                <p className="text-lg text-secondary max-w-2xl mx-auto">
                                    From clicking heads to corrupted firmware, we handle every category of hard drive failure with specialized recovery protocols.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Mechanical Failures */}
                                <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <AlertTriangle className="w-7 h-7 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Mechanical Failures</h3>
                                    <p className="text-secondary text-sm leading-relaxed mb-4">
                                        Physical component damage requiring cleanroom intervention. The most common and critical category.
                                    </p>
                                    <ul className="space-y-2 text-sm text-secondary">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Head crashes:</strong> Read/write heads contact platters, causing clicking sounds</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Motor seizure:</strong> Spindle motor fails to rotate platters, causing beeping</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Platter damage:</strong> Scratches or surface degradation from head contact</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Actuator arm failure:</strong> Mechanism controlling head positioning jams</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary">Success Rate:</span>
                                            <span className="font-bold text-accent">88%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2">
                                            <span className="text-secondary">Timeline:</span>
                                            <span className="font-bold text-primary">5-7 days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Logical Failures */}
                                <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Database className="w-7 h-7 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Logical Failures</h3>
                                    <p className="text-secondary text-sm leading-relaxed mb-4">
                                        Software-based issues where the drive spins normally but data is inaccessible due to file system corruption.
                                    </p>
                                    <ul className="space-y-2 text-sm text-secondary">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Formatted drives:</strong> Accidental quick or full format operations</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Deleted partitions:</strong> Partition table damage or accidental deletion</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Corrupted file systems:</strong> NTFS, HFS+, EXT4 corruption from crashes</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Virus/malware damage:</strong> Ransomware encryption or file deletion</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary">Success Rate:</span>
                                            <span className="font-bold text-accent">98%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2">
                                            <span className="text-secondary">Timeline:</span>
                                            <span className="font-bold text-primary">1-3 days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Firmware Corruption */}
                                <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Wrench className="w-7 h-7 text-purple-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Firmware Corruption</h3>
                                    <p className="text-secondary text-sm leading-relaxed mb-4">
                                        Service area damage or translator corruption that prevents the drive from initializing properly.
                                    </p>
                                    <ul className="space-y-2 text-sm text-secondary">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Service area corruption:</strong> Critical firmware modules become unreadable</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Bad sector management:</strong> G-list/P-list overflow causing instability</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Translator damage:</strong> Logical-to-physical address mapping corruption</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>ROM corruption:</strong> Bootloader or kernel code damage</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary">Success Rate:</span>
                                            <span className="font-bold text-accent">85%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2">
                                            <span className="text-secondary">Timeline:</span>
                                            <span className="font-bold text-primary">4-6 days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Circuit Board Failure */}
                                <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Zap className="w-7 h-7 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Circuit Board Failure</h3>
                                    <p className="text-secondary text-sm leading-relaxed mb-4">
                                        PCB damage from power surges, lightning strikes, or component aging requiring board-level repair.
                                    </p>
                                    <ul className="space-y-2 text-sm text-secondary">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Power surge damage:</strong> TVS diodes or controller chips blown</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Controller failure:</strong> Main processor or cache memory failure</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Burned components:</strong> Visible scorching or melted traces</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>ROM chip corruption:</strong> Adaptive firmware storage damage</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary">Success Rate:</span>
                                            <span className="font-bold text-accent">90%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2">
                                            <span className="text-secondary">Timeline:</span>
                                            <span className="font-bold text-primary">2-4 days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Water/Fire Damage */}
                                <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <AlertCircle className="w-7 h-7 text-cyan-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Environmental Damage</h3>
                                    <p className="text-secondary text-sm leading-relaxed mb-4">
                                        Drives exposed to water, fire, impact, or extreme temperatures requiring advanced recovery techniques.
                                    </p>
                                    <ul className="space-y-2 text-sm text-secondary">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Water immersion:</strong> Corrosion, short circuits, platter contamination</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Fire exposure:</strong> Heat warping, smoke residue, magnetic degradation</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Physical impact:</strong> Dropped drives with platter misalignment</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Contamination:</strong> Dust, debris, or chemical exposure</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary">Success Rate:</span>
                                            <span className="font-bold text-accent">65-80%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2">
                                            <span className="text-secondary">Timeline:</span>
                                            <span className="font-bold text-primary">7-10 days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bad Sectors */}
                                <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group">
                                    <div className="w-14 h-14 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Disc className="w-7 h-7 text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-3">Bad Sector Degradation</h3>
                                    <p className="text-secondary text-sm leading-relaxed mb-4">
                                        Progressive platter surface degradation causing slow performance and data instability over time.
                                    </p>
                                    <ul className="space-y-2 text-sm text-secondary">
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Weak sectors:</strong> Marginal areas requiring multiple read attempts</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Pending sectors:</strong> Sectors waiting for reallocation after errors</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Reallocated sectors:</strong> Growing spare sector usage indicates aging</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <ChevronRight className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                            <span><strong>Uncorrectable errors:</strong> ECC unable to recover data from sectors</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary">Success Rate:</span>
                                            <span className="font-bold text-accent">75-95%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs mt-2">
                                            <span className="text-secondary">Timeline:</span>
                                            <span className="font-bold text-primary">3-5 days</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recovery Process Section */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                    Our Hard Drive Recovery Process
                                </h2>
                                <p className="text-lg text-secondary max-w-2xl mx-auto">
                                    From free diagnostics to final data delivery, every step follows ISO-certified protocols for maximum success.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        1
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border border-border pt-8">
                                        <FileText className="w-10 h-10 text-accent mb-4" />
                                        <h3 className="text-xl font-bold text-primary mb-3">Free Diagnostic Evaluation</h3>
                                        <p className="text-secondary text-sm leading-relaxed">
                                            Ship or drop off your drive securely. Our technicians perform a comprehensive diagnostic within 4-6 hours, identifying the exact failure mechanism, success probability, and detailed pricing. Diagnostics are 100% free with no obligation to proceed.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        2
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border border-border pt-8">
                                        <Shield className="w-10 h-10 text-accent mb-4" />
                                        <h3 className="text-xl font-bold text-primary mb-3">Approval & Payment</h3>
                                        <p className="text-secondary text-sm leading-relaxed">
                                            We provide a detailed quote including parts, labor, timeline, and success probability. No hidden fees. You approve via email or phone. We accept UPI, bank transfer, credit cards, and cash. Work begins only after approval. No recovery = no fee guarantee.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        3
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border border-border pt-8">
                                        <HardDrive className="w-10 h-10 text-accent mb-4" />
                                        <h3 className="text-xl font-bold text-primary mb-3">Cleanroom Head Swap</h3>
                                        <p className="text-secondary text-sm leading-relaxed">
                                            For mechanical failures, we open the drive in our Class 100 cleanroom (fewer than 100 particles per cubic foot). Failed heads are replaced with precision-matched donor parts. Platters are cleaned with anti-static solutions. Drives are reassembled and tested.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        4
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border border-border pt-8">
                                        <Database className="w-10 h-10 text-accent mb-4" />
                                        <h3 className="text-xl font-bold text-primary mb-3">Data Imaging & Extraction</h3>
                                        <p className="text-secondary text-sm leading-relaxed">
                                            Using proprietary tools, we create sector-by-sector images of the drive, bypassing bad sectors and firmware issues. For logical failures, we rebuild partition tables and file system structures. All data is verified for integrity using checksum validation.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        5
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border border-border pt-8">
                                        <CheckCircle2 className="w-10 h-10 text-accent mb-4" />
                                        <h3 className="text-xl font-bold text-primary mb-3">Quality Verification</h3>
                                        <p className="text-secondary text-sm leading-relaxed">
                                            Recovered files are validated for integrity—photos opened, documents verified, videos tested for playback. We provide a detailed file list showing exactly what was recovered. Files are organized by type and original folder structure when possible.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-black text-lg shadow-lg">
                                        6
                                    </div>
                                    <div className="glass-card p-6 rounded-2xl border border-border pt-8">
                                        <Lock className="w-10 h-10 text-accent mb-4" />
                                        <h3 className="text-xl font-bold text-primary mb-3">Secure Data Delivery</h3>
                                        <p className="text-secondary text-sm leading-relaxed">
                                            Data is delivered on a new external drive or secure cloud transfer (AES-256 encrypted). Original drive returned unless destruction requested. All internal copies are securely wiped per DoD 5220.22-M standards. Chain of custody maintained throughout.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Signals Section */}
                <section className="py-16 md:py-20 bg-surface/30">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                    Why Choose Swaz Solutions for Hard Drive Recovery
                                </h2>
                                <p className="text-lg text-secondary max-w-2xl mx-auto">
                                    Over a decade of proven excellence in mechanical and logical hard drive recovery with industry-leading success rates.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-12">
                                <div className="glass-card p-8 rounded-2xl border border-border">
                                    <Award className="w-12 h-12 text-accent mb-4" />
                                    <h3 className="text-2xl font-bold text-primary mb-4">Certified Cleanroom Facility</h3>
                                    <p className="text-secondary leading-relaxed mb-4">
                                        Our Class 100 cleanroom meets ISO 14644-1 standards with positive pressure laminar flow, HEPA filtration, and ESD-protected workstations. Every mechanical recovery is performed under microscope-grade magnification with precision tools calibrated to 0.01mm tolerances. We maintain temperature (20-22°C) and humidity (40-45% RH) controls critical for platter stability.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">ISO 14644-1</div>
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">ESD Protected</div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-2xl border border-border">
                                    <Server className="w-12 h-12 text-accent mb-4" />
                                    <h3 className="text-2xl font-bold text-primary mb-4">Extensive Donor Drive Library</h3>
                                    <p className="text-secondary leading-relaxed mb-4">
                                        We stock 1,200+ donor drives covering Seagate (Barracuda, IronWolf, Exos), Western Digital (Blue, Black, Red, Gold), Toshiba (P300, X300, MG series), and HGST models from 2010-present. Head assemblies are firmware-matched and tested before transplant. Our inventory reduces turnaround time from weeks to days for rare models.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">1,200+ Donors</div>
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">2010-2025</div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-2xl border border-border">
                                    <TrendingUp className="w-12 h-12 text-accent mb-4" />
                                    <h3 className="text-2xl font-bold text-primary mb-4">Proprietary Recovery Tools</h3>
                                    <p className="text-secondary leading-relaxed mb-4">
                                        Our engineers developed custom firmware repair utilities for Seagate F3, Western Digital Marvel, and Toshiba drives. These tools access service areas directly via UART/SATA interfaces, bypassing damaged firmware modules to extract user data. We can rebuild translator tables, repair G-lists, and regenerate servo maps that commercial software cannot touch.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">Custom Tools</div>
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">Firmware Repair</div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 rounded-2xl border border-border">
                                    <Lock className="w-12 h-12 text-accent mb-4" />
                                    <h3 className="text-2xl font-bold text-primary mb-4">Military-Grade Data Security</h3>
                                    <p className="text-secondary leading-relaxed mb-4">
                                        All recovered data is handled in isolated, encrypted environments with zero internet connectivity. Chain of custody is documented from intake to delivery. We execute NDAs for sensitive corporate/legal cases. Internal data copies are wiped using DoD 5220.22-M 7-pass overwrite after delivery confirmation. CCTV monitoring in all recovery areas.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">NDA Available</div>
                                        <div className="px-3 py-1 bg-accent/10 text-accent rounded-full font-bold">DoD Wipe</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center glass-card p-6 rounded-xl border border-border">
                                    <div className="text-4xl font-black text-accent mb-2">15,000+</div>
                                    <div className="text-sm text-secondary uppercase tracking-wide">Drives Recovered</div>
                                </div>
                                <div className="text-center glass-card p-6 rounded-xl border border-border">
                                    <div className="text-4xl font-black text-accent mb-2">92%</div>
                                    <div className="text-sm text-secondary uppercase tracking-wide">Success Rate</div>
                                </div>
                                <div className="text-center glass-card p-6 rounded-xl border border-border">
                                    <div className="text-4xl font-black text-accent mb-2">4.9/5</div>
                                    <div className="text-sm text-secondary uppercase tracking-wide">Customer Rating</div>
                                </div>
                                <div className="text-center glass-card p-6 rounded-xl border border-border">
                                    <div className="text-4xl font-black text-accent mb-2">13yrs</div>
                                    <div className="text-sm text-secondary uppercase tracking-wide">Experience</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                    Hard Drive Recovery FAQs
                                </h2>
                                <p className="text-lg text-secondary">
                                    Common questions about hard drive data recovery, clicking sounds, mechanical failures, and pricing.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {hardDriveFAQs.map((faq, index) => (
                                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 md:py-20 bg-gradient-to-br from-accent/10 via-accent-orange/10 to-accent/5 border-y border-accent/20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl md:text-5xl font-black text-primary mb-6">
                                Don't Risk Your Data with DIY Recovery
                            </h2>
                            <p className="text-lg md:text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                                Every power-on attempt of a failing drive increases damage. Our free diagnostic evaluation takes 4-6 hours and provides exact pricing with no obligation to proceed.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                                <a
                                    href="tel:+919701087446"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-accent text-white font-bold rounded-xl hover:bg-accent-orange transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>Call +91-9701087446</span>
                                </a>
                                <a
                                    href="/#/contact"
                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-surface border-2 border-accent text-accent font-bold rounded-xl hover:bg-accent hover:text-white transition-all"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>Schedule Free Diagnostic</span>
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-secondary">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                    <span>Free Diagnostics</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                    <span>No Recovery = No Fee</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                    <span>24/7 Emergency Service</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-accent" />
                                    <span>Class 100 Cleanroom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Services */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                    Related Data Recovery Services
                                </h2>
                                <p className="text-lg text-secondary">
                                    Explore our full range of professional data recovery solutions for all storage devices.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <a
                                    href="/#/services/raid-recovery"
                                    className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group"
                                >
                                    <Server className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold text-primary mb-2">RAID Array Recovery</h3>
                                    <p className="text-secondary text-sm mb-4">
                                        Enterprise RAID 0, 1, 5, 6, 10 recovery with virtual destriping and multi-drive failures.
                                    </p>
                                    <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                                        <span>Learn More</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </a>

                                <a
                                    href="/#/services/ssd-recovery"
                                    className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group"
                                >
                                    <Disc className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold text-primary mb-2">SSD & Flash Recovery</h3>
                                    <p className="text-secondary text-sm mb-4">
                                        NAND chip-off recovery for SSDs, USB drives, SD cards, and encrypted flash storage.
                                    </p>
                                    <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                                        <span>Learn More</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </a>

                                <a
                                    href="/#/contact"
                                    className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-all group"
                                >
                                    <Phone className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold text-primary mb-2">Free Consultation</h3>
                                    <p className="text-secondary text-sm mb-4">
                                        Speak with our recovery specialists about your specific case. No obligation.
                                    </p>
                                    <div className="flex items-center gap-2 text-accent text-sm font-semibold">
                                        <span>Contact Us</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};
