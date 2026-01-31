import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getPreferences } from '../services/preferencesApi';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'pro' | 'admin';
    picture?: string;
    subscriptionStatus?: string;
    subscriptionEnd?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (user: User) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isRefreshingRef = useRef(false);

    // Refresh access token using httpOnly cookie
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        // Prevent concurrent refresh attempts
        if (isRefreshingRef.current) {
            return false;
        }

        isRefreshingRef.current = true;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include', // Send httpOnly cookies
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                return true;
            } else {
                // Refresh failed - clear user state
                setUser(null);
                return false;
            } else {
                // Token refresh successful - apply user preferences
                applyUserPreferences();
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    // Load and apply user preferences
    const applyUserPreferences = useCallback(async () => {
        try {
            const preferences = await getPreferences();

            // Apply theme preference
            const theme = preferences.appearance.theme;
            const htmlElement = document.documentElement;

            if (theme === 'dark') {
                htmlElement.classList.add('dark');
            } else if (theme === 'light') {
                htmlElement.classList.remove('dark');
            } else if (theme === 'system') {
                // Detect system preference
                const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (isDarkMode) {
                    htmlElement.classList.add('dark');
                } else {
                    htmlElement.classList.remove('dark');
                }

                // Listen for system theme changes
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const handleChange = (e: MediaQueryListEvent) => {
                    if (e.matches) {
                        htmlElement.classList.add('dark');
                    } else {
                        htmlElement.classList.remove('dark');
                    }
                };
                mediaQuery.addEventListener('change', handleChange);
                return () => mediaQuery.removeEventListener('change', handleChange);
            }
        } catch (error) {
            console.error('Failed to load user preferences:', error);
            // Continue without preferences - use defaults
        }
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include' // Send httpOnly cookies automatically
            });

            if (response.ok) {
                const data = await response.json();

                // Handle new response format with authenticated flag
                if (data.authenticated === false) {
                    setUser(null);
                } else if (data.user) {
                    setUser(data.user);
                    // Load and apply user preferences after authentication
                    applyUserPreferences();
                } else {
                    setUser(null);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));

                // Check if token expired - try refresh
                if (errorData.code === 'TOKEN_EXPIRED') {
                    const refreshed = await refreshAccessToken();
                    if (!refreshed) {
                        setUser(null);
                    }
                } else {
                    // Token invalid or missing
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [refreshAccessToken, applyUserPreferences]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = useCallback((userData: User) => {
        setUser(userData);
        // No token storage needed - backend sets httpOnly cookies
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include' // Send httpOnly cookies
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Clear user state
            setUser(null);
            // Redirect to home page
            window.location.href = '/';
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            login,
            logout,
            checkAuth,
            refreshAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
