// T100-T101: SocialLinks Display Component
// Displays featured and custom social links on public profile

import React from 'react';

interface SocialLink {
  id: number;
  platform: string | null;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

interface SocialLinksProps {
  links: SocialLink[];
  layout?: 'horizontal' | 'grid';
  iconSize?: 'small' | 'medium' | 'large';
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ 
  links, 
  layout = 'grid',
  iconSize = 'large'
}) => {
  const [showAll, setShowAll] = React.useState(false);

  if (!links || links.length === 0) {
    return null;
  }

  const featuredLinks = links.filter(l => l.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);
  const customLinks = links.filter(l => !l.isFeatured).sort((a, b) => a.displayOrder - b.displayOrder);

  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'small': return 'w-10 h-10';
      case 'medium': return 'w-12 h-12';
      case 'large': return 'w-16 h-16';
      default: return 'w-16 h-16';
    }
  };

  const getMobileIconSize = () => {
    switch (iconSize) {
      case 'small': return 'w-12 h-12';
      case 'medium': return 'w-14 h-14';
      case 'large': return 'w-16 h-16'; // T101: 60x60px minimum for mobile
      default: return 'w-16 h-16';
    }
  };

  return (
    <div className="w-full">
      {/* Featured Links - Prominent Display */}
      {featuredLinks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Connect With Me
          </h3>
          
          <div className={`
            ${layout === 'grid' 
              ? 'grid grid-cols-3 sm:grid-cols-5 gap-4' 
              : 'flex flex-wrap gap-4 justify-center'
            }
          `}>
            {featuredLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center transition-transform hover:scale-110"
                aria-label={link.platform || link.displayLabel || 'Social link'}
              >
                {/* T101: Large icons for mobile (60x60px = w-16 h-16) */}
                <div className={`
                  ${getMobileIconSize()} md:${getIconSizeClass()}
                  bg-gradient-to-br from-blue-500 to-purple-600 
                  rounded-2xl p-0.5 shadow-lg
                  group-hover:shadow-xl transition-shadow
                `}>
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center p-2">
                    {link.customLogo ? (
                      <img 
                        src={link.customLogo} 
                        alt={link.platform || 'Social link'} 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {(link.platform || link.displayLabel || '?')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Platform name or label */}
                <span className="mt-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center">
                  {link.displayLabel || link.platform || 'Link'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* T102: Custom Links - Expandable "More Links" Section */}
      {customLinks.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
              More Links ({customLinks.length})
            </h3>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${showAll ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAll && (
            <div className="space-y-2 animate-fadeIn">
              {customLinks.map(link => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  {link.customLogo ? (
                    <img 
                      src={link.customLogo} 
                      alt={link.platform || 'Link'} 
                      className="w-8 h-8 rounded"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded flex items-center justify-center text-white text-sm font-bold">
                      {(link.displayLabel || link.platform || '?')[0].toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {link.displayLabel || link.platform || 'Custom Link'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {new URL(link.url).hostname}
                    </div>
                  </div>

                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
