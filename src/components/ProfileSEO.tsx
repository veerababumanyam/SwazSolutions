// ProfileSEO Component
// Injects Schema.org structured data and dynamic meta tags for public profiles
// Improves SEO and social media sharing (Open Graph, Twitter Cards)

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PublicProfileResponse } from '../services/profileService';
import {
  generateProfilePageSchema,
  generateOpenGraphData,
  generateTwitterCardData,
  schemaToJsonLd,
} from '../utils/schemaGenerator';

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

interface ProfileSEOProps {
  profile: PublicProfileResponse;
  links: SocialLink[];
  profileUrl: string;
  siteName?: string;
}

/**
 * ProfileSEO Component
 * Injects Schema.org JSON-LD structured data and meta tags for profiles
 */
export const ProfileSEO: React.FC<ProfileSEOProps> = ({
  profile,
  links,
  profileUrl,
  siteName = 'Swaz Solutions',
}) => {
  // Generate schema data
  const profilePageSchema = generateProfilePageSchema(profile, links, profileUrl);
  const ogData = generateOpenGraphData(profile, profileUrl, siteName);
  const twitterData = generateTwitterCardData(profile, links);

  // Build page title
  const pageTitle = `${profile.displayName} | ${siteName}`;

  // Build meta description
  let metaDescription = '';
  if (profile.showBio && profile.bio) {
    metaDescription = profile.bio.length > 160
      ? profile.bio.substring(0, 157) + '...'
      : profile.bio;
  } else if (profile.showHeadline && profile.headline) {
    metaDescription = profile.headline;
  } else {
    metaDescription = `View ${profile.displayName}'s professional profile on ${siteName}`;
  }

  // Get canonical URL (clean, without hash)
  const canonicalUrl = profileUrl;

  // Update document title via useEffect as fallback
  useEffect(() => {
    const originalTitle = document.title;
    document.title = pageTitle;
    return () => {
      document.title = originalTitle;
    };
  }, [pageTitle]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Meta - respect indexingOptIn if present (this is controlled server-side) */}
      <meta name="robots" content="index, follow" />

      {/* Open Graph Tags */}
      <meta property="og:title" content={ogData.title} />
      <meta property="og:description" content={ogData.description} />
      <meta property="og:url" content={ogData.url} />
      <meta property="og:type" content={ogData.type} />
      <meta property="og:site_name" content={ogData.siteName} />
      <meta property="og:locale" content={ogData.locale} />
      {ogData.image && <meta property="og:image" content={ogData.image} />}
      {ogData.firstName && <meta property="profile:first_name" content={ogData.firstName} />}
      {ogData.lastName && <meta property="profile:last_name" content={ogData.lastName} />}
      {ogData.username && <meta property="profile:username" content={ogData.username} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content={twitterData.card} />
      <meta name="twitter:title" content={twitterData.title} />
      <meta name="twitter:description" content={twitterData.description} />
      {twitterData.image && <meta name="twitter:image" content={twitterData.image} />}
      {twitterData.creator && <meta name="twitter:creator" content={twitterData.creator} />}

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {schemaToJsonLd(profilePageSchema)}
      </script>
    </Helmet>
  );
};

export default ProfileSEO;
