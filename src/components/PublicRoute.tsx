// PublicRoute Component (T028)
// Wrapper for routes that are accessible without authentication
// Can optionally show different content for authenticated vs guest users

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

/**
 * PublicRoute - Allows access without authentication
 * 
 * @param redirectIfAuthenticated - If true, redirects authenticated users to redirectTo
 * @param redirectTo - Where to redirect authenticated users (default: /profile/dashboard)
 * 
 * Use cases:
 * 1. Public profile viewing (/u/:username) - accessible to everyone
 * 2. Login/Register pages - redirect if already authenticated
 * 3. Marketing/landing pages - show to everyone
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectIfAuthenticated = false,
  redirectTo = '/profile'  // Changed from /profile/dashboard to unified panel
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
