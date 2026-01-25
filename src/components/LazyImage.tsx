import React, { useEffect, useRef, useState, useCallback, memo } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
    threshold?: number;
    rootMargin?: string;
    blurPlaceholder?: boolean;
    onImageLoad?: () => void;
    onImageError?: () => void;
    priority?: boolean;
}

const DEFAULT_FALLBACK = '/placeholder-album.png';

/**
 * LazyImage Component for SEO and Performance
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Proper alt text enforcement (SEO)
 * - Fallback image support
 * - Blur-up placeholder effect
 * - Fade-in animation
 * - Width/height preservation (CLS prevention)
 * - Priority loading option for above-the-fold images
 * - Configurable root margin for preloading
 */
export const LazyImage: React.FC<LazyImageProps> = memo(({
    src,
    alt,
    className = '',
    fallback = DEFAULT_FALLBACK,
    threshold = 0.1,
    rootMargin = '100px',
    blurPlaceholder = false,
    onImageLoad,
    onImageError,
    priority = false,
    width,
    height,
    style,
    ...props
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [imgSrc, setImgSrc] = useState(priority ? src : '');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (priority || !imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [threshold, rootMargin, priority]);

    useEffect(() => {
        if (isInView && !hasError && src) {
            setImgSrc(src);
        }
    }, [isInView, src, hasError]);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        onImageLoad?.();
    }, [onImageLoad]);

    const handleError = useCallback(() => {
        setHasError(true);
        setImgSrc(fallback);
        onImageError?.();
    }, [fallback, onImageError]);

    const containerStyle: React.CSSProperties = {
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-block',
        width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
        ...style,
    };

    const imageStyle: React.CSSProperties = {
        transition: 'opacity 300ms ease-in-out, filter 300ms ease-in-out',
        opacity: isLoaded ? 1 : 0,
        filter: blurPlaceholder && !isLoaded ? 'blur(10px)' : 'none',
        transform: blurPlaceholder && !isLoaded ? 'scale(1.1)' : 'scale(1)',
    };

    if (blurPlaceholder) {
        return (
            <div style={containerStyle} className={className}>
                {!isLoaded && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: '#e5e7eb',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        }}
                        aria-hidden="true"
                    />
                )}
                <img
                    ref={imgRef}
                    src={imgSrc || undefined}
                    alt={alt}
                    width={width}
                    height={height}
                    style={imageStyle}
                    className="w-full h-full object-cover"
                    onLoad={handleLoad}
                    onError={handleError}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    {...props}
                />
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={imgSrc || undefined}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            {...props}
        />
    );
});

LazyImage.displayName = 'LazyImage';

/**
 * Optimized Image Alt Text Generator
 * Helps create SEO-friendly, descriptive alt text
 */
export const generateAltText = (context: {
    subject: string;
    action?: string;
    location?: string;
    descriptors?: string[];
}): string => {
    const parts: string[] = [];

    if (context.action) parts.push(context.action);
    if (context.descriptors?.length) parts.push(context.descriptors.join(', '));
    parts.push(context.subject);
    if (context.location) parts.push(`in ${context.location}`);

    return parts.join(' ');
};

// Example usage:
// generateAltText({
//   subject: 'data recovery engineer',
//   action: 'examining',
//   descriptors: ['professional', 'clean room'],
//   location: 'ISO certified lab'
// })
// Output: "examining professional, clean room data recovery engineer in ISO certified lab"
