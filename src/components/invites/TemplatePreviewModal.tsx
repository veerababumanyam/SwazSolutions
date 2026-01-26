/**
 * Template Preview Modal Component
 * Preview template in detail before using
 */

import { useState } from 'react';
import { templateApi } from '../../services/inviteApi';
import type { SavedTemplate } from '../../types/invite.types';
import { StarRating } from './StarRating';

interface TemplatePreviewModalProps {
  template: SavedTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onUse?: (template: SavedTemplate) => void;
  onRate?: (templateId: string, rating: number) => void;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onUse,
  onRate
}: TemplatePreviewModalProps) {
  const [usingTemplate, setUsingTemplate] = useState(false);
  const [userRating, setUserRating] = useState<number>(template?.userRating || 0);

  if (!isOpen || !template) return null;

  const handleUseTemplate = async () => {
    if (!onUse) return;

    setUsingTemplate(true);
    try {
      // Increment download count
      await templateApi.useTemplate(template.id);
      onUse(template);
      onClose();
    } catch (err) {
      console.error('Failed to use template:', err);
    } finally {
      setUsingTemplate(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!onRate) return;

    try {
      await onRate(template.id, rating);
      setUserRating(rating);
    } catch (err) {
      console.error('Failed to rate template:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{template.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.category}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="p-6">
          <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden mb-6">
            {template.thumbnailUrl ? (
              <img
                src={template.thumbnailUrl}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
                <span className="text-4xl font-bold text-gray-400 dark:text-gray-600">
                  {template.name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {template.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{template.description}</p>
          )}

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {template.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <StarRating rating={template.rating || 0} count={template.downloads} size="sm" />
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>{template.downloads || 0} downloads</span>
            </div>
            {template.creator && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>by {template.creator}</span>
              </div>
            )}
          </div>

          {/* Rating Section */}
          {onRate && (
            <div className="py-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {userRating > 0 ? 'Your rating:' : 'Rate this template:'}
              </p>
              <StarRating
                rating={userRating}
                onRate={handleRate}
                size="md"
                readonly={!!userRating}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
          >
            Cancel
          </button>
          {onUse && (
            <button
              onClick={handleUseTemplate}
              disabled={usingTemplate}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {usingTemplate ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Use Template
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
