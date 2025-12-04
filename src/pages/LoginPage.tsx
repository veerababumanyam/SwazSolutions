import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Music, Mail, Lock, ArrowRight } from 'lucide-react';

declare global {
    interface Window {
        google: any;
        handleGoogleCredentialResponse?: (response: any) => void;
    }
}

export const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const initializedRef = useRef(false);

    const from = location.state?.from?.pathname || '/studio';

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
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
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
        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        
        const initializeGoogleSignIn = () => {
            if (window.google && googleButtonRef.current && !initializedRef.current) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
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
                            width: 280,
                            text: "signin_with",
                            shape: "rectangular"
                        }
                    );
                    initializedRef.current = true;
                    setGoogleLoaded(true);
                } catch (error) {
                    console.error('Error initializing Google Sign-In:', error);
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
                // Store token in localStorage
                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                }
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md card animate-fade-in">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Music className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to access your studio</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div ref={googleButtonRef} className="w-full flex justify-center"></div>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input pl-10"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input pl-10"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn btn-primary justify-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <p className="text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
