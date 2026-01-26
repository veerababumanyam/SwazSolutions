/**
 * ENHANCED MOBILE PREVIEW
 * Wrapper around ProfileRenderer for live preview in the editor
 * This component is now just a thin wrapper that uses the shared ProfileRenderer
 *
 * By using the same ProfileRenderer, this preview is guaranteed to be
 * an EXACT replica of the public profile view
 */

import React from 'react';
import { ProfileRenderer, AppearanceSettings, SocialLink, ProfileData } from '../public-profile/ProfileRenderer';

export interface HeaderBackgroundSettings {
  useProfilePhoto: boolean;
  height: string;
  overlayColor: string;
  overlayOpacity: number;
  blur: number;
  gradientOverlay?: string;
  fallbackGradient: string;
}

export interface BannerSettings {
  mode: 'color' | 'image';
  color: string;
  image?: string;
  derivedFromWallpaper: boolean;
}

interface EnhancedMobilePreviewProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings | null;
  profileUrl?: string;
  onPreview?: () => void;
  onShare?: () => void;
  onDownloadVCard?: () => void;
}

export const EnhancedMobilePreview: React.FC<EnhancedMobilePreviewProps> = ({
  profile,
  links,
  appearance,
  profileUrl,
  onPreview,
  onShare,
  onDownloadVCard
}) => {
  return (
    <ProfileRenderer
      profile={profile}
      links={links}
      appearance={appearance}
      profileUrl={profileUrl}
      onDownloadVCard={onDownloadVCard}
      onShare={onShare}
      isPreview={true} // This is a preview, so no QR code or action bar
    />
  );
};

export default EnhancedMobilePreview;
