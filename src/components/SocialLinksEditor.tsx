// SocialLinksEditor Component
// Manages add/edit/delete/reorder of social links

import React, { useState, useEffect, useCallback } from 'react';
import { socialLinksService, SocialLink } from '../services/socialLinksService';
import {
  KNOWN_PLATFORMS,
  PLATFORM_CATEGORIES,
  getPlatformsByCategory,
  detectPlatformFromUrl,
  DEFAULT_LOGO,
  PlatformCategory,
} from '../constants/platforms';

interface SocialLinksEditorProps {
  onLinksChange?: (links: SocialLink[]) => void;
}

const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ onLinksChange }) => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [saving, setSaving] = useState(false);

  // Load social links
  const loadLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await socialLinksService.getSocialLinks();
      const allLinks = [...response.featured, ...response.custom].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );
      setLinks(allLinks);
      onLinksChange?.(allLinks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load links');
    } finally {
      setLoading(false);
    }
  }, [onLinksChange]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // Delete link
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
      setSaving(true);
      await socialLinksService.deleteSocialLink(id);
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete link');
    } finally {
      setSaving(false);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (link: SocialLink) => {
    try {
      setSaving(true);
      await socialLinksService.updateSocialLink(link.id, {
        isFeatured: !link.isFeatured,
      });
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link');
    } finally {
      setSaving(false);
    }
  };

  // Move link up/down
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const newLinks = [...links];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];

    try {
      setSaving(true);
      await socialLinksService.reorderSocialLinks(newLinks.map((l) => l.id));
      await loadLinks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder links');
    } finally {
      setSaving(false);
    }
  };

  const featuredCount = links.filter((l) => l.isFeatured).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading social links...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Links</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add links to your social media profiles. Featured links ({featuredCount}/5) appear prominently.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Link
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">No social links yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Add your first link
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                link.isFeatured
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Logo */}
              <img
                src={link.customLogo || DEFAULT_LOGO}
                alt={link.platform}
                className="w-8 h-8 rounded"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO;
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {link.platform}
                  </span>
                  {link.isFeatured && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded">
                      Featured
                    </span>
                  )}
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                >
                  {link.url}
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* Move up */}
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0 || saving}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Move down */}
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === links.length - 1 || saving}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Toggle featured */}
                <button
                  onClick={() => handleToggleFeatured(link)}
                  disabled={saving || (!link.isFeatured && featuredCount >= 5)}
                  className={`p-1.5 ${
                    link.isFeatured
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-yellow-500'
                  } disabled:opacity-30`}
                  title={link.isFeatured ? 'Remove from featured' : 'Add to featured'}
                >
                  <svg className="w-4 h-4" fill={link.isFeatured ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>

                {/* Edit */}
                <button
                  onClick={() => setEditingLink(link)}
                  disabled={saving}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={saving}
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingLink) && (
        <LinkFormModal
          link={editingLink}
          onClose={() => {
            setShowAddModal(false);
            setEditingLink(null);
          }}
          onSave={async () => {
            await loadLinks();
            setShowAddModal(false);
            setEditingLink(null);
          }}
          featuredCount={featuredCount}
        />
      )}
    </div>
  );
};

// Modal for adding/editing links
interface LinkFormModalProps {
  link: SocialLink | null;
  onClose: () => void;
  onSave: () => void;
  featuredCount: number;
}

const LinkFormModal: React.FC<LinkFormModalProps> = ({ link, onClose, onSave, featuredCount }) => {
  const isEditing = !!link;
  const [url, setUrl] = useState(link?.url || '');
  const [platform, setPlatform] = useState(link?.platform || '');
  const [customLogo, setCustomLogo] = useState(link?.customLogo || '');
  const [isFeatured, setIsFeatured] = useState(link?.isFeatured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (!isEditing && url) {
      const detected = detectPlatformFromUrl(url);
      if (detected) {
        setPlatform(detected.name);
        setCustomLogo(detected.logo);
      }
    }
  }, [url, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    if (!url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    try {
      setSaving(true);

      if (isEditing) {
        await socialLinksService.updateSocialLink(link.id, {
          url,
          platform: platform || 'Custom',
          customLogo: customLogo || DEFAULT_LOGO,
          isFeatured,
        });
      } else {
        await socialLinksService.createSocialLink({
          url,
          platform: platform || 'Custom',
          customLogo: customLogo || DEFAULT_LOGO,
          isFeatured,
        });
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save link');
    } finally {
      setSaving(false);
    }
  };

  const platformsByCategory = getPlatformsByCategory();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {isEditing ? 'Edit Social Link' : 'Add Social Link'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://twitter.com/username"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Platform will be auto-detected from URL
              </p>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700">
                    {customLogo && (
                      <img
                        src={customLogo}
                        alt=""
                        className="w-5 h-5"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_LOGO;
                        }}
                      />
                    )}
                    <span className="text-gray-900 dark:text-white">{platform || 'Custom'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Choose
                </button>
              </div>
            </div>

            {/* Platform Picker */}
            {showPlatformPicker && (
              <div className="border border-gray-200 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                {(Object.keys(PLATFORM_CATEGORIES) as PlatformCategory[]).map((category) => (
                  <div key={category}>
                    <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {PLATFORM_CATEGORIES[category].icon} {PLATFORM_CATEGORIES[category].label}
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {platformsByCategory[category].map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setPlatform(p.name);
                            setCustomLogo(p.logo);
                            setShowPlatformPicker(false);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            platform === p.name
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <img src={p.logo} alt="" className="w-4 h-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Featured Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <label className="font-medium text-gray-900 dark:text-white">Featured Link</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Featured links appear prominently on your profile ({featuredCount}/5)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={!isEditing && !isFeatured && featuredCount >= 5}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                {isEditing ? 'Save Changes' : 'Add Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksEditor;
