/**
 * QR Scanner Component
 * QR code scanner for guest check-in at events
 */

import { useState, useRef, useEffect } from 'react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
}

export function QRScanner({ onScan, onError, enabled = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const animationRef = useRef<number | undefined>();

  useEffect(() => {
    if (enabled) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => stopScanner();
  }, [enabled]);

  const startScanner = async () => {
    try {
      // Check camera permission
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionStatus(result.state);

      result.onchange = () => {
        setPermissionStatus(result.state);
      };

      if (result.state === 'denied') {
        setCameraError('Camera permission denied. Please enable camera access.');
        onError?.('Camera permission denied');
        return;
      }

      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        setCameraError(null);
        scanFrame();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(err.message || 'Failed to access camera');
      onError?.(err.message);
    }
  };

  const stopScanner = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Here you would integrate a QR code detection library
    // For now, this is a placeholder that simulates QR detection
    // In a real implementation, you'd use a library like:
    // - jsQR (lightweight, pure JS)
    // - react-qr-reader (React wrapper)

    // For this implementation, we'll rely on the parent component
    // to handle manual input or use a dedicated QR library

    animationRef.current = requestAnimationFrame(scanFrame);
  };

  return (
    <div className="relative">
      {/* Scanner UI */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* Video element (hidden) */}
        <video
          ref={videoRef}
          className="hidden"
          playsInline
          muted
        />

        {/* Canvas for processing (hidden) */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Camera preview */}
        {isScanning && (
          <div className="aspect-[3/4] bg-gray-900 relative">
            {/* Placeholder for camera feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* QR Code overlay frame */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-white rounded-lg relative">
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>

                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="w-full h-0.5 bg-blue-500 animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/50 rounded-lg px-4 py-2 inline-block">
                Position QR code within the frame
              </p>
            </div>
          </div>
        )}

        {/* Camera permission state */}
        {permissionStatus === 'denied' && (
          <div className="aspect-[3/4] bg-gray-900 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Camera Access Required</h3>
              <p className="text-gray-400 text-sm">
                Please enable camera access to scan QR codes. Go to your browser settings and allow camera access for this site.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {cameraError && permissionStatus !== 'denied' && (
          <div className="aspect-[3/4] bg-gray-900 flex items-center justify-center p-8">
            <div className="text-center text-white">
              <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
              <p className="text-gray-400 text-sm mb-4">{cameraError}</p>
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Not enabled state */}
        {!enabled && (
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <p>Scanner disabled</p>
            </div>
          </div>
        )}
      </div>

      {/* Manual input fallback */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or enter guest code manually:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Guest ID or email"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onScan((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Guest ID or email"]') as HTMLInputElement;
              if (input?.value) {
                onScan(input.value);
                input.value = '';
              }
            }}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Look Up
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: calc(100% - 2px); }
        }
      `}</style>
    </div>
  );
}
