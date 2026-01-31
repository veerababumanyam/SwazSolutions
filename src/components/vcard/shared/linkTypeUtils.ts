/**
 * Link Type Utilities - Shared helpers for vCard components
 * Extracted from LinksEditor.tsx
 */

import { LinkType } from '@/types/modernProfile.types';

/**
 * Get emoji icon for link type
 * Maps LinkType enum to emoji representation for visual identification
 * @param type - LinkType to get icon for
 * @returns Emoji string representing the link type
 */
export const getLinkTypeIcon = (type: LinkType): string => {
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
 * Get label for link type
 * Maps LinkType enum to user-friendly label
 * @param type - LinkType to get label for
 * @returns Human-readable label for the link type
 */
export const getLinkTypeLabel = (type: LinkType): string => {
  const labels: Record<LinkType, string> = {
    [LinkType.CLASSIC]: 'Link',
    [LinkType.HEADER]: 'Header',
    [LinkType.GALLERY]: 'Gallery',
    [LinkType.VIDEO_EMBED]: 'Video Embed',
    [LinkType.VIDEO_UPLOAD]: 'Video Upload',
    [LinkType.BOOKING]: 'Booking',
  };
  return labels[type];
};

/**
 * Get description for link type
 * Maps LinkType enum to help text description
 * @param type - LinkType to get description for
 * @returns Description of what the link type does
 */
export const getLinkTypeDescription = (type: LinkType): string => {
  const descriptions: Record<LinkType, string> = {
    [LinkType.CLASSIC]: 'Standard clickable link',
    [LinkType.HEADER]: 'Section divider',
    [LinkType.GALLERY]: 'Image showcase',
    [LinkType.VIDEO_EMBED]: 'YouTube/Vimeo embed',
    [LinkType.VIDEO_UPLOAD]: 'Upload video file',
    [LinkType.BOOKING]: 'Calendar integration',
  };
  return descriptions[type];
};
