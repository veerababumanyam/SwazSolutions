/**
 * Database Cleanup Script for Camera Updates
 * Removes duplicate entries based on normalized titles
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../music.db');

console.log('🧹 Camera Updates Database Cleanup Tool\n');
console.log('=' .repeat(60));

async function cleanup() {
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
        const result = db.exec('SELECT * FROM camera_updates ORDER BY created_at DESC');
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
    console.log(`\n📊 Found ${allUpdates.length} total camera updates in database`);
    
    // Find duplicates based on normalized title + brand
    const seen = new Map();
    const duplicates = [];
    const keep = [];
    
    for (const update of allUpdates) {
        const normalized = update.title.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/firmware/g, '')
            .replace(/update/g, '')
            .replace(/version/g, '');
        
        const key = `${update.brand}_${normalized}`;
        
        if (seen.has(key)) {
            // This is a duplicate
            duplicates.push(update);
            console.log(`   ⚠️  Duplicate: ${update.title.substring(0, 60)}`);
            console.log(`      ID: ${update.id}, Created: ${update.created_at}`);
        } else {
            // Keep this one (first occurrence)
            seen.set(key, update);
            keep.push(update);
        }
    }
    
        console.log(`\n📊 Analysis Results:`);
        console.log(`   ✓ Unique updates to keep: ${keep.length}`);
        console.log(`   ✗ Duplicates to remove: ${duplicates.length}`);
        
        if (duplicates.length > 0) {
            console.log(`\n🗑️  Removing ${duplicates.length} duplicate entries...`);
            
            // Delete duplicates
            for (const item of duplicates) {
                db.run(`DELETE FROM camera_updates WHERE id = ?`, [item.id]);
            }
            
            console.log('✅ Duplicates removed successfully!');
            
            // Save database
            const data = db.export();
            fs.writeFileSync(DB_PATH, data);
            
            // Verify
            const afterResult = db.exec('SELECT COUNT(*) as count FROM camera_updates');
            const afterCount = afterResult[0].values[0][0];
            console.log(`\n📊 Database now has ${afterCount} unique camera updates`);
        } else {
            console.log('\n✅ No duplicates found - database is clean!');
        }
        
        db.close();
        console.log('\n' + '='.repeat(60));
        console.log('✅ Cleanup completed successfully!\n');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
        process.exit(1);
    }
}

cleanup();
