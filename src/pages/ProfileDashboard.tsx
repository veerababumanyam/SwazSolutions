// ProfileDashboard Page
// Complete profile management dashboard with quick actions and QR code

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Edit, Eye, QrCode, Globe, Lock, User, Mail, Phone, Briefcase, ExternalLink, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../contexts/AuthContext';
import { getQRCodeDataURL } from '../services/qrCodeService';
import { MobilePreview, AppearanceSettings } from '../components/profile/MobilePreview';
import { LazyImage } from '../components/LazyImage';

// Helper for authenticated fetch requests
const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies automatically
  });
};

// Default appearance settings
const DEFAULT_APPEARANCE: AppearanceSettings = {
  buttonStyle: 'solid',
  cornerRadius: 12,
  shadowStyle: 'subtle',
  buttonColor: '#8B5CF6',
  shadowColor: '#000000',
  textColor: '#FFFFFF',
  backgroundColor: '#F9FAFB',
  fontFamily: 'Inter',
  headerStyle: 'simple',
  headerColor: '#8B5CF6',
  bannerSettings: {
    mode: 'color',
    color: '#8B5CF6',
    derivedFromWallpaper: true,
  },
  wallpaper: '',
  wallpaperOpacity: 100,
  footerText: '',
  showPoweredBy: true,
  themeId: '',
};

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

