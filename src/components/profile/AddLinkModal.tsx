// AddLinkModal Component
// Modal for adding new links with URL detection, grouped platforms, and custom logo upload

import React, { useState, useEffect, useRef } from 'react';
import { 
  KNOWN_PLATFORMS, 
  PLATFORM_CATEGORIES, 
  getPlatformsByCategory, 
  detectPlatformFromUrl,
  DEFAULT_LOGO,
  type Platform,
  type PlatformCategory 
} from '../../constants/platforms';
import { ImageCropper } from '../common/ImageCropper';
import { CropResult } from '../../utils/cropImage';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, label: string, isFeatured: boolean, customLogo?: string) => void;
  existingLinksCount: number;
  featuredCount: number;
}

type ViewMode = 'form' | 'platforms' | 'upload';

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingLinksCount,
  featuredCount,
}) => {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [isFeatured, setIsFeatured] = useState(true);
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [customLogoPreview, setCustomLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo cropper state
  const [logoCropperOpen, setLogoCropperOpen] = useState(false);
  const [logoCropperImage, setLogoCropperImage] = useState<string>('');

  const platformsByCategory = getPlatformsByCategory();

  useEffect(() => {
    if (url.trim()) {
      const detected = detectPlatformFromUrl(url);
      setDetectedPlatform(detected);
      // Clear custom logo if a platform is detected
      if (detected && !customLogo) {
        setCustomLogoPreview(null);
      }
    } else {
      setDetectedPlatform(null);
    }
  }, [url, customLogo]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max - higher to allow cropping)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be less than 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format. Use JPG, PNG, GIF, WebP, or SVG');
      return;
    }

    setError('');

    // Read file and open cropper
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setLogoCropperImage(base64);
      setLogoCropperOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  };

  // Handle cropped logo upload
  const handleLogoCropComplete = async (result: CropResult) => {
    setUploadingLogo(true);
    setCustomLogoPreview(result.base64);

    try {
      const response = await fetch('/api/uploads/social-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: result.base64 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await response.json();
      setCustomLogo(data.url);
      setViewMode('form');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
      setCustomLogoPreview(null);
    } finally {
      setUploadingLogo(false);
      setLogoCropperOpen(false);
      setLogoCropperImage('');
    }
  };

  const handlePlatformSelect = (platform: Platform) => {
    setUrl(`https://${platform.pattern}/`);
    setLabel(platform.name);
    setViewMode('form');
    setSelectedCategory(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!url.startsWith('https://')) {
      setError('URL must start with https://');
      return;
    }

    if (isFeatured && featuredCount >= 5) {
      setError('Maximum 5 featured links allowed. Disable "Show on profile" or remove an existing featured link.');
      return;
    }

    // Use custom logo, detected platform logo, or default
    const logoToUse = customLogo || detectedPlatform?.logo || DEFAULT_LOGO;
    onAdd(url, label, isFeatured, logoToUse);
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setUrl('');
    setLabel('');
    setIsFeatured(true);
    setDetectedPlatform(null);
    setCustomLogo(null);
    setCustomLogoPreview(null);
    setViewMode('form');
    setSelectedCategory(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Get current logo to display
  const displayLogo = customLogoPreview || customLogo || detectedPlatform?.logo || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            {viewMode !== 'form' && (
              <button
                onClick={() => {
                  setViewMode('form');
                  setSelectedCategory(null);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {viewMode === 'form' && 'Add New Link'}
              {viewMode === 'platforms' && (selectedCategory ? PLATFORM_CATEGORIES[selectedCategory].label : 'Choose Platform')}
              {viewMode === 'upload' && 'Upload Custom Logo'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {/* Form View */}
          {viewMode === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/your-link"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-24"
                    autoFocus
                  />
                  {displayLogo && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <img src={displayLogo} alt="" className="w-5 h-5 object-contain" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        {detectedPlatform?.name || 'Custom'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Display Label Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Label
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={detectedPlatform?.name || "My awesome link"}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Custom Logo Option */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('upload')}
                  className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-600 dark:text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {customLogo ? 'Change Logo' : 'Upload Custom Logo'}
                </button>
                {customLogo && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomLogo(null);
                      setCustomLogoPreview(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Show on profile
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {featuredCount}/5 featured links used
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  disabled={!isFeatured && featuredCount >= 5}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isFeatured 
                      ? 'bg-purple-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  } ${!isFeatured && featuredCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Browse Platforms Button */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                <button
                  type="button"
                  onClick={() => setViewMode('platforms')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Browse All Platforms ({KNOWN_PLATFORMS.length}+)
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
                >
                  Add Link
                </button>
              </div>
            </form>
          )}

          {/* Platform Browser View */}
          {viewMode === 'platforms' && !selectedCategory && (
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Choose a category to find your platform
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(PLATFORM_CATEGORIES) as [PlatformCategory, { label: string; icon: string }][]).map(([key, { label, icon }]) => {
                  const count = platformsByCategory[key]?.length || 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                    >
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{count} platforms</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Platform List in Category */}
          {viewMode === 'platforms' && selectedCategory && (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {platformsByCategory[selectedCategory]?.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handlePlatformSelect(platform)}
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-left"
                  >
                    <img 
                      src={platform.logo} 
                      alt="" 
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_LOGO;
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {platform.name}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-full mt-4 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ← Back to categories
              </button>
            </div>
          )}

          {/* Upload Custom Logo View */}
          {viewMode === 'upload' && (
            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {uploadingLogo ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">Uploading & optimizing...</p>
                  </div>
                ) : customLogoPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={customLogoPreview} alt="Preview" className="w-20 h-20 object-contain mb-3 rounded-lg" />
                    <p className="text-green-600 dark:text-green-400 font-medium">Logo uploaded!</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Click to upload logo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, PNG, GIF, WebP, or SVG (max 2MB)</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">You can crop and adjust after selecting</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('form');
                    if (!customLogo) {
                      setCustomLogoPreview(null);
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {customLogo ? 'Done' : 'Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logo Cropper Modal */}
      <ImageCropper
        imageSrc={logoCropperImage}
        isOpen={logoCropperOpen}
        onClose={() => {
          setLogoCropperOpen(false);
          setLogoCropperImage('');
        }}
        onCropComplete={handleLogoCropComplete}
        aspectRatio="logo"
        title="Crop Logo"
        cropShape="rect"
      />
    </div>
  );
};

export default AddLinkModal;
