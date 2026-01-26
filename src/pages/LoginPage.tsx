import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Lock, ArrowRight, Eye, EyeOff, Shield, Zap } from 'lucide-react';

declare global {
    interface Window {
        google: any;
        handleGoogleCredentialResponse?: (response: any) => void;
    }
}

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [googleError, setGoogleError] = useState<string | null>(null);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    const from = location.state?.from?.pathname || '/music';

    // Memoized callback to handle Google response
    const handleGoogleCallback = useCallback(async (response: any) => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: response.credential }),
            });

            const data = await res.json();

            if (res.ok) {
                // Backend sets httpOnly cookies - no token storage needed
                login(data.user);
                showToast('Successfully logged in with Google!', 'success');
                navigate(from, { replace: true });
            } else {
                showToast(data.error || 'Google login failed', 'error');
            }
        } catch (error) {
            showToast('An error occurred during Google login', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [login, showToast, navigate, from]);

    useEffect(() => {
        // Set up global callback
        window.handleGoogleCredentialResponse = handleGoogleCallback;

        return () => {
            delete window.handleGoogleCredentialResponse;
        };
    }, [handleGoogleCallback]);

    useEffect(() => {
        // Suppress Google OAuth console errors
        const originalError = console.error;
        const errorFilter = (message: any, ...args: any[]) => {
            if (typeof message === 'string' && (
                message.includes('GSI_LOGGER') ||
                message.includes('The given origin is not allowed') ||
                message.includes('credential_button_library')
            )) {
                // Set user-facing error message
                if (message.includes('The given origin is not allowed')) {
                    const origin = window.location.origin;
                    setGoogleError(`Google Sign-In is not configured for ${origin}. Please add this origin to your Google Cloud Console OAuth client settings.`);
                }
                return; // Suppress Google OAuth configuration errors
            }
            originalError(message, ...args);
        };
        console.error = errorFilter;

        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

        const initializeGoogleSignIn = () => {
            if (window.google && googleButtonRef.current && !initializedRef.current) {
                try {
                    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: (response: any) => {
                            if (window.handleGoogleCredentialResponse) {
                                window.handleGoogleCredentialResponse(response);
                            }
                        },
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    window.google.accounts.id.renderButton(
                        googleButtonRef.current,
                        {
                            theme: "outline",
                            size: "large",
                            text: "continue_with",
                            shape: "pill",
                            logo_alignment: "center"
                        }
                    );
                    initializedRef.current = true;
                    setGoogleLoaded(true);
                } catch (error) {
                    // Silently handle initialization errors
                    setGoogleLoaded(false);
                }
            }
        };

        if (existingScript) {
            // Script already loaded, just initialize
            if (window.google) {
                initializeGoogleSignIn();
            } else {
                existingScript.addEventListener('load', initializeGoogleSignIn);
            }
        } else {
            // Load the script
            const script = document.createElement('script');
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            script.onerror = () => console.error('Failed to load Google Sign-In script');
            document.head.appendChild(script);
        }

        return () => {
            initializedRef.current = false;
            console.error = originalError; // Restore original console.error
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Backend sets httpOnly cookies - no token storage needed
                login(data.user);
                showToast('Successfully logged in!', 'success');
                navigate(from, { replace: true });
            } else {
                showToast(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            showToast('An error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-accent/15 to-accent-orange/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-accent/50 rounded-full animate-pulse"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-accent-orange/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-accent/40 rounded-full animate-pulse" style={{ animationDelay: '700ms' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Main Card */}
                <div className="bg-surface/95 backdrop-blur-xl border border-border rounded-3xl p-8 md:p-10 shadow-2xl animate-fade-in">
                    {/* Logo & Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center mb-6">
                            <img 
                                src="/assets/SwazLogo.webp" 
                                alt="Swaz Solutions Logo" 
                                className="w-20 h-20 rounded-2xl shadow-lg"
                                style={{ boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.25)' }}
                            />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">Welcome Back</h1>
                        <p className="text-secondary text-base">Sign in to continue to your dashboard</p>
                    </div>

                    {/* Google Sign In - Primary CTA - Always Highlighted */}
                    <div className="mb-8">
                        {/* Error message for Google OAuth configuration issues */}
                        {googleError && (
                            <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                                    <strong>Google Sign-In Configuration Issue:</strong>
                                </p>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                                    {googleError}
                                </p>
                                <details className="text-xs">
                                    <summary className="cursor-pointer text-yellow-600 dark:text-yellow-400 hover:underline mb-2">
                                        How to fix this
                                    </summary>
                                    <ol className="list-decimal list-inside space-y-1 text-yellow-700 dark:text-yellow-300 ml-2">
                                        <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console Credentials</a></li>
                                        <li>Click on your OAuth 2.0 Client ID</li>
                                        <li>Under "Authorized JavaScript origins", add: <code className="bg-yellow-500/20 px-1 rounded">{window.location.origin}</code></li>
                                        <li>Click "SAVE" and wait 30-60 seconds</li>
                                        <li>Refresh this page</li>
                                    </ol>
                                </details>
                            </div>
                        )}
                        {/* Prominent Google Button with animated glow */}
                        <div className="relative group">
                            {/* Animated gradient glow - always visible, stronger on hover */}
                            <div 
                                className="absolute -inset-1 rounded-2xl opacity-60 group-hover:opacity-80 blur-md transition-all duration-500 animate-pulse"
                                style={{ background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853, #4285F4)', backgroundSize: '200% 100%' }}
                            ></div>
                            <div 
                                className="absolute -inset-0.5 rounded-xl opacity-40"
                                style={{ background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC05, #34A853)' }}
                            ></div>
                            
                            {/* Button container */}
                            <div className="relative bg-surface rounded-xl p-3 shadow-xl transition-all duration-300 group-hover:shadow-2xl border border-border/50 min-h-[56px] overflow-hidden">
                                {/* Google's rendered button */}
                                <div 
                                    ref={googleButtonRef} 
                                    className="w-full max-w-full flex justify-center items-center [&>div]:w-full [&>div]:max-w-full [&>div>div]:w-full [&>div>div]:max-w-full [&>div>div>div]:justify-center [&>div>div>div]:max-w-full"
                                ></div>
                                
                                {/* Fallback custom button if Google button doesn't load */}
                                {!googleLoaded && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Trigger Google Sign-In if available
                                            if (window.google?.accounts?.id) {
                                                window.google.accounts.id.prompt();
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                        <span className="text-gray-700 font-semibold text-base">Continue with Google</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Recommendation badge */}
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'rgb(16, 185, 129)' }}>
                                <Zap className="w-3 h-3" />
                                Fastest sign-in method
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-surface text-muted text-sm font-medium">or sign in with email</span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-primary">
                                Username or Email
                            </label>
                            <div className={`relative rounded-xl transition-all duration-300 ${
                                focusedField === 'username' 
                                    ? 'ring-2 ring-accent/50 shadow-lg' 
                                    : 'ring-1 ring-border hover:ring-accent/30'
                            }`}
                            style={focusedField === 'username' ? { boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.1)' } : {}}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className={`h-5 w-5 transition-colors duration-300 ${
                                        focusedField === 'username' ? 'text-accent' : 'text-muted'
                                    }`} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-surface text-primary placeholder:text-muted rounded-xl py-4 pl-12 pr-4 outline-none transition-colors text-base border-0"
                                    placeholder="Enter your username"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-primary">
                                Password
                            </label>
                            <div className={`relative rounded-xl transition-all duration-300 ${
                                focusedField === 'password' 
                                    ? 'ring-2 ring-accent/50 shadow-lg' 
                                    : 'ring-1 ring-border hover:ring-accent/30'
                            }`}
                            style={focusedField === 'password' ? { boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.1)' } : {}}>
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                                        focusedField === 'password' ? 'text-accent' : 'text-muted'
                                    }`} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full bg-surface text-primary placeholder:text-muted rounded-xl py-4 pl-12 pr-12 outline-none transition-colors text-base border-0"
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-gradient hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 text-base mt-8"
                            style={{ boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.3)' }}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center">
                        <p className="text-secondary">
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="text-accent font-semibold hover:underline underline-offset-4 transition-colors"
                            >
                                Create one free
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 flex items-center justify-center gap-6 text-muted text-sm">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                        <span>Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
                        <span>Fast</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" style={{ color: '#3B82F6' }} />
                        <span>Private</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
