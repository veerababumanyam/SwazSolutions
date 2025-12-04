// PublicProfile Page (T046)
// Public-facing profile view with integrated ProfileCard component

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { profileService, PublicProfileResponse } from '../services/profileService';
import ProfileCard from '../components/ProfileCard';
import ContactButton from '../components/ContactButton';
import SocialLinks from '../components/public-profile/SocialLinks';
import QRCodeModal from '../components/profile/QRCodeModal';
import { SharePanel } from '../components/profile/SharePanel';

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

  // vCard download now handled by ContactButton component (T074-T076)

  // Handle QR code display (T124-T128)
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

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      // Fallback to clipboard
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

  // Success state - display profile
  // T058: Mobile-first responsive design (320px-1920px)
  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <ProfileCard
            profile={profile}
            showActions={true}
            onViewQR={handleViewQR}
            onShare={handleShare}
          />

          {/* Social Links Display - T101-T102 */}
          {/* T060: Optimized for mobile with touch-friendly sizing */}
          {profile.socialProfiles && profile.socialProfiles.length > 0 && (
            <div className="bg-surface rounded-lg shadow-lg p-4 sm:p-6 border border-border">
              <SocialLinks
                links={profile.socialProfiles}
                layout="grid"
                iconSize="large"
              />
            </div>
          )}

          {/* Share Panel - T134-T139 */}
          <SharePanel
            profileId={profile.id}
            profileUrl={window.location.href}
            title={`${profile.displayName}'s Profile`}
            username={profile.username}
          />

          {/* SEO Meta Tags (will be added via Helmet in Phase 3) */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Profile URL: {window.location.href}</p>
          </div>
        </div>
      </div>

      {/* QR Code Modal (T124-T128) */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        username={profile.username}
      />
    </div>
  );
};
