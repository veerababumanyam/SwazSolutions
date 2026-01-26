/**
 * VideoUploadEditor Component
 * File upload for VIDEO_UPLOAD link type
 * Features: progress indicator, preview thumbnail, file validation
 */

import React, { useState, useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface VideoUploadEditorProps {
  linkId: string;
  currentVideoUrl?: string;
  onClose: () => void;
  onUploadComplete?: (url: string, thumbnail?: string) => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const SUPPORTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

export const VideoUploadEditor: React.FC<VideoUploadEditorProps> = ({
  linkId,
  currentVideoUrl,
  onClose,
  onUploadComplete
}) => {
  const { updateLink } = useProfile();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setError(null);

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
      setError('Unsupported video format. Please use MP4, MOV, AVI, or WebM.');
      return;
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 100MB limit. Your file is ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB.`);
      return;
    }

    setFile(selectedFile);

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const captureVideoThumbnail = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('Video element not found'));
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to capture thumbnail'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    });
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Convert file to base64
      const base64 = await fileToBase64(file);

      // Capture thumbnail from video preview
      let thumbnail: string | undefined;
      try {
        if (videoRef.current && previewUrl) {
          thumbnail = await captureVideoThumbnail();
        }
      } catch (err) {
        console.warn('Failed to capture thumbnail:', err);
        // Continue without thumbnail
      }

      // Simulate upload progress (replace with actual upload logic)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload via API
      const response = await fetch(`/api/profiles/me/videos/${linkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          video: base64,
          thumbnail,
          filename: file.name,
          mimeType: file.type,
          size: file.size
        })
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Update link with video URL
      await updateLink(linkId, {
        url: data.url,
        thumbnail: data.thumbnail || thumbnail
      });

      onUploadComplete?.(data.url, data.thumbnail);
      onClose();

    } catch (err) {
      console.error('Error uploading video:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload video');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload Video
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              MP4, MOV, AVI, WebM • Max 100MB
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Video (if exists) */}
          {currentVideoUrl && !file && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Video
              </label>
              <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                <video
                  src={currentVideoUrl}
                  controls
                  className="w-full"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            </div>
          )}

          {/* File Upload Zone */}
          {!file && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
                id="video-file-input"
              />
              <label
                htmlFor="video-file-input"
                className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Click to select video file
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      MP4, MOV, AVI, WebM up to 100MB
                    </p>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Selected File Preview */}
          {file && previewUrl && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected Video
                </label>
                {!uploading && (
                  <button
                    onClick={handleRemove}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Video Preview */}
              <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900">
                <video
                  ref={videoRef}
                  src={previewUrl}
                  controls
                  className="w-full"
                  style={{ maxHeight: '300px' }}
                  onLoadedMetadata={() => {
                    // Seek to 1 second for thumbnail preview
                    if (videoRef.current) {
                      videoRef.current.currentTime = 1;
                    }
                  }}
                />
              </div>

              {/* File Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
                      {file.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Format:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {file.type.split('/')[1].toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="flex-1 px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Video'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadEditor;
