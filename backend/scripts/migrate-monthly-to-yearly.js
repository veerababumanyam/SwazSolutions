/**
 * Migration script to convert existing monthly subscribers to yearly subscriptions
 * 
 * This script:
 * 1. Finds all users with active/paid subscriptions
 * 2. Calculates remaining days until expiration
 * 3. Extends subscription to exactly 365 days from now
 * 4. Provides detailed summary of migrations
 * 
 * Usage: node backend/scripts/migrate-monthly-to-yearly.js [--dry-run]
 */

const db = require('../config/database');

async function migrateMonthlyToYearly(dryRun = false) {
    console.log('🔄 Migrating Monthly Subscriptions to Yearly\n');
    
    if (dryRun) {
        console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }
    
    try {
        await db.ready;
        console.log('✅ Database ready\n');

        const now = new Date();
        const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

        // Find all active/paid subscribers
        const activeSubscribers = db.prepare(`
            SELECT 
                id, 
                username, 
                email,
                subscription_status, 
                subscription_end_date,
                created_at
            FROM users 
            WHERE subscription_status IN ('active', 'paid')
            ORDER BY subscription_end_date ASC
        `).all();

        if (activeSubscribers.length === 0) {
            console.log('✅ No active subscribers found. Nothing to migrate.\n');
            return { migrated: 0, users: [] };
        }

        console.log(`📊 Found ${activeSubscribers.length} active subscriber(s) to migrate:\n`);
        
        const migrations = [];
        
        activeSubscribers.forEach((user, index) => {
            const endDate = new Date(user.subscription_end_date);
            const daysRemaining = Math.floor((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
            
            let newEndDate;
            let extensionDays;
            
            if (daysRemaining > 0) {
                // User has remaining days - extend to exactly 365 days from now
                newEndDate = oneYearFromNow;
                extensionDays = 365 - daysRemaining;
            } else {
                // Subscription expired or has no remaining days - set to 365 days from now
                newEndDate = oneYearFromNow;
                extensionDays = 365;
            }

            migrations.push({
                userId: user.id,
                username: user.username,
                email: user.email,
                currentStatus: user.subscription_status,
                currentEndDate: user.subscription_end_date,
                daysRemaining: daysRemaining,
                newEndDate: newEndDate.toISOString(),
                extensionDays: extensionDays
            });

            console.log(`   ${index + 1}. User ID: ${user.id}`);
            console.log(`      Username: ${user.username || 'N/A'}`);
            console.log(`      Email: ${user.email || 'N/A'}`);
            console.log(`      Current Status: ${user.subscription_status}`);
            console.log(`      Current End Date: ${user.subscription_end_date}`);
            console.log(`      Days Remaining: ${daysRemaining > 0 ? daysRemaining : 'Expired/None'}`);
            console.log(`      New End Date: ${newEndDate.toISOString()}`);
            console.log(`      Extension: +${extensionDays} days`);
            console.log('');
        });

        if (dryRun) {
            console.log('💡 This is a dry run. Run without --dry-run to apply changes.\n');
            return { migrated: 0, users: migrations };
        }

        // Apply migrations
        console.log('🔄 Applying migrations...\n');
        
        let migratedCount = 0;
        const errors = [];

        migrations.forEach(migration => {
            try {
                db.prepare(`
                    UPDATE users 
                    SET subscription_end_date = ?
                    WHERE id = ?
                `).run(migration.newEndDate, migration.userId);
                
                migratedCount++;
                console.log(`   ✅ Migrated user ${migration.userId} (${migration.username || 'N/A'})`);
            } catch (error) {
                errors.push({ userId: migration.userId, error: error.message });
                console.error(`   ❌ Failed to migrate user ${migration.userId}:`, error.message);
            }
        });

        console.log(`\n✅ Migration complete! Migrated ${migratedCount} subscription(s)\n`);

        if (errors.length > 0) {
            console.log(`⚠️  ${errors.length} error(s) occurred during migration:\n`);
            errors.forEach(err => {
                console.log(`   - User ${err.userId}: ${err.error}`);
            });
            console.log('');
        }

        // Summary statistics
        console.log('📈 Migration Summary:');
        const totalDaysExtended = migrations.reduce((sum, m) => sum + m.extensionDays, 0);
        const avgExtension = Math.round(totalDaysExtended / migrations.length);
        console.log(`   - Total subscriptions migrated: ${migratedCount}`);
        console.log(`   - Total days extended: ${totalDaysExtended}`);
        console.log(`   - Average extension: ${avgExtension} days`);
        console.log('');

        // Verify migrations
        const verifyCount = db.prepare(`
            SELECT COUNT(*) as count
            FROM users
            WHERE subscription_status IN ('active', 'paid')
              AND subscription_end_date >= datetime('now', '+364 days')
        `).get();

        console.log(`📊 Verification: ${verifyCount.count} active subscription(s) now have 365+ days remaining\n`);

        return {
            migrated: migratedCount,
            users: migrations,
            errors: errors
        };

    } catch (error) {
        console.error('❌ Error during migration:', error);
        console.error(error.stack);
        throw error;
    }
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('-d');

    migrateMonthlyToYearly(dryRun)
        .then(result => {
            if (!dryRun) {
                console.log('✅ Migration completed successfully!\n');
            }
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { migrateMonthlyToYearly };
