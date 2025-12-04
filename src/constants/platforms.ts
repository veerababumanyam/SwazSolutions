/**
 * Centralized Platform Definitions for Social Links
 * All known platforms with URL patterns and logo paths
 * Grouped by category for better UX
 */

export interface Platform {
  name: string;
  pattern: string;
  logo: string;
  category: PlatformCategory;
}

export type PlatformCategory =
  | 'social'
  | 'music'
  | 'video'
  | 'messaging'
  | 'professional'
  | 'creative'
  | 'support'
  | 'other';

export const PLATFORM_CATEGORIES: Record<PlatformCategory, { label: string; icon: string }> = {
  social: { label: 'Social Media', icon: '👥' },
  music: { label: 'Music & Podcasts', icon: '🎵' },
  video: { label: 'Video & Streaming', icon: '🎬' },
  messaging: { label: 'Messaging', icon: '💬' },
  professional: { label: 'Professional', icon: '💼' },
  creative: { label: 'Creative & Portfolio', icon: '🎨' },
  support: { label: 'Support & Tips', icon: '💝' },
  other: { label: 'Other', icon: '🔗' },
};

export const KNOWN_PLATFORMS: Platform[] = [
  // ========== SOCIAL MEDIA ==========
  { name: 'Facebook', pattern: 'facebook.com', logo: '/assets/social-logos/facebook.svg', category: 'social' },
  { name: 'Instagram', pattern: 'instagram.com', logo: '/assets/social-logos/instagram.svg', category: 'social' },
  { name: 'Twitter', pattern: 'twitter.com', logo: '/assets/social-logos/twitter.svg', category: 'social' },
  { name: 'X', pattern: 'x.com', logo: '/assets/social-logos/x.svg', category: 'social' },
  { name: 'TikTok', pattern: 'tiktok.com', logo: '/assets/social-logos/tiktok.svg', category: 'social' },
  { name: 'Snapchat', pattern: 'snapchat.com', logo: '/assets/social-logos/snapchat.svg', category: 'social' },
  { name: 'Pinterest', pattern: 'pinterest.com', logo: '/assets/social-logos/pinterest.svg', category: 'social' },
  { name: 'Reddit', pattern: 'reddit.com', logo: '/assets/social-logos/reddit.svg', category: 'social' },
  { name: 'Threads', pattern: 'threads.net', logo: '/assets/social-logos/threads.svg', category: 'social' },
  { name: 'Bluesky', pattern: 'bsky.app', logo: '/assets/social-logos/bluesky.svg', category: 'social' },
  { name: 'Mastodon', pattern: 'mastodon.', logo: '/assets/social-logos/mastodon.svg', category: 'social' },
  { name: 'Tumblr', pattern: 'tumblr.com', logo: '/assets/social-logos/tumblr.svg', category: 'social' },
  { name: 'VK', pattern: 'vk.com', logo: '/assets/social-logos/vk.svg', category: 'social' },
  { name: 'Weibo', pattern: 'weibo.com', logo: '/assets/social-logos/weibo.svg', category: 'social' },

  // ========== MUSIC & PODCASTS ==========
  { name: 'Spotify', pattern: 'spotify.com', logo: '/assets/social-logos/spotify.svg', category: 'music' },
  { name: 'Apple Music', pattern: 'music.apple.com', logo: '/assets/social-logos/applemusic.svg', category: 'music' },
  { name: 'Apple Podcasts', pattern: 'podcasts.apple.com', logo: '/assets/social-logos/applepodcasts.svg', category: 'music' },
  { name: 'SoundCloud', pattern: 'soundcloud.com', logo: '/assets/social-logos/soundcloud.svg', category: 'music' },
  { name: 'Bandcamp', pattern: 'bandcamp.com', logo: '/assets/social-logos/bandcamp.svg', category: 'music' },
  { name: 'Tidal', pattern: 'tidal.com', logo: '/assets/social-logos/tidal.svg', category: 'music' },
  { name: 'YouTube Music', pattern: 'music.youtube.com', logo: '/assets/social-logos/youtubemusic.svg', category: 'music' },
  { name: 'Audiomack', pattern: 'audiomack.com', logo: '/assets/social-logos/audiomack.svg', category: 'music' },
  { name: 'Mixcloud', pattern: 'mixcloud.com', logo: '/assets/social-logos/mixcloud.svg', category: 'music' },
  { name: 'Last.fm', pattern: 'last.fm', logo: '/assets/social-logos/lastfm.svg', category: 'music' },
  { name: 'Pandora', pattern: 'pandora.com', logo: '/assets/social-logos/pandora.svg', category: 'music' },
  { name: 'iHeartRadio', pattern: 'iheart.com', logo: '/assets/social-logos/iheartradio.svg', category: 'music' },
  { name: 'Beatport', pattern: 'beatport.com', logo: '/assets/social-logos/beatport.svg', category: 'music' },
  { name: 'Genius', pattern: 'genius.com', logo: '/assets/social-logos/genius.svg', category: 'music' },

  // ========== VIDEO & STREAMING ==========
  { name: 'YouTube', pattern: 'youtube.com', logo: '/assets/social-logos/youtube.svg', category: 'video' },
  { name: 'Twitch', pattern: 'twitch.tv', logo: '/assets/social-logos/twitch.svg', category: 'video' },
  { name: 'Vimeo', pattern: 'vimeo.com', logo: '/assets/social-logos/vimeo.svg', category: 'video' },
  { name: 'Dailymotion', pattern: 'dailymotion.com', logo: '/assets/social-logos/dailymotion.svg', category: 'video' },
  { name: 'Kick', pattern: 'kick.com', logo: '/assets/social-logos/kick.svg', category: 'video' },
  { name: 'Rumble', pattern: 'rumble.com', logo: '/assets/social-logos/rumble.svg', category: 'video' },
  { name: 'Bilibili', pattern: 'bilibili.com', logo: '/assets/social-logos/bilibili.svg', category: 'video' },

  // ========== MESSAGING ==========
  { name: 'WhatsApp', pattern: 'wa.me', logo: '/assets/social-logos/whatsapp.svg', category: 'messaging' },
  { name: 'Telegram', pattern: 't.me', logo: '/assets/social-logos/telegram.svg', category: 'messaging' },
  { name: 'Discord', pattern: 'discord.', logo: '/assets/social-logos/discord.svg', category: 'messaging' },
  { name: 'Signal', pattern: 'signal.org', logo: '/assets/social-logos/signal.svg', category: 'messaging' },
  { name: 'Messenger', pattern: 'messenger.com', logo: '/assets/social-logos/messenger.svg', category: 'messaging' },
  { name: 'Slack', pattern: 'slack.com', logo: '/assets/social-logos/slack.svg', category: 'messaging' },
  { name: 'WeChat', pattern: 'wechat.com', logo: '/assets/social-logos/wechat.svg', category: 'messaging' },
  { name: 'Line', pattern: 'line.me', logo: '/assets/social-logos/line.svg', category: 'messaging' },
  { name: 'Viber', pattern: 'viber.com', logo: '/assets/social-logos/viber.svg', category: 'messaging' },
  { name: 'KakaoTalk', pattern: 'kakao.com', logo: '/assets/social-logos/kakaotalk.svg', category: 'messaging' },
  { name: 'Zoom', pattern: 'zoom.us', logo: '/assets/social-logos/zoom.svg', category: 'messaging' },
  { name: 'Google Meet', pattern: 'meet.google.com', logo: '/assets/social-logos/googlemeet.svg', category: 'messaging' },

  // ========== PROFESSIONAL ==========
  { name: 'LinkedIn', pattern: 'linkedin.com', logo: '/assets/social-logos/linkedin.svg', category: 'professional' },
  { name: 'GitHub', pattern: 'github.com', logo: '/assets/social-logos/github.svg', category: 'professional' },
  { name: 'GitLab', pattern: 'gitlab.com', logo: '/assets/social-logos/gitlab.svg', category: 'professional' },
  { name: 'Bitbucket', pattern: 'bitbucket.org', logo: '/assets/social-logos/bitbucket.svg', category: 'professional' },
  { name: 'Medium', pattern: 'medium.com', logo: '/assets/social-logos/medium.svg', category: 'professional' },
  { name: 'Substack', pattern: 'substack.com', logo: '/assets/social-logos/substack.svg', category: 'professional' },
  { name: 'Stack Overflow', pattern: 'stackoverflow.com', logo: '/assets/social-logos/stackoverflow.svg', category: 'professional' },
  { name: 'Dev.to', pattern: 'dev.to', logo: '/assets/social-logos/devto.svg', category: 'professional' },
  { name: 'Hashnode', pattern: 'hashnode.com', logo: '/assets/social-logos/hashnode.svg', category: 'professional' },
  { name: 'Product Hunt', pattern: 'producthunt.com', logo: '/assets/social-logos/producthunt.svg', category: 'professional' },
  { name: 'AngelList', pattern: 'angel.co', logo: '/assets/social-logos/angellist.svg', category: 'professional' },
  { name: 'Calendly', pattern: 'calendly.com', logo: '/assets/social-logos/calendly.svg', category: 'professional' },
  { name: 'Linktree', pattern: 'linktr.ee', logo: '/assets/social-logos/linktree.svg', category: 'professional' },
  { name: 'Glassdoor', pattern: 'glassdoor.com', logo: '/assets/social-logos/glassdoor.svg', category: 'professional' },
  { name: 'Indeed', pattern: 'indeed.com', logo: '/assets/social-logos/indeed.svg', category: 'professional' },
  { name: 'Upwork', pattern: 'upwork.com', logo: '/assets/social-logos/upwork.svg', category: 'professional' },
  { name: 'Fiverr', pattern: 'fiverr.com', logo: '/assets/social-logos/fiverr.svg', category: 'professional' },
  { name: 'Crunchbase', pattern: 'crunchbase.com', logo: '/assets/social-logos/crunchbase.svg', category: 'professional' },
  { name: 'HackerRank', pattern: 'hackerrank.com', logo: '/assets/social-logos/hackerrank.svg', category: 'professional' },
  { name: 'LeetCode', pattern: 'leetcode.com', logo: '/assets/social-logos/leetcode.svg', category: 'professional' },
  { name: 'Kaggle', pattern: 'kaggle.com', logo: '/assets/social-logos/kaggle.svg', category: 'professional' },
  { name: 'Replit', pattern: 'replit.com', logo: '/assets/social-logos/replit.svg', category: 'professional' },
  { name: 'npm', pattern: 'npmjs.com', logo: '/assets/social-logos/npm.svg', category: 'professional' },
  { name: 'PyPI', pattern: 'pypi.org', logo: '/assets/social-logos/pypi.svg', category: 'professional' },

  // ========== CREATIVE & PORTFOLIO ==========
  { name: 'Behance', pattern: 'behance.net', logo: '/assets/social-logos/behance.svg', category: 'creative' },
  { name: 'Dribbble', pattern: 'dribbble.com', logo: '/assets/social-logos/dribbble.svg', category: 'creative' },
  { name: 'ArtStation', pattern: 'artstation.com', logo: '/assets/social-logos/artstation.svg', category: 'creative' },
  { name: 'DeviantArt', pattern: 'deviantart.com', logo: '/assets/social-logos/deviantart.svg', category: 'creative' },
  { name: 'Figma', pattern: 'figma.com', logo: '/assets/social-logos/figma.svg', category: 'creative' },
  { name: 'Flickr', pattern: 'flickr.com', logo: '/assets/social-logos/flickr.svg', category: 'creative' },
  { name: '500px', pattern: '500px.com', logo: '/assets/social-logos/500px.svg', category: 'creative' },
  { name: 'Unsplash', pattern: 'unsplash.com', logo: '/assets/social-logos/unsplash.svg', category: 'creative' },

  // ========== SUPPORT & TIPS ==========
  { name: 'Patreon', pattern: 'patreon.com', logo: '/assets/social-logos/patreon.svg', category: 'support' },
  { name: 'Ko-fi', pattern: 'ko-fi.com', logo: '/assets/social-logos/kofi.svg', category: 'support' },
  { name: 'Buy Me a Coffee', pattern: 'buymeacoffee.com', logo: '/assets/social-logos/buymeacoffee.svg', category: 'support' },
  { name: 'PayPal', pattern: 'paypal.', logo: '/assets/social-logos/paypal.svg', category: 'support' },
  { name: 'Venmo', pattern: 'venmo.com', logo: '/assets/social-logos/venmo.svg', category: 'support' },
  { name: 'Cash App', pattern: 'cash.app', logo: '/assets/social-logos/cashapp.svg', category: 'support' },
  { name: 'Gumroad', pattern: 'gumroad.com', logo: '/assets/social-logos/gumroad.svg', category: 'support' },
  { name: 'Etsy', pattern: 'etsy.com', logo: '/assets/social-logos/etsy.svg', category: 'support' },
  { name: 'Shopify', pattern: 'shopify.com', logo: '/assets/social-logos/shopify.svg', category: 'support' },
  { name: 'Stripe', pattern: 'stripe.com', logo: '/assets/social-logos/stripe.svg', category: 'support' },

  // ========== OTHER / GENERAL ==========
  { name: 'Google', pattern: 'google.com', logo: '/assets/social-logos/google.svg', category: 'other' },
  { name: 'eBay', pattern: 'ebay.', logo: '/assets/social-logos/ebay.svg', category: 'other' },
  { name: 'Notion', pattern: 'notion.so', logo: '/assets/social-logos/notion.svg', category: 'other' },
  { name: 'Yelp', pattern: 'yelp.com', logo: '/assets/social-logos/yelp.svg', category: 'other' },
  { name: 'TripAdvisor', pattern: 'tripadvisor.com', logo: '/assets/social-logos/tripadvisor.svg', category: 'other' },
  { name: 'Steam', pattern: 'steamcommunity.com', logo: '/assets/social-logos/steam.svg', category: 'other' },
  { name: 'PlayStation', pattern: 'playstation.com', logo: '/assets/social-logos/playstation.svg', category: 'other' },
  { name: 'Epic Games', pattern: 'epicgames.com', logo: '/assets/social-logos/epicgames.svg', category: 'other' },
  { name: 'Battle.net', pattern: 'battle.net', logo: '/assets/social-logos/battlenet.svg', category: 'other' },
  { name: 'Roblox', pattern: 'roblox.com', logo: '/assets/social-logos/roblox.svg', category: 'other' },
  { name: 'Itch.io', pattern: 'itch.io', logo: '/assets/social-logos/itchio.svg', category: 'other' },
];

/**
 * Get platforms grouped by category
 */
export const getPlatformsByCategory = (): Record<PlatformCategory, Platform[]> => {
  const grouped: Record<PlatformCategory, Platform[]> = {
    social: [],
    music: [],
    video: [],
    messaging: [],
    professional: [],
    creative: [],
    support: [],
    other: [],
  };

  for (const platform of KNOWN_PLATFORMS) {
    grouped[platform.category].push(platform);
  }

  return grouped;
};

/**
 * Detect platform from URL
 */
export const detectPlatformFromUrl = (url: string): Platform | null => {
  const lowerUrl = url.toLowerCase();
  for (const platform of KNOWN_PLATFORMS) {
    if (lowerUrl.includes(platform.pattern)) {
      return platform;
    }
  }
  return null;
};

/**
 * Default logo for unknown platforms
 */
export const DEFAULT_LOGO = '/assets/social-logos/default-link.svg';
