/**
 * Seed Test Users Script
 * Creates test users for local development and testing
 * 
 * Usage: node backend/scripts/seed-test-users.js
 * 
 * Test Users Created:
 * 1. admin@swaz.com / Admin123! (role: admin)
 * 2. pro@swaz.com / ProUser123! (role: pro)  
 * 3. user@swaz.com / TestUser123! (role: user)
 */

const bcrypt = require('bcrypt');

async function seedTestUsers() {
  // Wait for database to be ready
  const db = require('../config/database');
  // @ts-ignore - db.ready is added via Proxy
  if (db.ready) await db.ready;

  console.log('\n🌱 Seeding test users...\n');

  const testUsers = [
    {
      username: 'admin',
      email: 'admin@swaz.com',
      password: 'Admin123!',
      role: 'admin'
    },
    {
      username: 'prouser',
      email: 'pro@swaz.com', 
      password: 'ProUser123!',
      role: 'pro'
    },
    {
      username: 'testuser',
      email: 'user@swaz.com',
      password: 'TestUser123!',
      role: 'user'
    }
  ];

  for (const user of testUsers) {
    try {
      // Check if user already exists
      const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(user.username, user.email);
      
      if (existing) {
        console.log(`⏭️  User "${user.username}" already exists (ID: ${existing.id})`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Insert user
      const result = db.prepare(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
      ).run(user.username, user.email, passwordHash, user.role);

      console.log(`✅ Created user "${user.username}" (ID: ${result.lastInsertRowid})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log('');

      // Create a default profile for the user
      try {
        db.prepare(
          `INSERT INTO profiles (user_id, username, display_name, published, created_at, updated_at)
           VALUES (?, ?, ?, 0, datetime('now'), datetime('now'))`
        ).run(result.lastInsertRowid, user.username, user.username);
        console.log(`   📋 Created default profile for "${user.username}"`);
      } catch (profileError) {
        const errMsg = profileError instanceof Error ? profileError.message : String(profileError);
        console.log(`   ⚠️  Profile already exists or could not be created: ${errMsg}`);
      }
      console.log('');

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to create user "${user.username}":`, errMsg);
    }
  }

  console.log('\n✨ Test user seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Test Credentials Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Admin User:');
  console.log('    Email:    admin@swaz.com');
  console.log('    Password: Admin123!');
  console.log('    Role:     admin');
  console.log('');
  console.log('  Pro User:');
  console.log('    Email:    pro@swaz.com');
  console.log('    Password: ProUser123!');
  console.log('    Role:     pro');
  console.log('');
  console.log('  Standard User:');
  console.log('    Email:    user@swaz.com');
  console.log('    Password: TestUser123!');
  console.log('    Role:     user');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔐 You can also login with Google OAuth using your Google account.');
  console.log('');

  process.exit(0);
}

seedTestUsers().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
