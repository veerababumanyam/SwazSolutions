// QR Code Modal Component (T124-T128)
// Display QR code with customization and download options

import React, { useState, useEffect } from 'react';
import { X, Download, Settings, Smartphone, Camera } from 'lucide-react';
import { getQRCodeDataURL, regenerateQRCode, downloadQRCode, QRCodeOptions } from '../../services/qrCodeService';
import { useToast } from '../../contexts/ToastContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, username }) => {
  const { showToast } = useToast();
  
  // QR Code state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Customization state
  const [showSettings, setShowSettings] = useState(false);
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [size, setSize] = useState(1000);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M');
  const [includeLogo, setIncludeLogo] = useState(false);

  // Load QR code on mount or when options change
  useEffect(() => {
    if (isOpen) {
      loadQRCode();
    }
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [isOpen]);

  const loadQRCode = async () => {
    setLoading(true);
    try {
      const options: QRCodeOptions = { format, size };
      const url = await getQRCodeDataURL(options);
      setQrCodeUrl(url);
    } catch (error) {
      showToast((error as Error).message || 'Failed to load QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const options: QRCodeOptions = { format, size, errorLevel, includeLogo };
      const response = await regenerateQRCode(options);
      
      // Revoke old URL and set new one
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
      setQrCodeUrl(response.qrCode.dataUrl);
      showToast('QR code regenerated successfully', 'success');
    } catch (error) {
      showToast((error as Error).message || 'Failed to regenerate QR code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadFormat: 'png' | 'svg') => {
    try {
      const options: QRCodeOptions = { 
        format: downloadFormat, 
        size, 
        errorLevel, 
        includeLogo 
      };
      const filename = `${username}-qr-code.${downloadFormat}`;
      await downloadQRCode(options, filename);
      showToast(`QR code downloaded as ${downloadFormat.toUpperCase()}`, 'success');
    } catch (error) {
      showToast((error as Error).message || 'Failed to download QR code', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code Display (T125) */}
        <div className="p-6 space-y-6">
          {/* QR Code Preview */}
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              {loading ? (
                <div className="w-64 h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <img
                  src={qrCodeUrl}
                  alt="Profile QR Code"
                  className="w-64 h-64"
                />
              )}
            </div>

            {/* Download Buttons (T126) */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => handleDownload('png')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={20} />
                Download PNG
              </button>
              <button
                onClick={() => handleDownload('svg')}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={20} />
                Download SVG
              </button>
            </div>
          </div>

          {/* Scanning Instructions (T128) */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Smartphone size={20} />
              <h3 className="font-semibold">How to Scan</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <Camera size={16} className="mt-0.5 flex-shrink-0" />
                <span><strong>iOS:</strong> Open the Camera app and point it at the QR code. Tap the notification banner to open the profile.</span>
              </li>
              <li className="flex items-start gap-2">
                <Camera size={16} className="mt-0.5 flex-shrink-0" />
                <span><strong>Android:</strong> Open the Camera app or Google Lens and scan the QR code. Tap the link to view the profile.</span>
              </li>
              <li className="flex items-start gap-2">
                <Download size={16} className="mt-0.5 flex-shrink-0" />
                <span><strong>Share:</strong> Download the QR code and share it in presentations, business cards, or social media.</span>
              </li>
            </ul>
          </div>

          {/* Customization Toggle (T127) */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings size={20} />
            {showSettings ? 'Hide' : 'Show'} Customization Options
          </button>

          {/* Customization Controls (T127) */}
          {showSettings && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Size Control */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size: {size}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>100px</span>
                  <span>2000px</span>
                </div>
              </div>

              {/* Error Correction Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Error Correction Level
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="L">Low (L) - 7% recovery</option>
                  <option value="M">Medium (M) - 15% recovery (Recommended)</option>
                  <option value="Q">Quartile (Q) - 25% recovery</option>
                  <option value="H">High (H) - 30% recovery</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Higher levels allow the QR code to be scanned even if partially damaged or obscured.
                </p>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('png')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      format === 'png'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    } transition-colors`}
                  >
                    PNG (Raster)
                  </button>
                  <button
                    onClick={() => setFormat('svg')}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      format === 'svg'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    } transition-colors`}
                  >
                    SVG (Vector)
                  </button>
                </div>
              </div>

              {/* Logo Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include Avatar Logo
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add your profile avatar to the center of the QR code
                  </p>
                </div>
                <button
                  onClick={() => setIncludeLogo(!includeLogo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    includeLogo ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      includeLogo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Regenerate Button */}
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {loading ? 'Regenerating...' : 'Apply Customization'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
