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
    Briefcase
} from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    companySize: string;
    teamSize: string;
    serviceType: string;
    projectDescription: string;
    projectRequirements: string;
    budget: string;
    timeline: string;
    honeypot: string;
    timestamp: number;
}

interface AgenticAIContactFormProps {
    className?: string;
}

export const AgenticAIContactForm: React.FC<AgenticAIContactFormProps> = ({ className = '' }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        companySize: '',
        teamSize: '',
        serviceType: 'Autonomous AI Agents',
        projectDescription: '',
        projectRequirements: '',
        budget: '',
        timeline: '',
        honeypot: '',
        timestamp: Date.now()
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            const response = await fetch('/api/contact/agentic-ai-inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    timestamp: Date.now()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitStatus('success');
                setSubmitMessage(data.message || 'Thank you! We\'ll contact you within 24 hours to discuss your project.');
                
                // Reset form on success
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    companySize: '',
                    teamSize: '',
                    serviceType: 'Autonomous AI Agents',
                    projectDescription: '',
                    projectRequirements: '',
                    budget: '',
                    timeline: '',
                    honeypot: '',
                    timestamp: Date.now()
                });

                // Clear success message after 10 seconds
                setTimeout(() => {
                    setSubmitStatus('idle');
                    setSubmitMessage('');
                }, 10000);
            } else {
                setSubmitStatus('error');
                setSubmitMessage(data.error || data.message || 'Failed to submit inquiry. Please try again or call us directly.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
            setSubmitMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`glass-card p-8 md:p-12 rounded-3xl shadow-2xl border-border bg-background/50 relative overflow-hidden ${className}`}>
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-gradient"></div>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-primary">Get Started with Agentic AI</h2>
                        <p className="text-secondary">Schedule a free consultation to discuss your project</p>
                    </div>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap gap-4 text-sm text-secondary">
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
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
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
                    value={formData.honeypot}
                    onChange={handleInputChange}
                    style={{ position: 'absolute', left: '-9999px' }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                />

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Full Name *
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                            <input 
                                type="text" 
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
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
                        <label htmlFor="email" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Work Email *
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                            <input 
                                type="email" 
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
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
                        <label htmlFor="phone" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Phone Number *
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                            <input 
                                type="tel" 
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="input rounded-xl pl-11" 
                                placeholder="+1 (555) 000-0000" 
                                required 
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="company" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Company Name *
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                            <input 
                                type="text" 
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleInputChange}
                                className="input rounded-xl pl-11" 
                                placeholder="Acme Corporation" 
                                required 
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>

                {/* Company & Team Details */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="companySize" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Company Size
                        </label>
                        <select
                            id="companySize"
                            name="companySize"
                            value={formData.companySize}
                            onChange={handleInputChange}
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
                        <label htmlFor="teamSize" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Technical Team Size *
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                            <select
                                id="teamSize"
                                name="teamSize"
                                value={formData.teamSize}
                                onChange={handleInputChange}
                                className="input rounded-xl pl-11"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select team size...</option>
                                <option value="solo">Solo / Individual</option>
                                <option value="2-5">2-5 team members</option>
                                <option value="6-10">6-10 team members</option>
                                <option value="11-25">11-25 team members</option>
                                <option value="26-50">26-50 team members</option>
                                <option value="50+">50+ team members</option>
                                <option value="not-applicable">Not applicable / Outsourced</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Service Type */}
                <div>
                    <label htmlFor="serviceType" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                        Service Type *
                    </label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                        <select
                            id="serviceType"
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleInputChange}
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
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="projectDescription" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                        Project Description *
                    </label>
                    <textarea
                        id="projectDescription"
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="input rounded-xl"
                        placeholder="Tell us about your use case, challenges, and what you're looking to achieve with Agentic AI..."
                        required
                        disabled={isSubmitting}
                        minLength={20}
                        maxLength={2000}
                    ></textarea>
                    <div className="text-xs text-muted mt-1 text-right">
                        {formData.projectDescription.length}/2000 characters
                    </div>
                </div>

                <div>
                    <label htmlFor="projectRequirements" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                        Key Project Requirements
                    </label>
                    <textarea
                        id="projectRequirements"
                        name="projectRequirements"
                        value={formData.projectRequirements}
                        onChange={handleInputChange}
                        rows={3}
                        className="input rounded-xl"
                        placeholder="List specific requirements: integrations needed, data sources, security requirements, compliance needs, etc..."
                        disabled={isSubmitting}
                        maxLength={1500}
                    ></textarea>
                    <div className="text-xs text-muted mt-1 text-right">
                        {formData.projectRequirements.length}/1500 characters
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="budget" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Estimated Budget
                        </label>
                        <select 
                            id="budget"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
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
                        <label htmlFor="timeline" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Target Timeline
                        </label>
                        <select 
                            id="timeline"
                            name="timeline"
                            value={formData.timeline}
                            onChange={handleInputChange}
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
                        id="consent" 
                        className="mt-1 w-4 h-4 text-accent focus:ring-accent rounded border-gray-300" 
                        required 
                        disabled={isSubmitting}
                    />
                    <label htmlFor="consent" className="text-sm text-secondary cursor-pointer">
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

                {/* Security Badges */}
                <div className="text-center text-xs text-muted flex flex-wrap justify-center items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 inline" /> SSL Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 inline" /> NDA Available
                    </span>
                    <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 inline" /> No Commitment Required
                    </span>
                </div>
            </form>
        </div>
    );
};
