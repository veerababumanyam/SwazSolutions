// ProfileQRCode Component
// Renders an inline, scannable QR code for profile sharing
// Uses react-qr-code for client-side generation without API calls

import React from 'react';
import QRCode from 'react-qr-code';

export interface ProfileQRCodeProps {
  /** The URL to encode in the QR code */
  profileUrl: string;
  /** Size of the QR code in pixels (default: 120) */
  size?: number;
  /** Background color of the QR code */
  bgColor?: string;
  /** Foreground color (the dots) of the QR code */
  fgColor?: string;
  /** Whether to show the "Scan to connect" label */
  showLabel?: boolean;
  /** Custom label text */
  labelText?: string;
  /** Label text color */
  labelColor?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Click handler for expanding QR or showing options */
  onClick?: () => void;
}

export const ProfileQRCode: React.FC<ProfileQRCodeProps> = ({
  profileUrl,
  size = 120,
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  showLabel = true,
  labelText = 'Scan to connect',
  labelColor,
  className = '',
  onClick,
}) => {
  // Don't render if no URL provided
  if (!profileUrl) {
    return null;
  }

  return (
    <div 
      className={`inline-flex flex-col items-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* QR Code Container with padding and rounded corners */}
      <div 
        className="p-3 rounded-xl shadow-md transition-transform hover:scale-105"
        style={{ backgroundColor: bgColor }}
      >
        <QRCode
          value={profileUrl}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level="M" // Medium error correction - good balance of density and reliability
        />
      </div>
      
      {/* Optional Label */}
      {showLabel && (
        <p 
          className="text-xs font-medium mt-2 text-center"
          style={{ color: labelColor || fgColor }}
        >
          {labelText}
        </p>
      )}
    </div>
  );
};

export default ProfileQRCode;
