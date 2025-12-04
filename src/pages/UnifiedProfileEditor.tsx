// UnifiedProfileEditor Page
// Single comprehensive page for all profile management: info, photo/logo, links, appearance, QR code
// Virtual Invitation Card - all features in one place

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Image, Link2, Palette, QrCode, Eye, Share2, Download,
  Save, ChevronDown, ChevronUp, Check, X, Camera, Globe, Lock,
  Mail, Phone, Briefcase, Building2, FileText, ExternalLink
} from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../contexts/ToastContext';
import { ProfileData } from '../services/profileService';
import { LinkCard } from '../components/profile/LinkCard';
import { MobilePreview, AppearanceSettings } from '../components/profile/MobilePreview';
import { AddLinkModal } from '../components/profile/AddLinkModal';
import { AppearancePanel } from '../components/profile/AppearancePanel';
import { getQRCodeDataURL } from '../services/qrCodeService';

// Tab types for different sections
type TabType = 'info' | 'media' | 'links' | 'appearance' | 'qr';

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
  clicks?: number;
}

// Known platforms for auto-detection
const KNOWN_PLATFORMS = [
  { name: 'LinkedIn', pattern: 'linkedin.com', logo: '/assets/social-logos/linkedin.svg' },
  { name: 'Twitter', pattern: 'twitter.com', logo: '/assets/social-logos/twitter.svg' },
  { name: 'X', pattern: 'x.com', logo: '/assets/social-logos/x.svg' },
  { name: 'GitHub', pattern: 'github.com', logo: '/assets/social-logos/github.svg' },
  { name: 'Instagram', pattern: 'instagram.com', logo: '/assets/social-logos/instagram.svg' },
  { name: 'Facebook', pattern: 'facebook.com', logo: '/assets/social-logos/facebook.svg' },
  { name: 'TikTok', pattern: 'tiktok.com', logo: '/assets/social-logos/tiktok.svg' },
  { name: 'YouTube', pattern: 'youtube.com', logo: '/assets/social-logos/youtube.svg' },
  { name: 'Spotify', pattern: 'spotify.com', logo: '/assets/social-logos/spotify.svg' },
  { name: 'Apple Music', pattern: 'music.apple.com', logo: '/assets/social-logos/apple-music.svg' },
  { name: 'WhatsApp', pattern: 'wa.me', logo: '/assets/social-logos/whatsapp.svg' },
  { name: 'Telegram', pattern: 't.me', logo: '/assets/social-logos/telegram.svg' },
];

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
  wallpaper: '',
  wallpaperOpacity: 100,
  footerText: '',
  showPoweredBy: true,
  themeId: '',
};

