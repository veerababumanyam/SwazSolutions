// PublicProfile Page (T046)
// Public-facing profile view with integrated PublicProfileView component
// Uses AppearanceSettings to match editor preview exactly

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileService, PublicProfileResponse } from '../services/profileService';
import PublicProfileView from '../components/public-profile/PublicProfileView';
import QRCodeModal from '../components/profile/QRCodeModal';

interface PublicProfileProps { }

export const PublicProfile: React.FC<PublicProfileProps> = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

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

  // Handle QR code display
  const handleViewQR = () => {
    setShowQRModal(true);
  };

  // Handle share
  const handleShare = async () => {
    if (!profile) return;

    const shareData = {
      title: `${profile.displayName}'s Profile`,
      text: profile.headline || `Check out ${profile.displayName}'s profile`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
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

  // Success state - display profile using PublicProfileView
  return (
    <>
      <PublicProfileView
        profile={profileData}
        links={allLinks}
        appearance={profile.appearance}
        onDownloadVCard={handleDownloadVCard}
        onViewQR={handleViewQR}
        onShare={handleShare}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        username={profile.username}
      />
    </>
  );
};
