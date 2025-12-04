/**
 * Update Test Profiles with Mock Data
 * Adds realistic profile data to existing test users for testing
 * 
 * Usage: node backend/scripts/update-test-profiles.js
 */

async function updateTestProfiles() {
  const db = require('../config/database');
  // @ts-ignore - db.ready is added via Proxy
  if (db.ready) await db.ready;

  console.log('\n📝 Updating test profiles with mock data...\n');

  const profileUpdates = [
    {
      username: 'admin',
      display_name: 'Admin User',
      first_name: 'System',
      last_name: 'Administrator',
      headline: 'Platform Administrator',
      company: 'Swaz Solutions',
      bio: 'Managing and maintaining the Swaz Solutions platform. Passionate about building great user experiences and ensuring smooth operations.',
      public_email: 'admin@swaz.com',
      public_phone: '+1 (555) 100-0001',
      website: 'https://swaz.solutions',
      pronouns: 'they/them',
      published: 1
    },
    {
      username: 'prouser',
      display_name: 'Sarah Johnson',
      first_name: 'Sarah',
      last_name: 'Johnson',
      headline: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      bio: 'Full-stack developer with 10+ years of experience building scalable web applications. Specializing in React, Node.js, and cloud architecture. Always learning, always building.',
      public_email: 'sarah.johnson@techinnovations.com',
      public_phone: '+1 (555) 200-0002',
      website: 'https://sarahjohnson.dev',
      pronouns: 'she/her',
      published: 1
    },
    {
      username: 'testuser',
      display_name: 'Alex Chen',
      first_name: 'Alex',
      last_name: 'Chen',
      headline: 'Product Designer & UX Specialist',
      company: 'Creative Studio',
      bio: 'Creating beautiful, user-centered designs that solve real problems. I believe in the power of design to make technology accessible and delightful for everyone.',
      public_email: 'alex.chen@creativestudio.io',
      public_phone: '+1 (555) 300-0003',
      website: 'https://alexchen.design',
      pronouns: 'he/him',
      published: 1
    }
  ];

  for (const profile of profileUpdates) {
    try {
      // Check if profile exists
      const existing = db.prepare('SELECT id, user_id FROM profiles WHERE username = ?').get(profile.username);
      
      if (!existing) {
        console.log(`⏭️  Profile for "${profile.username}" not found, skipping...`);
        continue;
      }

      // Update profile with mock data
      db.prepare(`
        UPDATE profiles SET
          display_name = ?,
          first_name = ?,
          last_name = ?,
          headline = ?,
          company = ?,
          bio = ?,
          public_email = ?,
          public_phone = ?,
          website = ?,
          pronouns = ?,
          published = ?,
          updated_at = datetime('now')
        WHERE username = ?
      `).run(
        profile.display_name,
        profile.first_name,
        profile.last_name,
        profile.headline,
        profile.company,
        profile.bio,
        profile.public_email,
        profile.public_phone,
        profile.website,
        profile.pronouns,
        profile.published,
        profile.username
      );

      console.log(`✅ Updated profile for "${profile.username}"`);
      console.log(`   Display Name: ${profile.display_name}`);
      console.log(`   Headline: ${profile.headline}`);
      console.log(`   Company: ${profile.company}`);
      console.log(`   Published: ${profile.published ? 'Yes' : 'No'}`);
      console.log('');

    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to update profile "${profile.username}":`, errMsg);
    }
  }

  console.log('\n✨ Test profile update complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Updated Profiles:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Admin User:');
  console.log('    Public URL: http://localhost:5173/u/admin');
  console.log('');
  console.log('  Pro User (Sarah Johnson):');
  console.log('    Public URL: http://localhost:5173/u/prouser');
  console.log('');
  console.log('  Test User (Alex Chen):');
  console.log('    Public URL: http://localhost:5173/u/testuser');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
}

updateTestProfiles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
