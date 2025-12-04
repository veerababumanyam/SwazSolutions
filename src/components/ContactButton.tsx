// ContactButton Component (T074-T076)
// vCard download button for public profiles - mobile-friendly

import React, { useState } from 'react';
import { Theme } from '../types/theme.types';

interface ContactButtonProps {
  username: string;
  displayName: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  theme?: Theme;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  username,
  displayName,
  className = '',
  variant = 'primary',
  theme,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      setError(null);

      const response = await fetch(`/api/public/profile/${username}/vcard`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download vCard');
      }

      // Get the blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}.vcf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Show success feedback
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50); // Haptic feedback on mobile
      }
    } catch (err) {
      console.error('vCard download failed:', err);
      setError('Failed to download contact card. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const baseClasses = 'flex items-center justify-center space-x-2 rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  // T076: Mobile-friendly touch target (minimum 44x44px)
  const sizeClasses = 'px-6 py-3 min-h-[44px] text-base';

  const variantClasses = !theme ? (variant === 'primary'
    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white') : '';

  const buttonStyle: React.CSSProperties = theme ? {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    borderRadius: theme.layout.borderRadius.md,
    boxShadow: theme.layout.shadows.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeights.medium,
  } : {};

  return (
    <div className={className}>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`${baseClasses} ${sizeClasses} ${variantClasses}`}
        style={buttonStyle}
        aria-label={`Save ${displayName}'s contact information`}
      >
        {downloading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>Save as Contact</span>
          </>
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
          {error}
        </div>
      )}

      {/* iOS/Android instructions */}
      <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        Tap to add to your phone's contacts
      </p>
    </div>
  );
};

export default ContactButton;
