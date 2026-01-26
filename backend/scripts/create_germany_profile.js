const path = require('path');
// Point to the root music.db as used by the server
process.env.DB_PATH = path.resolve('./music.db');
const db = require('../config/database');
const crypto = require('crypto');

(async () => {
    console.log('Waiting for database initialization...');
    await db.ready;
    console.log('✅ Database initialized. Creating GermanyManyam user and profile...\n');

    try {
        const username = 'GermanyManyam';
        const email = 'germany@swazsolutions.com'; // Dummy email

        // 1. Create User
        let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user) {
            const insertUser = db.prepare(`
        INSERT INTO users (username, email, password_hash, role, subscription_status)
        VALUES (?, ?, ?, ?, ?)
      `);
            const result = insertUser.run(username, email, 'dummy_hash', 'admin', 'active');
            console.log(`✅ User '${username}' created with ID: ${result.lastInsertRowid}`);
            user = { id: result.lastInsertRowid };
        } else {
            console.log(`ℹ️  User '${username}' already exists with ID: ${user.id}`);
        }

        // 2. Create Profile
        let profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(user.id);

        if (!profile) {
            const insertProfile = db.prepare(`
        INSERT INTO profiles (
          user_id, username, display_name, headline, bio, 
          published, indexing_opt_in, created_at, updated_at,
          show_email, show_phone, show_website,
          show_headline, show_company, show_first_name, show_last_name, show_pronouns
        ) VALUES (
          ?, ?, ?, ?, ?, 
          1, 1, datetime('now'), datetime('now'),
          1, 1, 1,
          1, 1, 1, 1, 1
        )
      `);

            const result = insertProfile.run(
                user.id,
                username,
                'Germany Manyam',
                'Digital Innovator',
                'Welcome to my digital business card.'
            );
            console.log(`✅ Profile for '${username}' created with ID: ${result.lastInsertRowid}`);
        } else {
            console.log(`ℹ️  Profile for '${username}' already exists. Updating published status...`);
            db.prepare('UPDATE profiles SET published = 1 WHERE id = ?').run(profile.id);
            console.log('✅ Profile marked as published');
        }

        console.log('\nVerification:');
        const verify = db.prepare('SELECT * FROM profiles WHERE username = ?').get(username);
        console.log('Profile found:', verify ? 'YES' : 'NO');
        if (verify) {
            console.log('Published:', verify.published);
            console.log('ID:', verify.id);
        }

        console.log('Waiting 2 seconds for database persistence...');
        setTimeout(() => {
            console.log('✅ Done.');
            process.exit(0);
        }, 2000);

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();
