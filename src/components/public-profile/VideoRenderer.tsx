/**
 * VideoRenderer Component
 * Public view for VIDEO_UPLOAD type
 * Features: HTML5 video player, fallback for unsupported formats, responsive design
 */

import React, { useState, useRef } from 'react';

interface VideoRendererProps {
  url: string;
  thumbnail?: string;
  title?: string;
  className?: string;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({
  url,
  thumbnail,
  title,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    setHasError(true);
    console.error('Video failed to load:', url);
  };

  if (hasError) {
    return (
      <div className={`rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-900 dark:text-white font-medium mb-1">
            Video unavailable
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This video format is not supported by your browser
          </p>
          <a
            href={url}
            download
            className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
          >
            Download Video
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
      <div className="relative group">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={url}
          poster={thumbnail}
          controls
          playsInline
          className="w-full aspect-video object-cover"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
          onError={handleError}
        >
          <source src={url} type="video/mp4" />
          <source src={url} type="video/webm" />
          <source src={url} type="video/quicktime" />
          Your browser does not support the video tag.
        </video>

        {/* Custom Play Button Overlay (shown when not playing and has thumbnail) */}
        {!isPlaying && thumbnail && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"
            aria-label="Play video"
          >
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        {/* Title Overlay (if provided) */}
        {title && !isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white font-medium">{title}</p>
          </div>
        )}
      </div>

      {/* Video Info (shown below video) */}
      {title && (
        <div className="p-3 bg-white dark:bg-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {title}
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoRenderer;
