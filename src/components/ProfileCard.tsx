// ProfileCard Component (T047)
// Public-facing profile display card

import React from 'react';
import { PublicProfileResponse } from '../services/profileService';
import ContactButton from './ContactButton';

interface ProfileCardProps {
  profile: PublicProfileResponse;
  showActions?: boolean;
  onViewQR?: () => void;
  onShare?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  showActions = true,
  onViewQR,
  onShare,
}) => {
  // T058-T062: Mobile-first optimizations
  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden border border-border">
      {/* Background Banner - T060: Responsive height */}
      <div
        className="h-24 sm:h-32 md:h-40 bg-brand-gradient"
        style={
          profile.theme?.backgroundImage
            ? { backgroundImage: `url(${profile.theme.backgroundImage})`, backgroundSize: 'cover' }
            : undefined
        }
      />

      {/* Profile Header */}
      <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Avatar - T060: Responsive sizing with lazy loading */}
        <div className="absolute -top-12 sm:-top-16 left-4 sm:left-6">
          <div className="relative">
            <img
              src={profile.avatar || '/assets/images/default-avatar.png'}
              alt={`${profile.displayName}'s avatar`}
              loading="lazy"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-surface bg-surface object-cover"
              onError={(e) => {
                e.currentTarget.src = '/assets/images/default-avatar.png';
              }}
            />
            {/* Logo Badge - positioned at bottom right of avatar */}
            {profile.logoUrl && (
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface shadow-lg border-2 border-surface overflow-hidden">
                <img
                  src={profile.logoUrl}
                  alt="Logo"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Name and Info - T058: Mobile-responsive typography */}
        <div className="pt-14 sm:pt-20">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {profile.displayName}
          </h1>

          {profile.pronouns && (
            <p className="text-sm text-muted-foreground mt-1">
              ({profile.pronouns})
            </p>
          )}

          {profile.headline && (
            <p className="text-base sm:text-lg text-primary mt-2">
              {profile.headline}
            </p>
          )}

          {profile.company && (
            <p className="text-md text-secondary mt-1">
              {profile.company}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4">
              <p className="text-primary whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {(profile.publicEmail || profile.publicPhone || profile.website) && (
            <div className="mt-6 space-y-2">
              {profile.publicEmail && (
                <div className="flex items-center text-secondary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a href={`mailto:${profile.publicEmail}`} className="hover:text-accent transition-colors">
                    {profile.publicEmail}
                  </a>
                </div>
              )}

              {profile.publicPhone && (
                <div className="flex items-center text-secondary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a href={`tel:${profile.publicPhone}`} className="hover:text-accent transition-colors">
                    {profile.publicPhone}
                  </a>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center text-secondary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {profile.socialProfiles && profile.socialProfiles.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-primary mb-3">
                Connect with me
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.socialProfiles
                  .filter((link) => link.isFeatured)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                      title={link.platform || undefined}
                    >
                      {link.customLogo && (
                        <img
                          src={link.customLogo}
                          alt={link.platform || 'Social'}
                          className="w-5 h-5 mr-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-sm font-medium text-primary">
                        {link.displayLabel || link.platform}
                      </span>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons - T059: 44x44px touch targets, T062: touch-responsive */}
          {showActions && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {/* ContactButton component (T074-T076) */}
              <ContactButton
                username={profile.username}
                displayName={profile.displayName}
                variant="primary"
                className="w-full sm:flex-1"
              />

              <div className="flex gap-3">
                {onViewQR && (
                  <button
                    onClick={onViewQR}
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] bg-muted text-primary rounded-lg hover:bg-muted/80 transition-all transform active:scale-95 flex items-center justify-center"
                    aria-label="View QR Code"
                  >
                    <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    <span className="hidden sm:inline">QR Code</span>
                  </button>
                )}

                {onShare && (
                  <button
                    onClick={onShare}
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] bg-muted text-primary rounded-lg hover:bg-muted/80 transition-all transform active:scale-95 flex items-center justify-center"
                    aria-label="Share Profile"
                  >
                    <svg className="w-5 h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Share</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
