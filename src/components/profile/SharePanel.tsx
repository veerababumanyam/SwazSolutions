// SharePanel Component (T134)
// Multi-channel sharing interface with Copy Link, WhatsApp, and System Share

import React, { useState } from 'react';
import { useShareTracking } from '../../hooks/useShareTracking';
import { 
  shareNative, 
  copyToClipboard, 
  shareWhatsApp,
  isShareSupported,
  isClipboardSupported
} from '../../services/shareService';
import { useToast } from '../../contexts/ToastContext';

interface SharePanelProps {
  profileId: number;
  profileUrl: string;
  title: string;
  username: string;
  className?: string;
}

export const SharePanel: React.FC<SharePanelProps> = ({
  profileId,
  profileUrl,
  title,
  username,
  className = ''
}) => {
  const { trackShareEvent } = useShareTracking(profileId);
  const { showToast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const shareOptions = {
    title,
    url: profileUrl,
    text: `Check out ${username}'s profile!`
  };

  // T135: Copy Link Button
  const handleCopyLink = async () => {
    setIsSharing(true);
    try {
      const result = await copyToClipboard(profileUrl);
      
      if (result.success) {
        showToast('Link copied to clipboard!', 'success');
        await trackShareEvent('clipboard', 'copy-link');
      } else {
        throw new Error(result.error || 'Failed to copy');
      }
    } catch (error) {
      console.error('Copy link error:', error);
      showToast('Failed to copy link. Please try again.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // T137: Share on WhatsApp Button
  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    try {
      const result = shareWhatsApp(shareOptions);
      
      if (result.success) {
        showToast('Opening WhatsApp...', 'success');
        await trackShareEvent('whatsapp', 'mobile');
      } else {
        throw new Error(result.error || 'Failed to share');
      }
    } catch (error) {
      console.error('WhatsApp share error:', error);
      showToast('Failed to open WhatsApp. Please try again.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  // T138: System Share Button (iOS/Android)
  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const result = await shareNative(shareOptions);
      
      if (result.success) {
        await trackShareEvent('native', result.method || 'system');
        // Don't show toast for native share - system handles feedback
      } else if (result.error === 'AbortError') {
        // User cancelled - no error message needed
        console.log('User cancelled share');
      } else {
        throw new Error(result.error || 'Share failed');
      }
    } catch (error: any) {
      // Only show error if not user cancellation
      if (error.name !== 'AbortError') {
        console.error('Native share error:', error);
        showToast('Failed to share. Please try another method.', 'error');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // T139: Fallback Messaging
  const showFallbackMessage = !isClipboardSupported();
  const showNativeShareButton = isShareSupported();

  return (
    <div className={`share-panel bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Share Profile
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share {username}'s profile with others
        </p>
      </div>

      {/* Share URL Display */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profile URL</p>
        <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
          {profileUrl}
        </p>
      </div>

      {/* T139: Fallback Warning */}
      {showFallbackMessage && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ Copy/paste may require manual selection on older browsers
          </p>
        </div>
      )}

      {/* Share Buttons */}
      <div className="space-y-3">
        {/* T135: Copy Link Button */}
        <button
          onClick={handleCopyLink}
          disabled={isSharing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
          aria-label="Copy profile link to clipboard"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
            />
          </svg>
          <span>Copy Link</span>
        </button>

        {/* T137: WhatsApp Button */}
        <button
          onClick={handleWhatsAppShare}
          disabled={isSharing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
          aria-label="Share profile on WhatsApp"
        >
          <svg 
            className="w-5 h-5" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span>Share on WhatsApp</span>
        </button>

        {/* T138: System Share Button (iOS/Android) */}
        {showNativeShareButton && (
          <button
            onClick={handleNativeShare}
            disabled={isSharing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
            aria-label="Share profile using system share"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
              />
            </svg>
            <span>More Share Options</span>
          </button>
        )}
      </div>

      {/* Share Stats (Optional - can expand later) */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Share this profile to help others discover {username}
        </p>
      </div>
    </div>
  );
};
