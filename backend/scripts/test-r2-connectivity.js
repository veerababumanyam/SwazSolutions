const { listObjects, getObjectUrl, isConfigured, listObjectsByAlbum } = require('../services/r2Service');
const { r2Config } = require('../config/r2Config');

/**
 * Test R2 connectivity and verify album mapping
 */

async function testR2Connectivity() {
    console.log('🧪 Testing Cloudflare R2 Connectivity...');
    console.log('');

    // Check configuration
    if (!isConfigured()) {
        console.error('❌ R2 is not configured. Please check your R2 environment variables.');
        console.error('   Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT');
        process.exit(1);
    }

    console.log('✅ R2 Configuration:');
    console.log(`   Account ID: ${r2Config.accountId}`);
    console.log(`   Bucket: ${r2Config.bucketName}`);
    console.log(`   Endpoint: ${r2Config.endpoint}`);
    console.log('');

    try {
        // Test 1: List objects
        console.log('📋 Test 1: Listing objects in bucket...');
        const objects = await listObjects('', 10); // Get first 10 objects
        console.log(`   ✅ Found ${objects.length} objects (showing first 10)`);
        
        if (objects.length > 0) {
            console.log('   Sample objects:');
            objects.slice(0, 5).forEach(obj => {
                console.log(`      - ${obj.key} (${(obj.size / 1024).toFixed(2)} KB)`);
            });
        } else {
            console.log('   ⚠️  No objects found in bucket. Make sure files are uploaded to R2.');
        }
        console.log('');

        // Test 2: Album mapping
        console.log('📁 Test 2: Verifying album mapping from subfolders...');
        const albumsMap = await listObjectsByAlbum('');
        console.log(`   ✅ Found ${albumsMap.size} albums:`);
        
        for (const [albumName, albumObjects] of albumsMap.entries()) {
            const audioFiles = albumObjects.filter(obj => {
                const ext = obj.key.split('.').pop().toLowerCase();
                return ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext);
            });
            console.log(`      - "${albumName}": ${audioFiles.length} audio file(s)`);
        }
        console.log('');

        // Test 3: Generate URLs
        if (objects.length > 0) {
            console.log('🔗 Test 3: Generating public URLs...');
            const testObject = objects[0];
            const url = await getObjectUrl(testObject.key, false);
            console.log(`   ✅ Generated URL for "${testObject.key}":`);
            console.log(`      ${url}`);
            console.log('');
        }

        // Test 4: Verify structure
        console.log('📊 Test 4: Verifying R2 structure...');
        const allObjects = await listObjects('');
        const hasSubfolders = allObjects.some(obj => obj.key.includes('/'));
        
        if (hasSubfolders) {
            console.log('   ✅ Bucket contains subfolders (albums)');
        } else {
            console.log('   ⚠️  No subfolders found - all files are in root');
        }
        console.log('');

        console.log('════════════════════════════════════════');
        console.log('✅ All R2 connectivity tests passed!');
        console.log('════════════════════════════════════════');
        console.log('');
        console.log('💡 Next steps:');
        console.log('   1. Run music scan: POST /api/songs/scan');
        console.log('   2. Verify songs are loaded in the database');
        console.log('   3. Test playback in the frontend');

    } catch (error) {
        console.error('❌ R2 connectivity test failed:');
        console.error(`   Error: ${error.message}`);
        console.error('');
        console.error('💡 Troubleshooting:');
        console.error('   1. Verify R2 credentials are correct');
        console.error('   2. Check R2 bucket name matches R2_BUCKET_NAME');
        console.error('   3. Ensure R2 bucket exists and is accessible');
        console.error('   4. Verify network connectivity to R2 endpoint');
        process.exit(1);
    }
}

// Run tests
testR2Connectivity()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
