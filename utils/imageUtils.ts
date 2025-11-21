/**
 * Image fallback utilities for music covers
 * Implements three-tier fallback system:
 * 1. Metadata embedded cover (from database)
 * 2. Folder image (cover.jpg, folder.jpg, etc.)
 * 3. Default placeholder
 */

import React from 'react';

/**
 * Handle image loading errors with graceful fallback to placeholder
 * @param event - Image error event
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    
    // Prevent infinite loop if placeholder also fails
    if (img.src.endsWith('/placeholder-album.png')) {
        return;
    }
    
    // Fallback to placeholder
    img.src = '/placeholder-album.png';
    img.onerror = null; // Prevent further error events
};

/**
 * Get cover image URL with proper fallback handling
 * @param coverPath - Cover path from API or database
 * @returns Valid image URL with fallback
 */
export const getCoverImageUrl = (coverPath: string | null | undefined): string => {
    if (!coverPath || coverPath.trim() === '') {
        return '/placeholder-album.png';
    }
    
    return coverPath.trim();
};

/**
 * Preload image to check if it exists
 * @param src - Image source URL
 * @returns Promise that resolves with src if image loads, rejects otherwise
 */
export const preloadImage = (src: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = src;
    });
};

/**
 * Get fallback chain for cover images
 * @param coverPath - Primary cover path
 * @param albumPath - Album directory path
 * @returns Array of URLs to try in order
 */
export const getCoverFallbackChain = (
    coverPath: string | null | undefined,
    albumPath?: string
): string[] => {
    const chain: string[] = [];
    
    // 1. Metadata embedded cover (highest priority)
    if (coverPath && coverPath.trim()) {
        chain.push(coverPath.trim());
    }
    
    // 2. Folder images (if album path provided)
    if (albumPath) {
        const folderImages = [
            `${albumPath}/cover.jpg`,
            `${albumPath}/cover.png`,
            `${albumPath}/folder.jpg`,
            `${albumPath}/album.jpg`,
        ];
        chain.push(...folderImages);
    }
    
    // 3. Default fallback in MusicFiles root
    chain.push('/music/default-cover.png');
    chain.push('/music/cover.png');
    chain.push('/music/cover.jpg');
    
    // 4. Ultimate fallback - placeholder
    chain.push('/placeholder-album.png');
    
    return chain;
};
