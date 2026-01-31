/**
 * LinkItemEditor Component
 * Universal router for all link block types with specialized editors
 * Routes to appropriate block-specific editors based on LinkType
 *
 * Block Types:
 * - CLASSIC: Standard URL link
 * - HEADER: Section header for grouping
 * - GALLERY: Image gallery
 * - VIDEO_EMBED: Embedded video from external source
 * - CONTACT_FORM: Visitor contact form
 * - MAP_LOCATION: Interactive map
 * - FILE_DOWNLOAD: File download link
 * - CUSTOM_LINK: Custom icon/logo with link
 */

import React, { useState, useEffect } from 'react';
import { LinkItem, LinkType, LinkMetadata, ContactFormConfig, MapLocationConfig, FileDownloadConfig, CustomLinkConfig } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';

// Import all block-specific editors
import { ClassicLinkEditor } from './ClassicLinkEditor';
import { HeaderEditor } from './HeaderEditor';
import { VideoEmbedEditor } from './VideoEmbedEditor';
import { ContactFormEditor } from './ContactFormEditor';
import { MapLocationEditor } from './MapLocationEditor';
import { FileDownloadEditor } from './FileDownloadEditor';
import { CustomLinkEditor } from './CustomLinkEditor';
import { GalleryEditor } from './GalleryEditor';
// VideoUploadEditor removed - VIDEO_UPLOAD type deprecated in favor of VIDEO_EMBED

interface LinkItemEditorProps {
  linkId?: string; // If provided, editing existing link; otherwise creating new
  initialType?: LinkType;
  onClose: () => void;
  onSave?: () => void;
}

type EditorViewType = 'type-select' | 'editor-routed';

export const LinkItemEditor: React.FC<LinkItemEditorProps> = ({
  linkId,
  initialType = LinkType.CLASSIC,
  onClose,
  onSave
}) => {
  const { links, addLink, updateLink } = useProfile();

  const existingLink = linkId ? links.find(l => l.id === linkId) : null;

  const [type, setType] = useState<LinkType>(existingLink?.type || initialType);
  const [viewMode, setViewMode] = useState<EditorViewType>(
    existingLink ? 'editor-routed' : 'type-select'
  );

  const isEditing = !!existingLink;

  /**
   * Router to render the appropriate editor based on LinkType
   * Each editor is responsible for its own state management and validation
   */
  const renderBlockEditor = (): React.ReactNode => {
    if (!linkId && !isEditing) {
      // For new links, create the link first
      if (!isEditing) {
        onClose();
        return null;
      }
    }

    const props = {
      linkId: linkId || '',
      title: existingLink?.title,
      url: existingLink?.url,
      onClose
    };

    switch (type) {
      case LinkType.CLASSIC:
        return <ClassicLinkEditor {...props} />;

      case LinkType.HEADER:
        return <HeaderEditor linkId={linkId || ''} title={props.title} onClose={onClose} />;

      case LinkType.GALLERY:
        return (
          <GalleryEditor
            linkId={linkId || ''}
            images={existingLink?.galleryImages || []}
            onClose={onClose}
          />
        );

      case LinkType.VIDEO_EMBED:
        return <VideoEmbedEditor {...props} />;

      // VIDEO_UPLOAD case removed - deprecated in favor of VIDEO_EMBED (YouTube/Vimeo only)
      // Existing VIDEO_UPLOAD blocks in database will fall through to default (ClassicLinkEditor)

      case LinkType.CONTACT_FORM:
        return (
          <ContactFormEditor
            linkId={linkId || ''}
            title={props.title}
            onClose={onClose}
          />
        );

      case LinkType.MAP_LOCATION:
        return (
          <MapLocationEditor
            linkId={linkId || ''}
            title={props.title}
            onClose={onClose}
          />
        );

      case LinkType.FILE_DOWNLOAD:
        return (
          <FileDownloadEditor
            linkId={linkId || ''}
            onClose={onClose}
          />
        );

      case LinkType.CUSTOM_LINK:
        return (
          <CustomLinkEditor
            linkId={linkId || ''}
            config={existingLink?.metadata?.type === 'custom_link' ? existingLink.metadata.config : undefined}
            onClose={onClose}
          />
        );

      case LinkType.BOOKING:
        // Booking kept for backward compatibility but hidden from UI
        return <ClassicLinkEditor {...props} />;

      default:
        return <ClassicLinkEditor {...props} />;
    }
  };

  const getLinkTypeLabel = (linkType: LinkType): string => {
    const labels: Record<LinkType, string> = {
      [LinkType.CLASSIC]: 'Classic Link',
      [LinkType.GALLERY]: 'Image Gallery',
      [LinkType.VIDEO_EMBED]: 'YouTube / Vimeo',
      [LinkType.HEADER]: 'Section Header',
      [LinkType.BOOKING]: 'Booking Link',
      [LinkType.CONTACT_FORM]: 'Contact Form',
      [LinkType.MAP_LOCATION]: 'Map & Location',
      [LinkType.FILE_DOWNLOAD]: 'File Download',
      [LinkType.CUSTOM_LINK]: 'Custom Link',
      [LinkType.VIDEO_UPLOAD]: 'Video Upload' // Deprecated - kept for backward compatibility
    };
    return labels[linkType];
  };

  const getLinkTypeDescription = (linkType: LinkType): string => {
    const descriptions: Record<LinkType, string> = {
      [LinkType.CLASSIC]: 'A standard clickable link button',
      [LinkType.GALLERY]: 'Showcase multiple images in a gallery',
      [LinkType.VIDEO_EMBED]: 'Embed videos from YouTube or Vimeo',
      [LinkType.HEADER]: 'Organize links with section headings',
      [LinkType.BOOKING]: 'Link to booking/scheduling service',
      [LinkType.CONTACT_FORM]: 'Embeddable contact form for visitor inquiries',
      [LinkType.MAP_LOCATION]: 'Show your location on an interactive map',
      [LinkType.FILE_DOWNLOAD]: 'Let visitors download a file',
      [LinkType.CUSTOM_LINK]: 'Link with custom icon and styling',
      [LinkType.VIDEO_UPLOAD]: 'Upload video file' // Deprecated - kept for backward compatibility
    };
    return descriptions[linkType];
  };

  // If we have an existing link, route directly to the editor
  if (isEditing && linkId) {
    return renderBlockEditor();
  }

  // For new links, show the type selector first
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Add New Link Block
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Choose a block type to get started
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

        {/* Block Type Selector Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(LinkType)
              .filter(t => t !== LinkType.BOOKING && t !== LinkType.VIDEO_UPLOAD) // Hide deprecated types
              .map(linkType => (
                <button
                  key={linkType}
                  onClick={async () => {
                    try {
                      // Create new link of this type
                      await addLink(linkType);

                      // Get the newly created link (first in array)
                      const newLink = links[0];

                      if (newLink) {
                        // Route to the editor for this type
                        setType(linkType);
                        setViewMode('editor-routed');
                      }
                    } catch (err) {
                      console.error('Error creating link:', err);
                    }
                  }}
                  className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all text-left hover:shadow-md dark:hover:bg-gray-700/50"
                >
                  <div className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    {getLinkTypeLabel(linkType)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {getLinkTypeDescription(linkType)}
                  </div>
                </button>
              ))}
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <span className="font-semibold">Tip:</span> Each block type has its own specialized editor with tailored options for that content type. After selecting a type, you'll be guided through configuration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkItemEditor;
