import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Custom className */
    className?: string;
    /** Text to display below spinner */
    text?: string;
    /** Whether to show full screen overlay */
    fullscreen?: boolean;
    /** Custom color for spinner */
    color?: string;
}

/**
 * Loading Spinner Component
 * Accessible loading indicator with customizable size and text
 *
 * @example
 * <LoadingSpinner size="lg" text="Loading your data..." />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    className = '',
    text,
    fullscreen = false,
    color = 'currentColor'
}) => {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    };

    const textSizeStyles = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <Loader2
                className={`animate-spin ${sizeStyles[size]}`}
                style={{ color }}
                aria-hidden="true"
            />
            {text && (
                <p className={`text-secondary ${textSizeStyles[size]} animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                role="status"
                aria-live="polite"
                aria-busy="true"
                aria-label={text || 'Loading'}
            >
                {spinner}
            </div>
        );
    }

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={text || 'Loading'}
        >
            {spinner}
            <span className="sr-only">{text || 'Loading...'}</span>
        </div>
    );
};

/**
 * Skeleton Loading Component
 * For placeholder content during loading
 */
interface SkeletonProps {
    /** Number of lines to show */
    lines?: number;
    /** Width of skeleton (e.g., '100px', '50%', 'full') */
    width?: string;
    /** Height of skeleton */
    height?: string;
    /** Custom className */
    className?: string;
    /** Whether to show as a circle (for avatars) */
    circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    lines = 1,
    width = '100%',
    height = '1rem',
    className = '',
    circle = false
}) => {
    const baseStyle = 'bg-gray-200 dark:bg-gray-700 animate-pulse rounded';

    if (circle) {
        return (
            <div
                className={`${baseStyle} rounded-full ${className}`}
                style={{ width, height }}
                aria-hidden="true"
            />
        );
    }

    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={baseStyle}
                    style={{ width: i === lines - 1 ? '60%' : width, height }}
                />
            ))}
        </div>
    );
};

/**
 * Page Loading Component
 * Full-page loading state with skeleton content
 */
interface PageLoadingProps {
    /** Title of the page being loaded */
    title?: string;
    /** Number of skeleton items to show */
    itemCount?: number;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
    title = 'Loading...',
    itemCount = 5
}) => {
    return (
        <div className="min-h-screen bg-background p-4" role="status" aria-live="polite" aria-busy="true">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-primary mb-6 animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-8 w-48" />
                <div className="space-y-4">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <Skeleton key={i} height="4rem" />
                    ))}
                </div>
            </div>
            <span className="sr-only">{title}</span>
        </div>
    );
};

/**
 * Inline Loading Component
 * Small loading indicator for inline use
 */
interface InlineLoadingProps {
    /** Size of the spinner */
    size?: 'sm' | 'md';
    /** Optional text */
    text?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({ size = 'sm', text }) => {
    const sizeStyles = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4'
    };

    return (
        <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
            <Loader2 className={`animate-spin ${sizeStyles[size]}`} aria-hidden="true" />
            {text && <span className="text-sm text-secondary">{text}</span>}
            <span className="sr-only">Loading</span>
        </span>
    );
};

/**
 * WithLoading HOC
 * Wraps a component to show loading state
 */
interface WithLoadingProps {
    loading: boolean;
    error?: Error | null;
    children: React.ReactNode;
    loadingComponent?: React.ReactNode;
    errorComponent?: React.ReactNode;
}

export const WithLoading: React.FC<WithLoadingProps> = ({
    loading,
    error,
    children,
    loadingComponent,
    errorComponent
}) => {
    if (loading) {
        return loadingComponent || <LoadingSpinner />;
    }

    if (error) {
        return (
            errorComponent || (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl" role="alert">
                    <p className="text-red-800 dark:text-red-200 font-medium">Failed to load content</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
                </div>
            )
        );
    }

    return <>{children}</>;
};

export default LoadingSpinner;
