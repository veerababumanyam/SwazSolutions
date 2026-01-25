// Schema.org Structured Data Generator for Profiles
// Generates JSON-LD structured data for SEO and social sharing

import { PublicProfileResponse } from '../services/profileService';

// Schema.org type definitions
interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

interface ContactPoint {
  '@type': 'ContactPoint';
  contactType: string;
  email?: string;
  telephone?: string;
}

interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  contentUrl: string;
}

interface Person {
  '@type': 'Person';
  '@id'?: string;
  name: string;
  givenName?: string;
  familyName?: string;
  alternateName?: string;
  description?: string;
  image?: string | ImageObject;
  jobTitle?: string;
  worksFor?: {
    '@type': 'Organization';
    name: string;
  };
  email?: string;
  telephone?: string;
  url?: string;
  sameAs?: string[];
  address?: PostalAddress;
  contactPoint?: ContactPoint[];
}

interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

interface ProfilePage {
  '@context': 'https://schema.org';
  '@type': 'ProfilePage';
  '@id': string;
  name: string;
  description?: string;
  url: string;
  mainEntity: Person;
  breadcrumb?: BreadcrumbList;
  dateModified?: string;
}

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

/**
 * Build a PostalAddress schema from profile data
 */
function buildPostalAddress(
  line1?: string,
  line2?: string,
  city?: string,
  state?: string,
  postalCode?: string,
  country?: string,
  showLine1?: boolean,
  showLine2?: boolean,
  showCity?: boolean,
  showState?: boolean,
  showPostalCode?: boolean,
  showCountry?: boolean
): PostalAddress | undefined {
  const streetParts: string[] = [];
  if (showLine1 && line1) streetParts.push(line1);
  if (showLine2 && line2) streetParts.push(line2);

  const hasVisibleAddress =
    streetParts.length > 0 ||
    (showCity && city) ||
    (showState && state) ||
    (showPostalCode && postalCode) ||
    (showCountry && country);

  if (!hasVisibleAddress) return undefined;

  const address: PostalAddress = {
    '@type': 'PostalAddress',
  };

  if (streetParts.length > 0) {
    address.streetAddress = streetParts.join(', ');
  }
  if (showCity && city) {
    address.addressLocality = city;
  }
  if (showState && state) {
    address.addressRegion = state;
  }
  if (showPostalCode && postalCode) {
    address.postalCode = postalCode;
  }
  if (showCountry && country) {
    address.addressCountry = country;
  }

  return address;
}

/**
 * Extract social profile URLs for sameAs property
 */
function extractSocialUrls(links: SocialLink[]): string[] {
  const socialUrls: string[] = [];

  for (const link of links) {
    if (link.url && link.url.startsWith('http')) {
      // Include all valid social URLs
      socialUrls.push(link.url);
    }
  }

  return socialUrls;
}

/**
 * Generate Person schema from profile data
 */
export function generatePersonSchema(
  profile: PublicProfileResponse,
  links: SocialLink[],
  profileUrl: string
): Person {
  const person: Person = {
    '@type': 'Person',
    '@id': `${profileUrl}#person`,
    name: profile.displayName,
  };

  // Add name parts if visible
  if (profile.showFirstName && profile.firstName) {
    person.givenName = profile.firstName;
  }
  if (profile.showLastName && profile.lastName) {
    person.familyName = profile.lastName;
  }

  // Username as alternate name
  if (profile.username && profile.username !== profile.displayName) {
    person.alternateName = profile.username;
  }

  // Bio as description
  if (profile.showBio && profile.bio) {
    person.description = profile.bio;
  } else if (profile.showHeadline && profile.headline) {
    person.description = profile.headline;
  }

  // Avatar image
  if (profile.avatar) {
    person.image = profile.avatar;
  }

  // Job title (headline)
  if (profile.showHeadline && profile.headline) {
    person.jobTitle = profile.headline;
  }

  // Company/Organization
  if (profile.showCompany && profile.company) {
    person.worksFor = {
      '@type': 'Organization',
      name: profile.company,
    };
  }

  // Contact information (personal)
  if (profile.showEmail && profile.publicEmail) {
    person.email = profile.publicEmail;
  }
  if (profile.showPhone && profile.publicPhone) {
    person.telephone = profile.publicPhone;
  }

  // Website
  if (profile.showWebsite && profile.website) {
    person.url = profile.website;
  } else {
    person.url = profileUrl;
  }

  // Social profiles for sameAs
  const socialUrls = extractSocialUrls(links);
  if (socialUrls.length > 0) {
    person.sameAs = socialUrls;
  }

  // Personal address
  const personalAddress = buildPostalAddress(
    profile.addressLine1,
    profile.addressLine2,
    profile.addressCity,
    profile.addressState,
    profile.addressPostalCode,
    profile.addressCountry,
    profile.showAddressLine1,
    profile.showAddressLine2,
    profile.showAddressCity,
    profile.showAddressState,
    profile.showAddressPostalCode,
    profile.showAddressCountry
  );
  if (personalAddress) {
    person.address = personalAddress;
  }

  // Contact points (for company contact)
  const contactPoints: ContactPoint[] = [];

  if (profile.showCompanyEmail && profile.companyEmail) {
    contactPoints.push({
      '@type': 'ContactPoint',
      contactType: 'work',
      email: profile.companyEmail,
    });
  }

  if (profile.showCompanyPhone && profile.companyPhone) {
    const workContact = contactPoints.find(c => c.contactType === 'work');
    if (workContact) {
      workContact.telephone = profile.companyPhone;
    } else {
      contactPoints.push({
        '@type': 'ContactPoint',
        contactType: 'work',
        telephone: profile.companyPhone,
      });
    }
  }

  if (contactPoints.length > 0) {
    person.contactPoint = contactPoints;
  }

  return person;
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  profile: PublicProfileResponse,
  profileUrl: string,
  siteUrl: string
): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Profiles',
        item: `${siteUrl}/profiles`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: profile.displayName,
        item: profileUrl,
      },
    ],
  };
}

