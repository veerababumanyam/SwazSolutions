/**
 * Gallery Manager Component
 * Upload and manage photo gallery for invitations
 */

import { useState, useRef, useCallback } from 'react';
import { galleryApi } from '../../services/inviteApi';

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  isCover: boolean;
  order: number;
}

interface GalleryManagerProps {
  inviteId: string;
  photos: GalleryPhoto[];
  onUpdate: (photos: GalleryPhoto[]) => void;
  className?: string;
}

export function GalleryManager({ inviteId, photos, onUpdate, className = '' }: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/')
    );

    if (files.length > 0) {
      await uploadPhotos(files);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadPhotos(files);
    }
  };

  const uploadPhotos = async (files: File[]) => {
    setUploading(true);
    try {
      const uploadPromises = files.map(file =>
        galleryApi.uploadPhoto(inviteId, file)
      );

      const results = await Promise.all(uploadPromises);
      const newPhotos = results
        .filter(r => r.success)
        .map(r => r.data);

      onUpdate([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await galleryApi.deletePhoto(inviteId, photoId);
      onUpdate(photos.filter(p => p.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSetCover = async (photoId: string) => {
    try {
      await galleryApi.updatePhoto(inviteId, photoId, { isCover: true });
      onUpdate(photos.map(p => ({ ...p, isCover: p.id === photoId })));
    } catch (err) {
      console.error('Set cover error:', err);
    }
  };

  const handleCaptionUpdate = async (photoId: string, caption: string) => {
    try {
      await galleryApi.updatePhoto(inviteId, photoId, { caption });
      onUpdate(photos.map(p => p.id === photoId ? { ...p, caption } : p));
      setEditingCaption(false);
    } catch (err) {
      console.error('Update caption error:', err);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Photo Gallery ({sortedPhotos.length})
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {uploading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Photos
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        }`}
      >
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop photos here, or <span className="text-blue-500 hover:underline cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 10MB each</p>
      </div>

      {/* Photo grid */}
      {sortedPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption || `Photo ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />

              {/* Cover badge */}
              {photo.isCover && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                  Cover
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetCover(photo.id);
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                  title="Set as cover"
                >
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo.id);
                  }}
                  className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
                  title="Delete photo"
                >
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected photo modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Selected photo'}
              className="w-full h-auto"
            />

            <div className="p-4">
              {editingCaption ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={selectedPhoto.caption}
                    placeholder="Add a caption..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleCaptionUpdate(selectedPhoto.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleCaptionUpdate(selectedPhoto.id, (document.querySelector('input[placeholder="Add a caption..."]') as HTMLInputElement)?.value || '')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCaption(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 dark:text-gray-300 flex-1">
                    {selectedPhoto.caption || <span className="italic text-gray-400">No caption</span>}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCaption(true)}
                      className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {!selectedPhoto.isCover && (
                      <button
                        onClick={() => handleSetCover(selectedPhoto.id)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                      >
                        Set as Cover
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(selectedPhoto.id)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
