const db = require('../backend/config/database');

async function check() {
    await db.ready;
    const songs = db.prepare('SELECT * FROM songs').all();
    console.log(JSON.stringify(songs, null, 2));
}

check();
