/**
 * ImageCropper Component
 * 
 * A reusable modal dialog for cropping, zooming, and rotating images.
 * Built with react-easy-crop for a smooth, touch-friendly experience.
 * 
 * Features:
 * - Zoom slider control (1x - 3x)
 * - Rotation control (0° - 360°)
 * - Preset aspect ratios (1:1 for avatar/logo, 16:9 for banner)
 * - Real-time crop preview
 * - Cancel/Apply actions
 * 
 * @author SwazSolutions
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Loader2 } from 'lucide-react';
import { getCroppedImg, CropResult } from '../../utils/cropImage';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AspectRatioPreset = 'avatar' | 'logo' | 'banner' | 'square' | 'free';

export interface ImageCropperProps {
  /** Image source URL or base64 string */
  imageSrc: string;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Callback when crop is confirmed */
  onCropComplete: (result: CropResult) => void;
  /** Aspect ratio preset (default: 'square') */
  aspectRatio?: AspectRatioPreset;
  /** Custom aspect ratio (overrides preset) */
  customAspectRatio?: number;
  /** Dialog title */
  title?: string;
  /** Output format */
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Output quality (0-1) */
  quality?: number;
  /** Crop shape */
  cropShape?: 'rect' | 'round';
  /** Show grid overlay */
  showGrid?: boolean;
  /** Minimum zoom level */
  minZoom?: number;
  /** Maximum zoom level */
  maxZoom?: number;
}

// ============================================================================
// ASPECT RATIO PRESETS
// ============================================================================

const ASPECT_RATIOS: Record<AspectRatioPreset, number | undefined> = {
  avatar: 1,         // 1:1 square for profile photos
  logo: 1,           // 1:1 square for logos
  banner: 16 / 9,    // 16:9 wide for banners
  square: 1,         // 1:1 generic square
  free: undefined,   // Free-form cropping
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete,
  aspectRatio = 'square',
  customAspectRatio,
  title = 'Crop Image',
  outputFormat = 'image/jpeg',
  quality = 0.92,
  cropShape = 'rect',
  showGrid = true,
  minZoom = 1,
  maxZoom = 3,
}) => {
  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate aspect ratio
  const finalAspectRatio = customAspectRatio ?? ASPECT_RATIOS[aspectRatio];

  // Handle crop complete callback from Cropper
  const onCropChange = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setCroppedAreaPixels(null);
    }
  }, [isOpen]);

  // Handle apply button click
  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const result = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        outputFormat,
        quality
      );
      onCropComplete(result);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      // Optionally show error toast here
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, outputFormat, quality, onCropComplete, onClose]);

  // Handle rotation reset
  const handleResetRotation = useCallback(() => {
    setRotation(0);
  }, []);

  // Handle zoom change from slider
  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(e.target.value));
  }, []);

  // Handle rotation change from slider
  const handleRotationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRotation(Number(e.target.value));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative w-full h-64 sm:h-80 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={finalAspectRatio}
            cropShape={aspectRatio === 'avatar' ? 'round' : cropShape}
            showGrid={showGrid}
            onCropChange={setCrop}
            onCropComplete={onCropChange}
            onZoomChange={setZoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            objectFit="contain"
          />
        </div>

        {/* Controls */}
        <div className="px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
          {/* Zoom Control */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={0.1}
              value={zoom}
              onChange={handleZoomChange}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              aria-label="Zoom"
            />
            <ZoomIn className="w-5 h-5 text-gray-500 shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          {/* Rotation Control */}
          <div className="flex items-center gap-3">
            <RotateCw className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={handleRotationChange}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              aria-label="Rotation"
            />
            <button
              onClick={handleResetRotation}
              className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium min-w-[48px]"
            >
              {rotation}°
            </button>
          </div>

          {/* Aspect Ratio Info */}
          {aspectRatio !== 'free' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {aspectRatio === 'avatar' && 'Square crop optimized for profile photos'}
              {aspectRatio === 'logo' && 'Square crop optimized for logos'}
              {aspectRatio === 'banner' && 'Wide 16:9 crop optimized for banners'}
              {aspectRatio === 'square' && 'Square 1:1 crop'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={isProcessing || !croppedAreaPixels}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
