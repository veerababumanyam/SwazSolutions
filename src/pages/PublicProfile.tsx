// PublicProfile Page (T046)
// Public-facing profile view with integrated PublicProfileView component
// Uses AppearanceSettings to match editor preview exactly
// Includes Schema.org structured data and SEO meta tags for better discoverability

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileService, PublicProfileResponse } from '../services/profileService';
import PublicProfileView from '../components/public-profile/PublicProfileView';
import { EnhancedPublicProfileView } from '../components/public-profile/PublicProfileView.enhanced';
// NEW: Mobile-first profile renderer
import { MobileFirstProfileRenderer } from '../components/public-profile/ProfileRenderer.mobile';
import { ProfileSEO } from '../components/ProfileSEO';

interface PublicProfileProps { }

export const PublicProfile: React.FC<PublicProfileProps> = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!username) {
          setError('Invalid profile URL');
          return;
        }

        const data = await profileService.getPublicProfile(username);

        if (!data) {
          setError('Profile not found');
        } else {
          setProfile(data);
          // Track the profile view (analytics)
          profileService.trackProfileView(username);
        }
      } catch (err) {
        console.error('Failed to load public profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Handle vCard download
  const handleDownloadVCard = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/public/profile/${profile.username}/vcard`);
      if (!response.ok) throw new Error('Failed to download vCard');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.username}.vcf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download vCard:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!profile) return;

    // Use clean public URL format without hash, properly encoded
    const publicUrl = `${window.location.origin}/u/${encodeURIComponent(profile.username)}`;

    const shareData = {
      title: `${profile.displayName}'s Profile`,
      text: profile.headline || `Check out ${profile.displayName}'s profile`,
      url: publicUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // Track successful web share
        profileService.trackShareEvent(profile.id, 'web_share');
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard(publicUrl);
        }
      }
    } else {
      copyToClipboard(publicUrl);
    }
  };

  const copyToClipboard = (url?: string) => {
    const publicUrl = url || `${window.location.origin}/u/${encodeURIComponent(profile?.username || '')}`;
    navigator.clipboard.writeText(publicUrl);
    // Track copy to clipboard share
    if (profile) {
      profileService.trackShareEvent(profile.id, 'copy_link');
    }
    alert('Profile link copied to clipboard!');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent mx-auto mb-4"></div>
          <p className="text-lg text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-7xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-primary mb-3">
            Profile Not Found
          </h1>
          <p className="text-secondary mb-8">
            {error || "The profile you're looking for doesn't exist or is not published."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Map profile data for PublicProfileView
  const profileData = {
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatar: profile.avatar,
    logo: profile.logoUrl,
    headline: profile.headline,
    publicEmail: profile.publicEmail,
    publicPhone: profile.publicPhone,
    website: profile.website,
    showEmail: profile.showEmail,
    showPhone: profile.showPhone,
    showWebsite: profile.showWebsite,
    showBio: profile.showBio,
    companyEmail: profile.companyEmail,
    companyPhone: profile.companyPhone,
    showCompanyEmail: profile.showCompanyEmail,
    showCompanyPhone: profile.showCompanyPhone,
    // Personal address fields
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    addressCity: profile.addressCity,
    addressState: profile.addressState,
    addressPostalCode: profile.addressPostalCode,
    addressCountry: profile.addressCountry,
    showAddressLine1: profile.showAddressLine1,
    showAddressLine2: profile.showAddressLine2,
    showAddressCity: profile.showAddressCity,
    showAddressState: profile.showAddressState,
    showAddressPostalCode: profile.showAddressPostalCode,
    showAddressCountry: profile.showAddressCountry,
    // Company address fields
    companyAddressLine1: profile.companyAddressLine1,
    companyAddressLine2: profile.companyAddressLine2,
    companyAddressCity: profile.companyAddressCity,
    companyAddressState: profile.companyAddressState,
    companyAddressPostalCode: profile.companyAddressPostalCode,
    companyAddressCountry: profile.companyAddressCountry,
    showCompanyAddressLine1: profile.showCompanyAddressLine1,
    showCompanyAddressLine2: profile.showCompanyAddressLine2,
    showCompanyAddressCity: profile.showCompanyAddressCity,
    showCompanyAddressState: profile.showCompanyAddressState,
    showCompanyAddressPostalCode: profile.showCompanyAddressPostalCode,
    showCompanyAddressCountry: profile.showCompanyAddressCountry,
    pronouns: profile.pronouns,
    company: profile.company,
  };

  // Combine social profiles and custom links for the links array
  const allLinks = [
    ...(profile.socialProfiles || []),
    ...(profile.customLinks || []).map(link => ({
      id: link.id,
      platform: null,
      url: link.linkUrl,
      displayLabel: link.linkTitle,
      customLogo: link.customLogoUrl,
      isFeatured: false,
      displayOrder: link.displayOrder,
    })),
  ].sort((a, b) => a.displayOrder - b.displayOrder);

  // Build profile URL for SEO and sharing
  const profileUrl = `${window.location.origin}/u/${encodeURIComponent(profile.username)}`;

  // Success state - display profile using MobileFirstProfileRenderer
  return (
    <>
      {/* SEO: Schema.org structured data and meta tags */}
      <ProfileSEO
        profile={profile}
        links={allLinks}
        profileUrl={profileUrl}
      />
      <MobileFirstProfileRenderer
        profile={profileData}
        links={allLinks}
        appearance={profile.appearance}
        profileUrl={profileUrl}
        onDownloadVCard={handleDownloadVCard}
        onShare={handleShare}
        isPreview={false}
      />
    </>
  );
};
