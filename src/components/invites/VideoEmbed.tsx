/**
 * Video Embed Component
 * Responsive video embedding for YouTube, Vimeo, Instagram, and uploaded videos
 */

import { useState, useRef } from 'react';

interface VideoEmbedProps {
  type: 'youtube' | 'vimeo' | 'instagram' | 'upload';
  url: string;
  thumbnail?: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export function VideoEmbed({
  type,
  url,
  thumbnail,
  title = 'Video',
  autoPlay = false,
  className = ''
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(autoPlay);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract video ID from URL
  const getVideoId = () => {
    switch (type) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return youtubeMatch ? youtubeMatch[1] : null;

      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        return vimeoMatch ? vimeoMatch[1] : null;

      case 'instagram':
        const instaMatch = url.match(/instagram\.com\/p\/([^\/]+)/);
        return instaMatch ? instaMatch[1] : null;

      case 'upload':
        return url;

      default:
        return null;
    }
  };

  const videoId = getVideoId();

  const getEmbedUrl = () => {
    if (!videoId) return '';

    switch (type) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0`;

      case 'vimeo':
        return `https://player.vimeo.com/video/${videoId}?autoplay=${autoPlay ? 1 : 0}`;

      case 'instagram':
        return `https://www.instagram.com/p/${videoId}/embed`;

      case 'upload':
        return videoId;

      default:
        return '';
    }
  };

  const embedUrl = getEmbedUrl();

  const handlePlay = () => {
    setIsLoaded(true);
    setIsPlaying(true);
  };

  if (!videoId) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">Invalid video URL</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}
    >
      {/* Video iframe */}
      {isLoaded ? (
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allowFullScreen
        />
      ) : (
        /* Thumbnail with play button */
        <div
          className="absolute inset-0 bg-cover bg-center cursor-pointer group"
          style={{
            backgroundImage: thumbnail
              ? `url(${thumbnail})`
              : type === 'youtube'
              ? `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`
              : undefined,
            backgroundColor: !thumbnail && type !== 'youtube' ? '#1a1a1a' : undefined
          }}
          onClick={handlePlay}
        >
          {!thumbnail && type !== 'youtube' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all transform group-hover:scale-110 shadow-lg">
              <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to detect video type from URL
export function detectVideoType(url: string): 'youtube' | 'vimeo' | 'instagram' | 'upload' | null {
  if (!url) return null;

  if (url.match(/(youtube\.com|youtu\.be)/)) return 'youtube';
  if (url.match(/vimeo\.com/)) return 'vimeo';
  if (url.match(/instagram\.com/)) return 'instagram';

  // Check if it's a direct video URL (mp4, webm, etc.)
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) return 'upload';

  return null;
}

interface VideoEmbedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function VideoEmbedInput({ value, onChange, placeholder = 'Enter video URL...', className = '' }: VideoEmbedInputProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoType, setVideoType] = useState<'youtube' | 'vimeo' | 'instagram' | 'upload' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const type = detectVideoType(newValue);
    setVideoType(type);

    // Set thumbnail preview
    if (type === 'youtube') {
      const match = newValue.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (match) {
        setPreviewUrl(`https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`);
      }
    } else {
      setPreviewUrl('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {videoType && (
          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm capitalize">
            {videoType}
          </span>
        )}
      </div>

      {/* Supported platforms hint */}
      {!value && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Supported: YouTube, Vimeo, Instagram, or direct video URLs (mp4, webm)
        </p>
      )}

      {/* Thumbnail preview */}
      {previewUrl && (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={previewUrl}
            alt="Video thumbnail"
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