export const UnifiedProfileEditor: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { profile, loading, error, exists, saving, createProfile, updateProfile, checkUsername } = useProfile();

  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Form state
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Username validation
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Media state
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploading, setUploading] = useState<'avatar' | 'logo' | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Links state
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Appearance state
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // QR Code state (auto-generated, persistent URL)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        displayName: profile.displayName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline,
        company: profile.company,
        bio: profile.bio,
        publicEmail: profile.publicEmail,
        publicPhone: profile.publicPhone,
        website: profile.website,
        pronouns: profile.pronouns,
        published: profile.published,
        indexingOptIn: profile.indexingOptIn,
      });
      setAvatarUrl(profile.avatar || '');
      setLogoUrl(profile.logo || '');

      // Load appearance settings
      const saved = localStorage.getItem(`appearance_${profile.username}`);
      if (saved) {
        try {
          setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(saved) });
        } catch (e) {
          console.error('Failed to load appearance settings:', e);
        }
      }
    }
  }, [profile]);

  // Load links when profile exists
  useEffect(() => {
    if (exists && profile) {
      fetchLinks();
      loadQRCode();
    }
  }, [exists, profile?.username]);

  // Username check with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && formData.username.length >= 3 && formData.username !== profile?.username) {
        handleUsernameCheck(formData.username);
      } else if (formData.username === profile?.username) {
        setUsernameAvailable(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.username, profile?.username]);

  const handleUsernameCheck = async (username: string) => {
    try {
      setUsernameChecking(true);
      const result = await checkUsername(username);
      setUsernameAvailable(result.available);
      if (!result.available) {
        setFormErrors(prev => ({ ...prev, username: 'Username is already taken' }));
      } else {
        setFormErrors(prev => {
          const { username, ...rest } = prev;
          return rest;
        });
      }
    } catch (err) {
      console.error('Username check failed:', err);
    } finally {
      setUsernameChecking(false);
    }
  };

  const fetchLinks = async () => {
    try {
      setLinksLoading(true);
      const response = await fetch('/api/profiles/me/social-links', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch links');
      const data = await response.json();
      const allLinks = [...(data.featured || []), ...(data.custom || [])];
      setLinks(allLinks);
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      setLinksLoading(false);
    }
  };

  const loadQRCode = async () => {
    if (!profile?.username) return;
    setQrLoading(true);
    try {
      const url = await getQRCodeDataURL({ format: 'png', size: 300 });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setHasChanges(true);

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const { [name]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      errors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]{3,30}$/.test(formData.username)) {
      errors.username = 'Username must be 3-30 characters (letters, numbers, _, -)';
    }

    if (!formData.displayName?.trim()) {
      errors.displayName = 'Display name is required';
    }

    if (formData.publicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.publicEmail)) {
      errors.publicEmail = 'Invalid email format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Website must start with http:// or https://';
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.bio = 'Bio must be 500 characters or less';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    if (usernameAvailable === false) {
      showToast('Username is not available', 'error');
      return;
    }

    try {
      if (exists) {
        await updateProfile(formData);
        showToast('Profile saved successfully!', 'success');
      } else {
        await createProfile(formData);
        showToast('Profile created successfully!', 'success');
      }
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast(err instanceof Error ? err.message : 'Failed to save profile', 'error');
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'logo') => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`File size must be less than ${type === 'avatar' ? '5MB' : '2MB'}`, 'error');
      return;
    }

    setUploading(type);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const response = await fetch(`/api/uploads/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: base64 })
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();

        if (type === 'avatar') setAvatarUrl(data.url);
        else setLogoUrl(data.url);

        showToast(`${type === 'avatar' ? 'Photo' : 'Logo'} uploaded successfully!`, 'success');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      showToast(`Failed to upload ${type}`, 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (type: 'avatar' | 'logo') => {
    if (!confirm(`Remove your ${type}?`)) return;
    try {
      const response = await fetch(`/api/uploads/${type}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Delete failed');

      if (type === 'avatar') setAvatarUrl('');
      else setLogoUrl('');

      showToast(`${type === 'avatar' ? 'Photo' : 'Logo'} removed`, 'success');
    } catch (error) {
      showToast(`Failed to remove ${type}`, 'error');
    }
  };

  const detectPlatform = (url: string) => {
    for (const platform of KNOWN_PLATFORMS) {
      if (url.toLowerCase().includes(platform.pattern)) {
        return { name: platform.name, logo: platform.logo };
      }
    }
    return null;
  };

  const handleAddLink = async (url: string, label: string, isFeatured: boolean) => {
    const detected = detectPlatform(url);
    try {
      const response = await fetch('/api/profiles/me/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          url,
          displayLabel: label || null,
          platform: detected?.name || null,
          customLogo: detected?.logo || null,
          isFeatured
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add link');
      }

      await fetchLinks();
      setShowAddModal(false);
      showToast('Link added successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add link', 'error');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Delete this link?')) return;
    try {
      const response = await fetch(`/api/profiles/me/social-links/${linkId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete link');
      await fetchLinks();
      showToast('Link deleted', 'success');
    } catch (err) {
      showToast('Failed to delete link', 'error');
    }
  };

  const handleUpdateLink = async (linkId: number, updates: Partial<SocialLink>) => {
    try {
      const response = await fetch(`/api/profiles/me/social-links/${linkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update link');
      await fetchLinks();
    } catch (err) {
      showToast('Failed to update link', 'error');
    }
  };

  const handleAppearanceChange = (newSettings: AppearanceSettings) => {
    setAppearance(newSettings);
    if (profile?.username) {
      localStorage.setItem(`appearance_${profile.username}`, JSON.stringify(newSettings));
    }
  };

  const handleDownloadQR = async (format: 'png' | 'svg') => {
    try {
      const response = await fetch(`/api/profiles/me/qr-code?format=${format}&size=1000`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.username || 'profile'}-qr.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast(`QR code downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to download QR code', 'error');
    }
  };

  const handleDownloadVCard = async () => {
    try {
      const response = await fetch(`/api/public/profile/${profile?.username}/vcard`);
      if (!response.ok) throw new Error('Failed to download vCard');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile?.username}.vcf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('vCard downloaded!', 'success');
    } catch (err) {
      showToast('Failed to download vCard', 'error');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/#/u/${profile?.username}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile?.displayName}'s Profile`, url });
      } catch (err) {
        navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard!', 'success');
      }
    } else {
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const profileUrl = `${window.location.origin}/#/u/${profile?.username || formData.username || 'username'}`;
  const sortedLinks = [...links].sort((a, b) => a.displayOrder - b.displayOrder);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Tab content components
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Profile Info', icon: <User className="w-5 h-5" /> },
    { id: 'media', label: 'Photo & Logo', icon: <Image className="w-5 h-5" /> },
    { id: 'links', label: 'Links', icon: <Link2 className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'qr', label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent" />
              {exists ? 'Edit Profile' : 'Create Profile'}
            </h1>

            <div className="flex items-center gap-3">
              {/* Publish Status */}
              {exists && (
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${formData.published
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
                  }`}>
                  {formData.published ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {formData.published ? 'Published' : 'Draft'}
                </span>
              )}

              {/* Preview Button */}
              {exists && formData.published && (
                <button
                  onClick={() => window.open(`/#/u/${profile?.username}`, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              )}

              {/* Share Button */}
              {exists && formData.published && (
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || (!hasChanges && exists)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${hasChanges || !exists
                  ? 'btn btn-primary'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{exists ? 'Save' : 'Create'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="bg-surface rounded-xl shadow-sm border border-border mb-6">
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-secondary hover:text-primary'
                      }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-surface rounded-xl shadow-sm border border-border p-6">

              {/* Profile Info Tab */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-6 h-6 text-accent" />
                    <h2 className="text-xl font-semibold text-primary">Profile Information</h2>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        disabled={exists}
                        className={`w-full input ${formErrors.username ? 'border-red-500' : usernameAvailable === true ? 'border-emerald-500' : ''
                          } ${exists ? 'bg-muted cursor-not-allowed' : ''}`}
                        placeholder="johndoe"
                      />
                      {usernameChecking && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <Check className="absolute right-3 top-3 w-5 h-5 text-emerald-500" />
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <X className="absolute right-3 top-3 w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {formErrors.username && <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>}
                    <p className="mt-1 text-xs text-secondary">Your profile URL: {profileUrl}</p>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName || ''}
                      onChange={handleChange}
                      className={`w-full input ${formErrors.displayName ? 'border-red-500' : ''}`}
                      placeholder="John Doe"
                    />
                    {formErrors.displayName && <p className="mt-1 text-sm text-red-500">{formErrors.displayName}</p>}
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={handleChange}
                        className="w-full input"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={handleChange}
                        className="w-full input"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Headline</label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline || ''}
                      onChange={handleChange}
                      className="w-full input"
                      placeholder="Software Engineer | Open Source Enthusiast"
                      maxLength={100}
                    />
                    <p className="mt-1 text-xs text-secondary">{(formData.headline || '').length}/100</p>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company || ''}
                      onChange={handleChange}
                      className="w-full input"
                      placeholder="Acme Corp"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full input ${formErrors.bio ? 'border-red-500' : ''}`}
                      placeholder="Tell people about yourself..."
                      maxLength={500}
                    />
                    {formErrors.bio && <p className="mt-1 text-sm text-red-500">{formErrors.bio}</p>}
                    <p className="mt-1 text-xs text-secondary">{(formData.bio || '').length}/500</p>
                  </div>

                  {/* Contact Info Section */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-accent" />
                      Contact Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-primary mb-1">Email</label>
                        <input
                          type="email"
                          name="publicEmail"
                          value={formData.publicEmail || ''}
                          onChange={handleChange}
                          className={`w-full input ${formErrors.publicEmail ? 'border-red-500' : ''}`}
                          placeholder="john@example.com"
                        />
                        {formErrors.publicEmail && <p className="mt-1 text-sm text-red-500">{formErrors.publicEmail}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary mb-1">Phone</label>
                        <input
                          type="tel"
                          name="publicPhone"
                          value={formData.publicPhone || ''}
                          onChange={handleChange}
                          className="w-full input"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-primary mb-1">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website || ''}
                          onChange={handleChange}
                          className={`w-full input ${formErrors.website ? 'border-red-500' : ''}`}
                          placeholder="https://example.com"
                        />
                        {formErrors.website && <p className="mt-1 text-sm text-red-500">{formErrors.website}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Visibility Section */}
                  <div className="border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-accent" />
                      Visibility Settings
                    </h3>

                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 bg-muted/30 rounded-lg cursor-pointer">
                        <div>
                          <p className="font-medium text-primary">Make profile public</p>
                          <p className="text-sm text-secondary">Anyone with the link can view your profile</p>
                        </div>
                        <input
                          type="checkbox"
                          name="published"
                          checked={formData.published || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-accent border-border rounded focus:ring-accent"
                        />
                      </label>

                      <label className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg ${formData.published ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                        <div>
                          <p className="font-medium text-primary">Allow search engine indexing</p>
                          <p className="text-sm text-secondary">Let Google and other search engines find your profile</p>
                        </div>
                        <input
                          type="checkbox"
                          name="indexingOptIn"
                          checked={formData.indexingOptIn || false}
                          onChange={handleChange}
                          disabled={!formData.published}
                          className="w-5 h-5 text-accent border-border rounded focus:ring-accent disabled:opacity-50"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo & Logo Tab */}
              {activeTab === 'media' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Image className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Photo & Logo</h2>
                  </div>

                  {/* Hidden file inputs */}
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')} />
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} />

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Profile Photo */}
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Photo</h3>
                      <div className="relative inline-block group">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl" />
                        ) : (
                          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-white dark:border-gray-700 shadow-xl">
                            {formData.displayName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        {uploading === 'avatar' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={uploading !== null}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-10 h-10 text-white" />
                        </button>
                        {avatarUrl && (
                          <button
                            onClick={() => handleRemoveImage('avatar')}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Your main profile picture (max 5MB)</p>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploading !== null}
                        className="mt-3 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        Upload Photo
                      </button>
                    </div>

                    {/* Logo */}
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Logo / Brand</h3>
                      <div className="relative inline-block group">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl bg-white" />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-dashed border-gray-300 dark:border-gray-600">
                            <Building2 className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {uploading === 'logo' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploading !== null}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                        {logoUrl && (
                          <button
                            onClick={() => handleRemoveImage('logo')}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Company or brand logo (max 2MB)</p>
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploading !== null}
                        className="mt-3 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        Upload Logo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Links Tab */}
              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-6 h-6 text-purple-500" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Social Links</h2>
                    </div>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Link
                    </button>
                  </div>

                  {linksLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : sortedLinks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No links yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">Add links to your social profiles and websites</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-colors"
                      >
                        Add your first link
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedLinks.map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          appearance={appearance}
                          onEdit={() => { }}
                          onDelete={() => handleDeleteLink(link.id)}
                          onToggleActive={() => handleUpdateLink(link.id, { isFeatured: !link.isFeatured })}
                          onUpdateLabel={(label) => handleUpdateLink(link.id, { displayLabel: label })}
                          onUpdateUrl={(url) => {
                            const detected = detectPlatform(url);
                            handleUpdateLink(link.id, {
                              url,
                              platform: detected?.name || link.platform,
                              customLogo: detected?.logo || link.customLogo
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customize Appearance</h2>
                  </div>
                  <AppearancePanel
                    settings={appearance}
                    onChange={handleAppearanceChange}
                    profileData={{
                      username: formData.username || '',
                      displayName: formData.displayName || '',
                      bio: formData.bio,
                      avatar: avatarUrl,
                      logo: logoUrl,
                    }}
                  />
                </div>
              )}

              {/* QR Code Tab */}
              {activeTab === 'qr' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <QrCode className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your QR Code</h2>
                  </div>

                  <div className="text-center">
                    <div className="bg-white p-6 rounded-xl shadow-lg inline-block mb-6">
                      {qrLoading ? (
                        <div className="w-64 h-64 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                      ) : qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Profile QR Code" className="w-64 h-64" />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      This QR code links to your profile: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{profileUrl}</code>
                    </p>

                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleDownloadQR('png')}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download PNG
                      </button>
                      <button
                        onClick={() => handleDownloadQR('svg')}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Download SVG
                      </button>
                    </div>

                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-left max-w-lg mx-auto">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📱 Scanning Instructions</h3>
                      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <li><strong>iOS:</strong> Open Camera app and point at QR code</li>
                        <li><strong>Android:</strong> Open Camera or Google Lens to scan</li>
                        <li><strong>Print:</strong> Great for business cards and presentations</li>
                      </ul>
                    </div>

                    {/* Download vCard */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Download Contact Card</h3>
                      <button
                        onClick={handleDownloadVCard}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                      >
                        <Download className="w-5 h-5" />
                        Download vCard (.vcf)
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        vCard can be imported directly into phone contacts
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Sidebar (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 text-center">Live Preview</h3>
              <MobilePreview
                profile={{
                  username: formData.username || '',
                  displayName: formData.displayName || '',
                  bio: formData.bio,
                  headline: formData.headline,
                  avatar: avatarUrl,
                  logo: logoUrl,
                }}
                links={sortedLinks}
                appearance={appearance}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Link Modal */}
      {
        showAddModal && (
          <AddLinkModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddLink}
            existingLinksCount={links.length}
            featuredCount={links.filter(l => l.isFeatured).length}
          />
        )
      }
    </div >
  );
};

export default UnifiedProfileEditor;
