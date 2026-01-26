/**
 * Migration script to fix expired subscriptions
 * 
 * This script:
 * 1. Finds all users with expired subscriptions that aren't marked as 'expired'
 * 2. Updates their status to 'expired'
 * 3. Provides a summary of changes
 * 
 * Usage: node backend/scripts/fix-expired-subscriptions.js [--dry-run]
 */

const db = require('../config/database');

async function fixExpiredSubscriptions(dryRun = false) {
    console.log('🔧 Fixing Expired Subscriptions\n');
    
    if (dryRun) {
        console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }
    
    try {
        await db.ready;
        console.log('✅ Database ready\n');

        // Find expired subscriptions
        const now = new Date().toISOString();
        const expiredUsers = db.prepare(`
            SELECT 
                id, 
                username, 
                email,
                subscription_status, 
                subscription_end_date,
                created_at
            FROM users 
            WHERE subscription_status IN ('free', 'active', 'paid')
              AND subscription_end_date < ?
              AND subscription_status != 'expired'
            ORDER BY subscription_end_date ASC
        `).all(now);

        if (expiredUsers.length === 0) {
            console.log('✅ No expired subscriptions found. All users are up to date.\n');
            return { updated: 0, users: [] };
        }

        console.log(`📊 Found ${expiredUsers.length} user(s) with expired subscriptions:\n`);
        
        expiredUsers.forEach((user, index) => {
            const endDate = new Date(user.subscription_end_date);
            const daysExpired = Math.floor((Date.now() - endDate.getTime()) / (24 * 60 * 60 * 1000));
            console.log(`   ${index + 1}. User ID: ${user.id}`);
            console.log(`      Username: ${user.username || 'N/A'}`);
            console.log(`      Email: ${user.email || 'N/A'}`);
            console.log(`      Current Status: ${user.subscription_status}`);
            console.log(`      End Date: ${user.subscription_end_date}`);
            console.log(`      Days Expired: ${daysExpired}`);
            console.log(`      Created: ${user.created_at || 'N/A'}`);
            console.log('');
        });

        if (dryRun) {
            console.log('💡 This is a dry run. Run without --dry-run to apply changes.\n');
            return { updated: 0, users: expiredUsers };
        }

        // Update expired subscriptions
        console.log('🔄 Updating expired subscriptions...\n');
        const result = db.prepare(`
            UPDATE users 
            SET subscription_status = 'expired'
            WHERE subscription_status IN ('free', 'active', 'paid')
              AND subscription_end_date < ?
              AND subscription_status != 'expired'
        `).run(now);

        console.log(`✅ Updated ${result.changes} subscription(s) to 'expired' status\n`);

        // Verify updates
        const verifyCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE subscription_status = 'expired'
        `).get();

        console.log(`📊 Total users with 'expired' status: ${verifyCount.count}\n`);

        // Summary by original status
        console.log('📈 Summary by original status:');
        const statusBreakdown = db.prepare(`
            SELECT 
                CASE 
                    WHEN subscription_end_date < ? THEN 'expired'
                    ELSE subscription_status
                END as final_status,
                COUNT(*) as count
            FROM users
            WHERE subscription_status IN ('free', 'active', 'paid', 'expired')
            GROUP BY final_status
        `).all(now);

        statusBreakdown.forEach(stat => {
            console.log(`   - ${stat.final_status}: ${stat.count} user(s)`);
        });
        console.log('');

        return {
            updated: result.changes,
            users: expiredUsers
        };

    } catch (error) {
        console.error('❌ Error fixing expired subscriptions:', error);
        console.error(error.stack);
        throw error;
    }
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('-d');

    fixExpiredSubscriptions(dryRun)
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

module.exports = { fixExpiredSubscriptions };
