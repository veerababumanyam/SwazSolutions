import React, { useState } from 'react';
import {
    HardDrive,
    Cpu,
    Zap,
    AlertCircle,
    CheckCircle,
    Clock,
    Shield,
    Award,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp,
    Database,
    FileWarning,
    Gauge,
    Microscope
} from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

export const SSDRecovery: React.FC = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: "Why do SSDs fail and how is it different from HDD failure?",
            answer: "SSDs fail for fundamentally different reasons than traditional hard drives. While HDDs primarily fail due to mechanical issues (head crashes, motor failure, platter damage), SSDs fail electronically. Common SSD failure modes include NAND flash cell wear from excessive write cycles, controller chip failures due to power surges or firmware bugs, capacitor degradation causing sudden power loss corruption, and firmware corruption from interrupted updates. Additionally, SSDs use wear leveling algorithms that redistribute writes across memory cells - when these algorithms fail or the flash translation layer becomes corrupted, the entire drive can become inaccessible even though the data physically exists on the NAND chips."
        },
        {
            question: "Can data be recovered from a failed SSD?",
            answer: "Yes, data can often be recovered from failed SSDs, but the process is vastly more complex than HDD recovery and requires specialized expertise. Our 98% success rate stems from our ability to perform chip-off recovery, where we physically remove NAND flash chips from the circuit board and read them directly using specialized programmers. We can also repair or bypass failed controllers, reconstruct corrupted firmware translation layers, and reverse-engineer proprietary wear leveling algorithms. However, there are limitations: if TRIM has been enabled and the operating system has marked blocks as deleted, that data is irrecoverably wiped. Similarly, if encryption was enabled without key backup, data remains encrypted even after physical recovery. Physical damage to NAND chips themselves (fire, crushing, electrical overstress) can also make recovery impossible."
        },
        {
            question: "How does the TRIM command affect SSD data recovery?",
            answer: "TRIM is the single biggest challenge in SSD data recovery. When you delete a file on a TRIM-enabled SSD, the operating system immediately sends a TRIM command to the drive, which instructs the SSD controller to erase those data blocks at the hardware level. Unlike HDDs where 'deleted' files remain on the platter until overwritten, TRIM causes immediate and permanent erasure of the underlying NAND cells. This happens in the background and is irreversible. For data recovery purposes, this means: files deleted while the SSD was connected to a running system are unrecoverable if TRIM executed; drives that failed before TRIM commands were processed may still contain recoverable data; and SSDs removed from systems quickly after data loss have higher recovery chances. Our lab can analyze the TRIM queue status and determine whether deleted data blocks were actually erased, but we cannot reverse TRIM operations that have already completed."
        },
        {
            question: "What is chip-off recovery and when is it necessary?",
            answer: "Chip-off recovery is the most advanced SSD recovery technique, required when the SSD's controller has completely failed or when firmware corruption prevents any logical access to the drive. The process involves: physically removing the NAND flash memory chips from the PCB using hot air rework stations and precision soldering tools; reading the raw data from each chip using specialized NAND programmers (our lab uses PC-3000 Flash and custom-built readers); reconstructing the data structure by reverse-engineering the drive's firmware translation layer (FTL), wear leveling algorithm, and ECC (Error Correction Code) schemes; and de-striping multi-chip RAID configurations used in high-capacity SSDs. This process requires Class 100 cleanroom conditions, forensic-grade equipment, and deep knowledge of each SSD manufacturer's proprietary architecture. We maintain an extensive database of controller firmware and FTL algorithms for major brands including Samsung, Intel, Crucial, SanDisk, and Western Digital. Chip-off is typically necessary for controller failures, severe firmware corruption, physical board damage, and forensic cases requiring court-admissible evidence chains."
        },
        {
            question: "How long does SSD data recovery take?",
            answer: "SSD recovery timelines vary significantly based on failure type and complexity. Simple logical issues (accidental deletion, partition corruption) can be resolved in 24-48 hours if TRIM hasn't executed. Controller failures requiring firmware repair typically take 3-5 business days as we need to diagnose the controller issue, source compatible donor parts, and transplant firmware while preserving data mappings. Chip-off recovery is the most time-intensive, requiring 7-14 days for multi-chip drives due to the meticulous process of chip removal, raw data extraction (which can take days for high-capacity drives), and algorithmic reconstruction of the data structure. We offer expedited service with 24/7 lab operations for mission-critical cases, though this requires evaluation of technical feasibility. Throughout the process, we provide regular status updates and maintain a transparent timeline so you're never left wondering about progress."
        },
        {
            question: "Why is SSD recovery more expensive than HDD recovery?",
            answer: "SSD recovery costs reflect the exponentially higher complexity and specialized resources required. Unlike HDD recovery which is relatively standardized, each SSD recovery case requires: proprietary forensic tools (PC-3000 Flash systems cost $40,000+, NAND programmers $15,000+); specialized cleanroom facilities for chip removal and handling; extensive reverse-engineering of manufacturer-specific firmware and wear leveling algorithms; and highly trained technicians with electrical engineering and data forensics expertise (our team includes former SSD controller engineers). Additionally, the process is non-deterministic - we may need to attempt multiple recovery strategies, especially for newer drives with advanced encryption and compression. Donor parts for SSDs are also more expensive and harder to source than HDD components. However, our transparent pricing includes all attempted recovery methods, and we operate on a no-data, no-charge policy - you only pay if we successfully recover your files."
        },
        {
            question: "Can encrypted SSDs be recovered if I forgot the password?",
            answer: "Encryption adds a critical layer of complexity to SSD recovery. If your SSD uses hardware-based encryption (common in modern Samsung, Crucial, and Intel drives) and you've lost the encryption key or password, the data is mathematically unrecoverable - even with chip-off techniques, we would only retrieve encrypted binary data that cannot be decrypted without the key. However, there are scenarios where we can help: if the encryption was software-based (BitLocker, FileVault) and you have a recovery key backup, we can decrypt after physical recovery; if the drive failed before encryption was completed, unencrypted portions may be accessible; and for forensic cases with legal authority, we work with law enforcement to explore specialized decryption resources. We always recommend: backing up encryption recovery keys separately from the drive; using password managers to prevent key loss; and for business-critical encrypted drives, implementing key escrow policies. Prevention is paramount because no amount of engineering expertise can break modern AES-256 encryption without the key."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <main className="min-h-screen bg-background pt-20 pb-20">
            {/* Hero Section with Answer-First Block */}
            <section className="container mx-auto px-4 mb-20">
                <div className="max-w-4xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="text-sm text-secondary mb-6">
                        <a href="#/" className="hover:text-accent transition-colors">Home</a>
                        <span className="mx-2">/</span>
                        <a href="#/services" className="hover:text-accent transition-colors">Services</a>
                        <span className="mx-2">/</span>
                        <span className="text-primary font-medium">SSD Recovery</span>
                    </div>

                    {/* Main Heading */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 mb-6">
                            <Zap className="w-4 h-4 text-accent" />
                            <span className="text-xs font-bold text-accent uppercase tracking-wider">Specialized SSD Recovery</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
                            SSD & Flash Memory<br />
                            <span className="bg-brand-gradient bg-clip-text text-transparent">Data Recovery Services</span>
                        </h1>
                        <p className="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
                            Advanced NAND flash recovery, controller repair, and chip-off techniques for solid-state drives when traditional methods fail.
                        </p>
                    </div>

                    {/* Answer-First Block */}
                    <div className="glass-card p-8 md:p-10 rounded-3xl bg-accent/5 border-2 border-accent/20 mb-12">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-primary mb-2">Why SSD Recovery Is Fundamentally Different</h2>
                                <p className="text-sm text-accent font-semibold">The answer you're looking for, upfront.</p>
                            </div>
                        </div>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-secondary leading-relaxed mb-4">
                                <strong className="text-primary">Solid-state drives (SSDs) require completely different recovery techniques than traditional hard drives.</strong> Unlike mechanical HDDs with spinning platters and read/write heads, SSDs store data electronically in NAND flash memory chips controlled by sophisticated firmware. When an SSD fails, you're not dealing with mechanical failure - you're facing complex electronic, firmware, or logical challenges that require specialized knowledge of controller architecture, flash translation layers, and wear leveling algorithms.
                            </p>
                            <p className="text-secondary leading-relaxed mb-4">
                                The biggest challenge is the <strong className="text-primary">TRIM command</strong>. Modern operating systems use TRIM to permanently erase deleted data blocks at the hardware level - making traditional "undelete" recovery impossible once TRIM executes. Additionally, SSDs use proprietary firmware that maps logical addresses to physical NAND cells. When this firmware corrupts or the controller fails, even intact data becomes inaccessible without reverse-engineering the manufacturer's mapping algorithm.
                            </p>
                            <p className="text-secondary leading-relaxed">
                                Our SSD recovery success rate of <strong className="text-accent">98%</strong> comes from three capabilities most labs lack: <strong className="text-primary">chip-off recovery</strong> (physically removing and reading NAND chips directly), <strong className="text-primary">controller-level repair</strong> (fixing or bypassing failed processors), and <strong className="text-primary">firmware reconstruction</strong> (rebuilding corrupted flash translation layers using manufacturer-specific knowledge). We maintain a Class 100 cleanroom facility, invest in $100,000+ forensic tools like PC-3000 Flash systems, and employ engineers with deep expertise in SSD controller architecture - because SSD recovery isn't just data recovery, it's electrical engineering and reverse engineering combined.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Signals Bar */}
            <section className="py-8 bg-surface border-y border-border mb-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl font-black text-accent mb-2">98%</div>
                            <div className="text-sm text-secondary font-medium">SSD Success Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-accent mb-2">Class 100</div>
                            <div className="text-sm text-secondary font-medium">Cleanroom Facility</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-accent mb-2">24/7</div>
                            <div className="text-sm text-secondary font-medium">Emergency Service</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-accent mb-2">12+ Years</div>
                            <div className="text-sm text-secondary font-medium">Flash Recovery Expertise</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technical Content Sections */}
            <section className="container mx-auto px-4 mb-20">
                <div className="max-w-6xl mx-auto">
                    {/* Understanding SSD Architecture */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-8">Understanding SSD Architecture & Failure Modes</h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="glass-card p-8 rounded-2xl border border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Cpu className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">Controller Failures</h3>
                                </div>
                                <p className="text-secondary leading-relaxed mb-4">
                                    The SSD controller is the brain of the drive - a specialized microprocessor (often ARM-based) that manages all read/write operations, wear leveling, garbage collection, and error correction. When controllers fail due to power surges, firmware bugs, or component degradation, the drive becomes completely unresponsive even though data remains intact on NAND chips.
                                </p>
                                <p className="text-secondary leading-relaxed">
                                    Recovery requires either: <strong className="text-primary">donor transplantation</strong> (replacing the controller with an identical chip while preserving firmware), <strong className="text-primary">ROM chip reading</strong> (extracting configuration data from the controller's ROM), or <strong className="text-primary">chip-off bypass</strong> (removing NAND chips and reading them independently of the failed controller).
                                </p>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Database className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">NAND Flash Degradation</h3>
                                </div>
                                <p className="text-secondary leading-relaxed mb-4">
                                    NAND flash cells have finite write endurance - typically 3,000-100,000 program/erase cycles depending on cell type (SLC, MLC, TLC, QLC). As cells wear out, they begin returning read errors, become slower, or fail to hold charge. Modern SSDs use sophisticated ECC (Error Correction Codes) to compensate, but eventually error rates exceed ECC capabilities.
                                </p>
                                <p className="text-secondary leading-relaxed">
                                    Our recovery process uses <strong className="text-primary">advanced ECC algorithms</strong> beyond consumer-grade capabilities, <strong className="text-primary">low-level NAND reading</strong> at reduced voltages to detect marginal cells, and <strong className="text-primary">statistical analysis</strong> to reconstruct data from partially degraded cells - techniques that can recover data even when the drive's onboard controller has given up.
                                </p>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <FileWarning className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">Firmware Corruption</h3>
                                </div>
                                <p className="text-secondary leading-relaxed mb-4">
                                    SSD firmware manages the Flash Translation Layer (FTL) - the critical mapping table that translates logical block addresses (what your computer sees) to physical NAND cells. Corrupted firmware can result from interrupted updates, power failures during critical operations, or software bugs. When the FTL is corrupted, the drive may appear empty or show nonsensical data even though files are physically intact.
                                </p>
                                <p className="text-secondary leading-relaxed">
                                    We recover firmware-corrupted drives by: <strong className="text-primary">extracting and analyzing service area data</strong> (hidden drive regions containing FTL backups), <strong className="text-primary">rebuilding translation tables</strong> using forensic algorithms, and <strong className="text-primary">firmware injection</strong> - loading known-good firmware from donor drives while preserving unique drive identifiers.
                                </p>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border border-border">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                                        <Gauge className="w-6 h-6 text-accent" />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary">Wear Leveling Failures</h3>
                                </div>
                                <p className="text-secondary leading-relaxed mb-4">
                                    SSDs use wear leveling algorithms to distribute writes evenly across all NAND cells, preventing premature failure of frequently-written areas. These algorithms are proprietary and vary by manufacturer. When wear leveling fails or becomes corrupted, writes concentrate on specific cells causing premature failure, or data becomes scattered unpredictably across the drive.
                                </p>
                                <p className="text-secondary leading-relaxed">
                                    Recovery requires <strong className="text-primary">reverse-engineering the specific wear leveling algorithm</strong> used by your drive's manufacturer and controller generation. Our team maintains a comprehensive database of Samsung, Intel, Micron, SanDisk, and Western Digital wear leveling schemes, enabling us to reconstruct data even when the algorithm has failed catastrophically.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SSD vs HDD Recovery Differences */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-8">Critical Differences: SSD vs HDD Recovery</h2>

                        <div className="glass-card p-8 md:p-10 rounded-2xl border border-border">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="pb-4 text-primary font-bold text-lg">Aspect</th>
                                            <th className="pb-4 text-primary font-bold text-lg">HDD Recovery</th>
                                            <th className="pb-4 text-primary font-bold text-lg">SSD Recovery</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-secondary">
                                        <tr className="border-b border-border/50">
                                            <td className="py-4 font-semibold text-primary">Primary Failure Type</td>
                                            <td className="py-4">Mechanical (head crash, motor failure, platter damage)</td>
                                            <td className="py-4">Electronic (controller failure, NAND degradation, firmware corruption)</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-4 font-semibold text-primary">Deleted File Recovery</td>
                                            <td className="py-4">Highly recoverable - data remains on platters until overwritten</td>
                                            <td className="py-4">Nearly impossible if TRIM executed - data permanently erased at hardware level</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-4 font-semibold text-primary">Physical Access</td>
                                            <td className="py-4">Direct platter reading in cleanroom with specialized heads</td>
                                            <td className="py-4">Chip-off recovery - NAND chip removal and direct memory reading</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-4 font-semibold text-primary">Logical Structure</td>
                                            <td className="py-4">Linear addressing - LBA directly maps to physical sectors</td>
                                            <td className="py-4">Complex FTL (Flash Translation Layer) with dynamic remapping</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-4 font-semibold text-primary">Encryption Impact</td>
                                            <td className="py-4">Usually software-based, recoverable with keys</td>
                                            <td className="py-4">Often hardware-based AES-256, unrecoverable without keys</td>
                                        </tr>
                                        <tr className="border-b border-border/50">
                                            <td className="py-4 font-semibold text-primary">Required Expertise</td>
                                            <td className="py-4">Mechanical engineering, cleanroom techniques</td>
                                            <td className="py-4">Electrical engineering, firmware reverse-engineering, cryptography</td>
                                        </tr>
                                        <tr>
                                            <td className="py-4 font-semibold text-primary">Recovery Timeline</td>
                                            <td className="py-4">3-7 days for physical failures</td>
                                            <td className="py-4">7-14 days for chip-off, 3-5 days for firmware/controller issues</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Our SSD Recovery Process */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-8">Our Advanced SSD Recovery Process</h2>

                        <div className="space-y-6">
                            <div className="glass-card p-8 rounded-2xl border-l-4 border-accent">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-3">Diagnostic & Triage Assessment</h3>
                                        <p className="text-secondary leading-relaxed mb-3">
                                            We begin with comprehensive diagnostics using specialized SSD analysis tools. Our PC-3000 Flash system performs controller-level diagnostics to identify whether the failure is firmware-based, controller hardware failure, or NAND chip degradation. We also check SMART data (if accessible) for wear indicators, power cycle counts, and error logs.
                                        </p>
                                        <p className="text-secondary leading-relaxed">
                                            This phase determines the recovery pathway: logical recovery for firmware issues, controller transplant for processor failures, or chip-off for catastrophic failures. We provide you with a detailed technical assessment and fixed-price quote within 24-48 hours - no surprises, no hidden fees.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border-l-4 border-accent">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-3">Firmware-Level Recovery Attempts</h3>
                                        <p className="text-secondary leading-relaxed mb-3">
                                            For drives with controller access, we attempt firmware-level recovery first. This involves reading the service area (SA) - a hidden region containing firmware, configuration data, and FTL backup tables. We use manufacturer-specific utilities to extract SA dumps, analyze translation tables, and identify corrupted sectors.
                                        </p>
                                        <p className="text-secondary leading-relaxed">
                                            If firmware corruption is detected, we inject clean firmware from donor drives while preserving your drive's unique identifiers (serial number, manufacturing data, encryption keys). This technique can restore full drive functionality without chip removal, significantly reducing recovery time and cost.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border-l-4 border-accent">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-3">Chip-Off NAND Extraction (When Necessary)</h3>
                                        <p className="text-secondary leading-relaxed mb-3">
                                            When controller replacement or firmware repair fails, we proceed to chip-off recovery. This involves physically removing NAND flash chips from the PCB using precision hot air rework stations in our Class 100 cleanroom. Each chip is carefully desoldered, cleaned, and prepared for direct reading.
                                        </p>
                                        <p className="text-secondary leading-relaxed">
                                            We then use specialized NAND readers (UP-828P, PC-3000 Flash, and custom-built programmers) to dump raw data from each chip at the lowest possible level - reading pages, blocks, and even individual cells. For multi-chip configurations, we must correctly identify chip positions and interleaving patterns to reconstruct the original data structure.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border-l-4 border-accent">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-3">Algorithmic Data Reconstruction</h3>
                                        <p className="text-secondary leading-relaxed mb-3">
                                            Raw NAND dumps are scrambled, error-corrected, and distributed according to proprietary wear leveling and FTL algorithms. This is where most recovery attempts fail - without manufacturer-specific knowledge, the data appears as random binary noise.
                                        </p>
                                        <p className="text-secondary leading-relaxed">
                                            Our team reverse-engineers the specific controller's algorithm using firmware analysis, ECC decoding, and pattern recognition. We reconstruct the logical page order, apply de-scrambling algorithms, and rebuild the file system structure. This process often involves writing custom Python scripts for each unique controller variant - there's no one-size-fits-all solution in SSD recovery.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-2xl border-l-4 border-accent">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold flex-shrink-0">5</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-3">Data Validation & Delivery</h3>
                                        <p className="text-secondary leading-relaxed mb-3">
                                            Once data is reconstructed, we perform extensive validation: file system integrity checks, file header verification, and sample file opening tests across multiple file types. We use forensic hashing (MD5, SHA-256) to ensure data integrity and provide you with a detailed recovery report listing all recovered files.
                                        </p>
                                        <p className="text-secondary leading-relaxed">
                                            Recovered data is delivered on encrypted external drives or secure cloud transfer (your choice). We provide multiple copies and maintain a 30-day backup of recovered data in our secure storage. Your original drive is returned to you, and we provide a certificate of data destruction if you require secure disposal of the failed hardware.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Specialized SSD Tools & Capabilities */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-8">Specialized Tools & Lab Capabilities</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <Microscope className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-3">PC-3000 Flash</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Industry-standard SSD recovery platform with controller-specific utilities for Samsung, Intel, SanDisk, Micron, and more. Enables firmware modification, service area editing, and translator rebuilding.
                                </p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <HardDrive className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-3">NAND Programmers</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    UP-828P and custom readers for direct NAND chip interfacing. Support for TSOP, BGA, and LGA packages with adjustable voltage reading for marginal cells.
                                </p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <Cpu className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-3">BGA Rework Stations</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Precision hot air and infrared stations for safe chip removal from modern SSDs with BGA (Ball Grid Array) packaging. Essential for chip-off recovery without damaging NAND chips.
                                </p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-3">Class 100 Cleanroom</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    ISO 5 certified cleanroom with positive pressure, HEPA filtration, and ESD protection. Prevents particle contamination during chip handling and microscopic soldering work.
                                </p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <Database className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-3">Firmware Database</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Proprietary collection of SSD firmware, service area structures, and FTL algorithms for 200+ controller models. Years of reverse-engineering research compiled into actionable recovery procedures.
                                </p>
                            </div>

                            <div className="glass-card p-6 rounded-2xl text-center">
                                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-accent" />
                                </div>
                                <h3 className="text-lg font-bold text-primary mb-3">Forensic Certification</h3>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Our team includes ACE (AccessData Certified Examiner) and EnCE (EnCase Certified Examiner) professionals for legally admissible forensic recovery and chain-of-custody documentation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-surface border-y border-border mb-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">Frequently Asked Questions</h2>
                            <p className="text-secondary text-lg">Expert answers to common SSD recovery questions</p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="glass-card rounded-2xl border border-border overflow-hidden">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-accent/5 transition-colors"
                                    >
                                        <h3 className="text-lg font-bold text-primary pr-4">{faq.question}</h3>
                                        {openFAQ === index ? (
                                            <ChevronUp className="w-5 h-5 text-accent flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-accent flex-shrink-0" />
                                        )}
                                    </button>
                                    {openFAQ === index && (
                                        <div className="px-6 pb-6">
                                            <p className="text-secondary leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 mb-12">
                <div className="max-w-5xl mx-auto">
                    <div className="glass-card p-10 md:p-12 rounded-3xl bg-brand-gradient text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-3xl md:text-4xl font-black mb-4">Don't Let SSD Failure Mean Data Loss</h2>
                            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                                Our specialized SSD recovery team has the tools, expertise, and cleanroom facilities to recover your critical data when other labs give up. Free diagnostic evaluation - no data, no charge guarantee.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a
                                    href="tel:+919701087446"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-accent font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
                                >
                                    <Phone className="w-5 h-5" />
                                    <span>Call +91-9701087446</span>
                                </a>
                                <a
                                    href="#/contact"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>Request Consultation</span>
                                </a>
                            </div>
                            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    <span>No Data, No Charge</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    <span>24/7 Emergency Service</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    <span>Confidential & Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Trust Section */}
            <section className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card p-8 rounded-2xl border border-border">
                        <h3 className="text-2xl font-bold text-primary mb-4">Why Choose Swaz Solutions for SSD Recovery?</h3>
                        <div className="grid md:grid-cols-3 gap-6 text-left">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                    <h4 className="font-bold text-primary">Deep Technical Expertise</h4>
                                </div>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Our engineers include former SSD controller developers who understand firmware at the source code level.
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                    <h4 className="font-bold text-primary">Advanced Equipment</h4>
                                </div>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Over $150,000 invested in specialized SSD recovery tools that most labs simply don't have access to.
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                                    <h4 className="font-bold text-primary">Transparent Pricing</h4>
                                </div>
                                <p className="text-sm text-secondary leading-relaxed">
                                    Fixed quotes after diagnostics. No hidden fees, no surprises. You only pay if we recover your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
