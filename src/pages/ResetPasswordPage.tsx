import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [email, setEmail] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setIsVerifying(false);
            setTokenError('No reset token provided');
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch(`/api/auth/verify-reset-token/${token}`);
                const data = await res.json();

                if (data.valid) {
                    setTokenValid(true);
                    setEmail(data.email);
                } else {
                    setTokenError(data.error || 'Invalid or expired token');
                }
            } catch (error) {
                setTokenError('Failed to verify token');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        // Password strength check (same as registration)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            showToast(
                'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
                'error'
            );
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setResetSuccess(true);
                showToast('Password reset successfully!', 'success');

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                showToast(data.error || 'Failed to reset password', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
                    <p className="text-secondary">Verifying reset token...</p>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-2xl text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-black text-primary mb-4">Invalid Reset Link</h1>
                        <p className="text-secondary mb-6">{tokenError}</p>

                        <div className="space-y-3">
                            <Link
                                to="/forgot-password"
                                className="block w-full bg-brand-gradient text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:opacity-90"
                            >
                                Request New Link
                            </Link>
                            <Link
                                to="/login"
                                className="block w-full text-accent font-semibold hover:underline"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (resetSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="w-full max-w-md">
                    <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-2xl text-center animate-fade-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>

                        <h1 className="text-3xl font-black text-primary mb-4">Password Reset!</h1>
                        <p className="text-secondary mb-6">
                            Your password has been successfully changed.
                            Redirecting to login...
                        </p>

                        <div className="flex items-center justify-center gap-2 text-sm text-muted">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Redirecting in 3 seconds</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Reset form
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
                        <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">Set New Password</h1>
                        <p className="text-secondary text-sm">
                            for <strong className="text-primary">{email}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-primary" htmlFor="new-password-input">
                                New Password
                            </label>
                            <div className={`relative rounded-xl transition-all duration-300 ${
                                focusedField === 'password'
                                    ? 'ring-2 ring-accent/50 shadow-lg'
                                    : 'ring-1 ring-border hover:ring-accent/30'
                            }`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                                        focusedField === 'password' ? 'text-accent' : 'text-muted'
                                    }`} />
                                </div>
                                <input
                                    id="new-password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-surface text-primary placeholder:text-muted rounded-xl py-4 pl-12 pr-12 outline-none transition-colors text-base border-0"
                                    placeholder="Enter new password"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-primary transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-primary" htmlFor="confirm-password-input">
                                Confirm Password
                            </label>
                            <div className={`relative rounded-xl transition-all duration-300 ${
                                focusedField === 'confirmPassword'
                                    ? 'ring-2 ring-accent/50 shadow-lg'
                                    : 'ring-1 ring-border hover:ring-accent/30'
                            }`}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                                        focusedField === 'confirmPassword' ? 'text-accent' : 'text-muted'
                                    }`} />
                                </div>
                                <input
                                    id="confirm-password-input"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-surface text-primary placeholder:text-muted rounded-xl py-4 pl-12 pr-12 outline-none transition-colors text-base border-0"
                                    placeholder="Confirm new password"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-primary transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">
                                Password must contain:
                            </p>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                <li>At least 8 characters</li>
                                <li>One uppercase letter</li>
                                <li>One lowercase letter</li>
                                <li>One number</li>
                                <li>One special character (@$!%*?&)</li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base mt-6"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
