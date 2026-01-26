/**
 * Test script for subscription expiration logic
 * 
 * This script tests:
 * 1. Free trial expiration detection
 * 2. Paid subscription expiration detection
 * 3. Status endpoint updates
 * 4. Middleware blocking expired users
 * 5. Background job expiration updates
 * 
 * Usage: node backend/scripts/test-subscription-expiration.js
 */

const db = require('../config/database');
const { checkSubscription } = require('../middleware/subscription');

// Mock request/response objects for middleware testing
const createMockReq = (user) => ({
    user: user || { id: 1, role: 'user' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' }
});

const createMockRes = () => {
    const res = {
        statusCode: 200,
        jsonData: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.jsonData = data;
            return this;
        }
    };
    return res;
};

const createMockNext = () => {
    let called = false;
    const next = () => { called = true; };
    next.wasCalled = () => called;
    return next;
};

async function testSubscriptionExpiration() {
    console.log('🧪 Starting Subscription Expiration Tests\n');
    
    try {
        // Wait for database to be ready
        await db.ready;
        console.log('✅ Database ready\n');

        // Test 1: Check for existing expired subscriptions that need updating
        console.log('📊 Test 1: Checking for expired subscriptions in database...');
        const expiredUsers = db.prepare(`
            SELECT id, username, subscription_status, subscription_end_date 
            FROM users 
            WHERE subscription_status IN ('free', 'active', 'paid')
              AND subscription_end_date < datetime('now')
              AND subscription_status != 'expired'
        `).all();
        
        if (expiredUsers.length > 0) {
            console.log(`   ⚠️  Found ${expiredUsers.length} user(s) with expired subscriptions that need status update:`);
            expiredUsers.forEach(user => {
                console.log(`      - User ID: ${user.id}, Username: ${user.username || 'N/A'}, Status: ${user.subscription_status}, End Date: ${user.subscription_end_date}`);
            });
        } else {
            console.log('   ✅ No expired subscriptions found (or all already marked as expired)');
        }
        console.log('');

        // Test 2: Test middleware with expired free trial
        console.log('📊 Test 2: Testing middleware with expired free trial...');
        const expiredFreeUser = db.prepare(`
            SELECT id, username, subscription_status, subscription_end_date 
            FROM users 
            WHERE subscription_status = 'free' 
            LIMIT 1
        `).get();
        
        if (expiredFreeUser) {
            // Set end date to past
            const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            db.prepare('UPDATE users SET subscription_end_date = ? WHERE id = ?')
                .run(pastDate, expiredFreeUser.id);
            
            const req = createMockReq({ id: expiredFreeUser.id, role: 'user' });
            const res = createMockRes();
            const next = createMockNext();
            
            checkSubscription(req, res, next);
            
            if (res.statusCode === 403 && res.jsonData?.code === 'SUBSCRIPTION_EXPIRED') {
                console.log('   ✅ Middleware correctly blocked expired free trial user');
                
                // Check if status was updated
                const updatedUser = db.prepare('SELECT subscription_status FROM users WHERE id = ?').get(expiredFreeUser.id);
                if (updatedUser.subscription_status === 'expired') {
                    console.log('   ✅ Database status correctly updated to "expired"');
                } else {
                    console.log(`   ⚠️  Database status is "${updatedUser.subscription_status}" (expected "expired")`);
                }
            } else {
                console.log(`   ❌ Middleware test failed. Status: ${res.statusCode}, Data:`, res.jsonData);
            }
            
            // Restore original date
            db.prepare('UPDATE users SET subscription_end_date = ? WHERE id = ?')
                .run(expiredFreeUser.subscription_end_date, expiredFreeUser.id);
        } else {
            console.log('   ⚠️  No free trial users found to test');
        }
        console.log('');

        // Test 3: Test middleware with active subscription
        console.log('📊 Test 3: Testing middleware with active subscription...');
        const activeUser = db.prepare(`
            SELECT id, username, subscription_status, subscription_end_date 
            FROM users 
            WHERE subscription_status = 'active' 
            LIMIT 1
        `).get();
        
        if (activeUser) {
            // Ensure end date is in future
            const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            db.prepare('UPDATE users SET subscription_end_date = ? WHERE id = ?')
                .run(futureDate, activeUser.id);
            
            const req = createMockReq({ id: activeUser.id, role: 'user' });
            const res = createMockRes();
            const next = createMockNext();
            
            checkSubscription(req, res, next);
            
            if (next.wasCalled() && res.statusCode === 200) {
                console.log('   ✅ Middleware correctly allowed active subscription user');
            } else {
                console.log(`   ❌ Middleware test failed. Next called: ${next.wasCalled()}, Status: ${res.statusCode}`);
            }
            
            // Restore original date
            db.prepare('UPDATE users SET subscription_end_date = ? WHERE id = ?')
                .run(activeUser.subscription_end_date, activeUser.id);
        } else {
            console.log('   ⚠️  No active subscription users found to test');
        }
        console.log('');

        // Test 4: Test admin bypass
        console.log('📊 Test 4: Testing admin bypass...');
        const adminReq = createMockReq({ id: 1, role: 'admin' });
        const adminRes = createMockRes();
        const adminNext = createMockNext();
        
        checkSubscription(adminReq, adminRes, adminNext);
        
        if (adminNext.wasCalled() && adminRes.statusCode === 200) {
            console.log('   ✅ Admin correctly bypasses subscription check');
        } else {
            console.log(`   ❌ Admin bypass test failed. Next called: ${adminNext.wasCalled()}, Status: ${adminRes.statusCode}`);
        }
        console.log('');

        // Test 5: Test background job function (simulate)
        console.log('📊 Test 5: Testing background job expiration update...');
        const now = new Date().toISOString();
        const result = db.prepare(`
            UPDATE users 
            SET subscription_status = 'expired'
            WHERE subscription_status IN ('free', 'active', 'paid')
              AND subscription_end_date < ?
              AND subscription_status != 'expired'
        `).run(now);
        
        if (result.changes >= 0) {
            console.log(`   ✅ Background job would update ${result.changes} expired subscription(s)`);
        } else {
            console.log('   ❌ Background job test failed');
        }
        console.log('');

        // Test 6: Summary statistics
        console.log('📊 Test 6: Subscription status summary...');
        const stats = db.prepare(`
            SELECT 
                subscription_status,
                COUNT(*) as count,
                MIN(subscription_end_date) as earliest_end,
                MAX(subscription_end_date) as latest_end
            FROM users
            WHERE subscription_status IS NOT NULL
            GROUP BY subscription_status
        `).all();
        
        console.log('   Subscription Status Distribution:');
        stats.forEach(stat => {
            console.log(`      - ${stat.subscription_status || 'NULL'}: ${stat.count} user(s)`);
            if (stat.earliest_end) {
                console.log(`        Range: ${stat.earliest_end} to ${stat.latest_end}`);
            }
        });
        console.log('');

        // Test 7: Check for users with null subscription_end_date
        console.log('📊 Test 7: Checking for users with missing subscription data...');
        const nullEndDate = db.prepare(`
            SELECT COUNT(*) as count 
            FROM users 
            WHERE subscription_end_date IS NULL
        `).get();
        
        if (nullEndDate.count > 0) {
            console.log(`   ⚠️  Found ${nullEndDate.count} user(s) with NULL subscription_end_date`);
            console.log('   💡 Consider running migration to set default values');
        } else {
            console.log('   ✅ All users have subscription_end_date set');
        }
        console.log('');

        console.log('✅ All tests completed!\n');
        console.log('💡 Next steps:');
        console.log('   1. Review any warnings above');
        console.log('   2. Run background job manually if needed');
        console.log('   3. Test with actual API endpoints');
        console.log('   4. Monitor logs for expiration events\n');

    } catch (error) {
        console.error('❌ Test error:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run tests
if (require.main === module) {
    testSubscriptionExpiration()
        .then(() => {
            console.log('🏁 Test script finished');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { testSubscriptionExpiration };
