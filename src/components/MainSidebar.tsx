import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Music,
  Sparkles,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  Lock,
  User,
  Database,
  LogOut,
  X,
  Mail,
  IdCard,
  Gift,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface MainSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const MainSidebar: React.FC<MainSidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navItemClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
      isActive(path)
        ? 'bg-accent/10 text-accent font-semibold'
        : 'text-muted-foreground hover:text-primary hover:bg-surface/50'
    }`;

  const sidebarClass = `
    fixed inset-y-0 left-0 z-40 w-72 bg-surface/95 backdrop-blur-xl border-r border-border shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-5rem)] lg:shadow-none overflow-y-auto
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const handleNavigation = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClass}>
        {/* Close Button (Mobile) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1">
          {/* Primary Actions */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
              Main
            </h3>
            <Link to="/" onClick={handleNavigation} className={navItemClass('/')}>
              <Home className="w-5 h-5 flex-shrink-0" />
              <span>Home</span>
            </Link>
          </div>

          {/* User Features (Protected) */}
          {user && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                Features
              </h3>
              <Link
                to="/studio"
                onClick={handleNavigation}
                className={navItemClass('/studio')}
              >
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <span>Lyric Studio</span>
              </Link>
              <Link
                to="/music"
                onClick={handleNavigation}
                className={navItemClass('/music')}
              >
                <Music className="w-5 h-5 flex-shrink-0" />
                <span>Music</span>
              </Link>
              <Link
                to="/profile"
                onClick={handleNavigation}
                className={navItemClass('/profile')}
              >
                <IdCard className="w-5 h-5 flex-shrink-0" />
                <span>Profile</span>
              </Link>
              <Link
                to="/invites"
                onClick={handleNavigation}
                className={navItemClass('/invites')}
              >
                <Gift className="w-5 h-5 flex-shrink-0" />
                <span>Invitations</span>
              </Link>
            </div>
          )}

          {/* Services */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
              Services
            </h3>
            <Link
              to="/services/data-recovery"
              onClick={handleNavigation}
              className={navItemClass('/services/data-recovery')}
            >
              <Database className="w-5 h-5 flex-shrink-0" />
              <span>Data Recovery</span>
            </Link>
          </div>

          {/* Account Settings (Protected) */}
          {user && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                Settings
              </h3>
              <Link
                to="/settings/account"
                onClick={handleNavigation}
                className={navItemClass('/settings/account')}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span>Account</span>
              </Link>
              <Link
                to="/settings/preferences"
                onClick={handleNavigation}
                className={navItemClass('/settings/preferences')}
              >
                <Bell className="w-5 h-5 flex-shrink-0" />
                <span>Preferences</span>
              </Link>
              <Link
                to="/settings/security"
                onClick={handleNavigation}
                className={navItemClass('/settings/security')}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span>Privacy & Security</span>
              </Link>
            </div>
          )}

          {/* Help & Support */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
              Support
            </h3>
            <Link
              to="/help"
              onClick={handleNavigation}
              className={navItemClass('/help')}
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              <span>Help & Support</span>
            </Link>
            <Link
              to="/about"
              onClick={handleNavigation}
              className={navItemClass('/about')}
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span>About</span>
            </Link>
            <Link
              to="/contact"
              onClick={handleNavigation}
              className={navItemClass('/contact')}
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span>Contact</span>
            </Link>
          </div>
        </nav>

        {/* User Section (Bottom) */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4 space-y-2 bg-surface/50 backdrop-blur">
            <div className="px-4 py-2 bg-surface rounded-lg">
              <p className="text-sm font-semibold text-primary truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent capitalize">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
