// Test script to create test user and profile for QR code testing
const db = require('../config/database');

console.log('Creating test user and profile...\n');

try {
  // Create test user
  const userStmt = db.prepare('INSERT OR REPLACE INTO users (id, email, password_hash, email_verified) VALUES (?, ?, ?, ?)');
  userStmt.run(999, 'qrtest@example.com', 'test', 1);
  console.log('✅ Test user created');

  // Create test profile
  const profileStmt = db.prepare(`
    INSERT OR REPLACE INTO profiles (
      id, user_id, username, display_name, headline, bio, 
      avatar, is_public, allow_search_indexing, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  profileStmt.run(
    999, 999, 'qrtestuser', 'QR Test User', 
    'Testing QR Code Feature', 'This is a test profile for QR code generation',
    null, 1, 1
  );
  console.log('✅ Test profile created\n');

  // Verify creation
  const verify = db.prepare('SELECT username, display_name FROM profiles WHERE id = ?').get(999);
  console.log('Profile details:');
  console.log(`  Username: ${verify.username}`);
  console.log(`  Display Name: ${verify.display_name}`);
  console.log(`  Public URL: http://localhost:5173/u/${verify.username}`);
  console.log(`  API endpoint: http://localhost:3000/api/qr-codes/me/qr-code`);

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
