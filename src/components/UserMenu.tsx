import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Shield,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { LazyImage } from './LazyImage';
import { UserMenuItem } from './UserMenuItem';

export interface UserMenuProps {
  /** Optional className for custom styling */
  className?: string;
}

/**
 * User dropdown menu component
 * Displays user info and quick navigation to settings
 * Features: click-outside detection, keyboard navigation, mobile bottom sheet
 */
export const UserMenu: React.FC<UserMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const htmlTheme =
      document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    setTheme(htmlTheme || savedTheme || 'light');
  }, []);

  // Click-outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout();
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to logout', 'error');
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  if (!user) return null;

  // Check if mobile view
  const isMobile =
    typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-3 pr-2 border-l border-border hover:bg-surface/50 rounded-xl transition-colors p-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        title="User menu"
      >
        {/* Desktop: Show username and role */}
        <div className="hidden md:flex flex-col items-end mr-1">
          <span className="text-sm font-bold text-foreground">{user.username}</span>
          <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
        </div>

        {/* Avatar */}
        {user.picture ? (
          <LazyImage
            src={user.picture}
            alt={user.username}
            className="w-9 h-9 rounded-full border border-border"
            priority
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <User className="w-5 h-5" />
          </div>
        )}

        {/* Chevron indicator */}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Desktop Dropdown */}
          <div
            className="hidden md:block absolute right-0 top-full mt-2 w-72 glass-card rounded-2xl shadow-xl border border-border z-50 overflow-hidden animate-fade-in"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-3">
                {user.picture ? (
                  <LazyImage
                    src={user.picture}
                    alt={user.username}
                    className="w-12 h-12 rounded-full border-2 border-primary/20"
                    priority
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground truncate">{user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-2">
              <UserMenuItem
                icon={Settings}
                label="Account Settings"
                onClick={() => handleNavigation('/settings/account')}
              />

              <UserMenuItem
                icon={Bell}
                label="Preferences"
                onClick={() => handleNavigation('/settings/preferences')}
              />

              <UserMenuItem
                icon={Shield}
                label="Privacy & Security"
                onClick={() => handleNavigation('/settings/security')}
              />

              <UserMenuItem
                icon={HelpCircle}
                label="Help & Support"
                onClick={() => handleNavigation('/help')}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-2" />

            {/* Quick Actions */}
            <div className="p-2">
              <UserMenuItem
                icon={theme === 'light' ? Moon : Sun}
                label={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                onClick={handleThemeToggle}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mx-2" />

            {/* Logout */}
            <div className="p-2">
              <UserMenuItem
                icon={LogOut}
                label="Sign Out"
                variant="danger"
                onClick={handleLogout}
              />
            </div>
          </div>

          {/* Mobile Bottom Sheet */}
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>

              {/* User Info Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  {user.picture ? (
                    <LazyImage
                      src={user.picture}
                      alt={user.username}
                      className="w-16 h-16 rounded-full border-2 border-primary/20"
                      priority
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-lg truncate">
                      {user.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                <UserMenuItem
                  icon={Settings}
                  label="Account Settings"
                  onClick={() => handleNavigation('/settings/account')}
                />

                <UserMenuItem
                  icon={Bell}
                  label="Preferences"
                  onClick={() => handleNavigation('/settings/preferences')}
                />

                <UserMenuItem
                  icon={Shield}
                  label="Privacy & Security"
                  onClick={() => handleNavigation('/settings/security')}
                />

                <UserMenuItem
                  icon={HelpCircle}
                  label="Help & Support"
                  onClick={() => handleNavigation('/help')}
                />

                {/* Divider */}
                <div className="h-px bg-border my-2" />

                {/* Quick Actions */}
                <UserMenuItem
                  icon={theme === 'light' ? Moon : Sun}
                  label={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  onClick={handleThemeToggle}
                />

                {/* Divider */}
                <div className="h-px bg-border my-2" />

                {/* Logout */}
                <UserMenuItem
                  icon={LogOut}
                  label="Sign Out"
                  variant="danger"
                  onClick={handleLogout}
                />
              </div>

              {/* Bottom spacing for safe area */}
              <div className="h-8" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
