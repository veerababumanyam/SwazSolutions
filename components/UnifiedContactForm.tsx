import React, { useState } from 'react';
import { 
    Send, 
    CheckCircle, 
    AlertCircle, 
    Lock, 
    Shield, 
    Zap, 
    Building2, 
    Users, 
    MessageSquare,
    Mail,
    Phone,
    Briefcase,
    Activity,
    FileWarning,
    HardDrive,
    Bot
} from 'lucide-react';

type ContactType = 'data-recovery' | 'agentic-ai';

interface DataRecoveryFormData {
    name: string;
    email: string;
    phone: string;
    deviceType: string;
    symptoms: string;
    honeypot: string;
    timestamp: number;
}

interface AgenticAIFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    companySize: string;
    serviceType: string;
    projectDescription: string;
    budget: string;
    timeline: string;
    honeypot: string;
    timestamp: number;
}

interface UnifiedContactFormProps {
    className?: string;
    defaultType?: ContactType;
}

export const UnifiedContactForm: React.FC<UnifiedContactFormProps> = ({ 
    className = '', 
    defaultType = 'data-recovery' 
}) => {
    const [contactType, setContactType] = useState<ContactType>(defaultType);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    // Data Recovery Form State
    const [dataRecoveryData, setDataRecoveryData] = useState<DataRecoveryFormData>({
        name: '',
        email: '',
        phone: '',
        deviceType: 'Laptop / Desktop Drive',
        symptoms: '',
        honeypot: '',
        timestamp: Date.now()
    });

    // Agentic AI Form State
    const [agenticAIData, setAgenticAIData] = useState<AgenticAIFormData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        companySize: '',
        serviceType: 'Autonomous AI Agents',
        projectDescription: '',
        budget: '',
        timeline: '',
        honeypot: '',
        timestamp: Date.now()
    });

    const handleDataRecoveryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDataRecoveryData(prev => ({ ...prev, [name]: value }));
    };

    const handleAgenticAIChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAgenticAIData(prev => ({ ...prev, [name]: value }));
    };

    const handleDataRecoverySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/contact/submit-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...dataRecoveryData,
                    isEmergency: emergencyMode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus('success');
                setSubmitMessage(data.message || 'Ticket submitted successfully!');
                setDataRecoveryData({
                    name: '',
                    email: '',
                    phone: '',
                    deviceType: 'Laptop / Desktop Drive',
                    symptoms: '',
                    honeypot: '',
                    timestamp: Date.now()
                });
                setEmergencyMode(false);
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.message || data.error || 'Failed to submit ticket. Please try again.');
            }
        } catch (error) {
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAgenticAISubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            const response = await fetch('http://localhost:3000/api/contact/agentic-ai-inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...agenticAIData,
                    timestamp: Date.now()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitStatus('success');
                setSubmitMessage(data.message || 'Thank you! We\'ll contact you within 24 hours to discuss your project.');
                setAgenticAIData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    companySize: '',
                    serviceType: 'Autonomous AI Agents',
                    projectDescription: '',
                    budget: '',
                    timeline: '',
                    honeypot: '',
                    timestamp: Date.now()
                });
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.message || data.error || 'Failed to submit inquiry. Please try again.');
            }
        } catch (error) {
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (contactType === 'data-recovery') {
            handleDataRecoverySubmit(e);
        } else {
            handleAgenticAISubmit(e);
        }
    };

    return (
        <div className={`glass-card p-8 md:p-12 rounded-3xl shadow-2xl border-border bg-background/50 relative overflow-hidden ${className}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-gradient"></div>

            {/* Toggle Switch Section */}
            <div className="mb-8">
                <div className="flex justify-center mb-6">
                    <div className="contact-toggle-container">
                        <button
                            type="button"
                            onClick={() => {
                                if (contactType !== 'data-recovery') {
                                    setContactType('data-recovery');
                                    setSubmitStatus('idle');
                                    setSubmitMessage('');
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`contact-toggle-btn ${contactType === 'data-recovery' ? 'active' : ''}`}
                            aria-pressed={contactType === 'data-recovery'}
                            aria-label="Switch to Data Recovery form"
                        >
                            <HardDrive className="w-5 h-5" />
                            <span>Data Recovery</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (contactType !== 'agentic-ai') {
                                    setContactType('agentic-ai');
                                    setSubmitStatus('idle');
                                    setSubmitMessage('');
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`contact-toggle-btn ${contactType === 'agentic-ai' ? 'active' : ''}`}
                            aria-pressed={contactType === 'agentic-ai'}
                            aria-label="Switch to Agentic AI Development form"
                        >
                            <Bot className="w-5 h-5" />
                            <span>Agentic AI Development</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Header Based on Contact Type */}
                {contactType === 'data-recovery' ? (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-primary mb-2">Open Priority Ticket</h2>
                            <p className="text-secondary">Start your free evaluation today. <strong>15 min</strong> average response time for emergency cases.</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-accent/5 text-accent rounded-lg border border-accent/20 animate-pulse shadow-sm">
                            <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>
                            <span className="text-xs font-bold uppercase">Lab Engineers Online</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-primary">Get Started with Agentic AI</h2>
                            <p className="text-secondary">Schedule a free consultation to discuss your project</p>
                        </div>
                    </div>
                )}

                {/* Trust Indicators for Agentic AI */}
                {contactType === 'agentic-ai' && (
                    <div className="flex flex-wrap gap-4 text-sm text-secondary mt-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span>Free Consultation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span>24-48 Hour Response</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span>NDA Available</span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl animate-fade-in">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-300">Success!</h4>
                                <p className="text-sm text-green-700 dark:text-green-400">{submitMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl animate-fade-in">
                        <div className="flex items-start gap-3">
                            {contactType === 'data-recovery' ? (
                                <FileWarning className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h4 className="font-bold text-red-800 dark:text-red-300">Error</h4>
                                <p className="text-sm text-red-700 dark:text-red-400">{submitMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Honeypot field - hidden from users, visible to bots */}
                <input 
                    type="text" 
                    name="honeypot" 
                    value={contactType === 'data-recovery' ? dataRecoveryData.honeypot : agenticAIData.honeypot}
                    onChange={contactType === 'data-recovery' ? handleDataRecoveryChange : handleAgenticAIChange}
                    style={{ position: 'absolute', left: '-9999px' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                />

                {/* Data Recovery Form Fields */}
                {contactType === 'data-recovery' && (
                    <>
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
                                <input 
                                    type="text" 
                                    name="name"
                                    value={dataRecoveryData.name}
                                    onChange={handleDataRecoveryChange}
                                    className="input rounded-xl" 
                                    placeholder="John Doe" 
                                    required 
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={dataRecoveryData.email}
                                    onChange={handleDataRecoveryChange}
                                    className="input rounded-xl" 
                                    placeholder="john@company.com" 
                                    required 
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Phone Number</label>
                                <input 
                                    type="tel" 
                                    name="phone"
                                    value={dataRecoveryData.phone}
                                    onChange={handleDataRecoveryChange}
                                    className="input rounded-xl" 
                                    placeholder="(555) 000-0000" 
                                    required 
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Device Type</label>
                                <select 
                                    name="deviceType"
                                    value={dataRecoveryData.deviceType}
                                    onChange={handleDataRecoveryChange}
                                    className="input rounded-xl"
                                    disabled={isSubmitting}
                                >
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
                            <textarea 
                                name="symptoms"
                                value={dataRecoveryData.symptoms}
                                onChange={handleDataRecoveryChange}
                                rows={3} 
                                className="input rounded-xl" 
                                placeholder="e.g. Dropped drive, clicking noise, water damage, deleted files..." 
                                required
                                disabled={isSubmitting}
                            ></textarea>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl">
                            <input type="checkbox" id="consent-dr" className="mt-1 w-4 h-4 text-accent focus:ring-accent rounded border-gray-300" required disabled={isSubmitting} />
                            <label htmlFor="consent-dr" className="text-sm text-secondary cursor-pointer">
                                I agree to the <span className="text-accent font-medium">No Data, No Charge</span> policy. I understand the initial evaluation is 100% free and risk-free.
                            </label>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-lg ${emergencyMode ? 'bg-accent hover:bg-accent-hover shadow-accent/20' : 'btn-primary'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Activity className="w-5 h-5" /> {emergencyMode ? 'Start EMERGENCY Recovery' : 'Start Free Evaluation'}
                                </>
                            )}
                        </button>
                    </>
                )}

                {/* Agentic AI Form Fields */}
                {contactType === 'agentic-ai' && (
                    <>
                        {/* Personal Information */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="ai-name" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <input 
                                        type="text" 
                                        id="ai-name"
                                        name="name"
                                        value={agenticAIData.name}
                                        onChange={handleAgenticAIChange}
                                        className="input rounded-xl pl-11" 
                                        placeholder="John Doe" 
                                        required 
                                        disabled={isSubmitting}
                                        minLength={2}
                                        maxLength={100}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="ai-email" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Work Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <input 
                                        type="email" 
                                        id="ai-email"
                                        name="email"
                                        value={agenticAIData.email}
                                        onChange={handleAgenticAIChange}
                                        className="input rounded-xl pl-11" 
                                        placeholder="john@company.com" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="ai-phone" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <input 
                                        type="tel" 
                                        id="ai-phone"
                                        name="phone"
                                        value={agenticAIData.phone}
                                        onChange={handleAgenticAIChange}
                                        className="input rounded-xl pl-11" 
                                        placeholder="+1 (555) 000-0000" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="ai-company" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Company Name *
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <input 
                                        type="text" 
                                        id="ai-company"
                                        name="company"
                                        value={agenticAIData.company}
                                        onChange={handleAgenticAIChange}
                                        className="input rounded-xl pl-11" 
                                        placeholder="Acme Corporation" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Company & Project Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="ai-companySize" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Company Size
                                </label>
                                <select 
                                    id="ai-companySize"
                                    name="companySize"
                                    value={agenticAIData.companySize}
                                    onChange={handleAgenticAIChange}
                                    className="input rounded-xl"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select size...</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="501-1000">501-1000 employees</option>
                                    <option value="1001+">1000+ employees</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="ai-serviceType" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Service Type *
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                                    <select 
                                        id="ai-serviceType"
                                        name="serviceType"
                                        value={agenticAIData.serviceType}
                                        onChange={handleAgenticAIChange}
                                        className="input rounded-xl pl-11"
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="Autonomous AI Agents">Autonomous AI Agents</option>
                                        <option value="Multi-Agent Orchestration">Multi-Agent Orchestration</option>
                                        <option value="AI Assistant Development">AI Assistant Development</option>
                                        <option value="Decision-Support Agents">Decision-Support Agents</option>
                                        <option value="Operational Agents">Operational Agents</option>
                                        <option value="RAG-Powered Agents">RAG-Powered Agents</option>
                                        <option value="Custom Multi-Modal Agents">Custom Multi-Modal Agents</option>
                                        <option value="RPA-Enhanced Agents">RPA-Enhanced Agents</option>
                                        <option value="Full AI Strategy Consultation">Full AI Strategy Consultation</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Project Description */}
                        <div>
                            <label htmlFor="ai-projectDescription" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                Project Description *
                            </label>
                            <textarea 
                                id="ai-projectDescription"
                                name="projectDescription"
                                value={agenticAIData.projectDescription}
                                onChange={handleAgenticAIChange}
                                rows={4} 
                                className="input rounded-xl resize-none" 
                                placeholder="Describe your project requirements, business challenges, and desired outcomes..." 
                                required
                                disabled={isSubmitting}
                                minLength={20}
                                maxLength={2000}
                            ></textarea>
                            <div className="text-xs text-muted mt-1 text-right">
                                {agenticAIData.projectDescription.length}/2000 characters
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="ai-budget" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Estimated Budget
                                </label>
                                <select 
                                    id="ai-budget"
                                    name="budget"
                                    value={agenticAIData.budget}
                                    onChange={handleAgenticAIChange}
                                    className="input rounded-xl"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select budget range...</option>
                                    <option value="<$25k">Less than $25,000</option>
                                    <option value="$25k-$50k">$25,000 - $50,000</option>
                                    <option value="$50k-$100k">$50,000 - $100,000</option>
                                    <option value="$100k-$250k">$100,000 - $250,000</option>
                                    <option value="$250k+">$250,000+</option>
                                    <option value="not-sure">Not sure yet</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="ai-timeline" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                                    Target Timeline
                                </label>
                                <select 
                                    id="ai-timeline"
                                    name="timeline"
                                    value={agenticAIData.timeline}
                                    onChange={handleAgenticAIChange}
                                    className="input rounded-xl"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select timeline...</option>
                                    <option value="asap">ASAP (1-2 months)</option>
                                    <option value="3-6-months">3-6 months</option>
                                    <option value="6-12-months">6-12 months</option>
                                    <option value="12+-months">12+ months</option>
                                    <option value="exploring">Just exploring</option>
                                </select>
                            </div>
                        </div>

                        {/* Privacy & Consent */}
                        <div className="flex items-start gap-3 p-4 bg-surface border border-border rounded-xl">
                            <input 
                                type="checkbox" 
                                id="consent-ai" 
                                className="mt-1 w-4 h-4 text-accent focus:ring-accent rounded border-gray-300" 
                                required 
                                disabled={isSubmitting}
                            />
                            <label htmlFor="consent-ai" className="text-sm text-secondary cursor-pointer">
                                I agree to be contacted about Agentic AI solutions and understand that my information will be handled according to Swaz Solutions' privacy policy. NDA available upon request.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-lg btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting Your Inquiry...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> 
                                    Request Consultation
                                </>
                            )}
                        </button>
                    </>
                )}

                {/* Security Badges */}
                <p className="text-center text-xs text-muted flex flex-wrap justify-center items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 inline" /> {contactType === 'data-recovery' ? '256-bit Encryption' : 'SSL Encrypted'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 inline" /> {contactType === 'data-recovery' ? 'HIPAA Compliant' : 'NDA Available'}
                    </span>
                    {contactType === 'agentic-ai' && (
                        <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 inline" /> No Commitment Required
                        </span>
                    )}
                </p>
            </form>
        </div>
    );
};
