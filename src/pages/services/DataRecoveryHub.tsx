import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  HardDrive,
  Shield,
  Clock,
  Award,
  CheckCircle,
  AlertTriangle,
  Server,
  Database,
  Smartphone,
  Zap,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  TrendingUp,
  Users,
  Lock,
  FileCheck,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Schema } from '../../components/Schema';
import { dataRecoveryFAQExpanded } from '../../schemas/faq/dataRecoveryFAQExpanded';

export const DataRecoveryHub: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Data Recovery Services India | 98% Success Rate | Free Diagnostics - Swaz Solutions</title>
        <meta
          name="description"
          content="Professional data recovery services in India with 98% success rate. RAID, SSD, HDD recovery specialists. Class 100 cleanroom facility. 24/7 emergency service. Free diagnostic evaluation. Call +91-9701087446."
        />
        <meta
          name="keywords"
          content="data recovery India, hard drive recovery, RAID recovery, SSD recovery, data recovery Hyderabad, emergency data recovery, cleanroom data recovery, professional data recovery, business data recovery"
        />
        <link rel="canonical" href="https://swazdatarecovery.com/#/services/data-recovery" />

        {/* Open Graph */}
        <meta property="og:title" content="Data Recovery Services India | 98% Success Rate - Swaz Solutions" />
        <meta property="og:description" content="Professional data recovery with 98% success rate. RAID, SSD, HDD specialists. Class 100 cleanroom. 24/7 emergency service. Free diagnostics." />
        <meta property="og:url" content="https://swazdatarecovery.com/#/services/data-recovery" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Data Recovery Services India | 98% Success Rate" />
        <meta name="twitter:description" content="Professional data recovery specialists. RAID, SSD, HDD recovery. Free diagnostics. Call +91-9701087446" />
      </Helmet>

      {/* FAQ Schema */}
      <Schema type="FAQPage" data={dataRecoveryFAQExpanded} />

      <main className="min-h-screen bg-background pt-20 pb-20">

        {/* Hero Section - Answer First */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-5xl mx-auto">
            {/* Trust Badge */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  12+ Years | 98% Success Rate | 24/7 Service
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 leading-tight">
                Professional Data Recovery Services
                <span className="block bg-brand-gradient bg-clip-text text-transparent mt-2">
                  Across All of India
                </span>
              </h1>
            </div>

            {/* Direct Answer Section - SEO Optimized */}
            <div className="glass-card p-8 md:p-10 rounded-3xl bg-surface/80 border border-border mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-4">What is Data Recovery?</h2>
                  <p className="text-lg text-secondary leading-relaxed mb-4">
                    Data recovery is the process of retrieving inaccessible, lost, corrupted, damaged, or formatted data from storage devices such as hard drives, SSDs, USB drives, RAID arrays, and flash media. At Swaz Solutions, we specialize in professional data recovery using advanced proprietary tools, a Class 100 cleanroom facility, and over 12 years of engineering expertise to achieve a 98% success rate across all device types and failure scenarios.
                  </p>
                  <p className="text-lg text-secondary leading-relaxed">
                    Whether you're dealing with mechanical hard drive failures (clicking sounds, head crashes), logical corruption (deleted files, formatted drives), physical damage (water, fire, impact), or complex RAID array failures, our certified technicians can recover your critical data when others cannot. We serve individuals, businesses, and enterprises across India with free diagnostic evaluations, transparent fixed-price quotes, and a no-data-no-fee guarantee.
                  </p>
                </div>
              </div>

              {/* Emergency CTA */}
              <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">Emergency Data Recovery Hotline</p>
                      <p className="text-xs text-secondary">Available 24/7 for Critical Cases</p>
                    </div>
                  </div>
                  <a
                    href="tel:+919701087446"
                    className="btn-primary px-6 py-3 rounded-xl font-bold text-white bg-brand-gradient hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                  >
                    <Phone className="w-4 h-4" />
                    +91-9701087446
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Award, label: "Success Rate", value: "98%" },
                { icon: Clock, label: "Experience", value: "12+ Years" },
                { icon: Shield, label: "Cleanroom", value: "Class 100" },
                { icon: Zap, label: "Service", value: "24/7" }
              ].map((stat, i) => (
                <div key={i} className="glass-card p-6 rounded-2xl text-center hover:-translate-y-1 transition-transform">
                  <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                  <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-xs text-secondary uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Offered Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                Comprehensive Data Recovery Services
              </h2>
              <p className="text-lg text-secondary max-w-3xl mx-auto">
                From simple deleted file recovery to complex multi-drive RAID reconstruction, we handle all data loss scenarios with the highest success rates in India.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service 1: Hard Drive Recovery */}
              <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HardDrive className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Hard Drive Recovery</h3>
                <p className="text-secondary mb-4 leading-relaxed">
                  Mechanical and logical recovery for all brands: Western Digital, Seagate, Toshiba, Hitachi, Samsung. We handle clicking sounds, head crashes, motor failures, firmware corruption, and bad sectors.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Cleanroom head swaps</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Platter repair & extraction</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>PCB replacement & repair</span>
                  </li>
                </ul>
                <div className="text-sm font-semibold text-accent">From ₹15,000</div>
              </div>

              {/* Service 2: RAID Recovery */}
              <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Server className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">RAID Array Recovery</h3>
                <p className="text-secondary mb-4 leading-relaxed">
                  Enterprise-grade RAID recovery for all levels: RAID 0, 1, 5, 6, 10, 50, 60. Virtual destriping technology for multi-drive failures. NAS and server specialists.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Multiple drive failures</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Controller card issues</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Rebuild failure recovery</span>
                  </li>
                </ul>
                <div className="text-sm font-semibold text-accent">From ₹40,000</div>
              </div>

              {/* Service 3: SSD Recovery */}
              <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">SSD & Flash Recovery</h3>
                <p className="text-secondary mb-4 leading-relaxed">
                  Advanced NAND chip recovery for SSDs, USB drives, SD cards, and microSD. Controller failure, TRIM issues, bad blocks, and firmware corruption specialists.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>NAND chip-off extraction</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Controller board repair</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Firmware reconstruction</span>
                  </li>
                </ul>
                <div className="text-sm font-semibold text-accent">From ₹20,000</div>
              </div>

              {/* Service 4: Logical Recovery */}
              <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileCheck className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Logical Data Recovery</h3>
                <p className="text-secondary mb-4 leading-relaxed">
                  Software-level recovery for deleted files, formatted drives, corrupted file systems, partition loss, and accidental data deletion. Fast turnaround times.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Deleted file restoration</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Format & partition recovery</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Corrupted file repair</span>
                  </li>
                </ul>
                <div className="text-sm font-semibold text-accent">From ₹8,000</div>
              </div>

              {/* Service 5: Physical Damage */}
              <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Physical Damage Recovery</h3>
                <p className="text-secondary mb-4 leading-relaxed">
                  Specialized recovery for water damage, fire damage, drops, impacts, electrical surges, and catastrophic failures. Ultrasonic cleaning and component-level repair.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Water & liquid damage</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Fire & smoke damage</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Impact & drop damage</span>
                  </li>
                </ul>
                <div className="text-sm font-semibold text-accent">From ₹25,000</div>
              </div>

              {/* Service 6: Mobile & Tablet */}
              <div className="glass-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">Mobile Device Recovery</h3>
                <p className="text-secondary mb-4 leading-relaxed">
                  iPhone, Android, and tablet data recovery. Internal storage chip extraction, deleted photo/video recovery, and broken device data extraction.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>iPhone NAND extraction</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Android chip-off recovery</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-primary">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span>Screen-damaged devices</span>
                  </li>
                </ul>
                <div className="text-sm font-semibold text-accent">From ₹12,000</div>
              </div>
            </div>
          </div>
        </section>

        {/* Recovery Process Section */}
        <section className="py-20 bg-surface border-y border-border mb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                  Our Professional Recovery Process
                </h2>
                <p className="text-lg text-secondary max-w-3xl mx-auto">
                  Transparent, systematic approach backed by 12+ years of engineering expertise. Every step documented and communicated clearly.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    step: "01",
                    icon: Phone,
                    title: "Contact & Consultation",
                    desc: "Call +91-9701087446 or fill our contact form. We provide immediate consultation, assess your situation, and provide shipping instructions. Emergency cases prioritized.",
                    time: "Immediate"
                  },
                  {
                    step: "02",
                    icon: FileCheck,
                    title: "Free Diagnostics",
                    desc: "Complete failure analysis in our certified lab. Identify root cause, assess recovery difficulty, and generate file list preview. Detailed technical report provided.",
                    time: "4-6 Hours"
                  },
                  {
                    step: "03",
                    icon: RefreshCw,
                    title: "Recovery Execution",
                    desc: "Upon approval, our certified technicians execute recovery using proprietary tools and Class 100 cleanroom for mechanical repairs. All work documented with chain-of-custody.",
                    time: "3-7 Days"
                  },
                  {
                    step: "04",
                    icon: CheckCircle,
                    title: "Data Return & Verification",
                    desc: "Recovered data delivered on new external drive or secure cloud transfer. You verify critical files before payment. Original device returned with secure wipe options.",
                    time: "Same Day"
                  }
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-colors h-full">
                      {/* Step Number */}
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white font-black text-lg mb-4">
                        {step.step}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <step.icon className="w-6 h-6 text-accent" />
                        <h3 className="text-lg font-bold text-primary">{step.title}</h3>
                      </div>

                      <p className="text-sm text-secondary leading-relaxed mb-4">{step.desc}</p>

                      <div className="flex items-center gap-2 text-xs font-bold text-accent">
                        <Clock className="w-4 h-4" />
                        <span>{step.time}</span>
                      </div>
                    </div>

                    {/* Arrow Connector (hidden on mobile, shown on desktop for all but last) */}
                    {i < 3 && (
                      <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ArrowRight className="w-6 h-6 text-accent" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                Why Swaz Solutions Stands Apart
              </h2>
              <p className="text-lg text-secondary max-w-3xl mx-auto">
                Industry-leading technology, certified facilities, and proven track record serving thousands of satisfied clients across India.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Benefit 1 */}
              <div className="glass-card p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">98% Success Rate</h3>
                    <p className="text-secondary leading-relaxed">
                      Our combination of certified cleanroom facilities, proprietary recovery tools, and 12+ years of engineering expertise enables us to successfully recover data in 98% of cases—even when other providers have failed. We maintain detailed success metrics across all device types and failure scenarios.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="glass-card p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">Class 100 Cleanroom</h3>
                    <p className="text-secondary leading-relaxed">
                      Our ISO-certified Class 100 cleanroom maintains fewer than 100 particles per cubic foot—essential for opening hard drives without causing head crashes or platter damage. Most competitors lack cleanroom facilities, leading to permanent data loss during mechanical repairs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="glass-card p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">Maximum Data Security</h3>
                    <p className="text-secondary leading-relaxed">
                      Strict chain-of-custody protocols, encrypted data transfer, isolated secure storage, and NDA agreements for sensitive cases. Your data is never shared, sold, or retained after recovery. We serve legal firms, healthcare providers, and enterprises with the highest confidentiality requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="glass-card p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">24/7 Emergency Service</h3>
                    <p className="text-secondary leading-relaxed">
                      Critical business data loss can't wait. Our emergency service provides immediate response, after-hours diagnostics, weekend processing, and expedited 24-48 hour turnaround times. Direct technician communication ensures your case receives priority attention when every minute counts.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 5 */}
              <div className="glass-card p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">Certified Engineers</h3>
                    <p className="text-secondary leading-relaxed">
                      Our recovery team includes hardware engineers, firmware specialists, and forensic data analysts with manufacturer-level training. Continuous education on emerging storage technologies (NVMe, 3D NAND, SMR drives) ensures we stay ahead of evolving data recovery challenges.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefit 6 */}
              <div className="glass-card p-8 rounded-2xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-3">No-Data-No-Fee Guarantee</h3>
                    <p className="text-secondary leading-relaxed">
                      You only pay if we successfully recover your data. After our free diagnostic evaluation, we provide a fixed-price quote and file preview. If we cannot recover your critical files, you pay nothing except return shipping. This guarantee demonstrates our confidence in our 98% success rate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-brand-gradient rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-black mb-4">Trusted by Thousands Across India</h2>
                  <p className="text-lg opacity-90 max-w-2xl mx-auto">
                    Serving individuals, businesses, enterprises, and government organizations since 2012
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-5xl font-black mb-2">5,000+</div>
                    <div className="text-sm uppercase tracking-wider opacity-80">Successful Recoveries</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black mb-2">98%</div>
                    <div className="text-sm uppercase tracking-wider opacity-80">Success Rate</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black mb-2">12+</div>
                    <div className="text-sm uppercase tracking-wider opacity-80">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black mb-2">24/7</div>
                    <div className="text-sm uppercase tracking-wider opacity-80">Emergency Service</div>
                  </div>
                </div>

                <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
                  <a
                    href="tel:+919701087446"
                    className="btn-primary px-8 py-4 rounded-xl font-bold bg-white text-accent hover:bg-white/90 transition-colors flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    Call Now: +91-9701087446
                  </a>
                  <a
                    href="#/contact"
                    className="btn-secondary px-8 py-4 rounded-xl font-bold border-2 border-white text-white hover:bg-white hover:text-accent transition-colors flex items-center gap-3"
                  >
                    <Mail className="w-5 h-5" />
                    Request Free Diagnostics
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-secondary">
                Get answers to common data recovery questions from our expert team
              </p>
            </div>

            <div className="space-y-4">
              {dataRecoveryFAQExpanded.mainEntity.slice(0, 7).map((faq, index) => (
                <details
                  key={index}
                  className="glass-card p-6 rounded-2xl border border-border hover:border-accent/30 transition-colors group"
                >
                  <summary className="font-bold text-lg text-primary cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.name}</span>
                    <ArrowRight className="w-5 h-5 text-accent transform group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-4 text-secondary leading-relaxed">
                    {faq.acceptedAnswer.text}
                  </div>
                </details>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-secondary mb-4">Have more questions? We're here to help.</p>
              <a
                href="#/contact"
                className="btn-primary px-6 py-3 rounded-xl font-bold text-white bg-brand-gradient hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Contact Our Team
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Related Services Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
                Specialized Recovery Services
              </h2>
              <p className="text-lg text-secondary">
                Explore our specialized data recovery solutions for specific device types and industries
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <a
                href="#/services/raid-recovery"
                className="glass-card p-6 rounded-2xl border border-border hover:border-accent/50 transition-all hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-bold text-primary">RAID Recovery</h3>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Specialized enterprise RAID array recovery with virtual destriping technology for all RAID levels.
                </p>
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  Learn More
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              <a
                href="#/services/ssd-recovery"
                className="glass-card p-6 rounded-2xl border border-border hover:border-accent/50 transition-all hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-bold text-primary">SSD Recovery</h3>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Advanced NAND chip recovery for SSDs and flash media using chip-off extraction and firmware repair.
                </p>
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  Learn More
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              <a
                href="#/services/database-recovery"
                className="glass-card p-6 rounded-2xl border border-border hover:border-accent/50 transition-all hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Server className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-bold text-primary">Database Recovery</h3>
                </div>
                <p className="text-sm text-secondary mb-4">
                  Critical business database recovery for SQL Server, Oracle, MySQL, PostgreSQL, and MongoDB.
                </p>
                <div className="flex items-center gap-2 text-accent font-semibold text-sm">
                  Learn More
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-10 md:p-12 rounded-3xl border border-border text-center">
              <h2 className="text-3xl md:text-4xl font-black text-primary mb-6">
                Don't Let Data Loss Cost You More
              </h2>
              <p className="text-lg text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                Every hour of delay increases the risk of permanent data loss. Our free diagnostic evaluation provides you with complete transparency—recovery difficulty, success probability, file preview, and fixed-price quote—with zero obligation.
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
                <a
                  href="tel:+919701087446"
                  className="btn-primary px-8 py-4 rounded-xl font-bold text-white bg-brand-gradient hover:opacity-90 transition-opacity flex items-center gap-3 w-full md:w-auto justify-center"
                >
                  <Phone className="w-5 h-5" />
                  Call +91-9701087446
                </a>
                <a
                  href="#/contact"
                  className="btn-secondary px-8 py-4 rounded-xl font-bold border-2 border-border text-primary hover:border-accent hover:text-accent transition-colors flex items-center gap-3 w-full md:w-auto justify-center"
                >
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>Free Diagnostics</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>No-Data-No-Fee</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-secondary">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span>98% Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};
