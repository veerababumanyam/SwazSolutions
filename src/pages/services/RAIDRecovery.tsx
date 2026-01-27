import React from 'react';
import { Server, Shield, Clock, CheckCircle, AlertTriangle, HardDrive, Layers, Network, Database, Cpu, Phone, ArrowRight, Lock, Zap, FileWarning, ChevronRight, Activity } from 'lucide-react';
import { LazyImage } from '../../components/LazyImage';

export const RAIDRecovery: React.FC = () => {
    return (
        <main className="min-h-screen bg-background pt-20 pb-20">
            {/* Hero Section */}
            <section className="container mx-auto px-4 mb-16">
                <div className="max-w-5xl mx-auto text-center animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 mb-6">
                        <Server className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Enterprise Data Recovery</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
                        RAID Array Recovery<br />
                        <span className="bg-brand-gradient bg-clip-text text-transparent">Experts in Multi-Drive Failures</span>
                    </h1>
                    <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
                        When your mission-critical RAID array crashes, server downtime costs thousands per hour. Our specialized engineers recover business-critical data from complex RAID configurations—even with multiple simultaneous drive failures.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="tel:+919701087446"
                            className="btn btn-primary px-8 py-4 rounded-xl text-lg hover-lift inline-flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" /> Emergency: +91-9701087446
                        </a>
                        <button
                            onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn btn-ghost px-8 py-4 rounded-xl text-lg hover-lift border-2 inline-flex items-center justify-center gap-2"
                        >
                            <Activity className="w-5 h-5" /> See Our Process
                        </button>
                    </div>
                </div>
            </section>

            {/* Answer-First Explainer Block */}
            <section className="bg-surface border-y border-border py-16 mb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                <Database className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-primary mb-2">What Is RAID Recovery?</h2>
                                <div className="w-20 h-1 bg-brand-gradient rounded-full mb-4"></div>
                            </div>
                        </div>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-secondary leading-relaxed mb-4">
                                <strong className="text-primary">RAID recovery is the specialized process of reconstructing data from failed RAID (Redundant Array of Independent Disks) storage systems.</strong> Unlike single-drive recovery, RAID configurations stripe data across multiple drives using mathematical parity algorithms. When one or more drives fail simultaneously, standard recovery tools cannot reassemble the fragmented data.
                            </p>
                            <p className="text-secondary leading-relaxed mb-4">
                                Our engineers perform <strong className="text-primary">virtual destriping</strong>—reconstructing the original RAID configuration in a controlled lab environment without powering on damaged drives. We analyze controller metadata, stripe block patterns, and parity calculations to rebuild your array logically, then extract files using enterprise-grade forensic software.
                            </p>
                            <p className="text-secondary leading-relaxed">
                                RAID recovery requires understanding of storage controller architectures, file system structures (NTFS, ext4, XFS), and redundancy mathematics. Whether you're running RAID 0, 1, 5, 6, 10, or proprietary NAS configurations like Synology SHR or QNAP JBOD, our certified technicians have recovered petabytes of enterprise data since 2012.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* RAID Levels Supported */}
            <section className="container mx-auto px-4 mb-20">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-primary mb-4">RAID Configurations We Recover</h2>
                        <p className="text-secondary max-w-2xl mx-auto">
                            Every RAID level has unique failure modes. Our lab is equipped to handle them all.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                level: 'RAID 0',
                                name: 'Striping',
                                icon: Layers,
                                color: 'text-red-500',
                                bgColor: 'bg-red-500/10',
                                borderColor: 'border-red-500/20',
                                risk: 'Critical',
                                desc: 'No redundancy. Single drive failure = total data loss. Requires precise block-level reconstruction.',
                                recovery: 'Stripe order analysis, block size detection, interleaved data reconstruction.'
                            },
                            {
                                level: 'RAID 1',
                                name: 'Mirroring',
                                icon: HardDrive,
                                color: 'text-emerald-500',
                                bgColor: 'bg-emerald-500/10',
                                borderColor: 'border-emerald-500/20',
                                risk: 'Low',
                                desc: 'Perfect mirror copies. Survives single drive failure. Issues arise with controller corruption.',
                                recovery: 'Mirror verification, metadata repair, split-brain resolution.'
                            },
                            {
                                level: 'RAID 5',
                                name: 'Distributed Parity',
                                icon: Database,
                                color: 'text-blue-500',
                                bgColor: 'bg-blue-500/10',
                                borderColor: 'border-blue-500/20',
                                risk: 'Medium',
                                desc: 'Distributed parity across all drives. Tolerates 1 drive failure. Vulnerable during rebuild.',
                                recovery: 'Parity recalculation, XOR algorithm reconstruction, stripe reassembly.'
                            },
                            {
                                level: 'RAID 6',
                                name: 'Dual Parity',
                                icon: Shield,
                                color: 'text-purple-500',
                                bgColor: 'bg-purple-500/10',
                                borderColor: 'border-purple-500/20',
                                risk: 'Medium-Low',
                                desc: 'Double parity. Survives 2 simultaneous failures. Complex Reed-Solomon error correction.',
                                recovery: 'Dual parity validation, Reed-Solomon decoding, Q-parity reconstruction.'
                            },
                            {
                                level: 'RAID 10',
                                name: 'Mirrored Stripes',
                                icon: Network,
                                color: 'text-orange-500',
                                bgColor: 'bg-orange-500/10',
                                borderColor: 'border-orange-500/20',
                                risk: 'Low-Medium',
                                desc: 'Combines RAID 1+0. High performance + redundancy. Requires proper mirror pair identification.',
                                recovery: 'Mirror set detection, stripe pattern analysis, nested array reconstruction.'
                            },
                            {
                                level: 'NAS Systems',
                                name: 'Synology, QNAP, Buffalo',
                                icon: Server,
                                color: 'text-cyan-500',
                                bgColor: 'bg-cyan-500/10',
                                borderColor: 'border-cyan-500/20',
                                risk: 'Variable',
                                desc: 'Proprietary RAID variants (SHR, X-RAID). Encrypted volumes, custom file systems.',
                                recovery: 'Vendor-specific metadata parsing, firmware analysis, volume decryption.'
                            }
                        ].map((raid, i) => (
                            <div
                                key={i}
                                className={`glass-card p-6 rounded-2xl border ${raid.borderColor} hover:border-opacity-50 transition-all hover:-translate-y-1 group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl ${raid.bgColor} flex items-center justify-center`}>
                                        <raid.icon className={`w-6 h-6 ${raid.color}`} />
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${raid.bgColor} ${raid.color}`}>
                                        {raid.risk} Risk
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-1">{raid.level}</h3>
                                <p className="text-xs font-bold text-secondary uppercase tracking-wide mb-3">{raid.name}</p>
                                <p className="text-sm text-secondary leading-relaxed mb-4">{raid.desc}</p>
                                <div className={`pt-4 border-t ${raid.borderColor} border-opacity-30`}>
                                    <p className="text-xs font-semibold text-primary mb-1">Recovery Technique:</p>
                                    <p className="text-xs text-secondary leading-relaxed">{raid.recovery}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Technical Deep Dive */}
            <section className="bg-surface border-y border-border py-20 mb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-primary mb-4">The Technical Challenge of RAID Failures</h2>
                            <p className="text-secondary max-w-2xl mx-auto">
                                Why RAID recovery requires specialized expertise beyond standard data recovery.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="glass-card p-8 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-primary mb-3">Multiple Drive Failures</h3>
                                        <p className="text-secondary leading-relaxed mb-4">
                                            The most catastrophic RAID scenario: two or more drives fail before redundancy rebuilds complete. In RAID 5 arrays, losing 2 drives simultaneously exceeds fault tolerance—standard recovery software will refuse to mount the array. We bypass controller logic and perform <strong className="text-primary">raw sector-level analysis</strong>, using advanced algorithms to predict missing parity blocks through probabilistic reconstruction.
                                        </p>
                                        <div className="bg-background/50 p-4 rounded-xl border border-border">
                                            <p className="text-sm text-secondary">
                                                <strong className="text-primary">Example:</strong> A RAID 5 array with 6 drives loses drives #2 and #5. We image the remaining 4 healthy drives, analyze metadata timestamps to determine failure sequence, then use XOR parity mathematics and known file signatures to interpolate missing data blocks. Success rate: 87% for complete recovery, 94% for partial recovery.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Cpu className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-primary mb-3">Destriping & Block Reconstruction</h3>
                                        <p className="text-secondary leading-relaxed mb-4">
                                            RAID controllers distribute file data across drives in fixed-size blocks (typically 64KB-1MB). A single 10MB file might exist as 160 fragments scattered across 8 drives. When the array fails, we must reverse-engineer the exact stripe size, offset parameters, and rotation algorithms—often with zero documentation if the controller is dead.
                                        </p>
                                        <div className="bg-background/50 p-4 rounded-xl border border-border">
                                            <p className="text-sm text-primary font-semibold mb-2">Our Destriping Process:</p>
                                            <ol className="text-sm text-secondary space-y-2 list-decimal list-inside">
                                                <li>Forensic imaging of all member drives using write-blockers</li>
                                                <li>Automated detection of stripe block boundaries via entropy analysis</li>
                                                <li>Controller metadata extraction (if available) or brute-force parameter discovery</li>
                                                <li>Virtual array assembly in read-only simulation environment</li>
                                                <li>File system mount and logical extraction</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                                        <FileWarning className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-primary mb-3">Rebuild Failures & URE Events</h3>
                                        <p className="text-secondary leading-relaxed mb-4">
                                            Modern high-capacity drives (8TB+) have Unrecoverable Read Error (URE) rates of 1 in 10^14 bits. During a RAID 5 rebuild after single drive failure, reading the entire array often triggers UREs on surviving drives—cascading into total failure. This "rebuild death spiral" is the #1 cause of RAID data loss in 2025.
                                        </p>
                                        <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                                            <p className="text-sm text-secondary">
                                                <strong className="text-primary">Critical Warning:</strong> If your RAID array is in degraded mode, <strong className="text-red-500">DO NOT attempt to insert a new replacement drive</strong> without professional consultation. The rebuild process may trigger additional failures. Power down the system immediately and contact our emergency line: <a href="tel:+919701087446" className="text-accent font-bold hover:underline">+91-9701087446</a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Lock className="w-6 h-6 text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-primary mb-3">Encrypted RAID Volumes</h3>
                                        <p className="text-secondary leading-relaxed mb-4">
                                            Enterprise NAS devices (Synology DSM, QNAP QTS) often employ full-disk encryption with proprietary key derivation. Recovery requires accessing encryption metadata stored in controller NVRAM or system partitions. We specialize in extracting encryption keys from damaged controllers using firmware analysis and JTAG debugging techniques.
                                        </p>
                                        <div className="bg-background/50 p-4 rounded-xl border border-border">
                                            <p className="text-sm text-secondary">
                                                <strong className="text-primary">Supported Encryption:</strong> LUKS, BitLocker, Synology encrypted volumes, QNAP AES-256 encryption, TrueCrypt/VeraCrypt containers. Recovery success depends on availability of encryption credentials or controller hardware.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recovery Process */}
            <section id="process" className="container mx-auto px-4 mb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-primary mb-4">Our RAID Recovery Process</h2>
                        <p className="text-secondary max-w-2xl mx-auto">
                            A methodical, forensic approach to enterprise data recovery.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                step: '01',
                                title: 'Emergency Consultation',
                                icon: Phone,
                                desc: 'Immediate phone assessment with senior engineer. We determine RAID level, number of failed drives, symptoms, and urgency. Critical cases receive same-day courier pickup.',
                                duration: '30 minutes',
                                color: 'accent'
                            },
                            {
                                step: '02',
                                title: 'Array Analysis & Diagnosis',
                                icon: Activity,
                                desc: 'Lab evaluation of all member drives. We document physical condition, extract controller metadata, identify stripe parameters, and assess recoverability. You receive a detailed technical report with fixed-price quote.',
                                duration: '4-8 hours',
                                color: 'accent-orange'
                            },
                            {
                                step: '03',
                                title: 'Forensic Imaging',
                                icon: HardDrive,
                                desc: 'Bit-perfect imaging of all drives using hardware write-blockers. Damaged drives undergo cleanroom platter extraction. All images stored on redundant enterprise storage with SHA-256 verification.',
                                duration: '1-3 days',
                                color: 'blue-500'
                            },
                            {
                                step: '04',
                                title: 'Virtual Destriping',
                                icon: Layers,
                                desc: 'Reconstruction of RAID geometry in software. Our proprietary tools analyze stripe boundaries, parity positions, and rotation algorithms. The virtual array is assembled in read-only mode to prevent any write operations.',
                                duration: '6-24 hours',
                                color: 'purple-500'
                            },
                            {
                                step: '05',
                                title: 'File System Reconstruction',
                                icon: Database,
                                desc: 'Mounting the reconstructed volume and scanning for file systems (NTFS, ext4, XFS, ZFS). We rebuild partition tables, recover inodes, and extract directory structures. Custom scripts handle corrupted metadata.',
                                duration: '12-48 hours',
                                color: 'emerald-500'
                            },
                            {
                                step: '06',
                                title: 'Data Validation & Delivery',
                                icon: CheckCircle,
                                desc: 'Comprehensive file integrity verification using checksums and sample testing. Recovered data delivered via encrypted USB/NAS, with optional secure cloud transfer. Includes detailed recovery report and recommendations.',
                                duration: '4-8 hours',
                                color: 'emerald-600'
                            }
                        ].map((phase, i) => (
                            <div key={i} className="relative">
                                <div className="flex gap-6 items-start group">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-16 h-16 rounded-2xl bg-${phase.color}/10 border-2 border-${phase.color}/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                            <phase.icon className={`w-8 h-8 text-${phase.color}`} />
                                        </div>
                                        {i < 5 && (
                                            <div className="w-0.5 h-12 bg-border my-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 glass-card p-6 rounded-2xl group-hover:border-accent/30 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className={`text-xs font-black text-${phase.color} uppercase tracking-wider`}>
                                                    Step {phase.step}
                                                </span>
                                                <h3 className="text-xl font-bold text-primary mt-1">{phase.title}</h3>
                                            </div>
                                            <span className="text-xs font-bold text-secondary px-3 py-1 rounded-full bg-surface border border-border whitespace-nowrap">
                                                <Clock className="w-3 h-3 inline mr-1" />{phase.duration}
                                            </span>
                                        </div>
                                        <p className="text-secondary leading-relaxed">{phase.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Enterprise Focus */}
            <section className="bg-gradient-to-br from-accent/5 to-accent-orange/5 py-20 mb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <Server className="w-16 h-16 text-accent mx-auto mb-4" />
                            <h2 className="text-3xl font-black text-primary mb-4">Enterprise-Grade Recovery for Business-Critical Systems</h2>
                            <p className="text-secondary max-w-2xl mx-auto">
                                When your production servers fail, every minute of downtime impacts revenue, compliance, and reputation.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                            <div className="glass-card p-6 rounded-2xl bg-background/80">
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-accent" /> Compliance & Security
                                </h3>
                                <ul className="space-y-3 text-secondary text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>HIPAA-compliant handling of medical imaging servers and EHR databases</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>GDPR-certified data processing with EU data residency options</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>SOC 2 Type II facility access controls and chain of custody documentation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>Attorney-client privilege preservation for legal discovery servers</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-card p-6 rounded-2xl bg-background/80">
                                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-accent-orange" /> Emergency Services
                                </h3>
                                <ul className="space-y-3 text-secondary text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>24/7/365 emergency hotline with immediate engineer escalation</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>Same-day courier pickup for Tier-1 metro areas (Hyderabad, Bangalore, Mumbai)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>Priority queue for production server outages (4-6 hour evaluation SLA)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <span>On-site data center visits for sensitive government/financial systems</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-2xl bg-background/80 border-2 border-accent/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Database className="w-6 h-6 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Industries We Serve</h3>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {[
                                            'Healthcare (PACS/RIS)',
                                            'Financial Services',
                                            'Legal/e-Discovery',
                                            'Video Production',
                                            'Scientific Research',
                                            'SaaS Infrastructure',
                                            'E-commerce Platforms',
                                            'Manufacturing ERP',
                                            'Government Agencies',
                                            'Telecom Providers'
                                        ].map((industry, i) => (
                                            <span
                                                key={i}
                                                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/10 text-primary border border-accent/20"
                                            >
                                                {industry}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="container mx-auto px-4 mb-20">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-primary mb-4">Transparent Pricing</h2>
                        <p className="text-secondary max-w-2xl mx-auto">
                            No hidden fees. You only pay when we successfully recover your data.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-card p-6 rounded-2xl text-center border-2 border-border hover:border-accent/30 transition-colors">
                            <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-2">Standard RAID 5/6</div>
                            <div className="text-4xl font-black text-primary mb-1">₹40,000</div>
                            <div className="text-xs text-muted mb-4">Starting price</div>
                            <ul className="text-sm text-secondary space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>4-8 drive arrays</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>Single drive failure</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>7-10 day turnaround</span>
                                </li>
                            </ul>
                        </div>

                        <div className="glass-card p-6 rounded-2xl text-center border-2 border-accent/50 hover:border-accent transition-colors relative">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                                Most Common
                            </div>
                            <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-2">Complex RAID</div>
                            <div className="text-4xl font-black text-primary mb-1">₹55,000</div>
                            <div className="text-xs text-muted mb-4">Average price</div>
                            <ul className="text-sm text-secondary space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>Multiple drive failures</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>NAS devices (Synology, QNAP)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>5-7 day turnaround</span>
                                </li>
                            </ul>
                        </div>

                        <div className="glass-card p-6 rounded-2xl text-center border-2 border-border hover:border-accent/30 transition-colors">
                            <div className="text-sm font-bold text-secondary uppercase tracking-wide mb-2">Enterprise Critical</div>
                            <div className="text-4xl font-black text-primary mb-1">₹75,000+</div>
                            <div className="text-xs text-muted mb-4">Custom quote</div>
                            <ul className="text-sm text-secondary space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>12+ drive arrays</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>Physical damage + encryption</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span>24-48 hour rush service</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <Shield className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-primary mb-2">No-Data, No-Fee Guarantee</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    If we cannot recover your critical files, you pay <strong className="text-primary">₹0</strong>. Our evaluation fee (₹2,500, waived for enterprise clients) covers diagnostic labor only and is credited toward successful recovery. All pricing confirmed in writing before work begins.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-surface border-y border-border py-20 mb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-black text-primary mb-4">Frequently Asked Questions</h2>
                            <p className="text-secondary">
                                Answers to common RAID recovery questions from enterprise clients.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    q: 'Can you recover RAID 5 with 2 failed drives?',
                                    a: 'Yes. While RAID 5 is mathematically designed to tolerate only 1 drive failure, we have successfully recovered 78% of dual-failure cases using advanced techniques. We analyze the remaining healthy drives to reconstruct missing data blocks through parity recalculation and file signature detection. Success depends on the order of failure, stripe size, and whether the controller wrote any corrupted parity before the second failure. We provide an honest assessment during the free evaluation—if recovery is impossible, we inform you immediately rather than wasting time and money.'
                                },
                                {
                                    q: 'How long does RAID recovery take?',
                                    a: 'Typical timelines: <strong>Standard RAID 5/6 single-failure:</strong> 5-7 business days. <strong>Complex multi-drive failures:</strong> 7-14 days. <strong>Emergency rush service:</strong> 24-48 hours (additional fees apply). The imaging phase alone can take 2-3 days for large arrays (40TB+). We provide daily progress updates for enterprise clients and can prioritize critical file types (databases, recent documents) for faster partial delivery while the full recovery completes in the background.'
                                },
                                {
                                    q: 'Can you recover data from NAS devices like Synology or QNAP?',
                                    a: 'Absolutely. NAS devices are our specialty—we recover 500+ Synology/QNAP/Buffalo/Netgear systems annually. These units use proprietary RAID variants (Synology Hybrid RAID, QNAP Static Volume) with custom file systems (Btrfs, ext4) and optional encryption. We extract drives, bypass the failed NAS controller, and reconstruct volumes in our lab using vendor-specific metadata parsers. Even if the NAS hardware is destroyed (fire, flood, electrical surge), the drives often survive and remain recoverable. Bring us the drives; we handle the rest.'
                                },
                                {
                                    q: 'What if I already attempted a RAID rebuild and it failed?',
                                    a: 'Stop immediately. Failed rebuild attempts cause secondary damage—the controller may have written bad parity data or corrupted file system metadata. Power down the array and do not insert new drives. We see this frequently: a well-intentioned IT admin replaces a failed drive, the rebuild process triggers Unrecoverable Read Errors (UREs) on aging drives, and a second drive fails mid-rebuild. This is recoverable, but requires professional intervention. The faster you contact us after a failed rebuild, the higher the success rate. Do not run any RAID repair utilities or "recovery wizards"—they often worsen the situation.'
                                },
                                {
                                    q: 'Do you recover encrypted RAID volumes?',
                                    a: 'Yes, with two requirements: (1) You provide the encryption password/keyfile, or (2) We have physical access to the original RAID controller (we can extract keys from controller firmware/NVRAM). We support all major encryption standards: LUKS (Linux), BitLocker (Windows Server), Synology/QNAP AES-256 encryption, TrueCrypt/VeraCrypt containers, and hardware-encrypted drives (SEDs). If you lost the encryption password and the controller is dead, recovery is cryptographically impossible—we will inform you during evaluation rather than offering false hope.'
                                },
                                {
                                    q: 'What is your success rate for RAID recovery?',
                                    a: 'Our overall RAID recovery success rate is 94% (full or partial recovery), broken down by scenario: <strong>RAID 5 single-drive failure:</strong> 99%. <strong>RAID 5 dual-failure:</strong> 78%. <strong>RAID 6 dual-failure:</strong> 96%. <strong>RAID 0 (no redundancy):</strong> 87% if all drives are intact. <strong>NAS devices:</strong> 91%. Success depends on how quickly you contact us after failure—delays allow drive degradation (bad sectors spreading), reducing recoverability. Our "no data, no fee" guarantee means we only get paid when you get your files back, ensuring honest assessments.'
                                },
                                {
                                    q: 'Can I ship my RAID drives to you, or do you pick them up?',
                                    a: 'Both options available. <strong>Courier pickup:</strong> We arrange insured pickup via BlueDart/FedEx (free for enterprise clients in Hyderabad/Bangalore/Mumbai, ₹1,500 elsewhere). <strong>Self-shipping:</strong> We provide packing instructions—ship drives in anti-static bags, padded boxes, marked fragile. <strong>On-site service:</strong> For highly sensitive systems (banking, healthcare, government), our engineers can visit your data center to image drives on-site, ensuring data never leaves your facility (additional ₹15,000 + travel). Most clients use courier pickup for convenience and speed.'
                                }
                            ].map((faq, i) => (
                                <div key={i} className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-colors">
                                    <h3 className="text-lg font-bold text-primary mb-3 flex items-start gap-3">
                                        <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <span>{faq.q}</span>
                                    </h3>
                                    <p
                                        className="text-secondary leading-relaxed pl-8"
                                        dangerouslySetInnerHTML={{ __html: faq.a }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="container mx-auto px-4 mb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-brand-gradient rounded-3xl p-12 text-white text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <Server className="w-16 h-16 mx-auto mb-6 opacity-90" />
                            <h2 className="text-3xl md:text-4xl font-black mb-4">
                                RAID Failure Is an Emergency—We Respond in Minutes
                            </h2>
                            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
                                Every hour of server downtime costs money. Our on-call engineers are standing by 24/7 to diagnose your RAID failure and begin recovery.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="tel:+919701087446"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-accent font-bold rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg"
                                >
                                    <Phone className="w-5 h-5" /> Call Emergency Line: +91-9701087446
                                </a>
                                <button
                                    onClick={() => {
                                        window.location.hash = '/contact';
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 transition-colors text-lg border-2 border-white/30"
                                >
                                    <ArrowRight className="w-5 h-5" /> Submit Online Case
                                </button>
                            </div>
                            <p className="mt-6 text-sm opacity-75 flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" /> All consultations protected by NDA • Free evaluation for enterprise clients
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
