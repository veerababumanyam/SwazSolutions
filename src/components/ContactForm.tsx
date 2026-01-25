import React, { useState } from 'react';
import {
    Send,
    CheckCircle,
    AlertCircle,
    Lock,
    Shield,
    MessageSquare,
    Mail,
    User,
    FileText
} from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    honeypot: string;
    timestamp: number;
}

interface ContactFormProps {
    className?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ className = '' }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '',
        timestamp: Date.now()
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [submitMessage, setSubmitMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');
        setSubmitMessage('');

        try {
            const response = await fetch('/api/contact/general-inquiry', {
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
                setSubmitMessage(data.message || 'Thank you! We\'ll get back to you within 24-48 hours.');

                // Reset form on success
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
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
                setSubmitMessage(data.error || data.message || 'Failed to send message. Please try again.');
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
                        <h2 className="text-3xl font-black text-primary">Get In Touch</h2>
                        <p className="text-secondary">We'd love to hear from you</p>
                    </div>
                </div>

                {/* Trust indicators */}
                <div className="flex flex-wrap gap-4 text-sm text-secondary">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span>Quick Response</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>24-48 Hour Reply</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                {/* Success/Error Messages */}
                {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl animate-fade-in" data-testid="success-message">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-green-800 dark:text-green-300">Message Sent!</h4>
                                <p className="text-sm text-green-700 dark:text-green-400">{submitMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl animate-fade-in" data-testid="error-message">
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

                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Your Name *
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
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
                                data-testid="name-input"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Email Address *
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
                                placeholder="john@example.com"
                                required
                                disabled={isSubmitting}
                                data-testid="email-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Subject */}
                <div>
                    <label htmlFor="subject" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                        Subject *
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="input rounded-xl pl-11"
                            placeholder="How can we help you?"
                            required
                            disabled={isSubmitting}
                            minLength={3}
                            maxLength={200}
                            data-testid="subject-input"
                        />
                    </div>
                </div>

                {/* Message */}
                <div>
                    <label htmlFor="message" className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                        Message *
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        className="input rounded-xl"
                        placeholder="Tell us more about your inquiry..."
                        required
                        disabled={isSubmitting}
                        minLength={10}
                        maxLength={2000}
                        data-testid="message-input"
                    ></textarea>
                    <div className="text-xs text-muted mt-1 text-right">
                        {formData.message.length}/2000 characters
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-lg btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    data-testid="submit-button"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Sending Message...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Send Message
                        </>
                    )}
                </button>

                {/* Security Badge */}
                <div className="text-center text-xs text-muted flex flex-wrap justify-center items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 inline" /> SSL Encrypted
                    </span>
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 inline" /> Your data is secure
                    </span>
                </div>
            </form>
        </div>
    );
};
