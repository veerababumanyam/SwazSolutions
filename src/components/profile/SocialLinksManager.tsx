// T093: SocialLinksManager Component
// Manages featured and custom social links with drag-and-drop reordering

import React, { useState, useEffect } from 'react';
import { 
  detectPlatformFromUrl, 
  DEFAULT_LOGO 
} from '../../constants/platforms';

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

interface SocialLinksManagerProps {
  profileId?: number;
  onChange?: () => void;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({ onChange }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [detectedLogo, setDetectedLogo] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profiles/me/social-links', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch social links');
      }

      const data = await response.json();
      setLinks(data.links || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching links:', err);
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  // T095: Auto-detect logo from URL using centralized platforms
  const detectPlatform = (url: string) => {
    const platform = detectPlatformFromUrl(url);
    if (platform) {
      setDetectedPlatform(platform.name);
      setDetectedLogo(platform.logo);
    } else {
      setDetectedPlatform(null);
      setDetectedLogo(null);
    }
  };

  const handleUrlChange = (url: string) => {
    setNewLinkUrl(url);
    if (url.trim()) {
      detectPlatform(url);
    } else {
      setDetectedPlatform(null);
      setDetectedLogo(null);
    }
  };

  const handleAddLink = async () => {
    if (!newLinkUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (!newLinkUrl.startsWith('https://')) {
      alert('URL must start with https://');
      return;
    }

    const featuredCount = links.filter(l => l.isFeatured).length;
    if (isFeatured && featuredCount >= 5) {
      alert('Maximum 5 featured links allowed. Uncheck "Featured" or remove an existing featured link.');
      return;
    }

    try {
      const response = await fetch('/api/profiles/me/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          url: newLinkUrl,
          displayLabel: newLinkLabel || null,
          platform: detectedPlatform,
          customLogo: detectedLogo,
          isFeatured
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add link');
      }

      // Reset form
      setNewLinkUrl('');
      setNewLinkLabel('');
      setDetectedPlatform(null);
      setDetectedLogo(null);
      setIsFeatured(true);

      // Refresh links
      await fetchLinks();
      onChange?.();
    } catch (err) {
      console.error('Error adding link:', err);
      alert(err instanceof Error ? err.message : 'Failed to add link');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/me/social-links/${linkId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      await fetchLinks();
      onChange?.();
    } catch (err) {
      console.error('Error deleting link:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete link');
    }
  };

  // T099: Toggle featured status
  const handleToggleFeatured = async (link: SocialLink) => {
    const featuredCount = links.filter(l => l.isFeatured).length;
    
    if (!link.isFeatured && featuredCount >= 5) {
      alert('Maximum 5 featured links allowed');
      return;
    }

    try {
      const response = await fetch(`/api/profiles/me/social-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isFeatured: !link.isFeatured
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update link');
      }

      await fetchLinks();
      onChange?.();
    } catch (err) {
      console.error('Error updating link:', err);
      alert(err instanceof Error ? err.message : 'Failed to update link');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Social Links</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const featuredLinks = links.filter(l => l.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);
  const customLinks = links.filter(l => !l.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Social Links</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Add New Link Form */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Link</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">URL *</label>
            <input
              type="url"
              value={newLinkUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {detectedPlatform && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                ✓ Detected: {detectedPlatform}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Display Label (optional)
            </label>
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="My Portfolio"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="featured" className="text-sm text-gray-700 dark:text-gray-300">
              Featured link ({featuredLinks.length}/5)
            </label>
          </div>

          <button
            onClick={handleAddLink}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Add Link
          </button>
        </div>
      </div>

      {/* Featured Links Section */}
      {featuredLinks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Featured Links ({featuredLinks.length}/5)
          </h3>
          <div className="space-y-2">
            {featuredLinks.map(link => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <img 
                    src={link.customLogo || DEFAULT_LOGO} 
                    alt={link.platform || 'Logo'} 
                    className="w-8 h-8 rounded object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {link.platform || 'Custom Link'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {link.url}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFeatured(link)}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
                  >
                    Unfeature
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Links Section */}
      {customLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            More Links ({customLinks.length})
          </h3>
          <div className="space-y-2">
            {customLinks.map(link => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <img 
                    src={link.customLogo || DEFAULT_LOGO} 
                    alt={link.platform || 'Logo'} 
                    className="w-6 h-6 rounded object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {link.displayLabel || link.platform || 'Custom Link'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {link.url}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleFeatured(link)}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Feature
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No social links added yet.</p>
          <p className="text-sm mt-1">Add your first link above to get started!</p>
        </div>
      )}
    </div>
  );
};

export default SocialLinksManager;
