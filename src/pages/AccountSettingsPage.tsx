import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Shield,
  Trash2,
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Key,
  Eye,
  EyeOff,
  Zap,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface ActiveSession {
  id: number;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface ApiKeyState {
  hasApiKey: boolean;
  keyPreview: string | null;
  apiKey: string;
  confirmPassword: string;
  showApiKey: boolean;
  isSaving: boolean;
  isTesting: boolean;
  testResult: {
    success: boolean;
    message: string;
    responseTime?: number;
  } | null;
}

interface AccountSettingsState {
  newEmail: string;
  emailConfirmPassword: string;
  isChangingEmail: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isChangingPassword: boolean;
  sessions: ActiveSession[];
  loadingSessions: boolean;
  showDeleteDialog: boolean;
  deleteConfirmText: string;
  apiKeyState: ApiKeyState;
}

export const AccountSettingsPage: React.FC = () => {
  const { user, checkAuth } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const [state, setState] = useState<AccountSettingsState>({
    newEmail: '',
    emailConfirmPassword: '',
    isChangingEmail: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isChangingPassword: false,
    sessions: [],
    loadingSessions: true,
    showDeleteDialog: false,
    deleteConfirmText: '',
    apiKeyState: {
      hasApiKey: false,
      keyPreview: null,
      apiKey: '',
      confirmPassword: '',
      showApiKey: false,
      isSaving: false,
      isTesting: false,
      testResult: null,
    },
  });

  // Load active sessions and API key status on mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadActiveSessions();
    loadApiKeyStatus();
  }, [user, navigate]);

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('/api/users/sessions', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          sessions: data.sessions || [],
          loadingSessions: false,
        }));
      } else {
        setState((prev) => ({ ...prev, loadingSessions: false }));
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setState((prev) => ({ ...prev, loadingSessions: false }));
      showToast('Failed to load sessions', 'error');
    }
  };

  const loadApiKeyStatus = async () => {
    try {
      const response = await fetch('/api/users/settings/gemini-key', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          apiKeyState: {
            ...prev.apiKeyState,
            hasApiKey: data.hasApiKey,
            keyPreview: data.keyPreview,
          }
        }));
      }
    } catch (error) {
      console.error('Failed to load API key status:', error);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.newEmail || !state.emailConfirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.newEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setState((prev) => ({ ...prev, isChangingEmail: true }));

    try {
      const response = await fetch('/api/users/email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          newEmail: state.newEmail,
          password: state.emailConfirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Email updated successfully', 'success');
        setState((prev) => ({
          ...prev,
          newEmail: '',
          emailConfirmPassword: '',
        }));
        await checkAuth();
      } else {
        showToast(data.message || 'Failed to update email', 'error');
      }
    } catch (error) {
      console.error('Email change error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setState((prev) => ({ ...prev, isChangingEmail: false }));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.currentPassword || !state.newPassword || !state.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (state.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setState((prev) => ({ ...prev, isChangingPassword: true }));

    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: state.currentPassword,
          newPassword: state.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password updated successfully', 'success');
        setState((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        showToast(data.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setState((prev) => ({ ...prev, isChangingPassword: false }));
    }
  };

  const handleLogoutSession = (session: ActiveSession) => {
    setConfirmDialogConfig({
      title: 'Logout Device?',
      message: 'This device will be signed out and will need to log in again.',
      confirmText: 'Logout Device',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/users/sessions/${session.id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            showToast('Device logged out successfully', 'success');
            await loadActiveSessions();
          } else {
            showToast('Failed to logout device', 'error');
          }
        } catch (error) {
          console.error('Logout device error:', error);
          showToast('Network error. Please try again.', 'error');
        }
      },
    });
    setShowConfirmDialog(true);
  };

  const handleDeleteAccount = async () => {
    if (state.deleteConfirmText !== 'DELETE') {
      showToast('Please type DELETE to confirm', 'error');
      return;
    }

    setConfirmDialogConfig({
      title: 'Delete Account Permanently?',
      message:
        'This action cannot be undone. All your data, playlists, and settings will be permanently deleted.',
      confirmText: 'Delete My Account',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/users/account', {
            method: 'DELETE',
            credentials: 'include',
          });

          if (response.ok) {
            showToast('Account deleted successfully', 'success');
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            const data = await response.json();
            showToast(data.message || 'Failed to delete account', 'error');
          }
        } catch (error) {
          console.error('Account deletion error:', error);
          showToast('Network error. Please try again.', 'error');
        }
      },
    });
    setShowConfirmDialog(true);
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate format
    if (!state.apiKeyState.apiKey.startsWith('AIza') || state.apiKeyState.apiKey.length < 35) {
      showToast('Invalid API key format. Must start with "AIza" and be at least 35 characters.', 'error');
      return;
    }

    if (!state.apiKeyState.confirmPassword) {
      showToast('Password confirmation required', 'error');
      return;
    }

    setState((prev) => ({
      ...prev,
      apiKeyState: { ...prev.apiKeyState, isSaving: true }
    }));

    try {
      const response = await fetch('/api/users/settings/gemini-key', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apiKey: state.apiKeyState.apiKey,
          password: state.apiKeyState.confirmPassword,
          testConnectivity: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('API key saved successfully', 'success');

        // Sync with localStorage for frontend agents
        localStorage.setItem('swaz_gemini_api_key', state.apiKeyState.apiKey);

        setState((prev) => ({
          ...prev,
          apiKeyState: {
            ...prev.apiKeyState,
            hasApiKey: true,
            keyPreview: data.keyPreview,
            apiKey: '',
            confirmPassword: '',
            testResult: data.connectivityTest,
          }
        }));
      } else {
        showToast(data.message || 'Failed to save API key', 'error');
      }
    } catch (error) {
      console.error('API key save error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setState((prev) => ({
        ...prev,
        apiKeyState: { ...prev.apiKeyState, isSaving: false }
      }));
    }
  };

  const handleTestConnectivity = async () => {
    if (!state.apiKeyState.apiKey || state.apiKeyState.apiKey.length < 35) {
      showToast('Please enter a valid API key first', 'error');
      return;
    }

    setState((prev) => ({
      ...prev,
      apiKeyState: { ...prev.apiKeyState, isTesting: true, testResult: null }
    }));

    try {
      const response = await fetch('/api/users/settings/gemini-key/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ apiKey: state.apiKeyState.apiKey }),
      });

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        apiKeyState: {
          ...prev.apiKeyState,
          testResult: data,
        }
      }));

      if (data.success) {
        showToast(`Connected successfully (${data.responseTime}ms)`, 'success');
      } else {
        showToast(data.message || 'Connection failed', 'error');
      }
    } catch (error) {
      console.error('API key test error:', error);
      showToast('Test failed. Check your internet connection.', 'error');
    } finally {
      setState((prev) => ({
        ...prev,
        apiKeyState: { ...prev.apiKeyState, isTesting: false }
      }));
    }
  };

  const handleRemoveApiKey = () => {
    setConfirmDialogConfig({
      title: 'Remove API Key?',
      message: 'You will revert to the system default API key. Your custom key will be permanently deleted.',
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          const response = await fetch('/api/users/settings/gemini-key', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password: state.apiKeyState.confirmPassword }),
          });

          if (response.ok) {
            showToast('API key removed successfully', 'success');

            // Clear localStorage too
            localStorage.removeItem('swaz_gemini_api_key');

            setState((prev) => ({
              ...prev,
              apiKeyState: {
                ...prev.apiKeyState,
                hasApiKey: false,
                keyPreview: null,
                apiKey: '',
                confirmPassword: '',
                testResult: null,
              }
            }));
          } else {
            const data = await response.json();
            showToast(data.message || 'Failed to remove API key', 'error');
          }
        } catch (error) {
          console.error('API key removal error:', error);
          showToast('Network error. Please try again.', 'error');
        }
      },
    });
    setShowConfirmDialog(true);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-secondary">Manage your account preferences and security settings</p>
      </div>

      {/* Settings Sections */}
      <div className="container mx-auto px-4 space-y-6 max-w-4xl">
        {/* Profile Information Section */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Profile Information</h2>
              <p className="text-sm text-muted">Update your email and profile details</p>
            </div>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Current Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-4 py-3 bg-surface/50 border border-border rounded-xl text-muted cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                New Email Address
              </label>
              <input
                type="email"
                value={state.newEmail}
                onChange={(e) => setState((prev) => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter new email address"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={state.emailConfirmPassword}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, emailConfirmPassword: e.target.value }))
                }
                placeholder="Enter your password to confirm"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={
                state.isChangingEmail ||
                !state.newEmail ||
                !state.emailConfirmPassword
              }
              className="px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
            >
              {state.isChangingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Email
                </>
              )}
            </button>
          </form>
        </section>

        {/* Password Change Section */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Password</h2>
              <p className="text-sm text-muted">Change your account password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={state.currentPassword}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="Enter current password"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                New Password
              </label>
              <input
                type="password"
                value={state.newPassword}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="Enter new password (min 8 characters)"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={state.confirmPassword}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Confirm new password"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <button
              type="submit"
              disabled={
                state.isChangingPassword ||
                !state.currentPassword ||
                !state.newPassword ||
                !state.confirmPassword
              }
              className="px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
            >
              {state.isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </section>

        {/* Active Sessions Section */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Active Sessions</h2>
              <p className="text-sm text-muted">Manage devices currently logged into your account</p>
            </div>
          </div>

          {state.loadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : state.sessions.length === 0 ? (
            <p className="text-muted text-center py-8">No active sessions found</p>
          ) : (
            <div className="space-y-3">
              {state.sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      {session.deviceInfo.toLowerCase().includes('mobile') ? (
                        <Smartphone className="w-5 h-5 text-primary" />
                      ) : (
                        <Monitor className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-primary flex items-center gap-2">
                        {session.deviceInfo}
                        {session.isCurrent && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            Current
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.lastActive).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      onClick={() => handleLogoutSession(session)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                    >
                      Logout
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI & Integrations Section */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary">AI & Integrations</h2>
              <p className="text-sm text-muted">Manage your Google Gemini API key</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                Configure your personal Gemini API key to use with Lyric Studio and AI features.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Get your free API key from Google AI Studio
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Status */}
          {state.apiKeyState.hasApiKey && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Custom API key configured
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 font-mono">
                  {state.apiKeyState.keyPreview}
                </p>
              </div>
            </div>
          )}

          {/* API Key Form */}
          <form onSubmit={handleSaveApiKey} className="space-y-4">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={state.apiKeyState.showApiKey ? 'text' : 'password'}
                  value={state.apiKeyState.apiKey}
                  onChange={(e) => setState((prev) => ({
                    ...prev,
                    apiKeyState: { ...prev.apiKeyState, apiKey: e.target.value }
                  }))}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-3 pr-12 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setState((prev) => ({
                    ...prev,
                    apiKeyState: { ...prev.apiKeyState, showApiKey: !prev.apiKeyState.showApiKey }
                  }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
                >
                  {state.apiKeyState.showApiKey ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Confirmation */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={state.apiKeyState.confirmPassword}
                onChange={(e) => setState((prev) => ({
                  ...prev,
                  apiKeyState: { ...prev.apiKeyState, confirmPassword: e.target.value }
                }))}
                placeholder="Enter your password to confirm"
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Test Result */}
            {state.apiKeyState.testResult && (
              <div className={`p-4 rounded-xl border ${
                state.apiKeyState.testResult.success
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center gap-2">
                  {state.apiKeyState.testResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    state.apiKeyState.testResult.success
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {state.apiKeyState.testResult.message}
                  </span>
                  {state.apiKeyState.testResult.responseTime && (
                    <span className="text-xs text-green-700 dark:text-green-300 ml-auto">
                      {state.apiKeyState.testResult.responseTime}ms
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={state.apiKeyState.isSaving || !state.apiKeyState.apiKey || !state.apiKeyState.confirmPassword}
                className="px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
              >
                {state.apiKeyState.isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save API Key
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnectivity}
                disabled={state.apiKeyState.isTesting || !state.apiKeyState.apiKey}
                className="px-6 py-3 bg-surface border border-border text-primary font-medium rounded-xl hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {state.apiKeyState.isTesting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>

              {state.apiKeyState.hasApiKey && (
                <button
                  type="button"
                  onClick={handleRemoveApiKey}
                  disabled={!state.apiKeyState.confirmPassword}
                  className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 font-medium rounded-xl hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ml-auto"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Key
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="glass-card p-6 border-red-200 dark:border-red-900/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h2>
              <p className="text-sm text-muted">Irreversible account actions</p>
            </div>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
            <h3 className="font-semibold text-primary mb-2">Delete Account</h3>
            <p className="text-sm text-secondary mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={state.deleteConfirmText}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, deleteConfirmText: e.target.value }))
                  }
                  placeholder="DELETE"
                  className="w-full px-4 py-3 bg-surface border border-red-200 dark:border-red-900/30 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={state.deleteConfirmText !== 'DELETE'}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Confirm Dialog */}
      {confirmDialogConfig && (
        <ConfirmDialog
          open={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setConfirmDialogConfig(null);
          }}
          onConfirm={confirmDialogConfig.onConfirm}
          title={confirmDialogConfig.title}
          message={confirmDialogConfig.message}
          confirmText={confirmDialogConfig.confirmText}
          variant="danger"
        />
      )}
    </div>
  );
};
