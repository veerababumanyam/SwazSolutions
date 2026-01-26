// ProfileLinksEditor Component
// Modern profile links management interface with appearance customization

import React, { useState, useEffect } from 'react';
import { LinkCard } from './LinkCard';
import { MobilePreview } from './MobilePreview';
import { AddLinkModal } from './AddLinkModal';
import { AppearancePanel, AppearanceSettings } from './AppearancePanel';
import { detectPlatformFromUrl, DEFAULT_LOGO } from '../../constants/platforms';
import { useProfile } from '@/contexts/ProfileContext';
import { LinkItem, LinkType } from '@/types/modernProfile.types';

// Legacy type for backward compatibility with existing UI components
export interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
  clicks?: number;
}

export interface ProfileData {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  logo?: string;
  headline?: string;
  // Contact info
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  // Contact visibility toggles
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
}

interface ProfileLinksEditorProps {
  profile: ProfileData;
  onProfileUpdate?: () => void;
}

// Featured social icons row - platforms that get shown as icons in header
const FEATURED_PLATFORMS = [
  { name: 'Instagram', icon: 'instagram', pattern: 'instagram.com' },
  { name: 'WhatsApp', icon: 'whatsapp', pattern: 'wa.me' },
  { name: 'YouTube', icon: 'youtube', pattern: 'youtube.com' },
  { name: 'Facebook', icon: 'facebook', pattern: 'facebook.com' },
  { name: 'X', icon: 'x', pattern: 'twitter.com' },
  { name: 'X', icon: 'x', pattern: 'x.com' },
  { name: 'TikTok', icon: 'tiktok', pattern: 'tiktok.com' },
  { name: 'Apple Music', icon: 'apple-music', pattern: 'music.apple.com' },
  { name: 'Spotify', icon: 'spotify', pattern: 'spotify.com' },
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

export const ProfileLinksEditor: React.FC<ProfileLinksEditorProps> = ({
  profile,
  onProfileUpdate
}) => {
  // Use ProfileContext for modern data layer
  const { links: modernLinks, addLink, updateLink, removeLink, reorderLinks, isLoading: contextLoading } = useProfile();

  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);
  const [showAppearancePanel, setShowAppearancePanel] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatar || '');
  const [logoUrl, setLogoUrl] = useState<string>(profile.logo || '');
  const [uploading, setUploading] = useState<'avatar' | 'logo' | null>(null);

  // File input refs
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  // Sync modern links from context to legacy format for existing UI
  useEffect(() => {
    const legacyLinks: SocialLink[] = modernLinks
      .filter(link => link.type === LinkType.CLASSIC) // Only show CLASSIC links in this legacy view
      .map((link, index) => ({
        id: parseInt(link.id.replace(/\D/g, '')) || index, // Extract numeric ID
        platform: link.platform || null,
        url: link.url || '',
        displayLabel: link.title,
        customLogo: link.thumbnail || null,
        isFeatured: link.isActive,
        displayOrder: link.displayOrder || index,
        clicks: link.clicks
      }));
    setLinks(legacyLinks);
    setLoading(contextLoading);
  }, [modernLinks, contextLoading]);

  useEffect(() => {
    loadAppearanceSettings();
  }, []);

  // Update local state when profile changes
  useEffect(() => {
    setAvatarUrl(profile.avatar || '');
    setLogoUrl(profile.logo || '');
  }, [profile.avatar, profile.logo]);

  const handleImageUpload = async (file: File, type: 'avatar' | 'logo') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB for avatar, 2MB for logo)
    const maxSize = type === 'avatar' ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${type === 'avatar' ? '5MB' : '2MB'}`);
      return;
    }

    setUploading(type);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(`/api/uploads/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: base64 })
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        
        if (type === 'avatar') {
          setAvatarUrl(data.url);
        } else {
          setLogoUrl(data.url);
        }
        
        onProfileUpdate?.();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}. Please try again.`);
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveImage = async (type: 'avatar' | 'logo') => {
    if (!confirm(`Are you sure you want to remove your ${type}?`)) return;

    try {
      const response = await fetch(`/api/uploads/${type}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      if (type === 'avatar') {
        setAvatarUrl('');
      } else {
        setLogoUrl('');
      }
      
      onProfileUpdate?.();
    } catch (error) {
      console.error(`Error removing ${type}:`, error);
      alert(`Failed to remove ${type}. Please try again.`);
    }
  };

  const loadAppearanceSettings = async () => {
    // Load saved appearance settings from API (with localStorage fallback)
    try {
      const response = await fetch('/api/profiles/me/appearance', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setAppearance({ ...DEFAULT_APPEARANCE, ...data.settings });
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load appearance from API:', error);
    }

    // Fallback to localStorage
    const saved = localStorage.getItem(`appearance_${profile.username}`);
    if (saved) {
      try {
        setAppearance({ ...DEFAULT_APPEARANCE, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load appearance settings:', e);
      }
    }
  };

  const handleAppearanceChange = async (newSettings: AppearanceSettings) => {
    setAppearance(newSettings);

    // Save to API (persistent storage)
    try {
      const response = await fetch('/api/profiles/me/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ settings: newSettings })
      });

      if (!response.ok) {
        throw new Error('Failed to save appearance settings');
      }

      // Also save to localStorage as backup
      localStorage.setItem(`appearance_${profile.username}`, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save appearance to API:', error);
      // Fallback to localStorage only
      localStorage.setItem(`appearance_${profile.username}`, JSON.stringify(newSettings));
    }
  };

  const detectPlatform = (url: string) => {
    const platform = detectPlatformFromUrl(url);
    if (platform) {
      return { name: platform.name, logo: platform.logo };
    }
    return null;
  };

  const handleAddLink = async (url: string, label: string, isFeatured: boolean, customLogo?: string) => {
    const detected = detectPlatform(url);

    try {
      // Use ProfileContext addLink method
      await addLink(LinkType.CLASSIC);

      // Get the newly created link (it will be at the top of the array)
      const newLink = modernLinks[0];

      // Update it with the actual data
      if (newLink) {
        await updateLink(newLink.id, {
          title: label || detected?.name || 'New Link',
          url,
          platform: (detected?.name as any) || 'generic',
          thumbnail: customLogo || detected?.logo || DEFAULT_LOGO,
          isActive: isFeatured
        });
      }

      onProfileUpdate?.();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding link:', err);
      alert(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  const handleUpdateLink = async (linkId: number, updates: Partial<SocialLink>) => {
    try {
      // Find the modern link with matching ID
      const modernLink = modernLinks.find(l => parseInt(l.id.replace(/\D/g, '')) === linkId);
      if (!modernLink) {
        throw new Error('Link not found');
      }

      // Convert legacy updates to modern format
      const modernUpdates: Partial<LinkItem> = {};
      if (updates.displayLabel !== undefined) modernUpdates.title = updates.displayLabel || '';
      if (updates.url !== undefined) modernUpdates.url = updates.url;
      if (updates.customLogo !== undefined) modernUpdates.thumbnail = updates.customLogo || undefined;
      if (updates.isFeatured !== undefined) modernUpdates.isActive = updates.isFeatured;
      if (updates.platform !== undefined) modernUpdates.platform = updates.platform as any;

      await updateLink(modernLink.id, modernUpdates);

      onProfileUpdate?.();
      setEditingLink(null);
    } catch (err) {
      console.error('Error updating link:', err);
      alert(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      // Find the modern link with matching ID
      const modernLink = modernLinks.find(l => parseInt(l.id.replace(/\D/g, '')) === linkId);
      if (!modernLink) {
        throw new Error('Link not found');
      }

      await removeLink(modernLink.id);

      onProfileUpdate?.();
    } catch (err) {
      console.error('Error deleting link:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  const handleToggleActive = async (link: SocialLink) => {
    await handleUpdateLink(link.id, { isFeatured: !link.isFeatured });
  };

  const handleReorder = async (dragIndex: number, hoverIndex: number) => {
    const reorderedLinks = [...links];
    const [removed] = reorderedLinks.splice(dragIndex, 1);
    reorderedLinks.splice(hoverIndex, 0, removed);

    // Update display orders
    const updatedLinks = reorderedLinks.map((link, index) => ({
      ...link,
      displayOrder: index
    }));

    setLinks(updatedLinks);

    // Convert to modern format and use context method
    try {
      const modernReorderedLinks = modernLinks
        .slice() // Copy array
        .sort((a, b) => {
          const aIndex = updatedLinks.findIndex(l => parseInt(l.id.toString().replace(/\D/g, '')) === parseInt(a.id.replace(/\D/g, '')));
          const bIndex = updatedLinks.findIndex(l => parseInt(l.id.toString().replace(/\D/g, '')) === parseInt(b.id.replace(/\D/g, '')));
          return aIndex - bIndex;
        });

      await reorderLinks(modernReorderedLinks);
    } catch (err) {
      console.error('Error reordering links:', err);
    }
  };

  // Get featured social icons for header row
  const getFeaturedSocialIcons = () => {
    return links
      .filter(link => link.isFeatured)
      .map(link => {
        const platform = FEATURED_PLATFORMS.find(p => 
          link.url.toLowerCase().includes(p.pattern)
        );
        return platform ? { ...platform, link } : null;
      })
      .filter(Boolean)
      .slice(0, 8); // Max 8 icons in header
  };

  const sortedLinks = [...links].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="flex gap-0">
      {/* Appearance Panel Sidebar */}
      {showAppearancePanel && (
        <div className="hidden xl:block w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <AppearancePanel
            settings={appearance}
            onChange={handleAppearanceChange}
            profileData={profile}
          />
        </div>
      )}

      {/* Main Editor Panel */}
      <div className="flex-1 min-w-0 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Toggle Appearance Panel Button (mobile/tablet) */}
          <button
            onClick={() => setShowAppearancePanel(!showAppearancePanel)}
            className="xl:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Customize Appearance
          </button>

          {/* Profile Header Card */}
          <div 
            className="rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6"
            style={{ backgroundColor: appearance.backgroundColor }}
          >
          {/* Hidden file inputs */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'avatar')}
          />
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
          />

          <div className="flex items-start gap-4">
            {/* Avatar & Logo Section */}
            <div className="flex flex-col items-center gap-2">
              {/* Profile Photo (Avatar) */}
              <div className="relative group">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.displayName}
                      className="w-20 h-20 rounded-full object-cover border-3 border-white dark:border-gray-700 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-3 border-white dark:border-gray-700 shadow-lg">
                      {profile.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                  {uploading === 'avatar' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload profile photo"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => handleRemoveImage('avatar')}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Remove photo"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Photo</span>

              {/* Logo (displayed below avatar in a smaller circle) */}
              <div className="relative group mt-1">
                <div className="relative">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                  {uploading === 'logo' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload logo"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {logoUrl && (
                  <button
                    onClick={() => handleRemoveImage('logo')}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Remove logo"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Logo</span>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.displayName}
                </h2>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 flex items-center gap-1">
                {profile.headline || profile.bio || 'Add a bio...'}
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </p>

              {/* Social Icons Row */}
              <div className="flex items-center gap-2 mt-3">
                {getFeaturedSocialIcons().map((item: any, index: number) => (
                  <a
                    key={index}
                    href={item.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={item.name}
                  >
                    <img 
                      src={item.link.customLogo || `/assets/social-logos/${item.icon}.svg`}
                      alt={item.name}
                      className="w-5 h-5"
                    />
                  </a>
                ))}
                {getFeaturedSocialIcons().length > 5 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    +{getFeaturedSocialIcons().length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-4 px-6 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mb-6"
          style={{
            backgroundColor: appearance.buttonColor,
            color: appearance.textColor,
            borderRadius: `${appearance.cornerRadius}px`,
            boxShadow: appearance.shadowStyle === 'none' ? 'none' :
                       appearance.shadowStyle === 'subtle' ? `0 2px 8px ${appearance.shadowColor}20` :
                       appearance.shadowStyle === 'strong' ? `0 4px 16px ${appearance.shadowColor}40` :
                       `4px 4px 0 ${appearance.shadowColor}`,
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>

        {/* Collection & Archive Actions */}
        <div className="flex items-center justify-between mb-6">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Add collection
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            View archive
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Divider with Add Button */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Links List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : sortedLinks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No links yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add your first link to get started
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-medium transition-colors"
            >
              Add your first link
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedLinks.map((link, index) => (
              <LinkCard
                key={link.id}
                link={link}
                appearance={appearance}
                onEdit={() => setEditingLink(link)}
                onDelete={() => handleDeleteLink(link.id)}
                onToggleActive={() => handleToggleActive(link)}
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
      </div>

      {/* Mobile Preview Panel */}
      <div className="hidden lg:block w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 p-6">
        <div className="sticky top-8">
          <MobilePreview
            profile={{
              ...profile,
              avatar: avatarUrl || profile.avatar,
              logo: logoUrl || profile.logo
            }}
            links={sortedLinks}
            appearance={appearance}
            profileUrl={profile.username ? `${window.location.origin}/u/${encodeURIComponent(profile.username)}` : undefined}
          />
        </div>
      </div>

      {/* Add Link Modal */}
      {showAddModal && (
        <AddLinkModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddLink}
          existingLinksCount={links.length}
          featuredCount={links.filter(l => l.isFeatured).length}
        />
      )}
    </div>
  );
};

export default ProfileLinksEditor;
