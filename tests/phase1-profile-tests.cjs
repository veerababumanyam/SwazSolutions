/**
 * Phase 1: Core Profile Testing Suite
 * Tests for Virtual Profile creation, validation, and publishing
 * 
 * Run with: node tests/phase1-profile-tests.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
const TEST_USER_ID = 1;

// Test user info (server will inject this in TESTING_MODE)
const TEST_USER = {
  id: TEST_USER_ID,
  email: 'test@example.com',
  name: 'Test User'
};

// Set testing mode environment variable
process.env.TESTING_MODE = 'true';

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

/**
 * Make HTTP request helper
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Phase1-Test-Suite',
        'X-Testing-Mode': 'true'
      }
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test assertion helper
 */
function assert(condition, testName, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    return true;
  } else {
    testResults.failed++;
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (message) {
      console.log(`  ${colors.yellow}→${colors.reset} ${message}`);
    }
    return false;
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate unique username
 */
function generateUsername() {
  return `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * T053: Test Profile Creation Flow
 */
async function testProfileCreation() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}T053: Profile Creation Flow${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const username = generateUsername();
  const profileData = {
    username,
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    headline: 'Software Engineer Testing Profile System',
    company: 'Test Corp',
    bio: 'This is a test profile created by the automated testing suite.',
    pronouns: 'they/them',
    publicEmail: 'test@example.com',
    publicPhone: '+1234567890',
    website: 'https://example.com',
    published: false,
    indexing_opt_in: false
  };

  try {
    // Create profile
    const createRes = await makeRequest('POST', '/api/profiles', profileData);
    
    assert(
      createRes.status === 201,
      'Profile creation returns 201 status',
      `Got ${createRes.status}`
    );
    
    assert(
      createRes.data && createRes.data.profile,
      'Profile creation returns profile data',
      `Got: ${JSON.stringify(createRes.data)}`
    );
    
    assert(
      createRes.data.profile.username === username,
      'Created profile has correct username',
      `Expected: ${username}, Got: ${createRes.data.profile?.username}`
    );
    
    const profileId = createRes.data.profile?.id;
    
    // Verify profile can be retrieved
    const getRes = await makeRequest('GET', '/api/profiles/me');
    
    assert(
      getRes.status === 200,
      'Can retrieve created profile',
      `Got ${getRes.status}`
    );
    
    assert(
      getRes.data && getRes.data.profile.username === username,
      'Retrieved profile matches created profile'
    );
    
    return { success: true, username, profileId };
  } catch (error) {
    console.log(`${colors.red}Error in profile creation test:${colors.reset}`, error.message);
    return { success: false };
  }
}

/**
 * T054: Test Username Validation
 */
async function testUsernameValidation() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}T054: Username Validation${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  // Test 1: Valid username
  const validUsername = generateUsername();
  let checkRes = await makeRequest('POST', '/api/profiles/me/username-check', { username: validUsername });
  
  assert(
    checkRes.status === 200 && checkRes.data.available === true,
    'Valid unique username is available',
    `Got: ${JSON.stringify(checkRes.data)}`
  );

  // Test 2: Create profile with that username
  const profileData = {
    username: validUsername,
    displayName: 'Username Test User',
    published: false
  };
  
  await makeRequest('POST', '/api/profiles', profileData);

  // Test 3: Check that same username is now taken
  checkRes = await makeRequest('POST', '/api/profiles/me/username-check', { username: validUsername });
  
  assert(
    checkRes.status === 200 && checkRes.data.available === false,
    'Taken username is reported as unavailable',
    `Got: ${JSON.stringify(checkRes.data)}`
  );
  
  assert(
    checkRes.data.suggestions && checkRes.data.suggestions.length > 0,
    'Suggestions provided for taken username',
    `Got: ${checkRes.data.suggestions?.join(', ')}`
  );

  // Test 4: Invalid username (too short)
  checkRes = await makeRequest('POST', '/api/profiles/me/username-check', { username: 'ab' });
  
  assert(
    checkRes.status === 200 && checkRes.data.available === false,
    'Username too short is rejected',
    `Expected validation error for "ab"`
  );

  // Test 5: Invalid username (special characters)
  checkRes = await makeRequest('POST', '/api/profiles/me/username-check', { username: 'test@user!' });
  
  assert(
    checkRes.status === 200 && checkRes.data.available === false,
    'Username with invalid characters is rejected',
    `Expected validation error for "test@user!"`
  );

  return { success: true };
}

/**
 * T055: Test Publish/Unpublish Toggle
 */
async function testPublishToggle() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}T055: Publish/Unpublish Toggle${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const username = generateUsername();
  
  // Create unpublished profile
  const profileData = {
    username,
    displayName: 'Publish Test User',
    headline: 'Testing publish functionality',
    published: false
  };
  
  await makeRequest('POST', '/api/profiles', profileData);

  // Test 1: Verify unpublished profile returns 404 on public route
  let publicRes = await makeRequest('GET', `/api/public/profile/${username}`);
  
  assert(
    publicRes.status === 404,
    'Unpublished profile returns 404 on public route',
    `Got ${publicRes.status}`
  );

  // Test 2: Publish the profile
  const publishRes = await makeRequest('PATCH', '/api/profiles/me/publish', { published: true });
  
  assert(
    publishRes.status === 200,
    'Publish operation succeeds',
    `Got ${publishRes.status}`
  );
  
  assert(
    publishRes.data && publishRes.data.profile.published === true,
    'Profile is marked as published',
    `Got: ${publishRes.data?.published}`
  );

  // Test 3: Verify published profile is accessible on public route
  publicRes = await makeRequest('GET', `/api/public/profile/${username}`);
  
  assert(
    publicRes.status === 200,
    'Published profile returns 200 on public route',
    `Got ${publicRes.status}`
  );
  
  assert(
    publicRes.data && publicRes.data.profile.username === username,
    'Published profile data is correct'
  );

  // Test 4: Unpublish the profile
  const unpublishRes = await makeRequest('PATCH', '/api/profiles/me/publish', { published: false });
  
  assert(
    unpublishRes.status === 200 && unpublishRes.data.profile.published === false,
    'Unpublish operation succeeds',
    `Got: ${unpublishRes.data?.published}`
  );

  // Test 5: Verify unpublished profile returns 404 again
  publicRes = await makeRequest('GET', `/api/public/profile/${username}`);
  
  assert(
    publicRes.status === 404,
    'Unpublished profile returns 404 after unpublishing',
    `Got ${publicRes.status}`
  );

  return { success: true, username };
}

/**
 * T056: Test Public Profile Access (No Auth)
 */
async function testPublicAccess() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}T056: Public Profile Access${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const username = generateUsername();
  
  // Create and publish profile
  const profileData = {
    username,
    displayName: 'Public Access Test',
    headline: 'Testing public accessibility',
    bio: 'Profile for public access testing',
    publicEmail: 'public@example.com',
    website: 'https://example.com',
    published: true
  };
  
  await makeRequest('POST', '/api/profiles', profileData);
  await makeRequest('PATCH', '/api/profiles/me/publish', { published: true });

  // Test 1: Access via public route (no auth)
  const publicRes = await makeRequest('GET', `/api/public/profile/${username}`);
  
  assert(
    publicRes.status === 200,
    'Public profile accessible without authentication',
    `Got ${publicRes.status}`
  );
  
  assert(
    publicRes.data && publicRes.data.profile.username === username,
    'Public profile returns correct data'
  );
  
  assert(
    publicRes.data.profile.displayName === profileData.displayName,
    'Public profile includes display name'
  );
  
  assert(
    publicRes.data.profile.headline === profileData.headline,
    'Public profile includes headline'
  );
  
  assert(
    publicRes.data.profile.bio === profileData.bio,
    'Public profile includes bio'
  );
  
  assert(
    publicRes.data.profile.publicEmail === profileData.publicEmail,
    'Public profile includes public email'
  );
  
  assert(
    publicRes.data.profile.website === profileData.website,
    'Public profile includes website'
  );

  // Test 2: Non-existent username returns 404
  const notFoundRes = await makeRequest('GET', '/api/public/profile/nonexistent_user_12345');
  
  assert(
    notFoundRes.status === 404,
    'Non-existent profile returns 404',
    `Got ${notFoundRes.status}`
  );

  return { success: true };
}

/**
 * T057: Test Profile Data Persistence
 */
async function testDataPersistence() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}T057: Profile Data Persistence${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const username = generateUsername();
  const originalData = {
    username,
    displayName: 'Persistence Test',
    firstName: 'Persist',
    lastName: 'Tester',
    headline: 'Original headline for testing',
    company: 'Test Persistence Inc',
    bio: 'Original bio content',
    pronouns: 'she/her',
    publicEmail: 'persist@example.com',
    publicPhone: '+9876543210',
    website: 'https://persist.example.com',
    published: true
  };
  
  // Create profile
  const createRes = await makeRequest('POST', '/api/profiles', originalData);
  const profileId = createRes.data?.profile?.id;

  assert(
    createRes.status === 201,
    'Profile created successfully for persistence test'
  );

  // Retrieve immediately
  let getRes = await makeRequest('GET', '/api/profiles/me');
  
  assert(
    getRes.status === 200 && getRes.data.profile.username === username,
    'Profile retrieved immediately after creation'
  );
  
  assert(
    getRes.data.profile.headline === originalData.headline,
    'Headline persisted correctly'
  );
  
  assert(
    getRes.data.profile.bio === originalData.bio,
    'Bio persisted correctly'
  );

  // Update profile
  const updatedData = {
    headline: 'Updated headline for persistence',
    bio: 'Updated bio content',
    company: 'Updated Company LLC'
  };
  
  const updateRes = await makeRequest('PUT', '/api/profiles/me', updatedData);
  
  assert(
    updateRes.status === 200,
    'Profile update succeeds',
    `Got ${updateRes.status}`
  );

  // Retrieve again to verify updates
  getRes = await makeRequest('GET', '/api/profiles/me');
  
  assert(
    getRes.data.profile.headline === updatedData.headline,
    'Updated headline persisted',
    `Expected: "${updatedData.headline}", Got: "${getRes.data.profile.headline}"`
  );
  
  assert(
    getRes.data.profile.bio === updatedData.bio,
    'Updated bio persisted',
    `Expected: "${updatedData.bio}", Got: "${getRes.data.profile.bio}"`
  );
  
  assert(
    getRes.data.profile.company === updatedData.company,
    'Updated company persisted'
  );
  
  assert(
    getRes.data.profile.firstName === originalData.firstName,
    'Unchanged field (firstName) remained intact'
  );

  // Test persistence via public route
  const publicRes = await makeRequest('GET', `/api/public/profile/${username}`);
  
  assert(
    publicRes.status === 200 && publicRes.data.profile.headline === updatedData.headline,
    'Updated data visible on public route'
  );

  return { success: true };
}

/**
 * Clean up test data
 */
async function cleanup() {
  try {
    // Delete test user's profile if it exists
    await makeRequest('DELETE', '/api/profiles/me');
    console.log(`\n${colors.yellow}Cleanup: Deleted test profile${colors.reset}`);
  } catch (error) {
    // Ignore cleanup errors
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║                                                        ║${colors.reset}`);
  console.log(`${colors.blue}║   Phase 1: Core Profile Testing Suite                 ║${colors.reset}`);
  console.log(`${colors.blue}║   Virtual Profile & Smart Sharing                      ║${colors.reset}`);
  console.log(`${colors.blue}║                                                        ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nBackend: ${API_BASE}`);
  console.log(`Test User: ${TEST_USER.email} (ID: ${TEST_USER.id})`);
  console.log(`Auth Mode: ${colors.yellow}TESTING_MODE (bypass authentication)${colors.reset}`);
  console.log(`\n${colors.yellow}Starting tests...${colors.reset}`);

  try {
    // Clean up any existing test data
    await cleanup();
    await sleep(500);

    // Run all test suites
    await testProfileCreation();
    await sleep(500);
    
    // Clean up and recreate for next test
    await cleanup();
    await sleep(500);
    
    await testUsernameValidation();
    await sleep(500);
    
    // Clean up and recreate for next test
    await cleanup();
    await sleep(500);
    
    await testPublishToggle();
    await sleep(500);
    
    // Clean up and recreate for next test
    await cleanup();
    await sleep(500);
    
    await testPublicAccess();
    await sleep(500);
    
    // Clean up and recreate for next test
    await cleanup();
    await sleep(500);
    
    await testDataPersistence();
    
    // Final cleanup
    await cleanup();

    // Print summary
    console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.cyan}Test Summary${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
    console.log(`Total Tests:  ${testResults.total}`);
    console.log(`${colors.green}Passed:       ${testResults.passed}${colors.reset}`);
    console.log(`${colors.red}Failed:       ${testResults.failed}${colors.reset}`);
    console.log(`Pass Rate:    ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
      console.log(`\n${colors.green}✓ All tests passed!${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${colors.red}✗ Some tests failed.${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n${colors.red}Fatal error running tests:${colors.reset}`, error);
    process.exit(1);
  }
}

// Check if backend is running before starting tests
async function checkBackend() {
  try {
    const res = await makeRequest('GET', '/api/health');
    if (res.status === 200) {
      console.log(`${colors.green}✓ Backend is running${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.error(`${colors.red}✗ Backend is not running at ${API_BASE}${colors.reset}`);
    console.error(`  Please start the backend with: npm run dev`);
    process.exit(1);
  }
}

// Run tests
(async () => {
  await checkBackend();
  await runAllTests();
})();
