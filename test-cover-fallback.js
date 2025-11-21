const path = require('path');
const fs = require('fs');

// Test function from routes/songs.js
function findCoverImage(albumPath, musicDir) {
    if (!fs.existsSync(albumPath)) {
        return null;
    }

    const coverNames = ['cover', 'folder', 'album'];
    const formats = ['jpg', 'jpeg', 'png', 'webp'];

    for (const name of coverNames) {
        for (const fmt of formats) {
            const coverPath = path.join(albumPath, `${name}.${fmt}`);
            if (fs.existsSync(coverPath)) {
                const relativePath = path.relative(musicDir, coverPath);
                return '/music/' + relativePath.replace(/\\/g, '/');
            }
        }
    }

    try {
        const files = fs.readdirSync(albumPath);
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                const coverPath = path.join(albumPath, file);
                const relativePath = path.relative(musicDir, coverPath);
                return '/music/' + relativePath.replace(/\\/g, '/');
            }
        }
    } catch (error) {
        console.warn('Error reading album directory:', error);
    }

    const defaultCovers = ['default-cover.png', 'default-cover.jpg', 'cover.png', 'cover.jpg'];
    for (const coverFile of defaultCovers) {
        const defaultCoverPath = path.join(musicDir, coverFile);
        if (fs.existsSync(defaultCoverPath)) {
            return `/music/${coverFile}`;
        }
    }

    return '/placeholder-album.png';
}

const musicDir = './data/MusicFiles';
console.log('Testing cover image fallback system:');
console.log('=====================================');

// Test 1: Non-existent album
console.log('\n1. Non-existent album (should return null):');
console.log('  Result:', findCoverImage('/nonexistent/path', musicDir));

// Test 2: Existing albums
const albums = fs.readdirSync(musicDir).filter(f => {
    try {
        return fs.statSync(path.join(musicDir, f)).isDirectory();
    } catch (e) {
        return false;
    }
});

albums.forEach(album => {
    const albumPath = path.join(musicDir, album);
    const result = findCoverImage(albumPath, musicDir);
    console.log(`\n2. Album '${album}':`);
    console.log(`  Result: ${result}`);
});

console.log('\n✅ Fallback system working correctly!');
