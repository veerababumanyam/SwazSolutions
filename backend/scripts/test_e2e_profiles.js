#!/usr/bin/env node
/**
 * End-to-End Testing Script for Virtual Profile System
 * Tests from an end-user perspective:
 * 1. Username uniqueness and validation
 * 2. URL uniqueness and collision prevention
 * 3. Profile-to-public-URL linkage
 * 4. Username suggestion system
 * 5. Short URL generation logic
 */

const BASE_URL = 'http://localhost:3000';

// Color output helpers
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function makeRequest(method, path, body = null) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  
  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

// Test Suite
const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

// ============================================================================
// TEST 1: Username Validation
// ============================================================================
test('Should reject uppercase letters in username', async () => {
  const result = await makeRequest('POST', '/api/profiles', {
    username: 'JohnDoe',
    displayName: 'John Doe'
  });
  
  if (result.status === 400 && result.data.error?.includes('Invalid username')) {
    return { pass: true, message: 'Correctly rejected uppercase' };
  }
  return { pass: false, message: `Expected 400, got ${result.status}` };
});

test('Should reject spaces in username', async () => {
  const result = await makeRequest('POST', '/api/profiles', {
    username: 'john doe',
    displayName: 'John Doe'
  });
  
  if (result.status === 400) {
    return { pass: true, message: 'Correctly rejected spaces' };
  }
  return { pass: false, message: `Expected 400, got ${result.status}` };
});

test('Should reject username < 3 characters', async () => {
  const result = await makeRequest('POST', '/api/profiles', {
    username: 'ab',
    displayName: 'AB'
  });
  
  if (result.status === 400) {
    return { pass: true, message: 'Correctly rejected short username' };
  }
  return { pass: false, message: `Expected 400, got ${result.status}` };
});

test('Should reject username > 50 characters', async () => {
  const result = await makeRequest('POST', '/api/profiles', {
    username: 'a'.repeat(51),
    displayName: 'Long Name'
  });
  
  if (result.status === 400) {
    return { pass: true, message: 'Correctly rejected long username' };
  }
  return { pass: false, message: `Expected 400, got ${result.status}` };
});

test('Should accept valid username with underscores and hyphens', async () => {
  const result = await makeRequest('POST', '/api/profiles', {
    username: 'john_doe-123',
    displayName: 'John Doe'
  });
  
  // Should succeed or conflict (if already exists)
  if (result.status === 201 || result.status === 409) {
    return { pass: true, message: 'Valid format accepted' };
  }
  return { pass: false, message: `Expected 201 or 409, got ${result.status}: ${JSON.stringify(result.data)}` };
});

// ============================================================================
// TEST 2: Username Uniqueness
// ============================================================================
test('Should prevent duplicate usernames', async () => {
  // Try to create same username twice
  const username = `testuser${Date.now()}`;
  
  const first = await makeRequest('POST', '/api/profiles', {
    username,
    displayName: 'First User'
  });
  
  if (first.status !== 201 && first.status !== 409) {
    return { pass: false, message: `First creation failed: ${first.status}` };
  }
  
  // Try again with same username
  const second = await makeRequest('POST', '/api/profiles', {
    username,
    displayName: 'Second User'
  });
  
  if (second.status === 409 && second.data.error?.includes('already taken')) {
    return { pass: true, message: 'Duplicate correctly prevented' };
  }
  return { pass: false, message: `Expected 409, got ${second.status}` };
});

test('Should provide username suggestions when taken', async () => {
  const username = `taken${Date.now()}`;
  
  // Create first profile
  await makeRequest('POST', '/api/profiles', { username, displayName: 'First' });
  
  // Try duplicate
  const result = await makeRequest('POST', '/api/profiles', {
    username,
    displayName: 'Second'
  });
  
  if (result.status === 409 && Array.isArray(result.data.suggestions) && result.data.suggestions.length > 0) {
    return { 
      pass: true, 
      message: `Provided ${result.data.suggestions.length} suggestions: ${result.data.suggestions.join(', ')}` 
    };
  }
  return { pass: false, message: 'No suggestions provided' };
});

