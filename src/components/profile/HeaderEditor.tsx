/**
 * HeaderEditor Component
 * Editor for HEADER link type - section headers for grouping links
 */

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface HeaderEditorProps {
  linkId: string;
  title?: string;
  onClose: () => void;
}

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  linkId,
  title = '',
  onClose
}) => {
  const { updateLink } = useProfile();

  const [formTitle, setFormTitle] = useState(title);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formTitle.trim()) {
      setError('Please enter a header title');
      return;
    }

    try {
      setLoading(true);
      await updateLink(linkId, {
        title: formTitle,
        metadata: {
          type: 'header',
          config: {
            size,
            alignment
          }
        }
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save header');
      console.error('Error saving header:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Section Header
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Organize links with section headings
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
          {/* Header Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Header Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., MY PROJECTS, SERVICES, ABOUT ME"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Headers are typically shown in UPPERCASE
            </p>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Header Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    size === s
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`text-gray-900 dark:text-white font-bold ${
                      s === 'small'
                        ? 'text-sm'
                        : s === 'medium'
                        ? 'text-lg'
                        : 'text-xl'
                    }`}
                  >
                    {s.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Alignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Text Alignment
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  type="button"
                  onClick={() => setAlignment(align)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    alignment === align
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`text-gray-900 dark:text-white font-medium text-sm text-${align}`}
                    style={{ textAlign: align }}
                  >
                    {align === 'center' ? '⋮' : align === 'left' ? '—' : '—'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 capitalize">
                    {align}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Preview</p>
            <div
              className="text-gray-900 dark:text-white font-bold"
              style={{
                fontSize:
                  size === 'small'
                    ? '0.875rem'
                    : size === 'medium'
                    ? '1.125rem'
                    : '1.25rem',
                textAlign: alignment
              }}
            >
              {formTitle || 'SECTION HEADER'}
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
              disabled={!formTitle.trim() || loading}
              className="flex-1 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Header'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeaderEditor;
