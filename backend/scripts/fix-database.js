/**
 * Database Fix Script
 * Fixes common database initialization issues including:
 * - Visitors table initialization
 * - Missing subscription columns
 * - Proper table creation
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../music.db');

async function fixDatabase() {
    console.log('🔧 Starting database fix...');
    
    const SQL = await initSqlJs();
    let db;
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('✅ Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('✅ Created new database');
    }
    
    // Fix visitors table
    console.log('\n📊 Fixing visitors table...');
    try {
        // Check if visitors table exists
        const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='visitors'");
        
        if (tables.length === 0 || tables[0].values.length === 0) {
            console.log('⚠️  Visitors table missing, creating...');
            db.run(`
                CREATE TABLE IF NOT EXISTS visitors (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    count INTEGER DEFAULT 0,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            // Initialize visitor count
            db.run("INSERT INTO visitors (id, count) VALUES (1, 0)");
            console.log('✅ Visitors table created and initialized');
        } else {
            // Check if visitor count exists
            const visitorCount = db.exec("SELECT count FROM visitors WHERE id = 1");
            if (visitorCount.length === 0 || visitorCount[0].values.length === 0) {
                db.run("INSERT INTO visitors (id, count) VALUES (1, 0)");
                console.log('✅ Visitor count initialized');
            } else {
                console.log('✅ Visitors table OK');
            }
        }
    } catch (error) {
        console.error('❌ Error fixing visitors table:', error.message);
    }
    
    // Fix subscription columns in users table
    console.log('\n💳 Fixing subscription columns...');
    try {
        // Check if subscription_status column exists
        db.exec("SELECT subscription_status FROM users LIMIT 1");
        console.log('✅ Subscription columns OK');
    } catch (e) {
        console.log('⚠️  Adding subscription columns...');
        try {
            db.run("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'");
            db.run("ALTER TABLE users ADD COLUMN subscription_end_date DATETIME");
            db.run("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT");
            db.run("ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT");
            
            // Set default subscription end date for existing users
            const oneMonthFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            db.run("UPDATE users SET subscription_status = 'free', subscription_end_date = ?", [oneMonthFromNow]);
            
            console.log('✅ Subscription columns added');
        } catch (alterError) {
            console.error('❌ Error adding subscription columns:', alterError.message);
        }
    }
    
    // Verify key tables exist
    console.log('\n🔍 Verifying key tables...');
    const keyTables = ['users', 'songs', 'playlists', 'profiles', 'visitors', 'refresh_tokens'];
    const existingTables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTableNames = existingTables.length > 0 ? existingTables[0].values.map(v => v[0]) : [];
    
    for (const table of keyTables) {
        if (existingTableNames.includes(table)) {
            console.log(`✅ ${table} exists`);
        } else {
            console.log(`⚠️  ${table} missing - will be created on server restart`);
        }
    }
    
    // Save database
    console.log('\n💾 Saving database...');
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('✅ Database saved');
    
    db.close();
    console.log('\n✅ Database fix complete!');
}

fixDatabase().catch(error => {
    console.error('❌ Database fix failed:', error);
    process.exit(1);
});
