const seoPages = require('../data/seo-pages');

// AI and traditional search engine crawlers
const CRAWLER_USER_AGENTS = [
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'PerplexityBot',
  'Claude-Web',
  'CCBot',
  'anthropic-ai',
  'Google-Extended',
  'Applebot',
  'facebookexternalhit',
  'Slackbot',
  'TwitterBot',
  'LinkedInBot',
  'DuckDuckBot',
  'Baiduspider',
  'YandexBot'
];

/**
 * Checks if the user agent is a crawler
 */
function isCrawler(userAgent) {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some(bot =>
    userAgent.includes(bot)
  );
}

/**
 * SEO Middleware for serving crawler-optimized HTML
 * Detects AI crawlers and serves pre-rendered content with schema
 */
function seoMiddleware(req, res, next) {
  const userAgent = req.headers['user-agent'] || '';

  // Skip for API routes, static assets, and uploads
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/covers') ||
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/music') ||
    req.path.includes('.')  // Skip files with extensions (css, js, images)
  ) {
    return next();
  }

  // Check if this is a crawler
  if (isCrawler(userAgent)) {
    console.log(`🤖 Crawler detected: ${userAgent.substring(0, 50)} - Path: ${req.path}`);

    // Generate crawler-optimized HTML
    const html = generateCrawlerHTML(req.path);

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Robots-Tag', 'index, follow');

    return res.send(html);
  }

  // Regular users continue to SPA
  next();
}

/**
 * Generates SEO-optimized HTML for crawlers
 */
function generateCrawlerHTML(path) {
  // Get page-specific data or use default homepage
  const pageData = seoPages[path] || seoPages['/'];

  if (!pageData) {
    // Fallback for unknown pages
    return generateFallbackHTML(path);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageData.title}</title>
  <meta name="description" content="${pageData.description}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://swazdatarecovery.com${path}" />

  <!-- Open Graph -->
  <meta property="og:title" content="${pageData.title}" />
  <meta property="og:description" content="${pageData.description}" />
  <meta property="og:url" content="https://swazdatarecovery.com${path}" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://swazdatarecovery.com/assets/SwazLogo.webp" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageData.title}" />
  <meta name="twitter:description" content="${pageData.description}" />
  <meta name="twitter:image" content="https://swazdatarecovery.com/assets/SwazLogo.webp" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  ${JSON.stringify(pageData.schema, null, 2)}
  </script>
</head>
<body>
  <main>
    <h1>${pageData.h1}</h1>
    ${pageData.content}
  </main>
</body>
</html>`;
}

/**
 * Fallback HTML for pages without specific SEO data
 */
function generateFallbackHTML(path) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Swaz Solutions - Digital Innovation Platform</title>
  <meta name="description" content="Professional data recovery, AI-powered lyric generation, and digital identity management services in India." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://swazdatarecovery.com${path}" />

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Swaz Solutions",
    "url": "https://swazdatarecovery.com",
    "logo": "https://swazdatarecovery.com/assets/SwazLogo.webp",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9701087446",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Telugu", "Tamil", "Hindi"],
      "areaServed": "IN"
    }
  }
  </script>
</head>
<body>
  <main>
    <h1>Swaz Solutions</h1>
    <p>Professional data recovery services, AI-powered lyric generation, and digital identity management.</p>
  </main>
</body>
</html>`;
}

module.exports = { seoMiddleware, isCrawler };
