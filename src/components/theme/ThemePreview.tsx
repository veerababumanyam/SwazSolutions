import React from 'react';
import { Theme } from '../../types/theme.types';

interface ThemePreviewProps {
    theme: Theme;
    size?: 'small' | 'medium' | 'large';
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, size = 'medium' }) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return { container: 'w-48 h-32', avatar: '40px', text: 'text-xs' };
            case 'large':
                return { container: 'w-96 h-64', avatar: '80px', text: 'text-base' };
            default:
                return { container: 'w-64 h-48', avatar: '60px', text: 'text-sm' };
        }
    };

    const sizeClasses = getSizeClasses();

    // Create inline styles from theme
    const containerStyle: React.CSSProperties = {
        background: theme.colors.background,
        borderColor: theme.colors.border,
        borderRadius: theme.layout.borderRadius.md,
        boxShadow: theme.layout.shadows.md,
        fontFamily: theme.typography.fontFamily,
    };

    const avatarStyle: React.CSSProperties = {
        width: sizeClasses.avatar,
        height: sizeClasses.avatar,
        borderRadius: theme.avatar.shape === 'circle' ? '50%' :
            theme.avatar.shape === 'rounded' ? theme.layout.borderRadius.lg : '0',
        borderWidth: theme.avatar.borderWidth,
        borderColor: theme.avatar.borderColor,
        borderStyle: 'solid',
        boxShadow: theme.avatar.shadow,
        background: theme.colors.primary,
    };

    const headingStyle: React.CSSProperties = {
        color: theme.colors.text,
        fontFamily: theme.typography.headingFont,
        fontWeight: theme.typography.fontWeights.bold,
        fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.25rem' : '1rem',
    };

    const textStyle: React.CSSProperties = {
        color: theme.colors.textSecondary,
        fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '0.875rem' : '0.75rem',
    };

    const buttonStyle: React.CSSProperties = {
        backgroundColor: theme.colors.primary,
        color: theme.colors.background,
        padding: size === 'small' ? '0.25rem 0.5rem' : '0.5rem 1rem',
        borderRadius: theme.layout.borderRadius.sm,
        fontSize: size === 'small' ? '0.625rem' : '0.75rem',
        fontWeight: theme.typography.fontWeights.medium,
        border: 'none',
        boxShadow: theme.layout.shadows.sm,
        cursor: 'pointer',
    };

    return (
        <div
            className={`${sizeClasses.container} border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all`}
            style={containerStyle}
        >
            {/* Avatar */}
            <div style={avatarStyle} className="flex items-center justify-center">
                <span style={{ color: theme.colors.background, fontSize: sizeClasses.avatar === '40px' ? '1rem' : '1.5rem' }}>
                    JD
                </span>
            </div>

            {/* Name & Title */}
            <div className="text-center">
                <h3 style={headingStyle} className="mb-1">
                    John Doe
                </h3>
                <p style={textStyle}>
                    Product Designer
                </p>
            </div>

            {/* Action Button */}
            {size !== 'small' && (
                <button style={buttonStyle} className="mt-2 hover:opacity-90 transition-opacity">
                    View Profile
                </button>
            )}
        </div>
    );
};

export default ThemePreview;
