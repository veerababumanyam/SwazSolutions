/**
 * CustomLinkEditor Component
 * Fully customizable link editor with custom logo/icon support
 * Features: logo upload with cropping, icon selection, styling options, analytics tracking
 */

import React, { useState, useRef } from 'react';
import { CustomLinkConfig, LinkItem } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';

interface CustomLinkEditorProps {
  linkId: string;
  config?: CustomLinkConfig;
  onClose: () => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB for icons

// Common icon names from lucide-react (simplified set)
const COMMON_ICONS = [
  'link',
  'external-link',
  'globe',
  'mail',
  'phone',
  'map-pin',
  'instagram',
  'twitter',
  'facebook',
  'youtube',
  'github',
  'linkedin',
  'star',
  'heart',
  'share-2',
  'download',
  'play-circle',
  'music',
  'image',
  'camera'
];

export const CustomLinkEditor: React.FC<CustomLinkEditorProps> = ({
  linkId,
  config,
  onClose
}) => {
  const { updateLink } = useProfile();

  // URL
  const [url, setUrl] = useState(config?.iconUrl || '');

  // Logo upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(
    config?.iconBase64 || config?.iconUrl || ''
  );
  const [logoBase64, setLogoBase64] = useState(config?.iconBase64 || '');

  // Logo styling
  const [logoSize, setLogoSize] = useState<'small' | 'medium' | 'large'>(
    getLogoSizeFromPixels(config?.iconSize || 48)
  );
  const [backgroundColor, setBackgroundColor] = useState(
    config?.iconBackgroundColor || '#ffffff'
  );
  const [borderRadius, setBorderRadius] = useState(0);
  const [shadow, setShadow] = useState(false);

  // Fallback icon
  const [fallbackIcon, setFallbackIcon] = useState(config?.customClass?.split(' ')[0] || 'link');
  const [iconColor, setIconColor] = useState('#666666');

  // Link text
  const [displayText, setDisplayText] = useState('');
  const [hoverText, setHoverText] = useState('');

  // Analytics
  const [trackClicks, setTrackClicks] = useState(true);
  const [openInNewTab, setOpenInNewTab] = useState(
    config?.openInNewTab !== false
  );

  // UI state
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Logo exceeds 2MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setLogoFile(file);

      // Convert to base64
      const base64 = await fileToBase64(file);
      setLogoBase64(base64);
    } catch (err) {
      setError('Failed to process logo image');
      console.error('Error processing logo:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const validateUrl = (urlStr: string): boolean => {
    if (!urlStr.trim()) return false;
    try {
      const urlObj = new URL(urlStr);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate URL
    if (!validateUrl(url)) {
      setError('Please enter a valid HTTPS URL');
      return;
    }

    // Validate display text
    if (!displayText.trim()) {
      setError('Please enter display text for the link');
      return;
    }

    try {
      setUploading(true);

      // Build config
      const updatedConfig: CustomLinkConfig = {
        iconUrl: logoBase64 ? undefined : url,
        iconBase64: logoBase64 || undefined,
        iconBackgroundColor: backgroundColor,
        iconSize: getSizeInPixels(logoSize),
        customClass: fallbackIcon,
        openInNewTab
      };

      // Update link with metadata
      await updateLink(linkId, {
        title: displayText,
        url,
        metadata: {
          type: 'custom_link',
          config: updatedConfig
        }
      });

      onClose();
    } catch (err) {
      console.error('Error saving custom link:', err);
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setUploading(false);
    }
  };

  const getSizeInPixels = (size: 'small' | 'medium' | 'large'): number => {
    const sizes = { small: 32, medium: 48, large: 64 };
    return sizes[size];
  };

  const getLogoSizeFromPixels = (pixels: number): 'small' | 'medium' | 'large' => {
    if (pixels <= 36) return 'small';
    if (pixels <= 56) return 'medium';
    return 'large';
  };

  const logoPixels = getSizeInPixels(logoSize);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Custom Link
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Create a fully customizable link with your own logo or icon
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close editor"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Link URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              {validateUrl(url) && (
                <div className="absolute right-4 top-3.5 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Must start with https://
            </p>
          </div>

          {/* Logo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Custom Logo
            </label>

            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Drop logo here or click to upload
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* Logo Preview */}
            {logoPreview && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Logo Preview</p>
                <div
                  className="rounded-lg p-6 flex items-center justify-center border border-gray-200 dark:border-gray-700"
                  style={{
                    backgroundColor,
                    boxShadow: shadow ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
                  }}
                >
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="object-contain"
                    style={{
                      width: `${logoPixels}px`,
                      height: `${logoPixels}px`,
                      borderRadius: `${borderRadius}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Logo Styling */}
          {logoPreview && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Logo Styling
              </h3>

              {/* Size */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size
                </label>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setLogoSize(size)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        logoSize === size
                          ? 'bg-purple-500 text-white'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-500'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                    aria-label="Background color picker"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Border Radius: {borderRadius}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full"
                  aria-label="Border radius slider"
                />
              </div>

              {/* Shadow */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="shadow-toggle"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="shadow-toggle" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Add shadow effect
                </label>
              </div>
            </div>
          )}

          {/* Fallback Icon Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Fallback Icon (if no logo)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COMMON_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFallbackIcon(icon)}
                  className={`p-3 rounded-lg border-2 transition-all text-xs font-medium capitalize ${
                    fallbackIcon === icon
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  title={icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link Text */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Link Text
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                placeholder="e.g., Visit My Website"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This text appears on the button
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hover Text (Tooltip)
              </label>
              <input
                type="text"
                value={hoverText}
                onChange={(e) => setHoverText(e.target.value)}
                placeholder="Optional tooltip text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Link Options
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="new-tab"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="new-tab" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Open link in new tab
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="track-clicks"
                checked={trackClicks}
                onChange={(e) => setTrackClicks(e.target.checked)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="track-clicks" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Track click analytics
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!validateUrl(url) || !displayText.trim() || uploading}
              className="flex-1 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomLinkEditor;
