/**
 * Update Database with Meaningful Descriptions
 * Replaces redundant descriptions with AI-generated meaningful summaries
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../music.db');

console.log('🔄 Updating Camera Updates with Meaningful Descriptions\n');
console.log('=' .repeat(60));

/**
 * Generate intelligent description based on title pattern analysis
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
 * Check if description is redundant (same as or very similar to title)
 */
function isRedundant(title, description) {
    if (!description || description.length < 20) return true;
    
    // Clean up description: remove tabs, extra spaces, and common prefixes
    let cleanDesc = description
        .replace(/\t+/g, ' ')           // Replace tabs with spaces
        .replace(/\s+/g, ' ')           // Normalize whitespace
        .trim();
    
    // Remove common prefixes that aren't meaningful content
    const prefixes = [
        /^[A-Za-z]+\s+Insights\s*/i,
        /^[A-Za-z]+\s+News\s*/i,
        /^[A-Za-z]+\s+Updates\s*/i,
        /^Latest:\s*/i,
        /^Breaking:\s*/i,
        /^New:\s*/i
    ];
    
    for (const prefix of prefixes) {
        cleanDesc = cleanDesc.replace(prefix, '');
    }
    
    const titleLower = title.toLowerCase().trim();
    const descLower = cleanDesc.toLowerCase().trim();
    
    // Exact match after cleaning
    if (titleLower === descLower) return true;
    
    // Description starts with title
    if (descLower.startsWith(titleLower)) return true;
    
    // Description ends with title (common pattern: "Prefix Title")
    if (descLower.endsWith(titleLower)) return true;
    
    // Description contains title and is too short (likely just title with wrapper text)
    if (descLower.includes(titleLower) && cleanDesc.length < title.length + 50) return true;
    
    // Description is just title repeated or with brand name added
    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 3);
    const descWords = descLower.split(/\s+/).filter(w => w.length > 3);
    const commonWords = titleWords.filter(w => descWords.includes(w));
    const similarity = commonWords.length / Math.max(titleWords.length, 1);
    
    if (similarity > 0.8 && cleanDesc.length < 150) return true;
    
    return false;
}

async function updateDescriptions() {
    try {
        const SQL = await initSqlJs();
        
        // Load database
        if (!fs.existsSync(DB_PATH)) {
            console.log('❌ Database file not found!');
            return;
        }
        
        const buffer = fs.readFileSync(DB_PATH);
        const db = new SQL.Database(buffer);
        
        // Get all camera updates
        const result = db.exec('SELECT * FROM camera_updates');
        if (result.length === 0 || !result[0].values) {
            console.log('📊 No camera updates found in database');
            return;
        }
        
        const columns = result[0].columns;
        const allUpdates = result[0].values.map(row => {
            const update = {};
            columns.forEach((col, idx) => {
                update[col] = row[idx];
            });
            return update;
        });
        
        console.log(`\n📊 Found ${allUpdates.length} camera updates`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const update of allUpdates) {
            const isRedundantDesc = isRedundant(update.title, update.description);
            
            if (isRedundantDesc) {
                const newDescription = generateSmartDescription(update.title, update.brand, update.type);
                
                console.log(`\n✏️  Updating: ${update.title.substring(0, 60)}...`);
                console.log(`   Old: ${update.description.substring(0, 80)}...`);
                console.log(`   New: ${newDescription.substring(0, 80)}...`);
                
                db.run(
                    'UPDATE camera_updates SET description = ? WHERE id = ?',
                    [newDescription, update.id]
                );
                
                updatedCount++;
            } else {
                skippedCount++;
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   ✓ Updated: ${updatedCount}`);
        console.log(`   ✓ Already good: ${skippedCount}`);
        
        if (updatedCount > 0) {
            // Save database
            console.log(`\n💾 Saving changes to database...`);
            const data = db.export();
            fs.writeFileSync(DB_PATH, data);
            console.log('✅ Database updated successfully!');
        }
        
        db.close();
        console.log('\n' + '='.repeat(60));
        console.log('✅ Update completed!\n');
        
    } catch (error) {
        console.error('❌ Error during update:', error.message);
        process.exit(1);
    }
}

updateDescriptions();
