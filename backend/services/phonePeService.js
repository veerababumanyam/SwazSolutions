const axios = require('axios');
const crypto = require('crypto');

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const SALT_KEY = process.env.PHONEPE_SALT_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const ENV = process.env.PHONEPE_ENV || 'UAT'; // 'UAT' or 'PROD'

const BASE_URL = ENV === 'PROD'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const CLIENT_URL = process.env.CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Create a PhonePe Order
 */
async function createPhonePeOrder(user) {
    const orderId = `ORDER_${user.id}_${Date.now()}`;

    const payload = {
        merchantId: MERCHANT_ID,
        merchantTransactionId: orderId,
        merchantUserId: `USER_${user.id}`,
        amount: 200 * 100, // Amount in paise (200 INR)
        redirectUrl: `${CLIENT_URL}/?payment_status=SUCCESS&provider=phonepe`, // Simplified for now
        redirectMode: "REDIRECT",
        callbackUrl: `${process.env.VITE_API_URL || 'http://localhost:3000'}/api/subscription/webhook`,
        mobileNumber: "9999999999", // Placeholder if user doesn't have phone
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = crypto.createHash('sha256').update(base64Payload + "/pg/v1/pay" + SALT_KEY).digest('hex') + "###" + SALT_INDEX;

    try {
        const response = await axios.post(`${BASE_URL}/pg/v1/pay`, {
            request: base64Payload
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            }
        });

        if (response.data.success) {
            return {
                order_id: orderId,
                payment_link: response.data.data.instrumentResponse.redirectInfo.url
            };
        } else {
            throw new Error(response.data.message || 'PhonePe payment creation failed');
        }
    } catch (error) {
        console.error('PhonePe Error:', error.response?.data || error.message);
        throw new Error('Failed to initiate PhonePe payment');
    }
}

module.exports = { createPhonePeOrder };