/**
 * Generate complete ProfilePage schema with Person entity
 */
export function generateProfilePageSchema(
  profile: PublicProfileResponse,
  links: SocialLink[],
  profileUrl: string
): ProfilePage {
  const siteUrl = new URL(profileUrl).origin;
  const person = generatePersonSchema(profile, links, profileUrl);
  const breadcrumb = generateBreadcrumbSchema(profile, profileUrl, siteUrl);

  // Build description
  let description = '';
  if (profile.showBio && profile.bio) {
    description = profile.bio;
  } else if (profile.showHeadline && profile.headline) {
    description = profile.headline;
  } else {
    description = `View ${profile.displayName}'s professional profile`;
  }

  const profilePage: ProfilePage = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': profileUrl,
    name: `${profile.displayName}'s Profile`,
    description,
    url: profileUrl,
    mainEntity: person,
    breadcrumb,
  };

  return profilePage;
}

/**
 * Convert schema to JSON-LD script content
 */
export function schemaToJsonLd(schema: object): string {
  return JSON.stringify(schema, null, 0);
}

/**
 * Generate Open Graph meta tag data
 */
export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  image?: string;
  type: string;
  siteName: string;
  locale: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export function generateOpenGraphData(
  profile: PublicProfileResponse,
  profileUrl: string,
  siteName: string = 'Swaz Solutions'
): OpenGraphData {
  let description = '';
  if (profile.showBio && profile.bio) {
    // Truncate for OG description (recommended max 200 chars)
    description = profile.bio.length > 200
      ? profile.bio.substring(0, 197) + '...'
      : profile.bio;
  } else if (profile.showHeadline && profile.headline) {
    description = profile.headline;
  } else {
    description = `View ${profile.displayName}'s profile on ${siteName}`;
  }

  const ogData: OpenGraphData = {
    title: `${profile.displayName} | ${siteName}`,
    description,
    url: profileUrl,
    type: 'profile',
    siteName,
    locale: 'en_US',
  };

  // Profile image
  if (profile.avatar) {
    ogData.image = profile.avatar;
  } else if (profile.logoUrl) {
    ogData.image = profile.logoUrl;
  }

  // Profile-specific OG tags
  if (profile.showFirstName && profile.firstName) {
    ogData.firstName = profile.firstName;
  }
  if (profile.showLastName && profile.lastName) {
    ogData.lastName = profile.lastName;
  }
  ogData.username = profile.username;

  return ogData;
}

/**
 * Generate Twitter Card meta tag data
 */
export interface TwitterCardData {
  card: 'summary' | 'summary_large_image';
  title: string;
  description: string;
  image?: string;
  creator?: string;
}

export function generateTwitterCardData(
  profile: PublicProfileResponse,
  links: SocialLink[]
): TwitterCardData {
  let description = '';
  if (profile.showBio && profile.bio) {
    // Truncate for Twitter (max 200 chars recommended)
    description = profile.bio.length > 200
      ? profile.bio.substring(0, 197) + '...'
      : profile.bio;
  } else if (profile.showHeadline && profile.headline) {
    description = profile.headline;
  } else {
    description = `${profile.displayName}'s professional profile`;
  }

  const twitterData: TwitterCardData = {
    card: profile.avatar ? 'summary_large_image' : 'summary',
    title: profile.displayName,
    description,
  };

  // Profile image
  if (profile.avatar) {
    twitterData.image = profile.avatar;
  } else if (profile.logoUrl) {
    twitterData.image = profile.logoUrl;
  }

  // Try to find Twitter/X handle from social links
  const twitterLink = links.find(link =>
    link.platform?.toLowerCase() === 'twitter' ||
    link.platform?.toLowerCase() === 'x' ||
    link.url?.includes('twitter.com') ||
    link.url?.includes('x.com')
  );

  if (twitterLink?.url) {
    // Extract handle from URL
    const match = twitterLink.url.match(/(?:twitter\.com|x\.com)\/([^\/\?]+)/i);
    if (match?.[1] && match[1] !== 'intent' && match[1] !== 'share') {
      twitterData.creator = `@${match[1]}`;
    }
  }

  return twitterData;
}
