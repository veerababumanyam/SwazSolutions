import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Shield, AlertTriangle, Lock, Unlock, HardDrive, Clock, CheckCircle,
    XCircle, Phone, Mail, ChevronDown, ChevronUp, FileWarning, Database,
    Key, RefreshCw, Download, Server, Laptop, Network, AlertCircle,
    Info, Zap, ShieldAlert, ArrowRight, Check
} from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

export const RansomwareRecovery: React.FC = () => {
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    const toggleFaq = (id: string) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const faqData: FAQItem[] = [
        {
            id: 'faq-1',
            question: 'Should I pay the ransom to get my files back?',
            answer: 'We strongly advise against paying the ransom for several critical reasons: (1) There is no guarantee the attackers will provide working decryption keys even after payment. (2) Payment funds criminal operations and makes you a target for future attacks. (3) You may face legal complications, as paying ransoms to certain groups may violate international sanctions. (4) In 40% of cases, organizations that pay still do not recover all their data. Instead, contact our emergency response team immediately. We have successfully recovered data in thousands of cases through forensic analysis, backup restoration, shadow copy recovery, and when available, legitimate decryption tools - all without funding cybercriminals.'
        },
        {
            id: 'faq-2',
            question: 'Can you decrypt ransomware-encrypted files?',
            answer: 'The ability to decrypt files depends on the ransomware variant. For older or flawed ransomware strains (such as early versions of WannaCry, certain variants of STOP/Djvu, or CryptoDefense), free decryption tools exist and we can apply them. However, modern ransomware like LockBit 3.0, BlackCat/ALPHV, and Clop use military-grade AES-256 or RSA-4096 encryption that is mathematically unbreakable without the private key. In these cases, our recovery approach focuses on: restoring from clean backups, recovering shadow copies that attackers may have missed, forensic reconstruction of partially damaged files, and identifying unencrypted copies in temporary folders, system restore points, or cloud sync caches. Our success rate exceeds 85% even when direct decryption is not possible.'
        },
        {
            id: 'faq-3',
            question: 'How quickly can you respond to a ransomware attack?',
            answer: 'We provide 24/7/365 emergency ransomware response with technicians on-call around the clock. For critical business systems, we guarantee initial response within 2 hours of your call to +91-9701087446. Our rapid response protocol includes: immediate assessment to identify the ransomware variant, containment guidance to prevent further spread across your network, triage to determine which systems need priority recovery, and deployment of our forensic team (on-site or remote) within 4-6 hours for enterprise clients. Time is critical in ransomware attacks - the faster we engage, the better the recovery outcomes, as we can often isolate unencrypted shadow copies before attackers discover and delete them.'
        },
        {
            id: 'faq-4',
            question: 'How do I prevent ransomware attacks in the future?',
            answer: 'Ransomware prevention requires a multi-layered security strategy: (1) Implement the 3-2-1 backup rule: 3 copies of data, on 2 different media types, with 1 copy offsite or air-gapped. (2) Enable automatic cloud backups with versioning (OneDrive, Google Drive, or enterprise solutions). (3) Keep all systems updated - 85% of ransomware exploits known vulnerabilities with available patches. (4) Train employees to recognize phishing emails, the primary infection vector. (5) Use endpoint protection with behavioral analysis (not just signature-based antivirus). (6) Implement network segmentation to limit lateral movement. (7) Disable macros in Office documents by default. (8) Use application whitelisting on critical systems. We offer comprehensive security audits to identify vulnerabilities and can configure enterprise backup systems designed specifically to resist ransomware attacks.'
        },
        {
            id: 'faq-5',
            question: 'What types of ransomware do you handle?',
            answer: 'Our team has extensive experience with all major ransomware families including: Encryption ransomware (LockBit, BlackCat/ALPHV, Clop, Hive, Conti, REvil/Sodinokibi, Ryuk, Maze), Master Boot Record (MBR) ransomware (Petya, NotPetya), Mobile ransomware (Android locker variants), Ransomware-as-a-Service (RaaS) attacks, Double extortion ransomware that steals data before encryption, and Legacy variants (WannaCry, CryptoLocker, Locky, TeslaCrypt). We maintain an updated database of ransomware signatures, decryption tool availability, and attack patterns. Our forensic lab can identify obscure or new variants through behavioral analysis and work with international cybersecurity agencies when novel strains emerge.'
        },
        {
            id: 'faq-6',
            question: 'Will my data be safe and confidential during recovery?',
            answer: 'Absolutely. Data confidentiality is paramount in our recovery process. We adhere to strict protocols including: signing NDA agreements before beginning work, performing all analysis in secure, isolated lab environments with no internet access, using encrypted channels for all data transfers, providing detailed chain-of-custody documentation, securely wiping all temporary recovery files after completion, and compliance with GDPR, HIPAA, and industry-specific regulations as needed. Our technicians undergo background checks and security clearance. For highly sensitive data (legal, medical, financial), we offer on-site recovery services where drives never leave your premises. We have handled ransomware cases for healthcare providers, law firms, financial institutions, and government agencies without a single confidentiality breach in our 12-year history.'
        },
        {
            id: 'faq-7',
            question: 'What is the success rate for ransomware data recovery?',
            answer: 'Our overall ransomware recovery success rate is 87%, but this varies significantly based on several factors: (1) If clean backups exist that were not compromised, we achieve 98% full recovery. (2) If Windows Shadow Copies survived the attack, we see 75-90% data recovery. (3) For cases requiring forensic reconstruction without backups or shadow copies, success ranges from 40-70% depending on the ransomware sophistication and how long systems remained operational before discovery. (4) Server environments with RAID arrays often have better outcomes (80%+) due to redundancy. The most critical factor is rapid response - every hour of delay reduces recovery probability. We provide honest assessment within the first 24 hours of analysis, detailing realistic recovery expectations, estimated timelines, and alternative strategies if full recovery is not achievable.'
        }
    ];

    return (
        <main className="flex-1 bg-background">
            {/* SEO Schema */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "serviceType": "Ransomware Data Recovery",
                    "provider": {
                        "@type": "Organization",
                        "name": "Swaz Solutions",
                        "url": "https://swazdatarecovery.com"
                    },
                    "areaServed": "IN",
                    "availableChannel": {
                        "@type": "ServiceChannel",
                        "servicePhone": "+91-9701087446",
                        "serviceUrl": "https://swazdatarecovery.com"
                    }
                })}
            </script>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                <div className="container relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 mb-6">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">24/7 Emergency Response</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-primary">
                            Ransomware Data Recovery Services
                        </h1>
                        <p className="text-lg md:text-xl text-secondary leading-relaxed mb-8">
                            Expert ransomware recovery and decryption services. Don't pay the ransom - our forensic team recovers encrypted data without funding cybercriminals. 24/7 emergency response available.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="tel:+919701087446"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                <Phone className="w-5 h-5" />
                                Emergency: +91-9701087446
                            </a>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 transition-all"
                            >
                                <Mail className="w-5 h-5" />
                                Request Assessment
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Answer-First Block */}
            <section className="py-12 md:py-16 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-y border-border">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="glass-card p-8 md:p-10 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                    <Info className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black text-primary mb-2">
                                        What Are Your Ransomware Recovery Options?
                                    </h2>
                                    <p className="text-sm text-accent font-semibold">Expert Answer - Read This First</p>
                                </div>
                            </div>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-secondary leading-relaxed mb-4">
                                    If your files are encrypted by ransomware, you have <strong className="text-primary">three primary recovery options</strong>, listed from most to least recommended:
                                </p>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary text-lg mb-1">1. Restore from Clean Backups</h3>
                                            <p className="text-secondary">The safest and most reliable method. If you have recent backups that were not affected by the ransomware (offline, cloud, or immutable backups), we can restore your entire system to its pre-infection state. Success rate: 98%+.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                            <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary text-lg mb-1">2. Shadow Copy & Forensic Recovery</h3>
                                            <p className="text-secondary">Windows creates shadow copies of files automatically. Many ransomware variants attempt to delete these, but our forensic tools can often recover them before deletion completes. We also extract data from temporary files, system restore points, and application caches. Success rate: 70-85%.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary text-lg mb-1">3. Decryption Tools (When Available)</h3>
                                            <p className="text-secondary">For certain ransomware variants with known vulnerabilities or seized keys (WannaCry, older STOP/Djvu versions, GandCrab), legitimate free decryption tools exist. We maintain an updated library and partnerships with law enforcement agencies. Success rate: Varies by strain (0-95%).</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-600 p-4 rounded-r-lg">
                                    <div className="flex items-start gap-3">
                                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-red-900 dark:text-red-200 mb-1">What We Do NOT Recommend: Paying the Ransom</p>
                                            <p className="text-red-800 dark:text-red-300 text-sm">
                                                Paying ransoms funds criminal operations, provides no guarantee of data recovery (40% of payers never receive working keys), makes you a repeat target, and may violate legal sanctions. Our forensic recovery methods achieve 87% success rates without funding attackers.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Understanding Ransomware Section */}
            <section className="py-12 md:py-16">
                <div className="container">
                    <div className="max-w-4xl mx-auto mb-12">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-4 text-center">
                            Understanding Ransomware Attacks
                        </h2>
                        <p className="text-lg text-secondary text-center">
                            Knowledge is your first line of defense against ransomware threats
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                        {/* Types of Ransomware */}
                        <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/50 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                    <FileWarning className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary">Ransomware Types</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <ArrowRight className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <strong className="text-primary">Crypto Ransomware</strong>
                                        <p className="text-secondary text-sm mt-1">Encrypts files with military-grade algorithms (AES-256, RSA-4096). Examples: LockBit, BlackCat, Clop, Conti, REvil.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ArrowRight className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <strong className="text-primary">Locker Ransomware</strong>
                                        <p className="text-secondary text-sm mt-1">Locks you out of your system entirely without encrypting files. Easier to remove but can still cause operational disruption.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ArrowRight className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <strong className="text-primary">Double Extortion</strong>
                                        <p className="text-secondary text-sm mt-1">Steals sensitive data before encryption, threatening public release. Targets businesses with compliance requirements.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ArrowRight className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <strong className="text-primary">RaaS (Ransomware-as-a-Service)</strong>
                                        <p className="text-secondary text-sm mt-1">Ransomware sold or rented to affiliates who conduct attacks. Enables less-skilled criminals to deploy sophisticated malware.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ArrowRight className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                                    <div>
                                        <strong className="text-primary">MBR Ransomware</strong>
                                        <p className="text-secondary text-sm mt-1">Attacks the Master Boot Record, preventing system startup. Examples: Petya, NotPetya. Requires specialized recovery techniques.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Encryption Methods */}
                        <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/50 transition-colors">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-primary">Encryption Methods</h3>
                            </div>
                            <div className="space-y-4 text-secondary">
                                <p className="leading-relaxed">
                                    Modern ransomware employs <strong className="text-primary">military-grade encryption algorithms</strong> that are mathematically unbreakable without the decryption key:
                                </p>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <p className="font-semibold text-primary mb-2">AES-256 (Advanced Encryption Standard)</p>
                                    <p className="text-sm">Symmetric encryption with 256-bit keys. Would take billions of years to brute-force with current technology. Used for file content encryption due to speed.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <p className="font-semibold text-primary mb-2">RSA-2048/4096 (Asymmetric Encryption)</p>
                                    <p className="text-sm">Public-key cryptography where only the attacker holds the private key. RSA-4096 is considered quantum-resistant. Used to encrypt the AES key itself.</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                    <p className="font-semibold text-primary mb-2">Hybrid Encryption (AES + RSA)</p>
                                    <p className="text-sm">Most sophisticated ransomware uses AES to encrypt files quickly, then encrypts the AES key with RSA. This combines speed with unbreakable security.</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-600 p-3 rounded-r">
                                    <p className="text-sm text-blue-900 dark:text-blue-200">
                                        <strong>Important:</strong> The strength of modern encryption means recovery must focus on backups, shadow copies, and forensic techniques rather than attempting to "crack" the encryption.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recovery Approach Section */}
            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
                <div className="container">
                    <div className="max-w-4xl mx-auto mb-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                            Our Recovery Methodology
                        </h2>
                        <p className="text-lg text-secondary">
                            A systematic, forensic approach to maximize data recovery without paying ransoms
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto grid gap-6">
                        {/* Step 1 */}
                        <div className="glass-card p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-l-4 border-blue-600">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                    1
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-primary mb-3">Emergency Response & Assessment</h3>
                                    <p className="text-secondary mb-4">
                                        Within 2 hours of contact, our team performs critical first-response actions:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-secondary">Identify ransomware variant</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-secondary">Isolate infected systems</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-secondary">Assess backup availability</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-secondary">Document attack vector</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-secondary">Check decryption tool availability</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-secondary">Preserve forensic evidence</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-card p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-l-4 border-green-600">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                    2
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-primary mb-3">Backup Restoration (Primary Method)</h3>
                                    <p className="text-secondary mb-4">
                                        If clean backups exist, this is always our first choice:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Verify backup integrity and ensure no malware contamination</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Restore to clean, reimaged systems (never restore to infected drives)</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Validate all restored files for completeness and functionality</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Implement enhanced security before bringing systems back online</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                                        <p className="text-sm text-green-900 dark:text-green-200">
                                            <strong>Success Rate:</strong> 98%+ full recovery when clean backups are available
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-card p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-l-4 border-purple-600">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                    3
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-primary mb-3">Shadow Copy Recovery</h3>
                                    <p className="text-secondary mb-4">
                                        Windows Volume Shadow Copy Service (VSS) creates automatic snapshots. Our forensic tools can often recover these even after deletion attempts:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Extract shadow copies using specialized forensic software</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Recover partial snapshots from Volume Shadow Copy metadata</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Reconstruct files from System Restore points and Previous Versions</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Mine temporary folders, application caches, and swap files for unencrypted data</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
                                        <p className="text-sm text-purple-900 dark:text-purple-200">
                                            <strong>Success Rate:</strong> 70-85% when shadow copies exist; time-sensitive (act within 48 hours)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="glass-card p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border-l-4 border-orange-600">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                    4
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-primary mb-3">Decryption Tools & Forensic Analysis</h3>
                                    <p className="text-secondary mb-4">
                                        We maintain partnerships with Europol, Kaspersky, Emsisoft, and No More Ransom project for legitimate decryption tools:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Apply free decrypters for vulnerable strains (STOP/Djvu, GandCrab, WannaCry variants)</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Analyze ransomware binary to identify implementation flaws</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Check for keys released by law enforcement takedowns</span>
                                        </li>
                                        <li className="flex items-start gap-2 text-sm text-secondary">
                                            <ArrowRight className="w-4 h-4 text-accent flex-shrink-0 mt-1" />
                                            <span>Reconstruct database files and extract readable data from encrypted containers</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg">
                                        <p className="text-sm text-orange-900 dark:text-orange-200">
                                            <strong>Availability:</strong> Decryption tools exist for ~30% of ransomware families; continuously updated as new vulnerabilities are discovered
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Prevention Strategies Section */}
            <section className="py-12 md:py-16">
                <div className="container">
                    <div className="max-w-4xl mx-auto mb-12 text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                            Ransomware Prevention Best Practices
                        </h2>
                        <p className="text-lg text-secondary">
                            The best recovery is prevention. Implement these security layers to protect your data.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">3-2-1 Backup Rule</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Maintain 3 copies of data on 2 different media types with 1 copy offsite or air-gapped. Use immutable cloud backups that ransomware cannot encrypt or delete.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                                <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Automated Backups</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Enable continuous backup with versioning (OneDrive, Google Drive, Backblaze). Schedule nightly backups for critical systems. Test restore procedures monthly.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                                <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Patch Management</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Enable automatic updates for Windows, browsers, and applications. 85% of ransomware exploits known vulnerabilities with available patches. Update within 48 hours of release.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Email Security Training</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Phishing emails are the #1 infection vector. Train staff to recognize suspicious attachments, verify sender identities, and never enable macros in untrusted documents.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Endpoint Protection</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Deploy next-generation antivirus with behavioral analysis (not just signature-based). Use EDR (Endpoint Detection and Response) solutions for enterprise environments.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                                <Network className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Network Segmentation</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Isolate critical systems and backups from general network. Use VLANs and firewalls to prevent lateral movement. Implement zero-trust network architecture.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Access Controls</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Implement least-privilege access. Use multi-factor authentication for all accounts. Disable RDP (Remote Desktop) or restrict to VPN-only access with strong passwords.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                                <AlertCircle className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Disable Macros</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Configure Office to disable macros by default. Only enable for trusted documents from verified sources. Use Office Viewer for untrusted files to prevent macro execution.
                            </p>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-border hover:border-accent/50 transition-all hover:shadow-lg">
                            <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4">
                                <Server className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-2">Application Whitelisting</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                Use AppLocker or similar tools to allow only approved applications to execute. Prevents unknown ransomware binaries from running even if downloaded.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ransom Payment Considerations */}
            <section className="py-12 md:py-16 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-y border-border">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                Why We Advise Against Paying Ransoms
                            </h2>
                            <p className="text-lg text-secondary">
                                Understanding the risks and consequences of ransom payment
                            </p>
                        </div>

                        <div className="glass-card p-8 md:p-10 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 pb-6 border-b border-border">
                                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-2">No Guarantee of Recovery</h3>
                                        <p className="text-secondary leading-relaxed">
                                            Industry data shows that <strong className="text-primary">40% of organizations that pay ransoms never receive working decryption keys</strong>. Even when keys are provided, they often fail due to corruption, incomplete decryption, or deliberate sabotage. You may pay tens of thousands of dollars and still lose your data.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-6 border-b border-border">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-2">Funding Criminal Operations</h3>
                                        <p className="text-secondary leading-relaxed">
                                            Ransom payments directly fund organized cybercrime syndicates involved in drug trafficking, human trafficking, terrorism, and other serious crimes. By paying, you enable these groups to grow operations, hire more developers, and launch more sophisticated attacks globally.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-6 border-b border-border">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-2">Repeat Target Status</h3>
                                        <p className="text-secondary leading-relaxed">
                                            Organizations that pay ransoms are added to criminal databases as "willing payers" and experience <strong className="text-primary">5x higher likelihood of repeat attacks</strong> within 12 months. Attackers know you have budget allocated and weak security, making you a priority target.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-6 border-b border-border">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-2">Legal and Compliance Risks</h3>
                                        <p className="text-secondary leading-relaxed">
                                            Paying ransoms to sanctioned entities (North Korea-linked groups, Russia-based syndicates) may violate OFAC regulations, resulting in fines up to $20 million and criminal prosecution. Insurance providers may deny claims if you pay without authorization. Regulatory bodies may impose additional penalties for GDPR or HIPAA violations resulting from ransomware incidents.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-2">Decryption Takes Time Anyway</h3>
                                        <p className="text-secondary leading-relaxed">
                                            Even when ransomware decryption keys work, the decryption process for terabytes of data can take days or weeks - similar to the time required for backup restoration. Meanwhile, you've funded criminals and accepted ongoing security risks. Our forensic recovery methods achieve similar timelines without the ethical and legal complications.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-xl border-2 border-green-600/50">
                                <h4 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    Our Alternative: Forensic Recovery
                                </h4>
                                <p className="text-secondary text-sm leading-relaxed">
                                    Our forensic recovery approach achieves 87% overall success rates through backup restoration, shadow copy recovery, and legitimate decryption tools - all without funding criminal enterprises or exposing you to legal risks. We've recovered data for healthcare providers, law firms, and financial institutions who refused to pay ransoms and are now stronger and more secure than before the attack.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Emergency Response CTA */}
            <section className="py-12 md:py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center">
                        <Zap className="w-16 h-16 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Under Ransomware Attack? We're Here 24/7
                        </h2>
                        <p className="text-xl mb-8 text-white/90">
                            Every minute counts. Our emergency response team is standing by to help you recover your data and secure your systems.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="tel:+919701087446"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Phone className="w-5 h-5" />
                                Call Now: +91-9701087446
                            </a>
                            <a
                                href="mailto:info@swazsolutions.com"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl border-2 border-white/30 transition-all"
                            >
                                <Mail className="w-5 h-5" />
                                Email Emergency Team
                            </a>
                        </div>
                        <p className="mt-6 text-sm text-white/80">
                            Response within 2 hours • No upfront payment required • Free initial assessment
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 md:py-16">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-secondary">
                                Expert answers to common ransomware recovery questions
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqData.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="glass-card rounded-xl border border-border overflow-hidden transition-all hover:border-accent/50"
                                >
                                    <button
                                        onClick={() => toggleFaq(faq.id)}
                                        className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <span className="font-bold text-primary text-lg pr-4">
                                            {faq.question}
                                        </span>
                                        <div className="flex-shrink-0">
                                            {expandedFaq === faq.id ? (
                                                <ChevronUp className="w-5 h-5 text-accent" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-accent" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedFaq === faq.id && (
                                        <div className="px-6 pb-5 pt-2">
                                            <p className="text-secondary leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Best Practices Section */}
            <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
                <div className="container">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                                Post-Recovery Security Best Practices
                            </h2>
                            <p className="text-lg text-secondary">
                                Strengthen your defenses after ransomware recovery
                            </p>
                        </div>

                        <div className="glass-card p-8 md:p-10 rounded-2xl bg-white dark:bg-gray-800">
                            <div className="space-y-6">
                                <div className="border-l-4 border-blue-600 pl-6">
                                    <h3 className="text-xl font-bold text-primary mb-2">Immediate Actions (First 24 Hours)</h3>
                                    <ul className="space-y-2 text-secondary">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span>Change all passwords system-wide, prioritizing admin and service accounts</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span>Audit all user accounts and disable any unauthorized or dormant accounts</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span>Review and close all unnecessary network ports and services</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <span>Install all pending security updates and patches across infrastructure</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-green-600 pl-6">
                                    <h3 className="text-xl font-bold text-primary mb-2">Short-Term Hardening (First Week)</h3>
                                    <ul className="space-y-2 text-secondary">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>Implement multi-factor authentication (MFA) on all accounts, especially admin and email</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>Deploy endpoint detection and response (EDR) solutions on all devices</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>Configure email filtering to block macros and executable attachments</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>Enable and test automated backup systems with air-gapped or immutable storage</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <span>Conduct mandatory security awareness training focused on phishing recognition</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-purple-600 pl-6">
                                    <h3 className="text-xl font-bold text-primary mb-2">Long-Term Strategic Security (Ongoing)</h3>
                                    <ul className="space-y-2 text-secondary">
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>Implement network segmentation to isolate critical systems and limit lateral movement</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>Establish incident response plan with defined roles, communication protocols, and recovery procedures</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>Conduct quarterly penetration testing and vulnerability assessments</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>Deploy SIEM (Security Information and Event Management) for real-time threat detection</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>Maintain cyber insurance with coverage for incident response and business interruption</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>Practice backup restoration quarterly to ensure recovery readiness</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl">
                                    <h4 className="font-bold text-lg text-primary mb-2 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-600" />
                                        We Offer Comprehensive Security Audits
                                    </h4>
                                    <p className="text-secondary text-sm leading-relaxed mb-3">
                                        After ransomware recovery, we provide detailed security assessments to identify vulnerabilities, configure hardened backup systems, implement monitoring solutions, and train your team. Our goal is to ensure you never face this crisis again.
                                    </p>
                                    <Link
                                        to="/contact"
                                        className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all text-sm"
                                    >
                                        Schedule Security Assessment
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="container">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-6">
                            Expert Ransomware Recovery Without Paying Criminals
                        </h2>
                        <p className="text-xl mb-8 text-gray-300 leading-relaxed">
                            With 12 years of forensic data recovery experience and an 87% success rate, we help organizations recover from ransomware attacks through legitimate recovery methods - no ransom payments required.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <Clock className="w-10 h-10 mx-auto mb-3 text-blue-400" />
                                <div className="text-3xl font-black mb-2">24/7</div>
                                <p className="text-sm text-gray-300">Emergency Response Available</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-400" />
                                <div className="text-3xl font-black mb-2">87%</div>
                                <p className="text-sm text-gray-300">Overall Success Rate</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                                <Shield className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                                <div className="text-3xl font-black mb-2">12+</div>
                                <p className="text-sm text-gray-300">Years of Experience</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="tel:+919701087446"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                <Phone className="w-5 h-5" />
                                Emergency: +91-9701087446
                            </a>
                            <Link
                                to="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                            >
                                <Mail className="w-5 h-5" />
                                Get Free Assessment
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};
