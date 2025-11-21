const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000;

function checkServerRunning() {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${PORT}/api/health`, (res) => {
            resolve(res.statusCode === 200);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.end();
    });
}

function triggerApiScan() {
    console.log('🌐 Server is running. Triggering scan via API...');

    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/songs/scan',
        method: 'POST'
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 200) {
                console.log('✅ Scan completed successfully via API.');
                console.log('Response:', JSON.parse(data));
            } else {
                console.error('❌ Scan failed via API:', res.statusCode, data);
                process.exit(1);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Error triggering API scan:', error);
        process.exit(1);
    });

    req.end();
}

async function runDirectScan() {
    console.log('💾 Server is offline. Running direct database scan...');

    try {
        // Initialize database
        const db = require('../config/database');
        const { scanMusicDirectory } = require('../services/musicScanner');

        // Wait for DB to be ready
        await db.ready;

        const musicDir = process.env.MUSIC_DIR || path.join(__dirname, '../../data/MusicFiles');
        console.log(`📂 Scanning directory: ${musicDir}`);

        const result = await scanMusicDirectory(db, musicDir);

        console.log('✅ Direct scan completed successfully.');
        console.log('Stats:', result);

        // Close DB to save changes
        db.close();

    } catch (error) {
        console.error('❌ Direct scan failed:', error);
        process.exit(1);
    }
}

async function main() {
    console.log(`🎵 Starting Music Update Script at ${new Date().toISOString()}`);

    const isRunning = await checkServerRunning();

    if (isRunning) {
        triggerApiScan();
    } else {
        runDirectScan();
    }
}

main();
