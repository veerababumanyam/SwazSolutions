const express = require('express');
const router = express.Router();

let db = null;
let lastScrapeTime = null;

// Initialize with database reference
function init(database) {
    db = database;
}

/**
 * GET /api/camera-updates
 * Fetch all camera updates with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const { brand, type, search, sortBy = 'date', dateFrom, dateTo } = req.query;

        let whereConditions = [];
        let params = [];

        // Filter by brand
        if (brand) {
            const brands = brand.split(',').map(b => b.trim());
            const placeholders = brands.map(() => '?').join(',');
            whereConditions.push(`brand IN (${placeholders})`);
            params.push(...brands);
        }

        // Filter by type
        if (type) {
            const types = type.split(',').map(t => t.trim());
            const placeholders = types.map(() => '?').join(',');
            whereConditions.push(`type IN (${placeholders})`);
            params.push(...types);
        }

        // Filter by date range
        if (dateFrom) {
            whereConditions.push(`date >= ?`);
            params.push(dateFrom);
        }
        if (dateTo) {
            whereConditions.push(`date <= ?`);
            params.push(dateTo);
        }

        // Search filter
        if (search) {
            whereConditions.push(`(title LIKE ? OR description LIKE ? OR features LIKE ?)`);
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        
        // Sort clause
        let orderBy = 'date DESC';
        if (sortBy === 'priority') {
            orderBy = `CASE priority 
                WHEN 'critical' THEN 0 
                WHEN 'high' THEN 1 
                ELSE 2 END, date DESC`;
        }
        
        const sql = `SELECT * FROM camera_updates ${whereClause} ORDER BY ${orderBy}`;
        const updates = db.prepare(sql).all(...params)
            .map(row => ({
                id: row.id,
                brand: row.brand,
                type: row.type,
                title: row.title,
                date: row.date,
                version: row.version,
                description: row.description,
                features: JSON.parse(row.features || '[]'),
                downloadLink: row.download_link,
                imageUrl: row.image_url,
                sourceUrl: row.source_url,
                sourceName: row.source_name,
                priority: row.priority,
                category: row.category
            }))
            // Filter: Only return English content
            .filter(update => {
                return isEnglishText(update.title) && isEnglishText(update.description);
            });
        
        res.json({
            success: true,
            count: updates.length,
            lastUpdated: lastScrapeTime,
            updates
        });
    } catch (error) {
        console.error('Error fetching camera updates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch camera updates'
        });
    }
});

/**
 * GET /api/camera-updates/:id
 * Fetch specific camera update by ID
 */
router.get('/:id', (req, res) => {
    try {
        const row = db.prepare('SELECT * FROM camera_updates WHERE id = ?').get(req.params.id);
        
        if (!row) {
            return res.status(404).json({
                success: false,
                error: 'Update not found'
            });
        }
        
        const update = {
            id: row.id,
            brand: row.brand,
            type: row.type,
            title: row.title,
            date: row.date,
            version: row.version,
            description: row.description,
            features: JSON.parse(row.features || '[]'),
            downloadLink: row.download_link,
            imageUrl: row.image_url,
            sourceUrl: row.source_url,
            sourceName: row.source_name,
            priority: row.priority,
            category: row.category
        };
        
        res.json({
            success: true,
            update
        });
    } catch (error) {
        console.error('Error fetching camera update:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch camera update'
        });
    }
});

/**
 * GET /api/camera-updates/stats/summary
 * Get statistics about camera updates
 */
