/**
 * Music Player Component
 * Background music player for digital invitations using Howler.js
 */

import { useState, useRef, useEffect } from 'react';
import { Howl } from 'howler';

interface MusicPlayerProps {
  src?: string;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  className?: string;
}

export function MusicPlayer({
  src,
  autoPlay = false,
  loop = true,
  volume = 50,
  className = ''
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const soundRef = useRef<Howl | null>(null);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setError(null);

    try {
      const sound = new Howl({
        src: [src],
        html5: true,
        autoplay: autoPlay,
        loop: loop,
        volume: currentVolume / 100,
        onplay: () => {
          setIsPlaying(true);
          setIsLoading(false);
          startProgressLoop();
        },
        onpause: () => {
          setIsPlaying(false);
          stopProgressLoop();
        },
        onend: () => {
          if (!loop) {
            setIsPlaying(false);
            stopProgressLoop();
          }
        },
        onload: () => {
          setIsLoading(false);
        },
        onloaderror: (_, err) => {
          setError('Failed to load audio');
          setIsLoading(false);
        }
      });

      soundRef.current = sound;

      return () => {
        stopProgressLoop();
        sound.unload();
      };
    } catch (err) {
      setError('Failed to initialize player');
      setIsLoading(false);
    }
  }, [src]);

  const startProgressLoop = () => {
    if (!soundRef.current) return;

    const updateProgress = () => {
      if (!soundRef.current) return;
      const seek = soundRef.current.seek() as number;
      const duration = soundRef.current.duration();
      progressRef.current = (seek / duration) * 100;
      if (isPlaying) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  };

  const stopProgressLoop = () => {
    // Progress loop stops when isPlaying is false
  };

  const togglePlay = () => {
    if (!soundRef.current) return;

    if (isPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setCurrentVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume / 100);
    }
  };

  const handleSeek = (percent: number) => {
    if (!soundRef.current) return;
    const duration = soundRef.current.duration();
    soundRef.current.seek((percent / 100) * duration);
  };

  if (!src) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}>
      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 mb-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Player Controls */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="flex-shrink-0 w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex-1">
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden cursor-pointer group">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all group-hover:bg-blue-600"
              style={{ width: `${progressRef.current}%` }}
            ></div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressRef.current}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVolumeChange(currentVolume === 0 ? 50 : 0)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {currentVolume === 0 ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={currentVolume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
            {currentVolume}%
          </span>
        </div>
      </div>
    </div>
  );
}
