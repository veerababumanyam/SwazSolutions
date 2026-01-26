// QR Code Service (T129)
// API calls for QR code generation and customization

export interface QRCodeOptions {
  format?: 'png' | 'svg';
  size?: number;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  includeLogo?: boolean;
  content?: 'url' | 'vcard';
  // Color customization options
  fgColor?: string; // Foreground (dots) color - hex format
  bgColor?: string; // Background color - hex format
}

export interface QRCodeStylePreset {
  id: string;
  name: string;
  fgColor: string;
  bgColor: string;
}

// Predefined style presets for QR codes
export const QR_STYLE_PRESETS: QRCodeStylePreset[] = [
  { id: 'classic', name: 'Classic', fgColor: '#000000', bgColor: '#FFFFFF' },
  { id: 'inverted', name: 'Inverted', fgColor: '#FFFFFF', bgColor: '#000000' },
  { id: 'purple', name: 'Purple', fgColor: '#8B5CF6', bgColor: '#FFFFFF' },
  { id: 'blue', name: 'Blue', fgColor: '#3B82F6', bgColor: '#FFFFFF' },
  { id: 'green', name: 'Green', fgColor: '#10B981', bgColor: '#FFFFFF' },
  { id: 'pink', name: 'Pink', fgColor: '#EC4899', bgColor: '#FFFFFF' },
  { id: 'orange', name: 'Orange', fgColor: '#F97316', bgColor: '#FFFFFF' },
  { id: 'dark-purple', name: 'Dark Purple', fgColor: '#A855F7', bgColor: '#1F2937' },
  { id: 'dark-blue', name: 'Dark Blue', fgColor: '#60A5FA', bgColor: '#1E3A5F' },
  { id: 'elegant', name: 'Elegant', fgColor: '#374151', bgColor: '#F9FAFB' },
];

export interface QRCodeResponse {
  message: string;
  qrCode: {
    format: string;
    size: number;
    errorLevel: string;
    cacheKey: string;
    dataUrl: string;
  };
}

/**
 * Get QR code for current user's profile
 * Returns the QR code image as a Blob
 */
export const getQRCode = async (
  options: QRCodeOptions = {}
): Promise<Blob> => {
  const {
    format = 'png',
    size = 1000,
    content = 'url',
    fgColor = '#000000',
    bgColor = '#FFFFFF',
  } = options;

  const params = new URLSearchParams({
    format,
    size: size.toString(),
    content,
    fgColor,
    bgColor,
  });

  const response = await fetch(`/api/qr-codes/me/qr-code?${params}`, {
    method: 'GET',
    credentials: 'include', // Send httpOnly cookies automatically
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get QR code');
  }

  return response.blob();
};

/**
 * Get QR code as data URL for preview
 */
export const getQRCodeDataURL = async (
  options: QRCodeOptions = {}
): Promise<string> => {
  const blob = await getQRCode(options);
  return URL.createObjectURL(blob);
};

/**
 * Regenerate QR code with custom options
 * Returns metadata and data URL
 */
export const regenerateQRCode = async (
  options: QRCodeOptions
): Promise<QRCodeResponse> => {
  const response = await fetch('/api/qr-codes/me/qr-code/regenerate', {
    method: 'POST',
    credentials: 'include', // Send httpOnly cookies automatically
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to regenerate QR code');
  }

  return response.json();
};

/**
 * Download QR code as file
 */
export const downloadQRCode = async (
  options: QRCodeOptions = {},
  filename?: string
): Promise<void> => {
  const { format = 'png' } = options;
  const blob = await getQRCode(options);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `qr-code.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
