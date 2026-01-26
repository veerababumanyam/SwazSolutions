import React from 'react';
import { FileQuestion, Music, List, Search, Users, FolderOpen, Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
    /** Type of empty state - determines icon and message */
    type?: 'songs' | 'playlists' | 'search' | 'profiles' | 'general' | 'folder';
    /** Custom title */
    title?: string;
    /** Custom description */
    description?: string;
    /** Action button label */
    actionLabel?: string;
    /** Action button click handler */
    onAction?: () => void;
    /** Additional action button */
    secondaryActionLabel?: string;
    /** Secondary action click handler */
    onSecondaryAction?: () => void;
    /** Custom icon */
    icon?: React.ReactNode;
    /** Size of the empty state */
    size?: 'sm' | 'md' | 'lg';
    /** Custom className */
    className?: string;
}

/**
 * Empty State Component
 * Provides consistent empty state UI across the application
 *
 * @example
 * <EmptyState
 *   type="songs"
 *   title="No songs yet"
 *   description="Upload your music to get started"
 *   actionLabel="Upload Music"
 *   onAction={handleUpload}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'general',
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    icon,
    size = 'md',
    className = ''
}) => {
    // Default configurations for each type
    const configs = {
        songs: {
            icon: <Music className="w-12 h-12" />,
            title: 'No songs in your library',
            description: 'Upload your music files or scan your music folder to get started.',
            actionLabel: 'Scan Music Folder'
        },
        playlists: {
            icon: <List className="w-12 h-12" />,
            title: 'No playlists yet',
            description: 'Create your first playlist to organize your favorite songs.',
            actionLabel: 'Create Playlist'
        },
        search: {
            icon: <Search className="w-12 h-12" />,
            title: 'No results found',
            description: 'Try adjusting your search terms or filters.',
            actionLabel: 'Clear Search'
        },
        profiles: {
            icon: <Users className="w-12 h-12" />,
            title: 'No profile yet',
            description: 'Create your public profile to share your music identity.',
            actionLabel: 'Create Profile'
        },
        general: {
            icon: <Inbox className="w-12 h-12" />,
            title: 'Nothing here',
            description: 'There are no items to display.',
            actionLabel: 'Add Item'
        },
        folder: {
            icon: <FolderOpen className="w-12 h-12" />,
            title: 'Folder is empty',
            description: 'This folder doesn\'t contain any items yet.',
            actionLabel: 'Browse'
        }
    };

    const config = configs[type];

    const sizeStyles = {
        sm: 'p-4 max-w-sm',
        md: 'p-8 max-w-md',
        lg: 'p-12 max-w-lg'
    };

    return (
        <div
            className={`flex flex-col items-center justify-center text-center ${sizeStyles[size]} ${className}`}
            role="presentation"
            aria-label={title || config.title}
        >
            {/* Icon */}
            <div className="text-muted mb-4 flex-shrink-0">
                {icon || config.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold text-primary mb-2">
                {title || config.title}
            </h3>

            {/* Description */}
            <p className="text-secondary mb-6 max-w-xs mx-auto">
                {description || config.description}
            </p>

            {/* Actions */}
            {(actionLabel || onAction) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {onAction && (
                        <button
                            onClick={onAction}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <Plus className="w-5 h-5" />
                            {actionLabel || config.actionLabel}
                        </button>
                    )}
                    {(secondaryActionLabel || onSecondaryAction) && (
                        <button
                            onClick={onSecondaryAction}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-primary font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            {secondaryActionLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Error State Component
 * For displaying error states with retry option
 */
interface ErrorStateProps {
    /** Error message */
    message?: string;
    /** Error details (development only) */
    details?: string;
    /** Retry handler */
    onRetry?: () => void;
    /** Custom className */
    className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    message = 'Something went wrong',
    details,
    onRetry,
    className = ''
}) => {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center p-8 max-w-md ${className}`}
            role="alert"
            aria-live="assertive"
        >
            <div className="text-red-500 mb-4">
                <FileQuestion className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
                {message}
            </h3>
            {details && process.env.NODE_ENV === 'development' && (
                <p className="text-sm text-red-500 mb-6 font-mono max-w-xs mx-auto truncate">
                    {details}
                </p>
            )}
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
};

/**
 * Minimal Empty State
 * Compact version for smaller spaces
 */
interface MinimalEmptyStateProps {
    /** Title */
    title: string;
    /** Action label */
    actionLabel?: string;
    /** Action handler */
    onAction?: () => void;
}

export const MinimalEmptyState: React.FC<MinimalEmptyStateProps> = ({
    title,
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center" role="presentation">
            <Inbox className="w-8 h-8 text-muted mb-3" />
            <p className="text-secondary text-sm mb-3">{title}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="text-accent text-sm font-medium hover:underline"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
