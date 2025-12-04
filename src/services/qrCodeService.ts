// QR Code Service (T129)
// API calls for QR code generation and customization

export interface QRCodeOptions {
  format?: 'png' | 'svg';
  size?: number;
  errorLevel?: 'L' | 'M' | 'Q' | 'H';
  includeLogo?: boolean;
}

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
  const { format = 'png', size = 1000 } = options;
  
  const params = new URLSearchParams({
    format,
    size: size.toString(),
  });

  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api/qr-codes/me/qr-code?${params}`, {
    method: 'GET',
    credentials: 'include',
    headers,
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
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/qr-codes/me/qr-code/regenerate', {
    method: 'POST',
    credentials: 'include',
    headers,
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
