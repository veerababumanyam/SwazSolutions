import React from 'react';
import { Schema } from './Schema';

interface BreadcrumbItem {
    name: string;
    url: string;
    position: number;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

/**
 * Breadcrumbs Component with Schema Markup
 * 
 * Provides both visual breadcrumb navigation and BreadcrumbList schema for SEO
 * Improves SERP display and site architecture understanding
 */
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    const breadcrumbSchema = {
        itemListElement: items.map((item) => ({
            '@type': 'ListItem',
            position: item.position,
            name: item.name,
            item: item.url
        }))
    };

    return (
        <>
            <Schema type="BreadcrumbList" data={breadcrumbSchema} />

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-secondary mb-6">
                {items.map((item, index) => (
                    <span key={item.position} className="flex items-center gap-2">
                        {index > 0 && <span className="text-muted">/</span>}
                        {index === items.length - 1 ? (
                            <span className="font-semibold text-primary">{item.name}</span>
                        ) : (
                            <a
                                href={item.url}
                                className="hover:text-accent transition-colors"
                            >
                                {item.name}
                            </a>
                        )}
                    </span>
                ))}
            </nav>
        </>
    );
};

// Helper function to generate breadcrumbs from path
export const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
        { name: 'Home', url: 'https://swazdatarecovery.com/', position: 1 }
    ];

    let currentPath = 'https://swazdatarecovery.com';
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        breadcrumbs.push({
            name: segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            url: currentPath,
            position: index + 2
        });
    });

    return breadcrumbs;
};
