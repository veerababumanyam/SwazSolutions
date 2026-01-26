/**
 * GalleryEditor Component
 * Manages images for GALLERY link type
 * Features: drag-drop upload, reorder, caption editing, delete
 */

import React, { useState, useRef } from 'react';
import { GalleryImage } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';

interface GalleryEditorProps {
  linkId: string;
  images: GalleryImage[];
  onClose: () => void;
}

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const GalleryEditor: React.FC<GalleryEditorProps> = ({
  linkId,
  images: initialImages,
  onClose
}) => {
  const { updateLink } = useProfile();

  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);

    // Check total images limit
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds 5MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload images to backend
      const uploadedImages: GalleryImage[] = [];

      for (const file of validFiles) {
        // Convert to base64
        const base64 = await fileToBase64(file);

        // Upload via API
        const response = await fetch(`/api/profiles/me/galleries/${linkId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ image: base64 })
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedImages.push({
          id: data.id,
          url: data.url,
          caption: ''
        });
      }

      // Add to state
      setImages([...images, ...uploadedImages]);

      // Update link with new images
      await updateLink(linkId, {
        galleryImages: [...images, ...uploadedImages]
      });

    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload images');
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleCaptionChange = async (imageId: string, caption: string) => {
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, caption } : img
    );
    setImages(updatedImages);

    // Update backend
    await updateLink(linkId, {
      galleryImages: updatedImages
    });
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      // Delete from backend
      const response = await fetch(`/api/profiles/me/galleries/${linkId}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Update state
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);

      await updateLink(linkId, {
        galleryImages: updatedImages
      });

    } catch (err) {
      console.error('Error deleting image:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const reordered = [...images];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);

    setImages(reordered);

    // Update backend
    await updateLink(linkId, {
      galleryImages: reordered
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    handleReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gallery Images
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {images.length} / {MAX_IMAGES} images • Drag to reorder
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
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="gallery-upload"
            />
            <label htmlFor="gallery-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Drop images here or click to upload
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB each
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Warning for max images */}
          {images.length >= MAX_IMAGES && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Maximum {MAX_IMAGES} images reached. Delete some to add more.
              </p>
            </div>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-move ${
                    draggedIndex === index
                      ? 'border-purple-500 opacity-50'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-500'
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-square">
                    <img
                      src={image.url}
                      alt={image.caption || `Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    Drag to reorder
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Caption Input */}
                  <div className="p-2 bg-gray-50 dark:bg-gray-700">
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                      placeholder="Add caption..."
                      className="w-full px-2 py-1 text-xs bg-transparent border border-transparent hover:border-gray-300 dark:hover:border-gray-600 rounded focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && !uploading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No images yet. Upload some to get started!
              </p>
            </div>
          )}

          {/* Uploading State */}
          {uploading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <svg className="animate-spin w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Uploading images...</span>
              </div>
            </div>
          )}

          {/* Done Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryEditor;
