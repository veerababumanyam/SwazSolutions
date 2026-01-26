// Minimal placeholder service for RupeePayments
const crypto = require('crypto');

const KEY = process.env.RUPEEPAYMENTS_KEY;
const SECRET = process.env.RUPEEPAYMENTS_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Create RupeePayments Order
 * DISABLED: This payment provider is not fully implemented
 */
async function createRupeePaymentsOrder(user) {
    throw new Error('RupeePayments integration is not available. Please use Cashfree or PhonePe.');
}

/**
 * Verify RupeePayments Payment
 * DISABLED: This payment provider is not fully implemented
 */
async function verifyRupeePaymentsPayment(orderId) {
    throw new Error('RupeePayments integration is not available. Please use Cashfree or PhonePe.');
}

/**
 * Get verification status for RupeePayments
 * Returns detailed status information
 * @param {string} orderId - Order ID to check
 * @returns {Promise<object>} Status object
 */
async function getRupeePaymentsStatus(orderId) {
    return {
        orderId,
        provider: 'rupeepayments',
        status: 'pending_manual_verification',
        message: 'Payment requires manual verification by administrator',
        verified: false,
        autoVerificationAvailable: false
    };
}

module.exports = {
    createRupeePaymentsOrder,
    verifyRupeePaymentsPayment,
    getRupeePaymentsStatus
};