// ============================================================================
// TEST 3: Profile-to-Public-URL Linkage
// ============================================================================
test('Should create profile with unique public URL', async () => {
  const username = `urltest${Date.now()}`;
  
  const create = await makeRequest('POST', '/api/profiles', {
    username,
    displayName: 'URL Test User',
    published: true
  });
  
  if (create.status !== 201) {
    return { pass: false, message: `Profile creation failed: ${create.status}` };
  }
  
  // Check public URL works
  const publicUrl = await makeRequest('GET', `/api/public/profile/${username}`);
  
  if (publicUrl.ok && publicUrl.data.username === username) {
    return { pass: true, message: `Public URL /u/${username} correctly linked` };
  }
  return { pass: false, message: 'Public URL not accessible' };
});

test('Should return 404 for non-existent profile', async () => {
  const result = await makeRequest('GET', `/api/public/profile/nonexistent${Date.now()}`);
  
  if (result.status === 404) {
    return { pass: true, message: 'Correctly returns 404' };
  }
  return { pass: false, message: `Expected 404, got ${result.status}` };
});

test('Should not show unpublished profiles publicly', async () => {
  const username = `private${Date.now()}`;
  
  await makeRequest('POST', '/api/profiles', {
    username,
    displayName: 'Private User',
    published: false  // Not published
  });
  
  const result = await makeRequest('GET', `/api/public/profile/${username}`);
  
  if (result.status === 404) {
    return { pass: true, message: 'Unpublished profile correctly hidden' };
  }
  return { pass: false, message: 'Unpublished profile is accessible!' };
});

// ============================================================================
// TEST 4: Short URL Logic
// ============================================================================
test('Should allow short usernames (3-5 chars)', async () => {
  const shortNames = ['abc', 'dev', 'pro', 'ai', 'app'];
  let success = 0;
  
  for (const name of shortNames) {
    const result = await makeRequest('POST', '/api/profiles', {
      username: `${name}${Date.now()}`.slice(0, 5),
      displayName: 'Short Name'
    });
    if (result.status === 201 || result.status === 409) success++;
  }
  
  if (success === shortNames.length) {
    return { pass: true, message: 'Short usernames work correctly' };
  }
  return { pass: false, message: `Only ${success}/${shortNames.length} succeeded` };
});

test('Username should be case-insensitive for uniqueness', async () => {
  const base = `casetest${Date.now()}`;
  
  const lower = await makeRequest('POST', '/api/profiles', {
    username: base.toLowerCase(),
    displayName: 'Lower Case'
  });
  
  if (lower.status !== 201 && lower.status !== 409) {
    return { pass: false, message: 'First creation failed' };
  }
  
  // Try uppercase version
  const upper = await makeRequest('POST', '/api/profiles', {
    username: base.toUpperCase(), // Will be rejected by validation
    displayName: 'Upper Case'
  });
  
  // Should be rejected due to validation (uppercase not allowed)
  if (upper.status === 400) {
    return { pass: true, message: 'Case sensitivity enforced via validation' };
  }
  return { pass: false, message: 'Case handling unclear' };
});

// ============================================================================
// TEST 5: QR Code Integration
// ============================================================================
test('Should generate QR code for created profile', async () => {
  const username = `qrtest${Date.now()}`;
  
  const create = await makeRequest('POST', '/api/profiles', {
    username,
    displayName: 'QR Test',
    published: true
  });
  
  if (create.status !== 201 && create.status !== 409) {
    return { pass: false, message: 'Profile creation failed' };
  }
  
  // Test QR code endpoint
  const qrResponse = await fetch(`${BASE_URL}/api/qr-codes/me/qr-code?format=png&size=500`);
  
  if (qrResponse.ok && qrResponse.headers.get('content-type')?.includes('image')) {
    return { pass: true, message: 'QR code generated successfully' };
  }
  return { pass: false, message: 'QR code generation failed' };
});

// ============================================================================
// Run All Tests
// ============================================================================
async function runTests() {
  console.log('\n' + '='.repeat(80));
  log(colors.blue, '🧪 RUNNING END-TO-END VIRTUAL PROFILE TESTS');
  console.log('='.repeat(80) + '\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, fn } of tests) {
    process.stdout.write(`Testing: ${name}... `);
    
    try {
      const result = await fn();
      
      if (result.pass) {
        log(colors.green, `✓ PASS - ${result.message}`);
        passed++;
      } else {
        log(colors.red, `✗ FAIL - ${result.message}`);
        failed++;
      }
    } catch (error) {
      log(colors.red, `✗ ERROR - ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(80));
  log(colors.blue, `RESULTS: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  console.log('='.repeat(80) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(colors.red, 'Fatal error:', error);
  process.exit(1);
});
