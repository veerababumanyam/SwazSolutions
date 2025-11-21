import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingStateProps> = ({ message, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-accent`} />
            {message && <p className="text-sm text-secondary">{message}</p>}
        </div>
    );
};

export const SkeletonSongCard: React.FC = () => (
    <div className="flex items-center gap-4 p-3 skeleton rounded-lg animate-pulse">
        <div className="w-12 h-12 bg-border rounded-lg" />
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-border rounded w-3/4" />
            <div className="h-3 bg-border rounded w-1/2" />
        </div>
        <div className="h-8 w-8 bg-border rounded-full" />
    </div>
);

export const SkeletonSongList: React.FC<{ count?: number }> = ({ count = 5 }) => (
    <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonSongCard key={i} />
        ))}
    </div>
);

export const SkeletonAlbumCard: React.FC = () => (
    <div className="skeleton rounded-xl p-4 animate-pulse space-y-3">
        <div className="aspect-square bg-border rounded-lg" />
        <div className="h-4 bg-border rounded w-3/4" />
        <div className="h-3 bg-border rounded w-1/2" />
    </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonAlbumCard key={i} />
        ))}
    </div>
);
