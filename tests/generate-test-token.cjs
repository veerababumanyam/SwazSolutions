/**
 * Generate Test JWT Token for Phase 1 Testing
 * This creates a valid JWT token for testing profile endpoints
 */

const jwt = require('jsonwebtoken');

// Use the same secret as the server
const JWT_SECRET = process.env.JWT_SECRET || 'placeholder-not-used';

// Generate token for test user
const testUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User'
};

const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '24h' });

console.log('\n====================================');
console.log('Test JWT Token Generated');
console.log('====================================\n');
console.log('Token:', token);
console.log('\nUser:', JSON.stringify(testUser, null, 2));
console.log('\nUse in API calls:');
console.log(`  -H "Authorization: Bearer ${token}"`);
console.log('\nOr in curl:');
console.log(`  curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/profiles/me`);
console.log('\n====================================\n');
