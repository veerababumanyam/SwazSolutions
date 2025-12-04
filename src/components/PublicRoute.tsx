// PublicRoute Component (T028)
// Wrapper for routes that are accessible without authentication
// Can optionally show different content for authenticated vs guest users

import React from 'react';
import { Navigate } from 'react-router-dom';

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
  redirectTo = '/profile/dashboard'
}) => {
  // Check if user is authenticated (placeholder - will use AuthContext)
  const isAuthenticated = false; // TODO: Use useAuth() hook from AuthContext

  // If route should redirect authenticated users (e.g., login page)
  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Allow access regardless of authentication status
  return <>{children}</>;
};
