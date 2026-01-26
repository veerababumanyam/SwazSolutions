const express = require('express');
const router = express.Router();
const { createSubscriptionOrder, verifyOrder } = require('../services/cashfreeService');
const { createPhonePeOrder } = require('../services/phonePeService');
const { createRupeePaymentsOrder } = require('../services/rupeePaymentsService');
const { authenticateToken } = require('../middleware/auth');

function createSubscriptionRoutes(db) {

    // Get current subscription status
    router.get('/status', authenticateToken, (req, res) => {
        try {
            const user = db.prepare('SELECT subscription_status, subscription_end_date FROM users WHERE id = ?').get(req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            const isPaid = user.subscription_status === 'active' || user.subscription_status === 'paid';
            const endDate = new Date(user.subscription_end_date);
            const now = new Date();
            const isExpired = now >= endDate && !isPaid;

            // Update status in database if expired and not already marked as expired
            if (isExpired && user.subscription_status !== 'expired') {
                db.prepare('UPDATE users SET subscription_status = ? WHERE id = ?')
                    .run('expired', req.user.id);
                console.log(`⏰ Subscription status updated to expired for user ${req.user.id}`);
            }

            res.json({
                status: isExpired ? 'expired' : user.subscription_status,
                endDate: user.subscription_end_date,
                isExpired
            });
        } catch (error) {
            console.error('Error fetching subscription status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Create Subscription Order (Multi-provider)
    router.post('/create-order', authenticateToken, async (req, res) => {
        try {
            const { provider } = req.body; // 'cashfree' | 'phonepe' | 'rupeepayments'
            const user = db.prepare('SELECT id, email, username, subscription_status, subscription_end_date FROM users WHERE id = ?').get(req.user.id);

            // Check if user has an active paid subscription
            const isPaid = user.subscription_status === 'active' || user.subscription_status === 'paid';
            if (isPaid) {
                const endDate = new Date(user.subscription_end_date);
                if (endDate.getTime() > Date.now()) {
                    return res.status(400).json({ error: 'You already have an active subscription' });
                }
            }

            let orderData;
            switch (provider) {
                case 'phonepe':
                    orderData = await createPhonePeOrder(user);
                    break;
                case 'rupeepayments':
                    orderData = await createRupeePaymentsOrder(user);
                    break;
                case 'cashfree':
                default:
                    orderData = await createSubscriptionOrder(user);
                    break;
            }

            res.json(orderData);

        } catch (error) {
            console.error(`Error creating subscription order (${req.body.provider}):`, error);
            res.status(500).json({ error: error.message });
        }
    });

    // Verify Payment (Called from frontend after redirect)
    router.post('/verify-payment', authenticateToken, async (req, res) => {
        const { orderId, provider } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        try {
            let isSuccessful = false;

            // Verification Logic per provider
            if (provider === 'cashfree' || !provider) {
                const payment = await verifyOrder(orderId);
                if (payment && payment.payment_status === 'SUCCESS') isSuccessful = true;
            }
            else if (provider === 'phonepe') {
                // TODO: Implement actual PhonePe server-to-server status check
                console.log('PhonePe verification requested for', orderId);
                // For demonstration/sandbox simplicity we might need to rely on webhook
            }
            else if (provider === 'rupeepayments') {
                // TODO: Implement RupeePayments validaton
                console.log('RupeePayments verification requested for', orderId);
            }

            // Note: If providers send webhooks, handled in handleWebhook.
            // If we can't verify here immediately, we might return 'pending'.

            if (isSuccessful) {
                const userId = req.user.id;
                const newEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

                db.prepare(`
                    UPDATE users 
                    SET subscription_status = 'active', 
                        subscription_end_date = ?
                    WHERE id = ?
                `).run(newEndDate, userId);

                console.log(`✅ Payment verified for user ${userId}. Order: ${orderId}`);

                res.json({
                    success: true,
                    message: 'Subscription activated successfully',
                    subscriptionEnd: newEndDate
                });
            } else {
                // If not strictly failed (maybe pending or just waiting for webhook), message accordingly
                res.status(400).json({ error: 'Payment verification failed or pending. check status later.' });
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({ error: 'Verification failed' });
        }
    });

    // Subscription system health/monitoring endpoint (admin only or public stats)
    router.get('/monitor', authenticateToken, (req, res) => {
        try {
            // Only admins can access detailed monitoring
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const now = new Date().toISOString();
            
            // Get subscription status distribution
            const statusDistribution = db.prepare(`
                SELECT 
                    subscription_status,
                    COUNT(*) as count
                FROM users
                WHERE subscription_status IS NOT NULL
                GROUP BY subscription_status
            `).all();

            // Get expired subscriptions that need updating
            const expiredNeedingUpdate = db.prepare(`
                SELECT COUNT(*) as count
                FROM users
                WHERE subscription_status IN ('free', 'active', 'paid')
                  AND subscription_end_date < ?
                  AND subscription_status != 'expired'
            `).get(now);

            // Get subscriptions expiring soon (next 7 days)
            const expiringSoon = db.prepare(`
                SELECT COUNT(*) as count
                FROM users
                WHERE subscription_status IN ('free', 'active', 'paid')
                  AND subscription_end_date BETWEEN datetime('now') AND datetime('now', '+7 days')
            `).get();

            // Get recent expirations (last 24 hours)
            const recentExpirations = db.prepare(`
                SELECT COUNT(*) as count
                FROM users
                WHERE subscription_status = 'expired'
                  AND subscription_end_date BETWEEN datetime('now', '-1 day') AND datetime('now')
            `).get();

            // Get total active subscriptions
            const activeCount = db.prepare(`
                SELECT COUNT(*) as count
                FROM users
                WHERE subscription_status IN ('active', 'paid')
                  AND subscription_end_date > datetime('now')
            `).get();

            res.json({
                timestamp: new Date().toISOString(),
                statusDistribution: statusDistribution.reduce((acc, stat) => {
                    acc[stat.subscription_status] = stat.count;
                    return acc;
                }, {}),
                issues: {
                    expiredNeedingUpdate: expiredNeedingUpdate.count,
                    expiringSoon: expiringSoon.count
                },
                metrics: {
                    activeSubscriptions: activeCount.count,
                    recentExpirations: recentExpirations.count
                },
                system: {
                    backgroundJobEnabled: true,
                    lastCheck: 'See server logs for background job execution'
                }
            });
        } catch (error) {
            console.error('Error fetching subscription monitoring data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
}

// Webhook handler
async function handleWebhook(req, res, db) {
    console.log('Webhook received:', req.body);
    // Parse webhook and update DB
    // We would need to identify provider from headers or payload structure
    res.json({ received: true });
}

module.exports = { createSubscriptionRoutes, handleWebhook };
