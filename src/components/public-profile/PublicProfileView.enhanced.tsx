/**
 * ENHANCED PUBLIC PROFILE VIEW
 * Wrapper around ProfileRenderer for public-facing profile pages
 * This component is now just a thin wrapper that uses the shared ProfileRenderer
 *
 * All rendering logic is in ProfileRenderer.tsx to ensure consistency
 */

import React from 'react';
import { ProfileRenderer, AppearanceSettings, SocialLink, ProfileData } from './ProfileRenderer';

interface EnhancedPublicProfileViewProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings | null;
  profileUrl?: string;
  onDownloadVCard?: () => void;
  onShare?: () => void;
}

export const EnhancedPublicProfileView: React.FC<EnhancedPublicProfileViewProps> = ({
  profile,
  links,
  appearance,
  profileUrl,
  onDownloadVCard,
  onShare
}) => {
  return (
    <ProfileRenderer
      profile={profile}
      links={links}
      appearance={appearance}
      profileUrl={profileUrl}
      onDownloadVCard={onDownloadVCard}
      onShare={onShare}
      isPreview={false}
    />
  );
};

export default EnhancedPublicProfileView;
