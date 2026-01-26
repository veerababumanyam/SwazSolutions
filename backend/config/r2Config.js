const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

/**
 * Cloudflare R2 Configuration
 * R2 uses S3-compatible API, so we use AWS SDK v3
 */

// Validate required environment variables
const requiredVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_ENDPOINT'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.warn(`⚠️  Missing R2 environment variables: ${missingVars.join(', ')}`);
    console.warn('   R2 functionality will be disabled until these are configured.');
}

// R2 Configuration
const r2Config = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    endpoint: process.env.R2_ENDPOINT,
    publicUrl: process.env.R2_PUBLIC_URL || null,
    region: process.env.R2_REGION || 'auto',
    presignedUrlExpiry: parseInt(process.env.R2_PRESIGNED_URL_EXPIRY || '3600', 10),
};

// Create S3 client for R2
let s3Client = null;

if (!missingVars.length) {
    try {
        s3Client = new S3Client({
            region: r2Config.region,
            endpoint: r2Config.endpoint,
            credentials: {
                accessKeyId: r2Config.accessKeyId,
                secretAccessKey: r2Config.secretAccessKey,
            },
            // R2-specific configuration
            forcePathStyle: true, // Required for R2
        });
        console.log('✅ R2 S3 client initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize R2 S3 client:', error.message);
    }
} else {
    console.warn('⚠️  R2 S3 client not initialized - missing configuration');
}

/**
 * Get the public URL for an R2 object
 * @param {string} key - Object key (path in bucket)
 * @returns {string} Public URL
 */
function getPublicUrl(key) {
    if (!key) return null;
    
    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    
    if (r2Config.publicUrl) {
        // Use custom domain if configured
        return `${r2Config.publicUrl}/${cleanKey}`;
    }
    
    // Use R2 endpoint format
    // Format: https://{account_id}.r2.cloudflarestorage.com/{bucket}/{key}
    return `${r2Config.endpoint}/${r2Config.bucketName}/${cleanKey}`;
}

/**
 * Check if R2 is properly configured
 * @returns {boolean}
 */
function isConfigured() {
    return s3Client !== null && !missingVars.length;
}

module.exports = {
    s3Client,
    r2Config,
    getPublicUrl,
    isConfigured,
};