export const ProfileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading, error, exists, togglePublish, saving } = useProfile();

  // QR Code state (auto-generated, no regenerate needed)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  // Additional state for preview
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // Load QR code when profile is published
  useEffect(() => {
    if (profile?.published) {
      loadQRCode();
    }
  }, [profile?.published, profile?.username]);

  // Load links and appearance when profile exists
  useEffect(() => {
    if (exists && profile) {
      fetchLinks();
      loadAppearanceSettings();
    }
  }, [exists, profile?.username]);

  const loadQRCode = async () => {
    setQrLoading(true);
    try {
      // Use URL for clean, easily scannable QR code
      const url = await getQRCodeDataURL({ format: 'png', size: 200, content: 'url' });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await authFetch('/api/profiles/me/social-links');
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      const allLinks = [...(data.featured || []), ...(data.custom || [])];
      setLinks(allLinks);
    } catch (err) {
      console.error('Error fetching links:', err);
    }
  };

  const loadAppearanceSettings = async () => {
    try {
      const response = await authFetch('/api/profiles/me/appearance');
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setAppearance({ ...DEFAULT_APPEARANCE, ...data.settings });
        }
      }
    } catch (e) {
      console.error('Failed to load appearance settings:', e);
      // Fallback to localStorage
      if (profile?.username) {
        const saved = localStorage.getItem(`appearance_${profile.username}`);
        if (saved) {
          try {
            setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(saved) });
          } catch (parseError) {
            console.error('Failed to parse localStorage appearance:', parseError);
          }
        }
      }
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(`/api/profiles/me/qr-code?format=png&size=1000&content=url`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.username || 'profile'}-qr.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handleTogglePublish = async () => {
    if (profile) {
      try {
        await togglePublish(!profile.published);
      } catch (err) {
        console.error('Failed to toggle publish:', err);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-surface rounded-lg shadow-md p-8 text-center border border-border">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-primary">Login Required</h2>
          <p className="text-secondary mb-6">
            Please login to access your profile dashboard.
          </p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 btn btn-primary rounded-lg transition"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  // No profile exists
  if (!exists || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-surface rounded-lg shadow-md p-8 text-center border border-border">
          <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-primary">Create Your Profile</h2>
          <p className="text-secondary mb-6">
            You don't have a profile yet. Create one to share your contact info and social links.
          </p>
          <button
            onClick={() => navigate('/profile?tab=portfolio')}
            className="inline-block px-6 py-3 btn btn-primary rounded-lg transition"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  // Calculate profile completeness
  const completenessFields = [
    profile.displayName,
    profile.firstName,
    profile.lastName,
    profile.headline,
    profile.company,
    profile.bio,
    profile.publicEmail,
    profile.website,
  ];
  const filledFields = completenessFields.filter(Boolean).length;
  const completenessPercent = Math.round((filledFields / completenessFields.length) * 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold">Profile Dashboard</h1>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            {profile.published ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm border border-emerald-500/20">
                <Globe className="w-4 h-4" />
                Published
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-muted/50 text-muted-foreground rounded-full text-sm border border-border">
                <Lock className="w-4 h-4" />
                Draft
              </span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Code Card */}
            {profile.published && (
              <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                  <QrCode className="w-5 h-5" />
                  Your QR Code
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    {qrLoading ? (
                      <div className="w-32 h-32 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                      </div>
                    ) : qrCodeUrl ? (
                      <LazyImage src={qrCodeUrl} alt="Profile QR Code" className="w-32 h-32" priority />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center bg-muted rounded">
                        <QrCode className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm text-secondary mb-4">
                      Scan this code to instantly open your public profile. Visitors can download your contact card from the profile page.
                    </p>
                    <button
                      onClick={handleDownloadQR}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 transition text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Public URL Card */}
            {profile.published && (
              <div className="bg-brand-gradient rounded-lg shadow-md p-6 text-white">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Your Public Profile
                </h3>
                <p className="text-sm opacity-90 mb-4">Share this link with anyone to let them view your profile and download your contact card.</p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <code className="w-full sm:flex-1 bg-white/20 rounded px-3 py-2 text-sm font-mono truncate">
                    {window.location.origin}/#/u/{profile.username}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/#/u/${profile.username}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Profile Preview Info */}
            <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                <User className="w-5 h-5" />
                Profile Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                    {profile.avatar ? (
                      <LazyImage src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover" priority />
                    ) : (
                      <span>{profile.displayName?.charAt(0) || profile.username?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-primary">{profile.displayName || profile.username}</p>
                    <p className="text-sm text-secondary">@{profile.username}</p>
                  </div>
                </div>
                {profile.headline && (
                  <p className="text-sm text-primary flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    {profile.headline}
                  </p>
                )}
                {profile.company && (
                  <p className="text-sm text-secondary ml-6">{profile.company}</p>
                )}
                {profile.publicEmail && (
                  <p className="text-sm text-secondary flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {profile.publicEmail}
                  </p>
                )}
                {profile.publicPhone && (
                  <p className="text-sm text-secondary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {profile.publicPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4 text-primary">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/profile?tab=portfolio')}
                  className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => window.open(`/#/u/${profile.username}`, '_blank')}
                  disabled={!profile.published}
                  className={`w-full px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 ${profile.published
                    ? 'bg-muted hover:bg-muted/80 text-primary'
                    : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                    }`}
                >
                  <Eye className="w-5 h-5" />
                  View Public Profile
                </button>
              </div>
              {!profile.published && (
                <p className="mt-3 text-xs text-secondary text-center">
                  Publish your profile to enable public viewing
                </p>
              )}
            </div>

            {/* Profile Status Card */}
            <div className="bg-surface rounded-lg shadow-md p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-primary">
                {completenessPercent >= 80 ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
                Profile Status
              </h3>

              {/* Completeness Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1 text-primary">
                  <span>Profile Completeness</span>
                  <span className="font-semibold">{completenessPercent}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${completenessPercent >= 80 ? 'bg-emerald-500' :
                      completenessPercent >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${completenessPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Publish Toggle */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Public Profile</p>
                    <p className="text-xs text-secondary">
                      {profile.published ? 'Visible to everyone' : 'Only visible to you'}
                    </p>
                  </div>
                  <button
                    onClick={handleTogglePublish}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.published ? 'bg-emerald-500' : 'bg-muted'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.published ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mobile Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold mb-4 text-primary text-center">Live Preview</h3>
              <div className="transform scale-90 sm:scale-100 origin-top">
                <MobilePreview
                  profile={profile}
                  links={links}
                  appearance={appearance}
                  profileUrl={profile.username ? `${window.location.origin}/u/${encodeURIComponent(profile.username)}` : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};