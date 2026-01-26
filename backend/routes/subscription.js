const express = require('express');
const router = express.Router();
const { createSubscriptionOrder, verifyOrder } = require('../services/cashfreeService');
const { createPhonePeOrder, verifyPhonePePayment } = require('../services/phonePeService');
const { createRupeePaymentsOrder, verifyRupeePaymentsPayment } = require('../services/rupeePaymentsService');
const { authenticateToken } = require('../middleware/auth');
const { SUBSCRIPTION, PAYMENT } = require('../constants');
const logger = require('../utils/logger');

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

        if (!provider) {
            return res.status(400).json({ error: 'Provider is required' });
        }

        try {
            let isSuccessful = false;
            let isPending = false;

            // Verification Logic per provider
            if (provider === PAYMENT.PROVIDER.CASHFREE) {
                const payment = await verifyOrder(orderId);
                if (payment && payment.payment_status === PAYMENT.STATUS.SUCCESS) {
                    isSuccessful = true;
                }
            }
            else if (provider === PAYMENT.PROVIDER.PHONEPE) {
                logger.payment(PAYMENT.PROVIDER.PHONEPE, orderId, 'verification_requested');
                isSuccessful = await verifyPhonePePayment(orderId);
            }
            else if (provider === PAYMENT.PROVIDER.RUPEEPAYMENTS) {
                logger.payment(PAYMENT.PROVIDER.RUPEEPAYMENTS, orderId, 'verification_requested');
                isSuccessful = await verifyRupeePaymentsPayment(orderId);

                // RupeePayments requires manual verification
                if (!isSuccessful) {
                    return res.status(202).json({
                        success: false,
                        message: 'Payment verification pending. Manual verification required.',
                        orderId,
                        provider
                    });
                }
            }

            // Note: If providers send webhooks, handled in handleWebhook.
            // If we can't verify here immediately, we might return 'pending'.

            if (isSuccessful) {
                const userId = req.user.id;
                const newEndDate = new Date(Date.now() + SUBSCRIPTION.DURATION_MS.YEAR).toISOString();

                db.prepare(`
                    UPDATE users
                    SET subscription_status = ?,
                        subscription_end_date = ?
                    WHERE id = ?
                `).run(SUBSCRIPTION.STATUS.ACTIVE, newEndDate, userId);

                logger.payment(provider, orderId, 'verified', { userId, newEndDate });
                logger.info(`Payment verified for user ${userId}. Order: ${orderId}`);

                res.json({
                    success: true,
                    message: 'Subscription activated successfully',
                    subscriptionEnd: newEndDate
                });
            } else {
                // If not strictly failed (maybe pending or just waiting for webhook), message accordingly
                res.status(400).json({
                    error: 'Payment verification failed or pending. Please check status later.'
                });
            }
        } catch (error) {
            logger.error('Payment verification error', {
                orderId,
                provider,
                error: error.message
            });
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

// Webhook handler with signature verification
async function handleWebhook(req, res, db) {
    const crypto = require('crypto');

    try {
        // Determine provider from headers or body
        const xVerifyHeader = req.headers['x-verify'];
        const cashfreeSignature = req.headers['x-cashfree-signature'];

        let provider, orderId, paymentStatus, verified = false;

        // PhonePe Webhook Verification
        if (xVerifyHeader && req.body.response) {
            const SALT_KEY = process.env.PHONEPE_SALT_KEY;
            const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';

            if (!SALT_KEY) {
                logger.error('PhonePe SALT_KEY not configured');
                return res.status(500).json({ error: 'Configuration error' });
            }

            // Verify checksum
            const response = req.body.response;
            const expectedChecksum = crypto.createHash('sha256')
                .update(response + SALT_KEY)
                .digest('hex') + '###' + SALT_INDEX;

            if (expectedChecksum !== xVerifyHeader) {
                logger.security('PhonePe webhook signature verification failed', {
                    expected: expectedChecksum,
                    received: xVerifyHeader
                });
                return res.status(401).json({ error: 'Invalid signature' });
            }

            // Parse response payload
            const payload = JSON.parse(Buffer.from(response, 'base64').toString());
            provider = PAYMENT.PROVIDER.PHONEPE;
            orderId = payload.data.merchantTransactionId;
            paymentStatus = payload.code === 'PAYMENT_SUCCESS' ? 'SUCCESS' : 'FAILED';
            verified = true;

            logger.payment(provider, orderId, 'webhook_received', {
                code: payload.code,
                paymentState: payload.data.paymentState
            });
        }
        // Cashfree Webhook Verification
        else if (cashfreeSignature) {
            const CASHFREE_SECRET = process.env.CASHFREE_SECRET_KEY;

            if (!CASHFREE_SECRET) {
                logger.error('Cashfree SECRET_KEY not configured');
                return res.status(500).json({ error: 'Configuration error' });
            }

            // Verify signature
            const timestamp = req.headers['x-cashfree-timestamp'];
            const rawBody = JSON.stringify(req.body);
            const expectedSignature = crypto.createHmac('sha256', CASHFREE_SECRET)
                .update(timestamp + rawBody)
                .digest('base64');

            if (expectedSignature !== cashfreeSignature) {
                logger.security('Cashfree webhook signature verification failed');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            provider = PAYMENT.PROVIDER.CASHFREE;
            orderId = req.body.data.order.order_id;
            paymentStatus = req.body.data.payment.payment_status;
            verified = true;

            logger.payment(provider, orderId, 'webhook_received', {
                status: paymentStatus
            });
        }
        else {
            logger.warn('Webhook received without recognizable provider headers');
            return res.status(400).json({ error: 'Unknown webhook provider' });
        }

        // Process payment if verification succeeded
        if (verified && paymentStatus === 'SUCCESS') {
            // Extract user ID from order ID (format: ORDER_<userId>_<timestamp>)
            const userId = parseInt(orderId.split('_')[1]);

            if (!userId || isNaN(userId)) {
                logger.error('Invalid order ID format', { orderId });
                return res.status(400).json({ error: 'Invalid order ID' });
            }

            // Check for duplicate webhook processing (idempotency)
            const existingProcessed = db.prepare(`
                SELECT id FROM users
                WHERE id = ?
                AND subscription_status = ?
                AND subscription_end_date > datetime('now')
            `).get(userId, SUBSCRIPTION.STATUS.ACTIVE);

            if (existingProcessed) {
                logger.info('Webhook already processed (idempotent)', { orderId, userId });
                return res.json({ received: true, status: 'already_processed' });
            }

            // Activate subscription
            const newEndDate = new Date(Date.now() + SUBSCRIPTION.DURATION_MS.YEAR).toISOString();

            db.prepare(`
                UPDATE users
                SET subscription_status = ?,
                    subscription_end_date = ?
                WHERE id = ?
            `).run(SUBSCRIPTION.STATUS.ACTIVE, newEndDate, userId);

            logger.payment(provider, orderId, 'subscription_activated', {
                userId,
                newEndDate
            });
            logger.info(`Subscription activated via webhook for user ${userId}`);

            res.json({ received: true, status: 'processed' });
        }
        else if (verified && paymentStatus === 'FAILED') {
            logger.payment(provider, orderId, 'payment_failed');
            res.json({ received: true, status: 'failed' });
        }
        else {
            logger.warn('Webhook received with unrecognized status', { paymentStatus });
            res.json({ received: true, status: 'ignored' });
        }

    } catch (error) {
        logger.error('Webhook processing error', {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}

module.exports = { createSubscriptionRoutes, handleWebhook };
