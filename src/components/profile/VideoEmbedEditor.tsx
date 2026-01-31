/**
 * VideoEmbedEditor Component
 * Editor for VIDEO_EMBED link type - embed videos from external sources
 */

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface VideoEmbedEditorProps {
  linkId: string;
  title?: string;
  url?: string;
  onClose: () => void;
}

export const VideoEmbedEditor: React.FC<VideoEmbedEditorProps> = ({
  linkId,
  title = '',
  url = '',
  onClose
}) => {
  const { updateLink } = useProfile();

  const [formTitle, setFormTitle] = useState(title);
  const [formUrl, setFormUrl] = useState(url);
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSupportedPlatforms = () => [
    { name: 'YouTube', icon: '▶️', example: 'https://youtube.com/watch?v=...' },
    { name: 'Vimeo', icon: '▶️', example: 'https://vimeo.com/...' },
    { name: 'TikTok', icon: '♪', example: 'https://tiktok.com/@.../video/...' },
    { name: 'Instagram', icon: '📷', example: 'https://instagram.com/p/...' }
  ];

  const validateUrl = (urlStr: string): boolean => {
    if (!urlStr.trim()) return false;
    try {
      const urlObj = new URL(urlStr);
      return (
        urlObj.hostname?.includes('youtube.com') ||
        urlObj.hostname?.includes('youtu.be') ||
        urlObj.hostname?.includes('vimeo.com') ||
        urlObj.hostname?.includes('tiktok.com') ||
        urlObj.hostname?.includes('instagram.com')
      );
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formTitle.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!validateUrl(formUrl)) {
      setError('Please enter a valid video URL from YouTube, Vimeo, TikTok, or Instagram');
      return;
    }

    try {
      setLoading(true);
      await updateLink(linkId, {
        title: formTitle,
        url: formUrl,
        metadata: {
          type: 'video_embed',
          config: {
            autoplay,
            muted,
            loop
          }
        }
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save video');
      console.error('Error saving video embed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Embedded Video
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Embed videos from YouTube, Vimeo, TikTok, or Instagram
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., My Latest Video"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              {validateUrl(formUrl) && (
                <div className="absolute right-4 top-3.5 text-green-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Supported Platforms */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-3">
              Supported Platforms
            </p>
            <div className="grid grid-cols-2 gap-2">
              {getSupportedPlatforms().map(platform => (
                <div key={platform.name} className="text-xs">
                  <p className="font-medium text-blue-900 dark:text-blue-300">{platform.icon} {platform.name}</p>
                  <p className="text-blue-700 dark:text-blue-400 truncate">{platform.example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Playback Options */}
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Playback Options
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoplay"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="autoplay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Autoplay
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="muted"
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="muted" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Muted (required for autoplay on most browsers)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="loop"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="loop" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Loop
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
              disabled={!formTitle.trim() || !validateUrl(formUrl) || loading}
              className="flex-1 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoEmbedEditor;