router.get('/stats/summary', (req, res) => {
    try {
        const total = db.prepare('SELECT COUNT(*) as count FROM camera_updates').get().count;
        
        const byBrand = {
            Canon: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE brand = 'Canon'").get().count,
            Nikon: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE brand = 'Nikon'").get().count,
            Sony: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE brand = 'Sony'").get().count
        };
        
        const byType = {
            firmware: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE type = 'firmware'").get().count,
            camera: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE type = 'camera'").get().count,
            lens: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE type = 'lens'").get().count
        };
        
        const byPriority = {
            critical: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE priority = 'critical'").get().count,
            high: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE priority = 'high'").get().count,
            normal: db.prepare("SELECT COUNT(*) as count FROM camera_updates WHERE priority = 'normal'").get().count
        };
        
        const stats = {
            total,
            byBrand,
            byType,
            byPriority,
            lastUpdated: lastScrapeTime
        };
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

/**
 * POST /api/camera-updates/refresh
 * Manually trigger a refresh of camera updates
 */
router.post('/refresh', async (req, res) => {
    try {
        // Import the scraper service
        const { scrapeAllBrands } = require('../services/cameraUpdatesScraper');
        
        // Trigger scraping
        const newUpdates = await scrapeAllBrands();
        
        if (newUpdates && newUpdates.length > 0) {
            // Save to database with intelligent deduplication
            const result = saveUpdatesToDb(newUpdates);
            
            res.json({
                success: true,
                message: result.inserted > 0 || result.updated > 0 ? 'Camera updates refreshed successfully' : 'All updates are current',
                inserted: result.inserted,
                updated: result.updated,
                skipped: result.skipped,
                total: newUpdates.length,
                lastUpdated: lastScrapeTime
            });
        } else {
            // No new data from scraper, keep existing data active
            const existingCount = db.prepare('SELECT COUNT(*) as count FROM camera_updates').get().count;
            res.json({
                success: true,
                message: existingCount > 0 ? 'No new updates available, keeping existing data active' : 'No updates found',
                inserted: 0,
                updated: 0,
                skipped: 0,
                total: 0,
                existing: existingCount,
                lastUpdated: lastScrapeTime
            });
        }
    } catch (error) {
        console.error('Error refreshing camera updates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to refresh camera updates'
        });
    }
});

/**
 * Basic English language detection
 */
function isEnglishText(text) {
    if (!text || text.length < 10) return false;
    
    // Check for non-English character ranges
    const nonEnglishChars = /[\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/;
    if (nonEnglishChars.test(text)) return false;
    
    // Check for common English words
    const englishWords = /\b(the|is|at|which|on|a|an|as|are|was|were|been|be|have|has|had|do|does|did|will|would|could|should|of|for|to|in|with|by|from|about|camera|lens|firmware|update)\b/gi;
    const matches = text.match(englishWords);
    const wordCount = text.split(/\s+/).length;
    const englishWordRatio = matches ? matches.length / wordCount : 0;
    
    return englishWordRatio >= 0.1;
}

/**
 * Compare two objects for meaningful changes
 */
function hasContentChanged(existing, newUpdate) {
    if (!existing) return true;
    
    // Compare critical fields
    const fieldsToCompare = ['title', 'description', 'version', 'priority', 'date'];
    for (const field of fieldsToCompare) {
        const existingValue = existing[field === 'version' ? 'version' : field];
        const newValue = newUpdate[field === 'version' ? 'version' : field];
        if (existingValue !== newValue) return true;
    }
    
    // Compare features array
    const existingFeatures = JSON.parse(existing.features || '[]');
    const newFeatures = newUpdate.features || [];
    if (existingFeatures.length !== newFeatures.length) return true;
    if (JSON.stringify(existingFeatures.sort()) !== JSON.stringify(newFeatures.sort())) return true;
    
    return false;
}

/**
 * Save updates to database with intelligent deduplication and content comparison
 * Preserves existing data and only updates when there are actual changes
 */
function saveUpdatesToDb(updates) {
    if (!db) {
        console.error('Database not initialized');
        return { inserted: 0, updated: 0, skipped: 0 };
    }
    
    let insertCount = 0;
    let updateCount = 0;
    let skippedCount = 0;
    
    // Pre-filter: Only save English content
    updates = updates.filter(update => {
        return isEnglishText(update.title) && isEnglishText(update.description);
    });
    
    for (const update of updates) {
        try {
            const existing = db.prepare('SELECT * FROM camera_updates WHERE id = ?').get(update.id);
            
            if (existing) {
                // Compare content before updating
                if (hasContentChanged(existing, update)) {
                    // Update only if content has actually changed
                    db.prepare(`
                        UPDATE camera_updates 
                        SET brand = ?, type = ?, title = ?, date = ?, version = ?,
                            description = ?, features = ?, download_link = ?, image_url = ?,
                            source_url = ?, source_name = ?, priority = ?, category = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                    `).run(
                        update.brand, update.type, update.title, update.date, update.version,
                        update.description, JSON.stringify(update.features), update.downloadLink,
                        update.imageUrl, update.sourceUrl, update.sourceName, update.priority,
                        update.category, update.id
                    );
                    updateCount++;
                } else {
                    // Content is identical, skip update
                    skippedCount++;
                }
            } else {
                // Insert new record
                db.prepare(`
                    INSERT INTO camera_updates 
                    (id, brand, type, title, date, version, description, features, 
                     download_link, image_url, source_url, source_name, priority, category)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    update.id, update.brand, update.type, update.title, update.date,
                    update.version, update.description, JSON.stringify(update.features),
                    update.downloadLink, update.imageUrl, update.sourceUrl, update.sourceName,
                    update.priority, update.category
                );
                insertCount++;
            }
        } catch (error) {
            console.error(`Error saving update ${update.id}:`, error);
        }
    }
    
    lastScrapeTime = new Date();
    return { inserted: insertCount, updated: updateCount, skipped: skippedCount };
}

// Export functions to be used by server.js
module.exports = {
    router,
    init,
    saveUpdatesToDb
};
