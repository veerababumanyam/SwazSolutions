// ProfileCard Component (T047)
// Public-facing profile display card

import React from 'react';
import { PublicProfileResponse } from '../services/profileService';
import { Theme } from '../types/theme.types';
import ContactButton from './ContactButton';
import { LazyImage } from './LazyImage';

interface ProfileCardProps {
  profile: PublicProfileResponse;
  showActions?: boolean;
  onViewQR?: () => void;
  onShare?: () => void;
}

// MoreLinksSection - Expandable section for non-featured links
interface MoreLinksSectionProps {
  links: Array<{
    id: number;
    platform: string | null;
    url: string;
    displayLabel: string | null;
    customLogo: string | null;
    isFeatured: boolean;
    displayOrder: number;
  }>;
  linkStyle: React.CSSProperties;
}

const MoreLinksSection: React.FC<MoreLinksSectionProps> = ({ links, linkStyle }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (links.length === 0) return null;

  return (
    <div className="mt-3 sm:mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        {isExpanded ? 'Show less' : `Show ${links.length} more link${links.length > 1 ? 's' : ''}`}
      </button>

      {isExpanded && (
        <div className="mt-2 sm:mt-3 flex flex-wrap gap-2 sm:gap-3">
          {links
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 hover:opacity-80 transition-opacity touch-target min-h-[44px]"
                style={linkStyle}
                title={link.platform || undefined}
              >
                {link.customLogo && (
                  <img
                    src={link.customLogo}
                    alt={link.platform || 'Social'}
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <span className="text-xs sm:text-sm font-medium text-primary">
                  {link.displayLabel || link.platform}
                </span>
              </a>
            ))}
        </div>
      )}
    </div>
  );
};

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  showActions = true,
  onViewQR,
  onShare,
}) => {
  const theme = profile.theme as Theme | undefined;

  // Generate dynamic styles from theme
  const cardStyle: React.CSSProperties = theme ? {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    fontFamily: theme.typography.fontFamily,
  } : {};

  const bannerStyle: React.CSSProperties = theme ? {
    backgroundColor: theme.colors.primary,
    background: theme.wallpaper || theme.colors.primary,
  } : {};

  const avatarStyle: React.CSSProperties = theme ? {
    borderRadius: theme.avatar.shape === 'circle' ? '50%' :
      theme.avatar.shape === 'rounded' ? theme.layout.borderRadius.lg : '0',
    borderWidth: theme.avatar.borderWidth,
    borderColor: theme.avatar.borderColor,
    boxShadow: theme.avatar.shadow,
  } : {};

  const headingStyle: React.CSSProperties = theme ? {
    color: theme.colors.text,
    fontFamily: theme.typography.headingFont,
    fontWeight: theme.typography.fontWeights.bold,
  } : {};

  const textStyle: React.CSSProperties = theme ? {
    color: theme.colors.textSecondary,
  } : {};

  const buttonStyle: React.CSSProperties = theme ? {
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    borderRadius: theme.layout.borderRadius.md,
    boxShadow: theme.layout.shadows.sm,
  } : {};

  const socialLinkStyle: React.CSSProperties = theme ? {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.text,
    borderRadius: theme.layout.borderRadius.md,
  } : {};

  // T058-T062: Mobile-first optimizations
  return (
    <div
      className="bg-surface rounded-lg sm:rounded-xl shadow-lg overflow-hidden border border-border"
      style={cardStyle}
    >
      {/* Background Banner - T060: Responsive height */}
      <div
        className="h-20 sm:h-28 md:h-36 lg:h-40"
        style={bannerStyle}
      />

      {/* Profile Header */}
      <div className="relative px-3 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
        {/* Avatar - T060: Responsive sizing with lazy loading */}
        <div className="absolute -top-10 sm:-top-14 md:-top-16 left-3 sm:left-5 md:left-6">
          <div className="relative">
            <LazyImage
              src={profile.avatar || '/assets/images/default-avatar.png'}
              alt={`${profile.displayName}'s avatar`}
              fallback="/assets/images/default-avatar.png"
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 border-3 sm:border-4 bg-surface object-cover"
              style={avatarStyle}
              priority
            />
            {/* Logo Badge - positioned at bottom right of avatar */}
            {profile.logoUrl && (
              <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 md:-bottom-2 md:-right-2 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-surface shadow-lg border-2 border-surface overflow-hidden">
                <LazyImage
                  src={profile.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            )}
          </div>
        </div>

        {/* Name and Info - T058: Mobile-responsive typography */}
        <div className="pt-12 sm:pt-16 md:pt-20">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary" style={headingStyle}>
            {profile.displayName}
          </h1>

          {profile.pronouns && (
            <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={textStyle}>
              ({profile.pronouns})
            </p>
          )}

          {profile.headline && (
            <p className="text-sm sm:text-base md:text-lg mt-1.5 sm:mt-2" style={headingStyle}>
              {profile.headline}
            </p>
          )}

          {profile.company && (
            <p className="text-sm sm:text-base mt-0.5 sm:mt-1" style={textStyle}>
              {profile.company}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-3 sm:mt-4">
              <p className="whitespace-pre-wrap text-sm sm:text-base" style={textStyle}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {(profile.publicEmail || profile.publicPhone || profile.website) && (
            <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
              {profile.publicEmail && (
                <div className="flex items-center text-secondary">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a href={`mailto:${profile.publicEmail}`} className="hover:text-accent transition-colors text-sm sm:text-base touch-target py-1 truncate">
                    {profile.publicEmail}
                  </a>
                </div>
              )}

              {profile.publicPhone && (
                <div className="flex items-center text-secondary">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a href={`tel:${profile.publicPhone}`} className="hover:text-accent transition-colors text-sm sm:text-base touch-target py-1">
                    {profile.publicPhone}
                  </a>
                </div>
              )}

              {profile.website && (
                <div className="flex items-center text-secondary">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="hover:text-accent transition-colors text-sm sm:text-base touch-target py-1 truncate"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          {profile.socialProfiles && profile.socialProfiles.length > 0 && (
            <div className="mt-4 sm:mt-6">
              {/* Featured Links */}
              {profile.socialProfiles.filter((link) => link.isFeatured).length > 0 && (
                <>
                  <h2 className="text-base sm:text-lg font-semibold text-primary mb-2 sm:mb-3">
                    Connect with me
                  </h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {profile.socialProfiles
                      .filter((link) => link.isFeatured)
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 hover:opacity-80 transition-opacity touch-target min-h-[44px]"
                          style={socialLinkStyle}
                          title={link.platform || undefined}
                        >
                          {link.customLogo && (
                            <img
                              src={link.customLogo}
                              alt={link.platform || 'Social'}
                              className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <span className="text-xs sm:text-sm font-medium text-primary">
                            {link.displayLabel || link.platform}
                          </span>
                        </a>
                      ))}
                  </div>
                </>
              )}

              {/* More Links (non-featured) */}
              {profile.socialProfiles.filter((link) => !link.isFeatured).length > 0 && (
                <MoreLinksSection
                  links={profile.socialProfiles.filter((link) => !link.isFeatured)}
                  linkStyle={socialLinkStyle}
                />
              )}
            </div>
          )}

          {/* Custom Links */}
          {profile.customLinks && profile.customLinks.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h2 className="text-base sm:text-lg font-semibold text-primary mb-2 sm:mb-3">
                More Links
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {profile.customLinks
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 hover:opacity-80 transition-opacity touch-target min-h-[44px]"
                      style={socialLinkStyle}
                      title={link.linkTitle}
                    >
                      {link.customLogoUrl && (
                        <img
                          src={link.customLogoUrl}
                          alt={link.linkTitle}
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <span className="text-xs sm:text-sm font-medium text-primary">
                        {link.linkTitle}
                      </span>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Action Buttons - T059: 44x44px touch targets, T062: touch-responsive */}
          {showActions && (
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {/* ContactButton component (T074-T076) */}
              <ContactButton
                username={profile.username}
                displayName={profile.displayName}
                variant="primary"
                className="w-full sm:flex-1"
              />

              <div className="flex gap-2 sm:gap-3">
                {onViewQR && (
                  <button
                    onClick={onViewQR}
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] hover:opacity-90 transition-all transform active:scale-95 flex items-center justify-center text-sm sm:text-base touch-target"
                    style={buttonStyle}
                    aria-label="View QR Code"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 min-h-[44px] hover:opacity-90 transition-all transform active:scale-95 flex items-center justify-center text-sm sm:text-base touch-target"
                    style={buttonStyle}
                    aria-label="Share Profile"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
