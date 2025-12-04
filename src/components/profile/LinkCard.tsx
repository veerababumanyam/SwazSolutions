// LinkCard Component
// Individual link card with edit, toggle, and action buttons - styled based on appearance settings

import React, { useState } from 'react';

export interface AppearanceSettings {
  // Button settings
  buttonStyle: 'solid' | 'glass' | 'outline';
  cornerRadius: number;
  shadowStyle: 'none' | 'subtle' | 'strong' | 'hard';
  buttonColor: string;
  shadowColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  // Header settings
  headerStyle?: 'simple' | 'banner' | 'avatar-top' | 'minimal' | 'hero-photo';
  headerColor?: string;
  // Wallpaper settings
  wallpaper?: string;
  wallpaperOpacity?: number;
  // Footer settings
  footerText?: string;
  showPoweredBy?: boolean;
  // Theme settings
  themeId?: string;
}

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

interface LinkCardProps {
  link: SocialLink;
  appearance?: AppearanceSettings;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onUpdateLabel: (label: string) => void;
  onUpdateUrl: (url: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  appearance,
  onEdit,
  onDelete,
  onToggleActive,
  onUpdateLabel,
  onUpdateUrl,
}) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editLabel, setEditLabel] = useState(link.displayLabel || link.platform || '');
  const [editUrl, setEditUrl] = useState(link.url);

  const handleLabelSave = () => {
    if (editLabel.trim()) {
      onUpdateLabel(editLabel.trim());
    }
    setIsEditingLabel(false);
  };

  const handleUrlSave = () => {
    if (editUrl.trim() && editUrl.startsWith('https://')) {
      onUpdateUrl(editUrl.trim());
    } else {
      setEditUrl(link.url);
      alert('URL must start with https://');
    }
    setIsEditingUrl(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      // Could show a toast here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const displayName = link.displayLabel || link.platform || 'Custom Link';
  const hostname = new URL(link.url).hostname;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button className="mt-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
          </button>

          {/* Link Content */}
          <div className="flex-1 min-w-0">
            {/* Platform/Label Row */}
            <div className="flex items-center gap-2 mb-1">
              {isEditingLabel ? (
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                  className="flex-1 px-2 py-1 text-base font-semibold border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              ) : (
                <>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {displayName}
                  </span>
                  <button
                    onClick={() => setIsEditingLabel(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* URL Row */}
            <div className="flex items-center gap-2 mb-3">
              {isEditingUrl ? (
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  onBlur={handleUrlSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSave()}
                  className="flex-1 px-2 py-1 text-sm border border-purple-300 dark:border-purple-600 rounded-md bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              ) : (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                    {link.url}
                  </span>
                  <button
                    onClick={() => setIsEditingUrl(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Action Icons Row */}
            <div className="flex items-center gap-1">
              {/* Platform Icon */}
              {link.customLogo && (
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={link.platform || 'Link'}>
                  <img src={link.customLogo} alt="" className="w-5 h-5" />
                </button>
              )}

              {/* Music/Embed Icon */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Add music">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </button>

              {/* Pin Icon */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Pin link">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* Thumbnail Icon */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Add thumbnail">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Star/Highlight Icon */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Highlight">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>

              {/* Copy Icon */}
              <button 
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" 
                title="Copy link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Lock Icon */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" title="Require sensitive content warning">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </button>

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Analytics */}
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm px-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>{link.clicks || 0} clicks</span>
              </div>

              {/* Delete */}
              <button
                onClick={onDelete}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Delete link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-col items-center gap-2 ml-2">
            {/* Share/Upload Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Share link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>

            {/* Toggle Switch */}
            <button
              onClick={onToggleActive}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                link.isFeatured 
                  ? 'bg-green-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={link.isFeatured ? 'Visible' : 'Hidden'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  link.isFeatured ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
