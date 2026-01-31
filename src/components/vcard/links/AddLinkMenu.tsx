/**
 * AddLinkMenu - Modal for selecting link/block type
 * Extracted from LinksEditor.tsx for reusability
 * Features: 6 link types in icon grid layout, smooth animations
 */

import React from 'react';
import { LinkType } from '@/types/modernProfile.types';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkTypeOption {
  type: LinkType;
  label: string;
  icon: string;
  description: string;
}

interface AddLinkMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: LinkType) => void;
}

/**
 * Predefined link type options for creating new blocks.
 * VIDEO_UPLOAD and BOOKING are deprecated and not shown in the UI.
 * Maps LinkType enum to user-friendly labels and descriptions.
 */
const LINK_TYPE_OPTIONS: LinkTypeOption[] = [
  {
    type: LinkType.CLASSIC,
    label: 'Link',
    icon: '🔗',
    description: 'Standard clickable link',
  },
  {
    type: LinkType.HEADER,
    label: 'Header',
    icon: '📝',
    description: 'Section divider',
  },
  {
    type: LinkType.GALLERY,
    label: 'Gallery',
    icon: '🖼️',
    description: 'Image showcase',
  },
  {
    type: LinkType.VIDEO_EMBED,
    label: 'YouTube / Vimeo',
    icon: '🎬',
    description: 'Embed video from URL',
  },
  {
    type: LinkType.CONTACT_FORM,
    label: 'Contact Form',
    icon: '📋',
    description: 'Visitor inquiry form',
  },
  {
    type: LinkType.MAP_LOCATION,
    label: 'Map',
    icon: '📍',
    description: 'Show your location',
  },
  {
    type: LinkType.FILE_DOWNLOAD,
    label: 'File Download',
    icon: '📥',
    description: 'Share downloadable files',
  },
  {
    type: LinkType.CUSTOM_LINK,
    label: 'Custom Link',
    icon: '⭐',
    description: 'Custom styled link',
  },
  // VIDEO_UPLOAD removed - use VIDEO_EMBED (YouTube/Vimeo) instead
  // BOOKING removed - deprecated feature
];

/**
 * AddLinkMenu Component
 * Modal dialog for selecting which type of content block to add
 * Features:
 * - Smooth fade and scale animations
 * - Icon grid layout (6 types in organized list)
 * - Hover effects and visual feedback
 * - Full keyboard accessibility
 * - Close on backdrop click
 * - Dark mode support
 */
export const AddLinkMenu: React.FC<AddLinkMenuProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  const handleSelectType = (type: LinkType) => {
    onSelectType(type);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={handleBackdropClick}
          role="presentation"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="add-link-title"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
              <h3
                id="add-link-title"
                className="text-gray-900 dark:text-white font-bold text-xl"
              >
                Add Content Block
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Choose what you want to add to your profile
              </p>
            </div>

            {/* Link Type Options */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {LINK_TYPE_OPTIONS.map((item) => (
                  <motion.button
                    key={item.type}
                    onClick={() => handleSelectType(item.type)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/5 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`Add ${item.label}: ${item.description}`}
                  >
                    <div
                      className="text-3xl flex-shrink-0"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.description}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer with Cancel Button */}
            <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white font-medium transition-colors"
                aria-label="Close dialog"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddLinkMenu;
