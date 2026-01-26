import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

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
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    }, []);

    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include' // Send httpOnly cookies automatically
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
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
    }, [refreshAccessToken]);

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
