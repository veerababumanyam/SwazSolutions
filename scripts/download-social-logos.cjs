/**
 * Download Social Media Logos Script
 * Downloads official SVG logos from Simple Icons (simpleicons.org)
 * Run with: node scripts/download-social-logos.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const LOGOS_DIR = path.join(__dirname, '../public/assets/social-logos');

// Simple Icons CDN base URL
const SIMPLE_ICONS_CDN = 'https://cdn.simpleicons.org';

// Mapping of our logo names to Simple Icons slugs
// Simple Icons uses lowercase slugs
const LOGO_MAPPINGS = {
  // Social Media
  'facebook': 'facebook',
  'instagram': 'instagram',
  'twitter': 'twitter',
  'x': 'x',
  'tiktok': 'tiktok',
  'snapchat': 'snapchat',
  'pinterest': 'pinterest',
  'reddit': 'reddit',
  'threads': 'threads',
  'mastodon': 'mastodon',
  'bluesky': 'bluesky',
  'tumblr': 'tumblr',
  'vk': 'vk',
  'weibo': 'sinaweibo',

  // Music & Podcasts
  'spotify': 'spotify',
  'applemusic': 'applemusic',
  'applepodcasts': 'applepodcasts',
  'soundcloud': 'soundcloud',
  'bandcamp': 'bandcamp',
  'deezer': 'deezer',
  'tidal': 'tidal',
  'amazonmusic': 'amazonmusic',
  'youtubemusic': 'youtubemusic',
  'audiomack': 'audiomack',
  'mixcloud': 'mixcloud',
  'lastfm': 'lastdotfm',
  'pandora': 'pandora',
  'iheartradio': 'iheartradio',
  'beatport': 'beatport',
  'genius': 'genius',

  // Video & Streaming
  'youtube': 'youtube',
  'twitch': 'twitch',
  'vimeo': 'vimeo',
  'dailymotion': 'dailymotion',
  'kick': 'kick',
  'rumble': 'rumble',
  'bilibili': 'bilibili',

  // Messaging
  'whatsapp': 'whatsapp',
  'telegram': 'telegram',
  'discord': 'discord',
  'signal': 'signal',
  'messenger': 'messenger',
  'slack': 'slack',
  'wechat': 'wechat',
  'line': 'line',
  'viber': 'viber',
  'kakaotalk': 'kakaotalk',

  // Professional
  'linkedin': 'linkedin',
  'github': 'github',
  'gitlab': 'gitlab',
  'medium': 'medium',
  'substack': 'substack',
  'stackoverflow': 'stackoverflow',
  'devto': 'devdotto',
  'hashnode': 'hashnode',
  'producthunt': 'producthunt',
  'angellist': 'angellist',
  'calendly': 'calendly',
  'linktree': 'linktree',

  // Creative & Portfolio
  'behance': 'behance',
  'dribbble': 'dribbble',
  'artstation': 'artstation',
  'deviantart': 'deviantart',
  'figma': 'figma',
  'codepen': 'codepen',
  'flickr': 'flickr',
  '500px': '500px',
  'unsplash': 'unsplash',

  // Support & Tips
  'patreon': 'patreon',
  'kofi': 'kofi',
  'buymeacoffee': 'buymeacoffee',
  'paypal': 'paypal',
  'venmo': 'venmo',
  'cashapp': 'cashapp',
  'gumroad': 'gumroad',
  'etsy': 'etsy',
  'shopify': 'shopify',

  // Other
  'google': 'google',
  'amazon': 'amazon',
  'ebay': 'ebay',
  'notion': 'notion',
  'yelp': 'yelp',
  'tripadvisor': 'tripadvisor',
};

// Brand colors for the SVGs (optional - can be used with ?color=hex)
const BRAND_COLORS = {
  'facebook': '1877F2',
  'instagram': 'E4405F',
  'twitter': '1DA1F2',
  'x': '000000',
  'tiktok': '000000',
  'linkedin': '0A66C2',
  'youtube': 'FF0000',
  'spotify': '1DB954',
  'discord': '5865F2',
  'telegram': '26A5E4',
  'whatsapp': '25D366',
  'github': '181717',
  'twitch': '9146FF',
  'behance': '1769FF',
  'dribbble': 'EA4C89',
  'medium': '000000',
  'pinterest': 'BD081C',
  'reddit': 'FF4500',
  'snapchat': 'FFFC00',
  'slack': '4A154B',
  'paypal': '00457C',
  'patreon': 'FF424D',
  'soundcloud': 'FF5500',
  'applemusic': 'FA243C',
  'amazon': 'FF9900',
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      reject(err);
    });
  });
}

async function downloadLogos() {
  // Ensure directory exists
  if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR, { recursive: true });
  }

  console.log('Downloading social media logos from Simple Icons...\n');
  
  const results = { success: [], failed: [], skipped: [] };

  for (const [filename, slug] of Object.entries(LOGO_MAPPINGS)) {
    const destPath = path.join(LOGOS_DIR, `${filename}.svg`);
    
    // Skip if file already exists
    if (fs.existsSync(destPath)) {
      results.skipped.push(filename);
      continue;
    }

    // Get color if available
    const color = BRAND_COLORS[filename] || null;
    const url = color 
      ? `${SIMPLE_ICONS_CDN}/${slug}/${color}`
      : `${SIMPLE_ICONS_CDN}/${slug}`;

    try {
      await downloadFile(url, destPath);
      results.success.push(filename);
      console.log(`✓ Downloaded: ${filename}.svg`);
    } catch (error) {
      results.failed.push({ name: filename, error: error.message });
      console.log(`✗ Failed: ${filename}.svg - ${error.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n--- Download Summary ---');
  console.log(`✓ Success: ${results.success.length}`);
  console.log(`○ Skipped (already exist): ${results.skipped.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed downloads:');
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
  }
}

downloadLogos().catch(console.error);
