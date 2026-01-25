import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

interface User {
    id: number;
    username: string;
    email: string;
    role: 'user' | 'pro' | 'admin';
    picture?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (user: User, token?: string, refreshToken?: string) => void;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token refresh threshold - refresh when less than 2 minutes remaining
const TOKEN_REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isRefreshingRef = useRef(false);

    // Parse JWT to get expiration time
    const getTokenExpiry = (token: string): number | null => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
        } catch {
            return null;
        }
    };

    // Refresh access token using refresh token
    const refreshAccessToken = useCallback(async (): Promise<boolean> => {
        // Prevent concurrent refresh attempts
        if (isRefreshingRef.current) {
            return false;
        }

        isRefreshingRef.current = true;

        try {
            const refreshToken = localStorage.getItem('refresh_token');

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                // Store new tokens
                localStorage.setItem('auth_token', data.token);
                if (data.refreshToken) {
                    localStorage.setItem('refresh_token', data.refreshToken);
                }
                setUser(data.user);

                // Schedule next refresh
                scheduleTokenRefresh(data.token);
                return true;
            } else {
                // Refresh failed - clear tokens and user
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    // Schedule automatic token refresh before expiry
    const scheduleTokenRefresh = useCallback((token: string) => {
        // Clear existing timer
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
        }

        const expiry = getTokenExpiry(token);
        if (!expiry) return;

        const timeUntilExpiry = expiry - Date.now();
        const refreshTime = timeUntilExpiry - TOKEN_REFRESH_THRESHOLD_MS;

        if (refreshTime > 0) {
            refreshTimerRef.current = setTimeout(() => {
                refreshAccessToken();
            }, refreshTime);
        } else if (timeUntilExpiry > 0) {
            // Token is about to expire, refresh immediately
            refreshAccessToken();
        }
    }, [refreshAccessToken]);

    const checkAuth = useCallback(async () => {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('auth_token');

            // Skip auth check if no token exists - avoids unnecessary 401 errors
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Check if token is expired
            const expiry = getTokenExpiry(token);
            if (expiry && expiry < Date.now()) {
                // Token expired, try to refresh
                const refreshed = await refreshAccessToken();
                if (!refreshed) {
                    setUser(null);
                }
                setLoading(false);
                return;
            }

            const response = await fetch('/api/auth/me', {
                credentials: 'include', // Include cookies
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                // Schedule token refresh
                scheduleTokenRefresh(token);
            } else {
                const errorData = await response.json().catch(() => ({}));

                // Check if token expired - try refresh
                if (errorData.code === 'TOKEN_EXPIRED') {
                    const refreshed = await refreshAccessToken();
                    if (!refreshed) {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('refresh_token');
                        setUser(null);
                    }
                } else {
                    // Token invalid - clear it
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [refreshAccessToken, scheduleTokenRefresh]);

    useEffect(() => {
        checkAuth();

        // Cleanup timer on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
            }
        };
    }, [checkAuth]);

    const login = useCallback((userData: User, token?: string, refreshToken?: string) => {
        setUser(userData);
        if (token) {
            localStorage.setItem('auth_token', token);
            scheduleTokenRefresh(token);
        }
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    }, [scheduleTokenRefresh]);

    const logout = useCallback(async () => {
        try {
            // Clear refresh timer
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }

            const refreshToken = localStorage.getItem('refresh_token');

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Always clear local storage and state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
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
