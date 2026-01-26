import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Loading state - shows spinner and disables button */
    loading?: boolean;
    /** Icon to display before text */
    icon?: React.ReactNode;
    /** Icon to display after text */
    iconRight?: React.ReactNode;
    /** Variant style */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    /** Size */
    size?: 'sm' | 'md' | 'lg';
    /** Full width button */
    fullWidth?: boolean;
    /** Children content */
    children: React.ReactNode;
}

/**
 * Accessible Button Component
 * Includes proper ARIA labels, loading states, and keyboard support
 *
 * @example
 * <AccessibleButton
 *   aria-label="Save changes"
 *   loading={isSaving}
 *   onClick={handleSave}
 * >
 *   Save
 * </AccessibleButton>
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
    (
        {
            children,
            loading = false,
            icon,
            iconRight,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            disabled,
            className = '',
            'aria-label': ariaLabel,
            'aria-describedby': ariaDescribedBy,
            ...props
        },
        ref
    ) => {
        // Generate accessible label if not provided
        const getAccessibleLabel = () => {
            if (ariaLabel) return ariaLabel;
            if (typeof children === 'string') return children;
            return props.title || 'Button';
        };

        const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

        const variantStyles = {
            primary: 'bg-brand-gradient text-white hover:opacity-90 focus:ring-accent',
            secondary: 'bg-secondary text-white hover:bg-secondary/80 focus:ring-accent',
            outline: 'border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary',
            ghost: 'bg-transparent hover:bg-background/50 focus:ring-primary',
            danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
        };

        const sizeStyles = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg'
        };

        const widthStyle = fullWidth ? 'w-full' : '';

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                aria-label={getAccessibleLabel()}
                aria-describedby={ariaDescribedBy}
                aria-busy={loading}
                aria-disabled={disabled || loading}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {icon && !loading && <span className="flex-shrink-0">{icon}</span>}
                <span>{children}</span>
                {iconRight && !loading && <span className="flex-shrink-0">{iconRight}</span>}
            </button>
        );
    }
);

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Accessible Icon Button
 * For buttons that only contain an icon
 */
interface AccessibleIconButtonProps extends Omit<AccessibleButtonProps, 'children'> {
    /** Required aria-label for icon-only buttons */
    'aria-label': string;
    /** Icon to display */
    icon: React.ReactNode;
    /** Tooltip text (optional) */
    tooltip?: string;
}

export const AccessibleIconButton = forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
    ({ 'aria-label': ariaLabel, icon, tooltip, size = 'md', variant = 'ghost', className = '', ...props }, ref) => {
        return (
            <button
                ref={ref}
                aria-label={ariaLabel}
                title={tooltip || ariaLabel}
                className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-accent hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
                {...props}
            >
                <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            </button>
        );
    }
);

AccessibleIconButton.displayName = 'AccessibleIconButton';

export default AccessibleButton;
