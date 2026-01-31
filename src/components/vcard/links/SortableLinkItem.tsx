/**
 * SortableLinkItem - Individual link/block item with drag handle
 * Extracted from LinksEditor.tsx for reusability
 * Features: drag handle, edit button, delete button, toggle active
 */

import React from 'react';
import { LinkItem, LinkType } from '@/types/modernProfile.types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface SortableLinkItemProps {
  link: LinkItem;
  onEdit: (linkId: string) => void;
  onDelete: (linkId: string) => void;
  onToggleActive: (linkId: string) => void;
}

/**
 * Get emoji icon for link type
 * Maps LinkType enum to emoji representation
 */
const getLinkTypeIcon = (type: LinkType): string => {
  const icons: Record<LinkType, string> = {
    [LinkType.CLASSIC]: '🔗',
    [LinkType.HEADER]: '📝',
    [LinkType.GALLERY]: '🖼️',
    [LinkType.VIDEO_EMBED]: '🎬',
    [LinkType.VIDEO_UPLOAD]: '📹',
    [LinkType.BOOKING]: '📅',
  };
  return icons[type];
};

/**
 * SortableLinkItem Component
 * Renders an individual link item with:
 * - Drag handle (left side with GripVertical icon)
 * - Content display (title, description/URL)
 * - Action buttons (visibility toggle, edit, delete)
 * - Visual feedback (active highlight, hover states, drag feedback)
 * - Full accessibility (ARIA labels, keyboard support via @dnd-kit)
 */
export const SortableLinkItem: React.FC<SortableLinkItemProps> = ({
  link,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      onDelete(link.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-4">
      {/* Active Highlight Border */}
      {link.isActive && (
        <div
          className="absolute -left-[1px] top-[10px] bottom-[10px] w-[3px] bg-blue-500 rounded-r-full"
          aria-hidden="true"
        />
      )}

      <div className="relative bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 overflow-hidden">
        <div className="flex">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-300 dark:text-white/10 hover:text-gray-500 dark:hover:text-white/50 touch-none hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-r border-gray-100 dark:border-white/5"
            role="button"
            tabIndex={0}
            aria-label="Drag handle to reorder link"
          >
            <GripVertical size={16} />
          </div>

          {/* Link Content */}
          <div className="flex-1 p-4 flex items-center gap-3">
            <div className="text-2xl" aria-hidden="true">
              {getLinkTypeIcon(link.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {link.title || 'Untitled'}
              </div>
              {link.url && link.type !== LinkType.HEADER && (
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {link.url}
                </div>
              )}
              {link.type === LinkType.GALLERY && link.galleryImages && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {link.galleryImages.length} image{link.galleryImages.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Visibility Toggle */}
              <button
                onClick={() => onToggleActive(link.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label={link.isActive ? 'Hide this link' : 'Show this link'}
                title={link.isActive ? 'Hide' : 'Show'}
              >
                {link.isActive ? (
                  <Eye size={16} className="text-green-500" />
                ) : (
                  <EyeOff size={16} className="text-gray-400" />
                )}
              </button>

              {/* Edit Button */}
              <button
                onClick={() => onEdit(link.id)}
                className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                aria-label="Edit this link"
                title="Edit"
              >
                <Edit2 size={16} className="text-blue-500" />
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                aria-label="Delete this link"
                title="Delete"
              >
                <Trash2 size={16} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortableLinkItem;
