import React, { useEffect, useRef, useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
    threshold?: number;
}

/**
 * LazyImage Component for SEO and Performance
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Proper alt text enforcement (SEO)
 * - Fallback image support
 * - Fade-in animation
 * - Width/height preservation (CLS prevention)
 */
export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = '',
    fallback = '/placeholder-image.webp',
    threshold = 0.1,
    width,
    height,
    ...props
}) => {
    const imgRef = useRef<HTMLImageElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [imgSrc, setImgSrc] = useState(fallback);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold, rootMargin: '50px' }
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, [threshold]);

    useEffect(() => {
        if (isInView && !hasError) {
            setImgSrc(src);
        }
    }, [isInView, src, hasError]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        setImgSrc(fallback);
    };

    return (
        <img
            ref={imgRef}
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            {...props}
        />
    );
};

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
