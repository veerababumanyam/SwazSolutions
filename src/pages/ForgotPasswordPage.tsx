import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic email validation
        if (!email || !email.includes('@')) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setEmailSent(true);
                showToast('Reset link sent! Check your email.', 'success');
            } else {
                showToast(data.error || 'Failed to send reset email', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Success state - show confirmation message
    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/15 to-accent-orange/10 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in text-center">
                        {/* Success Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>

                        <h1 className="text-3xl font-black text-primary mb-4">Check Your Email</h1>

                        <p className="text-secondary mb-6">
                            If an account exists for <strong className="text-primary">{email}</strong>,
                            you'll receive a password reset link within a few minutes.
                        </p>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                                <strong>Didn't receive an email?</strong>
                            </p>
                            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                                <li>Check your spam/junk folder</li>
                                <li>Make sure you entered the correct email</li>
                                <li>Wait a few minutes and try again</li>
                            </ul>
                        </div>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-accent font-semibold hover:underline underline-offset-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Request form
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/15 to-accent-orange/10 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-6">
                            <img
                                src="/assets/SwazLogo.webp"
                                alt="Swaz Solutions Logo"
                                className="w-16 h-16 rounded-2xl shadow-lg"
                            />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">Reset Password</h1>
                        <p className="text-secondary text-base">
                            Enter your email to receive a reset link
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-primary" htmlFor="reset-email-input">
                                Email Address
                            </label>
                            <div className={`relative rounded-xl transition-all duration-300 ${
                                focusedField === 'email'
                                    ? 'ring-2 ring-accent/50 shadow-lg'
                                    : 'ring-1 ring-border hover:ring-accent/30'
                            }`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className={`h-5 w-5 transition-colors duration-300 ${
                                        focusedField === 'email' ? 'text-accent' : 'text-muted'
                                    }`} />
                                </div>
                                <input
                                    id="reset-email-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-surface text-primary placeholder:text-muted rounded-xl py-4 pl-12 pr-4 outline-none transition-colors text-base border-0"
                                    placeholder="your.email@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base mt-6"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Send Reset Link'
                            )}
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-secondary hover:text-accent transition-colors text-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                            <strong>Note:</strong> If you signed up with Google, use Google Sign-In instead
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
