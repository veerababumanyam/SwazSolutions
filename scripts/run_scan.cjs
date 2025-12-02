const path = require('path');
const db = require('../backend/config/database');
const { scanMusicDirectory } = require('../backend/services/musicScanner');

async function run() {
    try {
        const musicDir = path.join(__dirname, '../src/data/MusicFiles');
        console.log('Scanning:', musicDir);
        const result = await scanMusicDirectory(db, musicDir);
        console.log('Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
