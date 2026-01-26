let Cashfree;
try {
    ({ Cashfree } = require('cashfree-pg'));
    // Initialize Cashfree
    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = process.env.NODE_ENV === 'production' ? Cashfree.Environment.PRODUCTION : Cashfree.Environment.SANDBOX;
} catch (error) {
    console.warn('⚠️  Cashfree SDK not available. Subscription features will be disabled.');
}

const CLIENT_URL = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Create a Cashfree order for subscription
 * @param {Object} user
 * @returns {Promise<Object>} orderData
 */
async function createSubscriptionOrder(user) {
    if (!Cashfree) {
        throw new Error('Cashfree SDK not available. Please install cashfree-pg package.');
    }

    const orderId = `ORDER_${user.id}_${Date.now()}`;

    // expiry 30 minutes for the payment link
    const expiryDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const request = {
        order_amount: 200.00,
        order_currency: 'INR',
        customer_details: {
            customer_id: `USER_${user.id}`,
            customer_name: user.username,
            customer_email: user.email || 'noemail@example.com',
            customer_phone: '9999999999' // Required by Cashfree, placeholder if not available
        },
        order_meta: {
            return_url: `${CLIENT_URL}/?payment_id={order_id}&payment_status={order_status}`,
            notify_url: `${process.env.VITE_API_URL || 'http://localhost:3000'}/api/subscription/webhook`
        },
        order_id: orderId,
        order_note: 'Yearly Subscription - 1 Year Access'
    };

    try {
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        return response.data;
    } catch (error) {
        console.error('Error creating Cashfree order:', error.response?.data || error.message);
        throw new Error('Failed to create payment order');
    }
}

/**
 * Verify a Cashfree payment
 * @param {string} orderId
 * @returns {Promise<Object>} paymentData
 */
async function verifyOrder(orderId) {
    if (!Cashfree) {
        throw new Error('Cashfree SDK not available. Please install cashfree-pg package.');
    }

    try {
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        // Find successful payment
        const successPayment = response.data.find(p => p.payment_status === 'SUCCESS');
        return successPayment;
    } catch (error) {
        console.error('Error verifying Cashfree order:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    createSubscriptionOrder,
    verifyOrder
};
