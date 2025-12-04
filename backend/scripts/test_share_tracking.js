// Test Share Functionality (T143-T147)
// Comprehensive test for Multi-Channel Sharing feature

const baseUrl = 'http://localhost:3000';

async function testShareTracking() {
  console.log('\n🧪 Testing Share Tracking Functionality\n');
  console.log('═'.repeat(60));
  
  let testsPassed = 0;
  let testsFailed = 0;
  const errors = [];

  // Test 1: Track copy link share
  try {
    console.log('\n📋 Test 1: Track "Copy Link" Share');
    const response = await fetch(`${baseUrl}/api/profiles/share-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'TESTING_MODE=true'
      },
      body: JSON.stringify({
        profile_id: 47,
        share_method: 'clipboard',
        platform: 'copy-link'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('  ✅ Copy link share tracked successfully');
      console.log(`  📊 Event ID: ${data.event_id}`);
      testsPassed++;
    } else {
      throw new Error(data.error || 'Failed to track share');
    }
  } catch (error) {
    console.error('  ❌ FAILED:', error.message);
    errors.push({ test: 'Copy Link Share', error: error.message });
    testsFailed++;
  }

  // Test 2: Track WhatsApp share
  try {
    console.log('\n📱 Test 2: Track "WhatsApp" Share');
    const response = await fetch(`${baseUrl}/api/profiles/share-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'TESTING_MODE=true'
      },
      body: JSON.stringify({
        profile_id: 47,
        share_method: 'whatsapp',
        platform: 'mobile'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('  ✅ WhatsApp share tracked successfully');
      console.log(`  📊 Event ID: ${data.event_id}`);
      testsPassed++;
    } else {
      throw new Error(data.error || 'Failed to track share');
    }
  } catch (error) {
    console.error('  ❌ FAILED:', error.message);
    errors.push({ test: 'WhatsApp Share', error: error.message });
    testsFailed++;
  }

  // Test 3: Track native system share
  try {
    console.log('\n🔄 Test 3: Track "Native Share" (iOS/Android)');
    const response = await fetch(`${baseUrl}/api/profiles/share-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'TESTING_MODE=true'
      },
      body: JSON.stringify({
        profile_id: 47,
        share_method: 'native',
        platform: 'system'
      })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('  ✅ Native share tracked successfully');
      console.log(`  📊 Event ID: ${data.event_id}`);
      testsPassed++;
    } else {
      throw new Error(data.error || 'Failed to track share');
    }
  } catch (error) {
    console.error('  ❌ FAILED:', error.message);
    errors.push({ test: 'Native Share', error: error.message });
    testsFailed++;
  }

  // Test 4: Validation - missing required fields
  try {
    console.log('\n⚠️  Test 4: Validation - Missing Required Fields');
    const response = await fetch(`${baseUrl}/api/profiles/share-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'TESTING_MODE=true'
      },
      body: JSON.stringify({
        profile_id: 47
        // Missing share_method
      })
    });

    const data = await response.json();
    
    if (response.status === 400 && data.error.includes('required fields')) {
      console.log('  ✅ Validation working - rejected missing fields');
      testsPassed++;
    } else {
      throw new Error('Expected 400 error for missing fields');
    }
  } catch (error) {
    console.error('  ❌ FAILED:', error.message);
    errors.push({ test: 'Missing Fields Validation', error: error.message });
    testsFailed++;
  }

  // Test 5: Validation - non-existent profile
  try {
    console.log('\n🔍 Test 5: Validation - Non-Existent Profile');
    const response = await fetch(`${baseUrl}/api/profiles/share-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'TESTING_MODE=true'
      },
      body: JSON.stringify({
        profile_id: 99999,
        share_method: 'clipboard'
      })
    });

    const data = await response.json();
    
    if (response.status === 404 && data.error === 'Profile not found') {
      console.log('  ✅ Validation working - rejected invalid profile');
      testsPassed++;
    } else {
      throw new Error('Expected 404 error for invalid profile');
    }
  } catch (error) {
    console.error('  ❌ FAILED:', error.message);
    errors.push({ test: 'Invalid Profile Validation', error: error.message });
    testsFailed++;
  }

  // Test 6: Verify share events stored correctly
  try {
    console.log('\n💾 Test 6: Verify Share Events Stored in Database');
    const db = require('../config/database');

    const events = db.prepare(
      'SELECT * FROM share_events WHERE profile_id = 47 ORDER BY created_at DESC LIMIT 5'
    ).all();

    if (events && events.length >= 3) {
      console.log(`  ✅ Found ${events.length} share events in database`);
      console.log('\n  📊 Recent Share Events:');
      events.forEach((event, i) => {
        console.log(`     ${i + 1}. ${event.share_method} (${event.platform || 'N/A'}) - ${event.created_at}`);
      });
      testsPassed++;
    } else {
      throw new Error(`Expected at least 3 events, found ${events ? events.length : 0}`);
    }
  } catch (error) {
    console.error('  ❌ FAILED:', error.message);
    errors.push({ test: 'Database Storage Verification', error: error.message });
    testsFailed++;
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

  if (errors.length > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.test}`);
      console.log(`   Error: ${err.error}\n`);
    });
  }

  console.log('\n' + '═'.repeat(60));

  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
testShareTracking();
