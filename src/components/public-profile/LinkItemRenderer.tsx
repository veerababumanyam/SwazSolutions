/**
 * LinkItemRenderer Component
 * Renders different LinkType values for public profile view
 *
 * Supported types:
 * - CLASSIC: Standard clickable link
 * - HEADER: Section divider
 * - GALLERY: Image showcase
 * - VIDEO_EMBED: YouTube/Vimeo embed
 * - CONTACT_FORM: Visitor contact form
 * - MAP_LOCATION: Interactive map
 * - FILE_DOWNLOAD: Downloadable file
 * - CUSTOM_LINK: Custom styled link
 *
 * Deprecated types (kept for backward compatibility with existing data):
 * - VIDEO_UPLOAD: Uploaded video file (use VIDEO_EMBED instead)
 * - BOOKING: Calendar integration
 */

import React from 'react';
import { LinkItem, LinkType } from '@/types/modernProfile.types';
import { GalleryRenderer } from './GalleryRenderer';
import { VideoRenderer } from './VideoRenderer';

interface LinkItemRendererProps {
  link: LinkItem;
  buttonStyle?: string;
  shadowClass?: string;
  cornerRadius?: number;
  isDarkBg?: boolean;
  textColor?: string;
}

export const LinkItemRenderer: React.FC<LinkItemRendererProps> = ({
  link,
  buttonStyle = 'bg-purple-500 text-white hover:bg-purple-600',
  shadowClass = 'shadow-lg',
  cornerRadius = 12,
  isDarkBg = false,
  textColor = '#ffffff'
}) => {
  // Skip inactive links
  if (!link.isActive) {
    return null;
  }

  switch (link.type) {
    case LinkType.HEADER:
      return (
        <div className="pt-6 pb-2" key={link.id}>
          <h3
            className="text-sm font-bold uppercase tracking-wider text-center opacity-70"
            style={{ color: textColor }}
          >
            {link.title}
          </h3>
        </div>
      );

    case LinkType.GALLERY:
      return (
        <div key={link.id} className="py-2">
          <GalleryRenderer
            images={link.galleryImages || []}
            layout={link.layout}
            title={link.title}
          />
        </div>
      );

    case LinkType.VIDEO_EMBED:
      return (
        <div key={link.id} className="py-2">
          {link.url && (
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <div className="aspect-video">
                {renderVideoEmbed(link.url, link.title)}
              </div>
              {link.title && (
                <div className="p-3 bg-white dark:bg-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {link.title}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      );

    case LinkType.VIDEO_UPLOAD:
      return (
        <div key={link.id} className="py-2">
          {link.url && (
            <VideoRenderer
              url={link.url}
              thumbnail={link.thumbnail}
              title={link.title}
            />
          )}
        </div>
      );

    case LinkType.BOOKING:
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${buttonStyle} ${shadowClass}`}
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Calendar Icon for Booking */}
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isDarkBg ? 'bg-white/10' : 'bg-black/10'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0 text-left">
              <p className="font-semibold truncate">{link.title}</p>
              <p className="text-xs opacity-70 mt-0.5">Schedule a meeting</p>
            </div>
          </div>

          {/* External Link Icon */}
          <svg className="w-5 h-5 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );

    case LinkType.CLASSIC:
    default:
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(link.id)}
          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02] ${buttonStyle} ${shadowClass}`}
          style={{ borderRadius: `${cornerRadius}px` }}
        >
          {/* Platform Icon/Thumbnail */}
          {link.thumbnail && (
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
              <img
                src={link.thumbnail}
                alt={link.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold truncate">{link.title}</p>
            {link.url && (
              <p className="text-xs opacity-70 mt-0.5 truncate">
                {link.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
              </p>
            )}
          </div>

          {/* Click Count Badge (optional) */}
          {link.clicks && link.clicks > 0 && (
            <div className="flex-shrink-0 text-xs opacity-50">
              {link.clicks} clicks
            </div>
          )}
        </a>
      );
  }
};

/**
 * Renders embedded video from various platforms
 */
function renderVideoEmbed(url: string, title?: string): React.ReactNode {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
          className="w-full h-full"
        />
      );
    }
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = extractVimeoId(url);
    if (videoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title || 'Vimeo video'}
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
          className="w-full h-full"
        />
      );
    }
  }

  // TikTok (embed)
  if (url.includes('tiktok.com')) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white p-6 text-center">
        <div>
          <p className="mb-4">View on TikTok</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100"
          >
            Open TikTok
          </a>
        </div>
      </div>
    );
  }

  // Generic video fallback
  return (
    <div className="flex items-center justify-center h-full bg-gray-900 text-white p-6 text-center">
      <div>
        <p className="mb-4">Video Embed</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100"
        >
          Watch Video
        </a>
      </div>
    </div>
  );
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Track link click (async, non-blocking)
 */
function trackClick(linkId: string): void {
  // Fire and forget - don't block navigation
  fetch(`/api/profiles/links/${linkId}/click`, {
    method: 'POST',
    credentials: 'include'
  }).catch(err => {
    console.warn('Failed to track click:', err);
  });
}

export default LinkItemRenderer;
