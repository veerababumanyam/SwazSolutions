/**
 * PreviewPane - Right-side sticky preview pane
 *
 * Features:
 * - Sticky container on desktop, collapsible on mobile
 * - MobilePreview component embedded for live preview
 * - Real-time updates as user edits
 * - Published/Draft badge
 * - Action buttons: QR Code, Share, Download vCard, View Public
 * - Stats display (views, downloads, shares)
 * - Dark mode support
 * - Responsive to screen size
 */

import React, { useState, useCallback } from 'react';
import {
  QrCode,
  Share2,
  Download,
  Eye,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProfileData, LinkItem, Theme, SocialLink } from '@/types/modernProfile.types';
import { AccessibleButton, AccessibleIconButton } from '@/components/common/AccessibleButton';

interface PreviewPaneProps {
  /** Profile data to display */
  profile: ProfileData;
  /** Link items (blocks) */
  links: LinkItem[];
  /** Current theme */
  theme: Theme;
  /** Whether profile is published */
  isPublished: boolean;
  /** Analytics statistics */
  stats?: {
    views: number;
    downloads: number;
    shares: number;
  };
  /** Callback for QR code action */
  onQRCode?: () => void;
  /** Callback for share action */
  onShare?: () => void;
  /** Callback for download vCard */
  onDownloadVCard?: () => void;
  /** Callback for view public profile */
  onViewPublic?: () => void;
}

/**
 * Badge component for status display
 */
const Badge: React.FC<{ label: string; variant: 'published' | 'draft' }> = ({
  label,
  variant,
}) => {
  const styles = {
    published: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    draft: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
};

/**
 * Stat card component
 */
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 flex items-center gap-3">
    <div className="text-gray-400">{icon}</div>
    <div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold text-primary">{value.toLocaleString()}</p>
    </div>
  </div>
);

/**
 * Placeholder MobilePreview component
 * This would be replaced with actual mobile mockup in production
 */
const MobilePreview: React.FC<{
  profile: ProfileData;
  links: LinkItem[];
  theme: Theme;
}> = ({ profile, links, theme }) => (
  <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl border-8 border-gray-900 dark:border-gray-700 shadow-xl overflow-hidden">
    {/* Status bar */}
    <div className="bg-gray-900 dark:bg-black text-white text-xs h-6 flex items-center justify-between px-4">
      <span>9:41</span>
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-white rounded-full" />
        <div className="w-1 h-1 bg-white rounded-full" />
      </div>
    </div>

    {/* Content area - placeholder */}
    <div className="h-screen bg-white dark:bg-gray-950 p-4 space-y-4 overflow-hidden">
      {/* Avatar placeholder */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Avatar</span>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="text-center">
        <h2 className="font-bold text-lg text-primary">{profile.displayName}</h2>
        {profile.profession && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{profile.profession}</p>
        )}
        {profile.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Socials placeholder */}
      {profile.socials && profile.socials.length > 0 && (
        <div className="flex justify-center gap-3">
          {profile.socials.slice(0, 4).map((social) => (
            <div
              key={social.id}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"
              title={social.platform}
            />
          ))}
        </div>
      )}

      {/* Links preview - show first 2 */}
      <div className="space-y-2 pt-2">
        {links.slice(0, 2).map((link) => (
          <div
            key={link.id}
            className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center px-3 text-xs text-gray-600 dark:text-gray-400 truncate"
          >
            {link.title}
          </div>
        ))}
        {links.length > 2 && (
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center pt-2">
            +{links.length - 2} more
          </p>
        )}
      </div>
    </div>
  </div>
);

/**
 * PreviewPane Component
 * Right-side sticky pane showing live mobile mockup and actions
 */
export const PreviewPane: React.FC<PreviewPaneProps> = ({
  profile,
  links,
  theme,
  isPublished,
  stats = { views: 0, downloads: 0, shares: 0 },
  onQRCode,
  onShare,
  onDownloadVCard,
  onViewPublic,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div
      className="sticky top-20 max-h-[calc(100vh-80px)] flex flex-col bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden"
      role="region"
      aria-label="Profile preview pane"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-primary">Live Preview</h3>
          <Badge
            label={isPublished ? 'Published' : 'Draft'}
            variant={isPublished ? 'published' : 'draft'}
          />
        </div>

        {/* Mobile: expand/collapse button */}
        <div className="md:hidden">
          <AccessibleIconButton
            aria-label={isExpanded ? 'Collapse preview' : 'Expand preview'}
            icon={isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            onClick={handleToggleExpand}
            variant="ghost"
          />
        </div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Mobile mockup */}
          <div className="flex-shrink-0 p-4 flex justify-center">
            <div className="w-full max-w-xs">
              <MobilePreview profile={profile} links={links} theme={theme} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-white/5 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <AccessibleButton
                variant="outline"
                size="sm"
                onClick={onQRCode}
                disabled={!onQRCode}
                icon={<QrCode size={16} />}
                aria-label="Generate QR code"
              >
                QR Code
              </AccessibleButton>

              <AccessibleButton
                variant="outline"
                size="sm"
                onClick={onShare}
                disabled={!onShare}
                icon={<Share2 size={16} />}
                aria-label="Share profile"
              >
                Share
              </AccessibleButton>

              <AccessibleButton
                variant="outline"
                size="sm"
                onClick={onDownloadVCard}
                disabled={!onDownloadVCard}
                icon={<Download size={16} />}
                aria-label="Download vCard file"
              >
                vCard
              </AccessibleButton>

              <AccessibleButton
                variant="outline"
                size="sm"
                onClick={onViewPublic}
                disabled={!onViewPublic || !isPublished}
                icon={<Eye size={16} />}
                aria-label="View public profile"
              >
                View
              </AccessibleButton>
            </div>
          </div>

          {/* Stats */}
          {stats && (stats.views > 0 || stats.downloads > 0 || stats.shares > 0) && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUp size={14} />
                Analytics
              </div>

              <div className="grid grid-cols-1 gap-2">
                <StatCard
                  label="Views"
                  value={stats.views}
                  icon={<Eye size={16} />}
                />
                <StatCard
                  label="Downloads"
                  value={stats.downloads}
                  icon={<Download size={16} />}
                />
                <StatCard
                  label="Shares"
                  value={stats.shares}
                  icon={<Share2 size={16} />}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewPane;
