/**
 * SEO Utility Functions
 * 
 * Helper functions for improving SEO performance throughout the application
 */

/**
 * Generate dynamic page title with brand consistency
 * Format: "Page Title | Swaz Solutions"
 */
export const generatePageTitle = (pageTitle: string, includeBrand: boolean = true): string => {
    const brand = 'Swaz Solutions';
    return includeBrand ? `${pageTitle} | ${brand}` : pageTitle;
};

/**
 * Generate dynamic meta description
 * Ensures optimal length (150-160 characters) for SERP display
 */
export const generateMetaDescription = (description: string, maxLength: number = 160): string => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength - 3) + '...';
};

/**
 * Generate canonical URL for the current page
 * Prevents duplicate content issues
 */
export const generateCanonicalUrl = (path: string, baseUrl: string = 'https://swazdatarecovery.com'): string => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
};

/**
 * Generate keywords from content
 * Extracts relevant keywords for meta tags
 */
export const generateKeywords = (content: string, maxKeywords: number = 10): string[] => {
    // Simple keyword extraction (in production, use more sophisticated NLP)
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};

    // Common stop words to exclude
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were']);

    words.forEach(word => {
        const clean = word.replace(/[^a-z]/g, '');
        if (clean.length > 3 && !stopWords.has(clean)) {
            wordFreq[clean] = (wordFreq[clean] || 0) + 1;
        }
    });

    return Object.entries(wordFreq)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxKeywords)
        .map(([word]) => word);
};

/**
 * Calculate estimated reading time
 * Useful for content-heavy pages
 */
export const calculateReadingTime = (text: string, wordsPerMinute: number = 200): number => {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

/**
 * Format date for structured data
 * ISO 8601 format required by schema.org
 */
export const formatStructuredDate = (date: Date): string => {
    return date.toISOString();
};

/**
 * Validate and sanitize alt text
 * Ensures alt text follows SEO best practices
 */
export const sanitizeAltText = (altText: string): string => {
    // Remove excessive whitespace
    let clean = altText.trim().replace(/\s+/g, ' ');

    // Ensure reasonable length (125 characters recommended)
    if (clean.length > 125) {
        clean = clean.substring(0, 122) + '...';
    }

    // Remove non-descriptive phrases
    const badPhrases = ['image of', 'picture of', 'photo of'];
    badPhrases.forEach(phrase => {
        if (clean.toLowerCase().startsWith(phrase)) {
            clean = clean.substring(phrase.length).trim();
        }
    });

    return clean;
};

/**
 * Generate Open Graph image URL with optimal dimensions
 * Facebook/LinkedIn prefer 1200x630
 */
export const generateOGImageUrl = (
    imagePath: string,
    baseUrl: string = 'https://swazdatarecovery.com'
): string => {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
};

/**
 * Extract headings from HTML content for SEO analysis
 * Helps identify content structure issues
 */
export const extractHeadings = (htmlContent: string): { level: number; text: string }[] => {
    const headings: { level: number; text: string }[] = [];
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;

    let match;
    while ((match = headingRegex.exec(htmlContent)) !== null) {
        headings.push({
            level: parseInt(match[1]),
            text: match[2].replace(/<[^>]*>/g, '').trim()
        });
    }

    return headings;
};

/**
 * Check if URL is internal or external
 * Important for nofollow/rel attributes
 */
export const isInternalLink = (url: string, currentDomain: string = 'swazsolutions.com'): boolean => {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.includes(currentDomain);
    } catch {
        // Relative URL, therefore internal
        return true;
    }
};

/**
 * Generate structured breadcrumb trail from URL path
 */
export const pathToBreadcrumbs = (pathname: string): { name: string; path: string }[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: { name: string; path: string }[] = [
        { name: 'Home', path: '/' }
    ];

    let currentPath = '';
    segments.forEach(segment => {
        currentPath += `/${segment}`;
        const name = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
        breadcrumbs.push({ name, path: currentPath });
    });

    return breadcrumbs;
};
