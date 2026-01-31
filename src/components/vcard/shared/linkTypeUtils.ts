/**
 * Link Type Utilities - Shared helpers for vCard components
 * Extracted from LinksEditor.tsx
 *
 * @remarks
 * VIDEO_UPLOAD type has been deprecated in favor of VIDEO_EMBED (YouTube/Vimeo only).
 * The type is kept in the enum for backward compatibility with existing data.
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
    [LinkType.CONTACT_FORM]: '📋',
    [LinkType.MAP_LOCATION]: '📍',
    [LinkType.FILE_DOWNLOAD]: '📥',
    [LinkType.CUSTOM_LINK]: '⭐',
    // Deprecated types - kept for backward compatibility
    [LinkType.VIDEO_UPLOAD]: '📹',
    [LinkType.BOOKING]: '📅',
  };
  return icons[type] || '🔗';
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
    [LinkType.VIDEO_EMBED]: 'YouTube / Vimeo',
    [LinkType.CONTACT_FORM]: 'Contact Form',
    [LinkType.MAP_LOCATION]: 'Map',
    [LinkType.FILE_DOWNLOAD]: 'File Download',
    [LinkType.CUSTOM_LINK]: 'Custom Link',
    // Deprecated types - kept for backward compatibility
    [LinkType.VIDEO_UPLOAD]: 'Video Upload',
    [LinkType.BOOKING]: 'Booking',
  };
  return labels[type] || 'Link';
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
    [LinkType.CONTACT_FORM]: 'Visitor contact form',
    [LinkType.MAP_LOCATION]: 'Interactive map',
    [LinkType.FILE_DOWNLOAD]: 'Downloadable file',
    [LinkType.CUSTOM_LINK]: 'Custom styled link',
    // Deprecated types - kept for backward compatibility
    [LinkType.VIDEO_UPLOAD]: 'Uploaded video file',
    [LinkType.BOOKING]: 'Calendar integration',
  };
  return descriptions[type] || 'Link';
};

/**
 * Link types available for creating new blocks in the UI.
 * Excludes deprecated VIDEO_UPLOAD and BOOKING types.
 */
export const AVAILABLE_LINK_TYPES: LinkType[] = [
  LinkType.CLASSIC,
  LinkType.HEADER,
  LinkType.GALLERY,
  LinkType.VIDEO_EMBED,
  LinkType.CONTACT_FORM,
  LinkType.MAP_LOCATION,
  LinkType.FILE_DOWNLOAD,
  LinkType.CUSTOM_LINK,
];
