/**
 * Template Card Component
 * Display template cards in the marketplace
 */

import { useState } from 'react';
import type { SavedTemplate } from '../../types/invite.types';
import { StarRating, StarRatingCompact } from './StarRating';

interface TemplateCardProps {
  template: SavedTemplate;
  onSelect?: (template: SavedTemplate) => void;
  onRate?: (templateId: string, rating: number) => void;
  userRating?: number;
  className?: string;
}

export function TemplateCard({ template, onSelect, onRate, userRating, className = '' }: TemplateCardProps) {
  const [imageError, setImageError] = useState(false);
  const [rating, setRating] = useState(userRating || 0);

  const handleRate = async (newRating: number) => {
    setRating(newRating);
    if (onRate) {
      await onRate(template.id, newRating);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group ${className}`}
      onClick={() => onSelect?.(template)}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
        {template.thumbnailUrl && !imageError ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
            <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">
              {template.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white font-medium">Preview Template</span>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            {template.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-medium text-gray-900 dark:text-white truncate">{template.name}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
          {template.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <StarRatingCompact rating={template.rating || 0} />
            {/* Downloads */}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {template.downloads || 0}
            </span>
          </div>

          {/* Creator */}
          {template.creator && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              by {template.creator}
            </span>
          )}
        </div>

        {/* Rate button (if user hasn't rated) */}
        {onRate && !userRating && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Rate this template:</p>
            <StarRating rating={rating} onRate={handleRate} size="sm" />
          </div>
        )}

        {/* User's rating */}
        {userRating && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your rating:</p>
            <StarRating rating={userRating} readonly size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateGridProps {
  templates: SavedTemplate[];
  onSelect?: (template: SavedTemplate) => void;
  onRate?: (templateId: string, rating: number) => void;
  userRatings?: Record<string, number>;
  className?: string;
}

export function TemplateGrid({ templates, onSelect, onRate, userRatings, className = '' }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">No templates found</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onSelect}
          onRate={onRate}
          userRating={userRatings?.[template.id]}
        />
      ))}
    </div>
  );
}
