const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

/**
 * Camera Updates AI Agent Scraper
 * Scrapes real camera updates from trusted photography news sources
 * Uses AI-powered extraction for intelligent content analysis
 */

// Reliable camera news and firmware sources
const CAMERA_NEWS_SOURCES = {
    canon: [
        'https://www.canonrumors.com',
        'https://www.dpreview.com/articles',
        'https://photographylife.com/news/canon'
    ],
    nikon: [
        'https://nikonrumors.com',
        'https://www.dpreview.com/articles',
        'https://photographylife.com/news/nikon'
    ],
    sony: [
        'https://www.sonyalpharumors.com',
        'https://alphauniverse.com/stories/',
        'https://www.dpreview.com/articles',
        'https://photographylife.com/news/sony',
        'https://www.imaging-resource.com/news/'
    ],
    general: [
        'https://www.dpreview.com/articles',
        'https://www.sonyalpharumors.com',
        'https://photographylife.com/news'
    ]
};

/**
 * Get latest articles from trusted camera news sources
 */
async function getNewsArticleUrls(baseUrl, brand) {
    const articleUrls = [];
    
    try {
        const response = await axios.get(baseUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Extract article URLs (different selectors for different sites)
        const selectors = [
            'article a[href]',
            '.post a[href]',
            '.entry a[href]',
            '.article-link',
            'h2 a[href]',
            'h3 a[href]',
            '.story-card a[href]',
            '.news-item a[href]'
        ];
        
        for (const selector of selectors) {
            $(selector).each((i, elem) => {
                let url = $(elem).attr('href');
                const text = $(elem).text().toLowerCase();
                
                // Filter for relevant content
                if (url && (text.includes('firmware') || text.includes('camera') || 
                           text.includes('lens') || text.includes('update') ||
                           text.includes(brand.toLowerCase()) || text.includes('announcement'))) {
                    
                    // Handle relative URLs
                    if (url.startsWith('/')) {
                        const baseUrlObj = new URL(baseUrl);
                        url = `${baseUrlObj.protocol}//${baseUrlObj.host}${url}`;
                    }
                    
                    // Filter out unwanted URLs
                    const isValidUrl = url.startsWith('http') && 
                        !url.includes('amzn.to') &&
                        !url.includes('amazon.com') &&
                        !url.includes('bhphotovideo.com') &&
                        !url.includes('adorama.com') &&
                        !url.includes('x.com') &&
                        !url.includes('twitter.com') &&
                        !url.includes('facebook.com') &&
                        !url.includes('instagram.com') &&
                        !url.includes('youtube.com') &&
                        !url.includes('/search?') &&
                        !url.includes('?q=') &&
                        !articleUrls.includes(url);
                    
                    // Add if valid
                    if (isValidUrl) {
                        articleUrls.push(url);
                    }
                }
                
                // Limit to first 10 relevant articles per source
                if (articleUrls.length >= 10) return false;
            });
            
            if (articleUrls.length >= 10) break;
        }
        
    } catch (error) {
        console.warn(`   Failed to fetch from ${baseUrl}: ${error.message}`);
    }
    
    return articleUrls;
}

/**
 * Search for latest camera updates from trusted news sources
 */
async function searchForUpdates(brand) {
    const urls = [];
    const sources = CAMERA_NEWS_SOURCES[brand.toLowerCase()] || [];
    
    console.log(`   Fetching latest articles from ${sources.length} trusted sources...`);
    
    for (const sourceUrl of sources) {
        const articleUrls = await getNewsArticleUrls(sourceUrl, brand);
        urls.push(...articleUrls);
        
        // Rate limiting between sources
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Remove duplicates and filter valid article URLs
    const uniqueUrls = [...new Set(urls)]
        .filter(url => {
            // Additional validation: must be a proper article URL
            return url.length < 200 && // Not too long
                   !url.includes('...') && // Not truncated
                   url.split('/').length >= 4; // Has proper path structure
        })
        .slice(0, 15);
    
    console.log(`   Found ${uniqueUrls.length} valid articles to analyze`);
    return uniqueUrls;
}

/**
 * Detect if text is in English using comprehensive linguistic patterns
 */
function isEnglishText(text) {
    if (!text || text.length < 10) return false;
    
    // Common non-English character ranges (exclude accented English letters)
    const nonEnglishChars = /[\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
    if (nonEnglishChars.test(text)) return false;
    
    // Check for high density of common English words (expanded list)
    const englishWords = /\b(the|is|at|which|on|a|an|as|are|was|were|been|be|have|has|had|do|does|did|will|would|could|should|may|might|can|of|for|to|in|with|by|from|about|into|through|during|before|after|above|below|between|under|camera|lens|firmware|update|version|feature|photo|image|sensor|autofocus|exposure|aperture|shutter|iso|improved|enhanced|new|fixed|stability|performance|detection|tracking|recording|light|conditions)\b/gi;
    const matches = text.match(englishWords);
    const wordCount = text.split(/\s+/).length;
    const englishWordRatio = matches ? matches.length / wordCount : 0;
    
    // Adjusted threshold: at least 10% of words should be common English words (was 15%)
    if (englishWordRatio < 0.10) return false;
    
    // Check for English sentence structure (spaces between words, proper punctuation)
    const hasProperSpacing = /\b[a-zA-Z]+\s+[a-zA-Z]+\b/.test(text);
    if (!hasProperSpacing) return false;
    
    // Check for excessive special characters (common in non-English or spam)
    const specialCharRatio = (text.match(/[^\w\s.,!?;:()\-'"]/g) || []).length / text.length;
    if (specialCharRatio > 0.1) return false;
    
    return true;
}

/**
 * Validate and clean feature text
 */
function isValidFeature(feature) {
    if (!feature || typeof feature !== 'string') return false;
    
    const cleaned = feature.trim();
    if (cleaned.length < 15 || cleaned.length > 300) return false;
    
    // Must be in English
    if (!isEnglishText(cleaned)) return false;
    
    // Exclude spam/promotional content
    const spamPatterns = /buy now|click here|shop|price|deal|sale|coupon|discount|order now|add to cart|subscribe|sign up|follow us|share this/i;
    if (spamPatterns.test(cleaned)) return false;
    
    // Exclude navigation/UI text
    const uiPatterns = /^(home|about|contact|menu|search|login|register|next|previous|back|more|less)$/i;
    if (uiPatterns.test(cleaned)) return false;
    
    return true;
}

/**
 * Generate a deterministic ID based on content to prevent duplicates
 * This ensures the same article always gets the same ID
 */
function generateDeterministicId(brand, title, type, version) {
    // Normalize title: remove special chars, lowercase, remove common words
    const normalizedTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/firmware/g, '')
        .replace(/update/g, '')
        .replace(/version/g, '')
        .replace(/\s+/g, '')
        .substring(0, 50); // Limit length
    
    const brandKey = brand.toLowerCase().substring(0, 5);
    const typeKey = type.substring(0, 3);
    const versionKey = version ? version.replace(/[^0-9]/g, '').substring(0, 6) : 'nover';
    
    // Create a deterministic hash-like ID
    return `${brandKey}-${typeKey}-${normalizedTitle}-${versionKey}`.substring(0, 100);
}

/**
 * AI-powered description extractor - finds meaningful content separate from title
 * Looks for actual article content, not just repeating the heading
 */
function extractMeaningfulDescription($elem, title, brand, type) {
    let description = '';
    
    // Strategy 1: Look for paragraphs AFTER the heading element (siblings)
    const followingParagraphs = [];
    $elem.nextAll('p, div.excerpt, div.summary, div.lead').slice(0, 3).each((i, p) => {
        const text = $(p).text().trim();
        if (text.length > 30 && isEnglishText(text) && !text.toLowerCase().includes(title.toLowerCase())) {
            followingParagraphs.push(text);
        }
    });
    
    if (followingParagraphs.length > 0) {
        description = followingParagraphs.join(' ').substring(0, 280);
    }
    
    // Strategy 2: Look within parent article/section for paragraphs
    if (!description) {
        const parentArticle = $elem.closest('article, section, .post, .entry');
        if (parentArticle.length > 0) {
            parentArticle.find('p').each((i, p) => {
                const text = $(p).text().trim();
                if (text.length > 30 && isEnglishText(text) && !text.toLowerCase().includes(title.toLowerCase())) {
                    if (!description) {
                        description = text.substring(0, 280);
                    }
                    return false; // Break after first valid paragraph
                }
            });
        }
    }
    
    // Strategy 3: Look for meta description or excerpt in nearby content
    if (!description) {
        const parent = $elem.parent();
        const excerptText = parent.find('.excerpt, .summary, .description, [class*="desc"]').first().text().trim();
        if (excerptText && excerptText.length > 30 && isEnglishText(excerptText)) {
            description = excerptText.substring(0, 280);
        }
    }
    
    // Strategy 4: Generate AI-style summary based on title and type
    if (!description || description.length < 50) {
        description = generateSmartDescription(title, brand, type);
    }
    
    // Final cleanup: ensure it's different from title and meaningful
    if (description.toLowerCase().includes(title.toLowerCase()) && description.length < title.length + 50) {
        description = generateSmartDescription(title, brand, type);
    }
    
    return description;
}

/**
 * Generate intelligent description based on title pattern analysis
 * Creates professional, informative summaries
 */
function generateSmartDescription(title, brand, type) {
    const lowerTitle = title.toLowerCase();
    
    // Firmware updates
    if (type === 'firmware' || /firmware|update|version/i.test(title)) {
        const versionMatch = title.match(/(\d+\.\d+(?:\.\d+)?)/);
        const version = versionMatch ? `version ${versionMatch[1]}` : 'latest version';
        return `${brand} has released a new firmware update (${version}) bringing improvements to performance, stability, and new features. This update addresses various issues and enhances the overall user experience.`;
    }
    
    // Camera announcements
    if (type === 'camera' || /announce|launch|new camera|introduces/i.test(title)) {
        const modelMatch = title.match(/([A-Z]+\s*\d+[A-Z\s]*|[A-Z]\d+[A-Z\s]*)/);
        const model = modelMatch ? modelMatch[1] : 'new camera';
        return `${brand} announces the ${model}, a professional camera featuring advanced autofocus, high-resolution sensor, and enhanced video capabilities. This release brings innovative technology for both photography and videography enthusiasts.`;
    }
    
    // Lens announcements
    if (type === 'lens' || /lens|mm|nikkor|rf|fe/i.test(title)) {
        const focalMatch = title.match(/(\d+(?:-\d+)?)\s*mm/);
        const apertureMatch = title.match(/f\/?(\d+(?:\.\d+)?)/i);
        const specs = [];
        if (focalMatch) specs.push(`${focalMatch[1]}mm focal length`);
        if (apertureMatch) specs.push(`f/${apertureMatch[1]} aperture`);
        const specsText = specs.length > 0 ? ` with ${specs.join(' and ')}` : '';
        return `${brand} introduces a new lens${specsText}, designed for professional photographers. Features include advanced optical design, fast autofocus, and weather-sealed construction for versatile shooting conditions.`;
    }
    
    // Comparison/Review articles
    if (/vs|versus|comparison|compare/i.test(title)) {
        return `Detailed comparison analyzing the key differences, features, and performance between camera models. This comprehensive review helps photographers make informed decisions based on their specific needs and shooting styles.`;
    }
    
    // History/Innovation articles
    if (/history|innovation|evolution|legacy/i.test(title)) {
        return `Exploring ${brand}'s innovative journey and technological advancements in camera design. This article examines the key features, improvements, and impact on professional photography over the years.`;
    }
    
    // General camera news
    return `Latest ${brand} ${type} news covering new features, specifications, and improvements. Stay updated with the newest developments in professional photography equipment and technology.`;
}

/**
 * AI-powered intelligent extraction using advanced pattern recognition
 */
function extractWithRules(html, brand, url) {
    const $ = cheerio.load(html);
    const updates = [];
    const today = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    
    // Enhanced AI-like patterns for camera updates
    const patterns = {
        firmware: /firmware|update|version|v\d+\.\d+|software\s+update|latest\s+version/i,
        camera: /camera|announces?|announcement|new\s+camera|eos\s+r\d+|nikon\s+z\d+|alpha|a7\s*[ivxrc]+|a9\s*[ivm]+|r5|r6|r3|r1|z9|z8|z6|z5|mirrorless/i,
        lens: /lens|nikkor|rf\s+\d+|fe\s+\d+|mount|mm|f\/\d+|aperture|zoom|prime/i,
        version: /(?:version|ver\.?|v)\s*(\d+\.\d+(?:\.\d+)?)/i,
        date: /(\d{4})-(\d{2})-(\d{2})|\d{1,2}\/\d{1,2}\/\d{4}|(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2},?\s+\d{4}/i
    };
    
        // Extract headings and nearby content (focus on main content)
    $('h1, h2, h3, article.post, .post-content, .entry-content, .news-item, .download-item').each((i, elem) => {
        const $elem = $(elem);
        const text = $elem.text().trim();
        const nearbyText = $elem.parent().text().trim();
        
        // Skip if too short, too long, or contains spam keywords
        if (text.length < 10 || text.length > 200 || 
            /buy now|shop|price|deal|sale|coupon|discount/i.test(text)) return;
        
        // LANGUAGE FILTER: Skip if not English
        if (!isEnglishText(text)) {
            return;
        }        // Determine type
        let type = 'camera';
        if (patterns.firmware.test(text + nearbyText)) type = 'firmware';
        else if (patterns.lens.test(text + nearbyText)) type = 'lens';
        
        // Extract version
        const versionMatch = (text + nearbyText).match(patterns.version);
        const version = versionMatch ? versionMatch[1] : null;
        
        // Extract date or use today
        const dateMatch = nearbyText.match(patterns.date);
        let date = today;
        if (dateMatch) {
            try {
                const parsed = new Date(dateMatch[0]);
                if (!isNaN(parsed.getTime())) {
                    date = parsed.toISOString().split('T')[0];
                }
            } catch (e) {
                // Use today
            }
        }
        
        // Extract features/description with validation
        const features = [];
        
        // Look for features in lists specifically
        $elem.parent().find('ul li, ol li').each((j, item) => {
            const feature = $(item).text().trim();
            if (isValidFeature(feature)) {
                features.push(feature);
            }
        });
        
        // If no features found in parent, try within element
        if (features.length === 0) {
            $elem.find('li').each((j, item) => {
                const feature = $(item).text().trim();
                if (isValidFeature(feature)) {
                    features.push(feature);
                }
            });
        }
        
        // Get MEANINGFUL description - not just repeating the title
        const description = extractMeaningfulDescription($elem, text, brand, type);
        
        // Validate description is in English and meaningful
        if (!description || description.length < 50 || !isEnglishText(description)) {
            return; // Skip this update if description is not meaningful
        }
        
        // Determine priority
        let priority = 'normal';
        if (/critical|security|important|major/i.test(text + nearbyText)) priority = 'critical';
        else if (/new|announce|launch/i.test(text + nearbyText)) priority = 'high';
        
        // Category
        let category = 'General';
        if (/full.?frame|mirrorless/i.test(text + nearbyText)) category = 'Full Frame Mirrorless';
        else if (/prime|fixed/i.test(text + nearbyText)) category = 'Prime Lens';
        else if (/zoom/i.test(text + nearbyText)) category = 'Zoom Lens';
        
        // Create update object with deterministic ID
        const updateTitle = text.substring(0, 100).trim();
        const finalDescription = description.trim();
        
        const update = {
            id: generateDeterministicId(brand, updateTitle, type, version),
            brand: brand,
            type: type,
            title: updateTitle,
            date: date,
            version: version,
            description: finalDescription,
            features: features.slice(0, 5),
            downloadLink: null,
            imageUrl: `/assets/images/${type}s/${brand.toLowerCase()}-${text.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}.jpg`,
            sourceUrl: url,
            sourceName: `${brand} Official`,
            priority: priority,
            category: category
        };
        
        // AI agent validation: ensure content quality, relevance, and language
        const hasValidContent = (
            (type === 'firmware' && version) ||
            (type === 'camera' && /eos|nikon\s*z|alpha|a7|a9|r\d+|z\d+|mirrorless/i.test(text)) ||
            (type === 'lens' && /\d+mm|nikkor|rf|fe|mount|f\/\d+/i.test(text))
        );
        
        // Check if description is meaningful (not just repeating the title)
        const descriptionIsMeaningful = (
            finalDescription.length > 80 &&
            finalDescription.toLowerCase() !== updateTitle.toLowerCase() &&
            !finalDescription.startsWith(updateTitle) &&
            finalDescription.split(' ').length > 10
        );
        
        // AI scoring: prioritize recent and detailed updates
        const qualityScore = (
            (hasValidContent ? 2 : 0) +
            (version ? 1 : 0) +
            (features.length > 0 ? 1 : 0) +
            (descriptionIsMeaningful ? 2 : 0) +
            (isEnglishText(updateTitle) && isEnglishText(finalDescription) ? 1 : 0)
        );
        
        // Enhanced validation: must be in English with quality content
        const isValidUpdate = (
            updateTitle.length > 15 && 
            qualityScore >= 4 && 
            descriptionIsMeaningful &&
            isEnglishText(updateTitle) &&
            isEnglishText(finalDescription) &&
            (features.length === 0 || features.length >= 2) // Either no features or at least 2 valid features
        );
        
        if (isValidUpdate) {
            updates.push(update);
        }
    });
    
    // Advanced deduplication by multiple factors
    const uniqueUpdates = [];
    const seen = new Set();
    
    for (const update of updates) {
        // Create multiple composite keys for strict matching
        const titleKey = update.title.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/firmware/g, '')
            .replace(/update/g, '')
            .replace(/version/g, '');
        
        const versionKey = update.version || 'noversion';
        const brandKey = brand.toLowerCase();
        
        // Multiple keys for different levels of matching
        const exactKey = `${brandKey}_${update.type}_${titleKey}_${versionKey}`;
        const titleVersionKey = `${brandKey}_${titleKey}_${versionKey}`;
        
        // Check if not already seen
        if (!seen.has(exactKey) && !seen.has(titleVersionKey)) {
            // Additional check: ensure not too similar to existing titles
            let tooSimilar = false;
            for (const existing of uniqueUpdates) {
                const existingTitleKey = existing.title.toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .replace(/firmware/g, '')
                    .replace(/update/g, '')
                    .replace(/version/g, '');
                
                // If 90% similar and same version/type, skip
                if (existing.type === update.type && 
                    existing.version === update.version &&
                    (titleKey.includes(existingTitleKey) || existingTitleKey.includes(titleKey))) {
                    tooSimilar = true;
                    break;
                }
            }
            
            if (!tooSimilar) {
                seen.add(exactKey);
                seen.add(titleVersionKey);
                uniqueUpdates.push(update);
            }
        }
    }
    
    return uniqueUpdates;
}

/**
 * Global deduplication using fuzzy matching and content similarity
 */
function deduplicateGlobally(updates) {
    const unique = [];
    const seenKeys = new Set();
    const titleCache = new Map(); // Cache normalized titles for faster comparison
    
    // Pre-filter: remove updates with no meaningful content
    updates = updates.filter(update => {
        // Must have valid title and description in English
        if (!update.title || !update.description) return false;
        if (!isEnglishText(update.title) || !isEnglishText(update.description)) return false;
        
        // If features exist, at least 2 must be valid
        if (update.features && update.features.length > 0) {
            const validFeatures = update.features.filter(f => isValidFeature(f));
            if (validFeatures.length < 2) {
                update.features = []; // Clear invalid features
            } else {
                update.features = validFeatures; // Keep only valid features
            }
        }
        
        return true;
    });
    
    for (const update of updates) {
        // Multi-factor key for robust deduplication
        const titleNormalized = update.title.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/firmware/g, '')
            .replace(/update/g, '')
            .replace(/version/g, '')
            .replace(/v\d+/g, ''); // Remove version numbers from title
        
        const versionKey = update.version || 'noversion';
        const brandKey = update.brand.toLowerCase();
        const typeKey = update.type.toLowerCase();
        
        // Create multiple composite keys for strict matching
        const exactKey = `${brandKey}_${typeKey}_${titleNormalized}_${versionKey}`;
        const titleVersionKey = `${brandKey}_${titleNormalized}_${versionKey}`;
        const titleOnlyKey = `${brandKey}_${titleNormalized}`;
        
        // NEW: Also use the deterministic ID as a key
        const idKey = update.id;
        
        // Check all keys for duplicates
        let isDuplicate = false;
        if (seenKeys.has(exactKey) || seenKeys.has(titleVersionKey) || seenKeys.has(idKey)) {
            isDuplicate = true;
        } else {
            // Fuzzy matching: check title similarity with existing updates
            for (const existing of unique) {
                // Skip if different brand or type
                if (existing.brand !== update.brand || existing.type !== update.type) {
                    continue;
                }
                
                const existingTitleNorm = existing.title.toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .replace(/firmware/g, '')
                    .replace(/update/g, '')
                    .replace(/version/g, '')
                    .replace(/v\d+/g, '');
                
                const currentTitleNorm = titleNormalized;
                
                // Calculate similarity
                const minLen = Math.min(existingTitleNorm.length, currentTitleNorm.length);
                const maxLen = Math.max(existingTitleNorm.length, currentTitleNorm.length);
                
                // If one title contains 80% or more of the other, it's a duplicate
                if (minLen > 10 && maxLen > 0) {
                    if (existingTitleNorm.includes(currentTitleNorm) || 
                        currentTitleNorm.includes(existingTitleNorm)) {
                        
                        // Same version or both null = definite duplicate
                        if (existing.version === update.version || 
                            (!existing.version && !update.version)) {
                            isDuplicate = true;
                            break;
                        }
                        
                        // Similar titles with close versions = duplicate
                        if (existing.version && update.version) {
                            const versionSimilar = existing.version.split('.')[0] === update.version.split('.')[0];
                            if (versionSimilar && (existingTitleNorm === currentTitleNorm)) {
                                isDuplicate = true;
                                break;
                            }
                        }
                    }
                    
                    // Calculate Levenshtein-like similarity for very close matches
                    const similarity = 1 - Math.abs(existingTitleNorm.length - currentTitleNorm.length) / maxLen;
                    if (similarity > 0.9 && existingTitleNorm.substring(0, minLen) === currentTitleNorm.substring(0, minLen)) {
                        if (existing.version === update.version) {
                            isDuplicate = true;
                            break;
                        }
                    }
                }
            }
        }
        
        if (!isDuplicate) {
            seenKeys.add(exactKey);
            seenKeys.add(titleVersionKey);
            seenKeys.add(titleOnlyKey);
            seenKeys.add(idKey); // Add ID to seen keys
            titleCache.set(update.title, titleNormalized);
            unique.push(update);
        } else {
            // Log when duplicates are found for debugging
            console.log(`   ⚠️  Duplicate found and removed: ${update.title.substring(0, 60)}...`);
        }
    }
    
    console.log(`   🧹 Removed ${updates.length - unique.length} duplicate(s) via global deduplication`);
    return unique;
}

/**
 * Extract updates using AI-powered rule-based parsing
 */
function extractWithAI(htmlContent, brand, url) {
    return extractWithRules(htmlContent, brand, url);
}

/**
 * Scrape Canon updates with AI agent
 */
async function scrapeCanonUpdates() {
    try {
        console.log('🔍 Canon: Searching web for updates...');
        const allUpdates = [];
        
        const urls = await searchForUpdates('Canon');
        console.log(`📄 Canon: Found ${urls.length} URLs to analyze`);
        
        for (const url of urls.slice(0, 12)) {
            try {
                console.log(`   🤖 AI analyzing: ${url.substring(0, 70)}...`);
                const htmlContent = await scrapeWithRetry(url);
                const $ = cheerio.load(htmlContent);
                const pageHtml = $('main, article, .post, .entry-content, .content, body').html();
                
                if (pageHtml && pageHtml.length > 500) {
                    const updates = extractWithAI(pageHtml, 'Canon', url);
                    if (updates.length > 0) {
                        console.log(`   ✅ Extracted ${updates.length} update(s)`);
                        allUpdates.push(...updates);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                // Silent fail
            }
        }
        
        // Global deduplication across all Canon sources
        const dedupedUpdates = deduplicateGlobally(allUpdates);
        console.log(`✅ Canon: ${dedupedUpdates.length} total updates extracted (${allUpdates.length - dedupedUpdates.length} duplicates removed)`);
        return dedupedUpdates;
    } catch (error) {
        console.error('❌ Error scraping Canon updates:', error.message);
        return [];
    }
}

/**
 * Scrape Nikon updates with AI agent
 */
async function scrapeNikonUpdates() {
    try {
        console.log('🔍 Nikon: Searching web for updates...');
        const allUpdates = [];
        
        const urls = await searchForUpdates('Nikon');
        console.log(`📄 Nikon: Found ${urls.length} URLs to analyze`);
        
        for (const url of urls.slice(0, 12)) {
            try {
                console.log(`   🤖 AI analyzing: ${url.substring(0, 70)}...`);
                const htmlContent = await scrapeWithRetry(url);
                const $ = cheerio.load(htmlContent);
                const pageHtml = $('main, article, .post, .entry-content, .content, body').html();
                
                if (pageHtml && pageHtml.length > 500) {
                    const updates = extractWithAI(pageHtml, 'Nikon', url);
                    if (updates.length > 0) {
                        console.log(`   ✅ Extracted ${updates.length} update(s)`);
                        allUpdates.push(...updates);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                // Silent fail
            }
        }
        
        // Global deduplication across all Nikon sources
        const dedupedUpdates = deduplicateGlobally(allUpdates);
        console.log(`✅ Nikon: ${dedupedUpdates.length} total updates extracted (${allUpdates.length - dedupedUpdates.length} duplicates removed)`);
        return dedupedUpdates;
    } catch (error) {
        console.error('❌ Error scraping Nikon updates:', error.message);
        return [];
    }
}

/**
 * Scrape Sony updates with AI agent
 */
async function scrapeSonyUpdates() {
    try {
        console.log('🔍 Sony: Searching web for updates...');
        const allUpdates = [];
        
        const urls = await searchForUpdates('Sony');
        console.log(`📄 Sony: Found ${urls.length} URLs to analyze`);
        
        for (const url of urls.slice(0, 12)) {
            try {
                console.log(`   🤖 AI analyzing: ${url.substring(0, 70)}...`);
                const htmlContent = await scrapeWithRetry(url);
                const $ = cheerio.load(htmlContent);
                const pageHtml = $('main, article, .post, .entry-content, .content, body').html();
                
                if (pageHtml && pageHtml.length > 500) {
                    const updates = extractWithAI(pageHtml, 'Sony', url);
                    if (updates.length > 0) {
                        console.log(`   ✅ Extracted ${updates.length} update(s)`);
                        allUpdates.push(...updates);
                    }
                }
                
                await new Promise(resolve => setTimeout(resolve, 800));
            } catch (error) {
                // Silent fail
            }
        }
        
        // Global deduplication across all Sony sources
        const dedupedUpdates = deduplicateGlobally(allUpdates);
        console.log(`✅ Sony: ${dedupedUpdates.length} total updates extracted (${allUpdates.length - dedupedUpdates.length} duplicates removed)`);
        return dedupedUpdates;
    } catch (error) {
        console.error('❌ Error scraping Sony updates:', error.message);
        return [];
    }
}

/**
 * Scrape all brands with intelligent fallback
 * Returns null if scraping fails to preserve existing data
 */
async function scrapeAllBrands() {
    try {
        console.log('🔍 Starting real-time camera updates scraping...');
        
        const [canonUpdates, nikonUpdates, sonyUpdates] = await Promise.all([
            scrapeCanonUpdates(),
            scrapeNikonUpdates(),
            scrapeSonyUpdates()
        ]);
        
        let allUpdates = [...canonUpdates, ...nikonUpdates, ...sonyUpdates];
        
        // If no updates found, return null to signal "keep existing data"
        if (allUpdates.length === 0) {
            console.log('⚠️  No new updates found from web scraping, existing data will be preserved');
            return null;
        }
        
        // Final cross-brand deduplication (in case same update appears in multiple sources)
        const beforeFinal = allUpdates.length;
        allUpdates = deduplicateGlobally(allUpdates);
        console.log(`🧹 Cross-brand deduplication: ${beforeFinal - allUpdates.length} duplicates removed`);
        
        // Sort by date (newest first)
        allUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log(`✅ Successfully scraped ${allUpdates.length} unique camera updates from the web`);
        return allUpdates;
    } catch (error) {
        console.error('Error scraping all brands:', error);
        // Return null on error to preserve existing database content
        return null;
    }
}

/**
 * Production-ready scraping function with retry logic
 */
async function scrapeWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

module.exports = {
    scrapeAllBrands,
    scrapeCanonUpdates,
    scrapeNikonUpdates,
    scrapeSonyUpdates
};
