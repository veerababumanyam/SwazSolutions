// Share Service (T141)
// Handles profile sharing across multiple channels

export interface ShareOptions {
  url: string;
  title: string;
  text?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'whatsapp' | 'fallback';
  error?: string;
}

/**
 * Check if Web Share API is supported
 */
export const isShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator;
};

/**
 * Check if Clipboard API is supported
 */
export const isClipboardSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
};

/**
 * Share using native Web Share API (mobile-first)
 */
export const shareNative = async (options: ShareOptions): Promise<ShareResult> => {
  if (!isShareSupported()) {
    return {
      success: false,
      method: 'fallback',
      error: 'Web Share API not supported'
    };
  }

  try {
    await navigator.share({
      title: options.title,
      text: options.text || '',
      url: options.url
    });

    return {
      success: true,
      method: 'native'
    };
  } catch (error) {
    // User cancelled or error occurred
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        method: 'native',
        error: 'User cancelled share'
      };
    }

    return {
      success: false,
      method: 'native',
      error: error instanceof Error ? error.message : 'Share failed'
    };
  }
};

/**
 * Copy link to clipboard
 */
export const copyToClipboard = async (text: string): Promise<ShareResult> => {
  if (!isClipboardSupported()) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      return {
        success: true,
        method: 'clipboard'
      };
    } catch (error) {
      return {
        success: false,
        method: 'fallback',
        error: 'Clipboard not supported'
      };
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return {
      success: true,
      method: 'clipboard'
    };
  } catch (error) {
    return {
      success: false,
      method: 'clipboard',
      error: error instanceof Error ? error.message : 'Failed to copy'
    };
  }
};

/**
 * Share via WhatsApp
 */
export const shareWhatsApp = (options: ShareOptions): ShareResult => {
  const text = encodeURIComponent(`${options.title}\n${options.url}`);
  const whatsappUrl = `https://wa.me/?text=${text}`;
  
  try {
    window.open(whatsappUrl, '_blank');
    return {
      success: true,
      method: 'whatsapp'
    };
  } catch (error) {
    return {
      success: false,
      method: 'whatsapp',
      error: 'Failed to open WhatsApp'
    };
  }
};

/**
 * Track share event
 */
export const trackShare = async (
  profileId: number,
  shareMethod: string,
  platform?: string
): Promise<void> => {
  try {
    await fetch('/api/profiles/share-event', {
      method: 'POST',
      credentials: 'include', // Send httpOnly cookies automatically
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileId,
        shareMethod,
        platform,
        sharedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Failed to track share event:', error);
  }
};
