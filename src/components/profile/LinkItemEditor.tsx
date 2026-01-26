/**
 * LinkItemEditor Component
 * Universal editor for all 6 link types: CLASSIC, GALLERY, VIDEO_EMBED, HEADER, BOOKING, VIDEO_UPLOAD
 * Displays appropriate form fields based on LinkType
 */

import React, { useState, useEffect } from 'react';
import { LinkItem, LinkType } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';

interface LinkItemEditorProps {
  linkId?: string; // If provided, editing existing link; otherwise creating new
  initialType?: LinkType;
  onClose: () => void;
  onSave?: () => void;
}

export const LinkItemEditor: React.FC<LinkItemEditorProps> = ({
  linkId,
  initialType = LinkType.CLASSIC,
  onClose,
  onSave
}) => {
  const { links, addLink, updateLink } = useProfile();

  const existingLink = linkId ? links.find(l => l.id === linkId) : null;

  const [type, setType] = useState<LinkType>(existingLink?.type || initialType);
  const [title, setTitle] = useState(existingLink?.title || '');
  const [url, setUrl] = useState(existingLink?.url || '');
  const [layout, setLayout] = useState<'grid' | 'carousel' | 'list'>(existingLink?.layout || 'carousel');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingLink;

  // Validation
  const isValid = () => {
    if (!title.trim()) return false;

    switch (type) {
      case LinkType.CLASSIC:
      case LinkType.VIDEO_EMBED:
      case LinkType.BOOKING:
        return !!url.trim();
      case LinkType.VIDEO_UPLOAD:
        return isEditing || !!file; // Existing video or new file required
      case LinkType.HEADER:
      case LinkType.GALLERY:
        return true; // Only title required
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValid()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);

      if (isEditing && linkId) {
        // Update existing link
        const updates: Partial<LinkItem> = {
          title,
          ...(type !== LinkType.HEADER && { url }),
          ...(type === LinkType.GALLERY && { layout })
        };

        await updateLink(linkId, updates);
      } else {
        // Create new link
        await addLink(type);

        // Get the newly created link (first in array after optimistic update)
        const newLink = links[0];

        if (newLink) {
          const updates: Partial<LinkItem> = {
            title,
            ...(type !== LinkType.HEADER && { url }),
            ...(type === LinkType.GALLERY && { layout })
          };

          await updateLink(newLink.id, updates);
        }
      }

      onSave?.();
      onClose();
    } catch (err) {
      console.error('Error saving link:', err);
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setUploading(false);
    }
  };

  const getLinkTypeLabel = (linkType: LinkType): string => {
    const labels: Record<LinkType, string> = {
      [LinkType.CLASSIC]: 'Classic Link',
      [LinkType.GALLERY]: 'Image Gallery',
      [LinkType.VIDEO_EMBED]: 'Embedded Video',
      [LinkType.VIDEO_UPLOAD]: 'Upload Video',
      [LinkType.HEADER]: 'Section Header',
      [LinkType.BOOKING]: 'Booking Link'
    };
    return labels[linkType];
  };

  const getLinkTypeDescription = (linkType: LinkType): string => {
    const descriptions: Record<LinkType, string> = {
      [LinkType.CLASSIC]: 'A standard clickable link button',
      [LinkType.GALLERY]: 'Showcase multiple images in a gallery',
      [LinkType.VIDEO_EMBED]: 'Embed videos from YouTube, Vimeo, etc.',
      [LinkType.VIDEO_UPLOAD]: 'Upload and host your own video',
      [LinkType.HEADER]: 'Organize links with section headings',
      [LinkType.BOOKING]: 'Link to booking/scheduling service'
    };
    return descriptions[linkType];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Link' : 'Add New Link'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {getLinkTypeDescription(type)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Link Type Selector (only for new links) */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Link Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(LinkType).map(linkType => (
                  <button
                    key={linkType}
                    type="button"
                    onClick={() => setType(linkType)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      type === linkType
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {getLinkTypeLabel(linkType)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {getLinkTypeDescription(linkType)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title Field (required for all types) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === LinkType.HEADER
                  ? 'SECTION HEADING'
                  : type === LinkType.GALLERY
                  ? 'Gallery Name'
                  : 'Link Title'
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* URL Field (for CLASSIC, VIDEO_EMBED, BOOKING) */}
          {(type === LinkType.CLASSIC || type === LinkType.VIDEO_EMBED || type === LinkType.BOOKING) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  type === LinkType.VIDEO_EMBED
                    ? 'https://youtube.com/watch?v=...'
                    : type === LinkType.BOOKING
                    ? 'https://calendly.com/...'
                    : 'https://example.com'
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              {type === LinkType.VIDEO_EMBED && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supported: YouTube, Vimeo, TikTok, Instagram
                </p>
              )}
            </div>
          )}

          {/* Layout Field (for GALLERY) */}
          {type === LinkType.GALLERY && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout Style
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['grid', 'carousel', 'list'] as const).map(layoutOption => (
                  <button
                    key={layoutOption}
                    type="button"
                    onClick={() => setLayout(layoutOption)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      layout === layoutOption
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {layoutOption}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Upload (for VIDEO_UPLOAD) */}
          {type === LinkType.VIDEO_UPLOAD && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video File {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="video-upload"
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="text-gray-500 dark:text-gray-400">
                    {file ? (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="font-medium">Click to upload video</p>
                        <p className="text-sm mt-1">MP4, MOV, AVI (max 100MB)</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

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
              disabled={!isValid() || uploading}
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
                <span>{isEditing ? 'Update Link' : 'Add Link'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkItemEditor;
