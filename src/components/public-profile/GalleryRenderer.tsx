/**
 * GalleryRenderer Component
 * Public view for GALLERY link type
 * Supports 3 layouts: grid, carousel, list
 * Features: lightbox for image viewing, caption display
 */

import React, { useState } from 'react';
import { GalleryImage } from '@/types/modernProfile.types';

interface GalleryRendererProps {
  images: GalleryImage[];
  layout?: 'grid' | 'carousel' | 'list';
  title?: string;
}

export const GalleryRenderer: React.FC<GalleryRendererProps> = ({
  images,
  layout = 'carousel',
  title
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + images.length) % images.length);
  };

  // Grid Layout
  if (layout === 'grid') {
    return (
      <div className="space-y-3">
        {title && (
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        )}
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={image.url}
                alt={image.caption || `Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs line-clamp-2">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Carousel Layout
  if (layout === 'carousel') {
    return (
      <div className="space-y-3">
        {title && (
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        )}
        <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Main Image */}
          <button
            onClick={() => openLightbox(currentSlide)}
            className="relative w-full aspect-[4/3] cursor-pointer"
          >
            <img
              src={images[currentSlide].url}
              alt={images[currentSlide].caption || `Slide ${currentSlide + 1}`}
              className="w-full h-full object-cover"
            />
            {images[currentSlide].caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm">{images[currentSlide].caption}</p>
              </div>
            )}
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Previous image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-full p-2 shadow-lg transition-all"
                aria-label="Next image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Slide Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List Layout
  return (
    <div className="space-y-3">
      {title && (
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      )}
      <div className="space-y-2">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className="group relative w-full rounded-lg overflow-hidden cursor-pointer"
          >
            <img
              src={image.url}
              alt={image.caption || `Gallery image ${index + 1}`}
              className="w-full h-auto object-cover transition-transform group-hover:scale-105"
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-10"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-10"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || `Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {/* Caption */}
            {images[lightboxIndex].caption && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 max-w-full">
                <p className="text-white text-center">{images[lightboxIndex].caption}</p>
              </div>
            )}

            {/* Image Counter */}
            <div className="mt-2 text-white/70 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryRenderer;
