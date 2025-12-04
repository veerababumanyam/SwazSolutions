// AddLinkModal Component
// Modal for adding new links with URL detection and options

import React, { useState, useEffect } from 'react';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, label: string, isFeatured: boolean) => void;
  existingLinksCount: number;
  featuredCount: number;
}

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
  { name: 'Medium', pattern: 'medium.com', logo: '/assets/social-logos/medium.svg' },
  { name: 'Behance', pattern: 'behance.net', logo: '/assets/social-logos/behance.svg' },
  { name: 'Dribbble', pattern: 'dribbble.com', logo: '/assets/social-logos/dribbble.svg' },
  { name: 'Twitch', pattern: 'twitch.tv', logo: '/assets/social-logos/twitch.svg' },
  { name: 'Discord', pattern: 'discord.', logo: '/assets/social-logos/discord.svg' },
  { name: 'Telegram', pattern: 't.me', logo: '/assets/social-logos/telegram.svg' },
  { name: 'WhatsApp', pattern: 'wa.me', logo: '/assets/social-logos/whatsapp.svg' },
];

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingLinksCount,
  featuredCount,
}) => {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [detectedPlatform, setDetectedPlatform] = useState<{ name: string; logo: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (url.trim()) {
      const detected = detectPlatform(url);
      setDetectedPlatform(detected);
    } else {
      setDetectedPlatform(null);
    }
  }, [url]);

  const detectPlatform = (urlStr: string) => {
    for (const platform of KNOWN_PLATFORMS) {
      if (urlStr.toLowerCase().includes(platform.pattern)) {
        return { name: platform.name, logo: platform.logo };
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    if (isFeatured && featuredCount >= 5) {
      setError('Maximum 5 featured links allowed. Disable "Show on profile" or remove an existing featured link.');
      return;
    }

    onAdd(url, label, isFeatured);
    
    // Reset form
    setUrl('');
    setLabel('');
    setIsFeatured(true);
    setDetectedPlatform(null);
  };

  const handleClose = () => {
    setUrl('');
    setLabel('');
    setIsFeatured(true);
    setDetectedPlatform(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Link
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/your-link"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
              {detectedPlatform && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <img src={detectedPlatform.logo} alt="" className="w-5 h-5" />
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {detectedPlatform.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Display Label Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Display Label
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={detectedPlatform?.name || "My awesome link"}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                Show on profile
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {featuredCount}/5 featured links used
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              disabled={!isFeatured && featuredCount >= 5}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isFeatured 
                  ? 'bg-purple-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              } ${!isFeatured && featuredCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isFeatured ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Quick Add Suggestions */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick add popular platforms
            </div>
            <div className="flex flex-wrap gap-2">
              {KNOWN_PLATFORMS.slice(0, 8).map((platform) => (
                <button
                  key={platform.name}
                  type="button"
                  onClick={() => {
                    setUrl(`https://${platform.pattern}/`);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <img src={platform.logo} alt="" className="w-4 h-4" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLinkModal;
