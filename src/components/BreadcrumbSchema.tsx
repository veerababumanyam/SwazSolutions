import React from 'react';
import { Schema } from './Schema';

interface BreadcrumbSchemaProps {
  path: string;
}

/**
 * Generates BreadcrumbList schema for SEO
 * Helps search engines understand page hierarchy and navigation structure
 */
export const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ path }) => {
  const breadcrumbs = pathToBreadcrumbs(path);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://swazdatarecovery.com${crumb.path}`
    }))
  };

  return <Schema type="BreadcrumbList" data={schema} />;
};

/**
 * Converts URL path to breadcrumb structure
 * Example: /services/data-recovery → [Home, Services, Data Recovery]
 */
function pathToBreadcrumbs(path: string): Array<{ name: string; path: string }> {
  const breadcrumbs: Array<{ name: string; path: string }> = [
    { name: 'Home', path: '/' }
  ];

  // Remove leading/trailing slashes and split
  const segments = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      name: formatSegmentName(segment),
      path: currentPath
    });
  });

  return breadcrumbs;
}

/**
 * Formats URL segment into readable name
 * Example: "data-recovery" → "Data Recovery"
 */
function formatSegmentName(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
