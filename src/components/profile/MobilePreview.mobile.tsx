/**
 * MOBILE-FIRST PREVIEW WRAPPER
 * Wrapper that uses MobileFirstProfileRenderer for live preview
 */

import React from 'react';
import { MobileFirstProfileRenderer, AppearanceSettings, SocialLink, ProfileData } from '../public-profile/ProfileRenderer.mobile';

interface MobileFirstPreviewProps {
  profile: ProfileData;
  links: SocialLink[];
  appearance?: AppearanceSettings | null;
  profileUrl?: string;
  onPreview?: () => void;
  onShare?: () => void;
  onDownloadVCard?: () => void;
}

/**
 * MobileFirstPreview - Live preview component using the new mobile-first renderer
 * This ensures the editor preview matches exactly what the public profile will look like
 */
export const MobileFirstPreview: React.FC<MobileFirstPreviewProps> = ({
  profile,
  links,
  appearance,
  profileUrl,
  onPreview,
  onShare,
  onDownloadVCard
}) => {
  // Wrap in phone frame for preview
  return (
    <div className="flex justify-center py-8">
      <div className="relative">
        {/* Phone Frame */}
        <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
          <div className="bg-gray-800 rounded-[2rem] overflow-hidden">
            {/* Preview Screen */}
            <div className="relative">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-20" />

              {/* Profile Renderer */}
              <MobileFirstProfileRenderer
                profile={profile}
                links={links}
                appearance={appearance}
                profileUrl={profileUrl}
                onDownloadVCard={onDownloadVCard}
                onShare={onShare}
                isPreview={true}
              />
            </div>
          </div>
        </div>

        {/* Preview Actions */}
        <div className="mt-4 flex justify-center gap-4">
          {onPreview && (
            <button
              onClick={onPreview}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Open Live Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileFirstPreview;
