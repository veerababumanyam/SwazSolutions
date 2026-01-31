#!/usr/bin/env node

/**
 * E2E Test Suite Verification Script
 *
 * Checks that all required files and dependencies are in place
 * before running the test suite.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function checkFile(filePath, description) {
  const fullPath = path.join(rootDir, filePath);
  const exists = fs.existsSync(fullPath);
  const status = exists ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
  console.log(`${status} ${description}`);
  return exists;
}

async function checkDependency(packageName) {
  try {
    await import(packageName);
    console.log(`${colors.green}✓${colors.reset} ${packageName}`);
    return true;
  } catch (e) {
    console.log(`${colors.red}✗${colors.reset} ${packageName} (run: npm install)`);
    return false;
  }
}

async function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   E2E Test Suite Verification                 ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  let allChecks = true;

// Check test files
console.log(`${colors.yellow}Test Files:${colors.reset}`);
allChecks &= checkFile('e2e/vcard-panel.spec.ts', 'Main panel tests (17 scenarios)');
allChecks &= checkFile('e2e/vcard-blocks.spec.ts', 'Block management tests (21 scenarios)');
allChecks &= checkFile('e2e/vcard-templates.spec.ts', 'Template tests (14 scenarios)');
allChecks &= checkFile('e2e/vcard-appearance.spec.ts', 'Appearance tests (12 scenarios)');
allChecks &= checkFile('e2e/vcard-public-profile.spec.ts', 'Public profile tests (10 scenarios)');

// Check helper files
console.log(`\n${colors.yellow}Helper Files:${colors.reset}`);
allChecks &= checkFile('e2e/helpers/auth.helper.ts', 'Authentication helper');
allChecks &= checkFile('e2e/helpers/vcard.helper.ts', 'vCard editor helper');
allChecks &= checkFile('e2e/helpers/test.fixtures.ts', 'Custom fixtures');

// Check configuration
console.log(`\n${colors.yellow}Configuration:${colors.reset}`);
allChecks &= checkFile('playwright.config.ts', 'Playwright configuration');
allChecks &= checkFile('package.json', 'Package configuration');

  // Check dependencies
  console.log(`\n${colors.yellow}Dependencies:${colors.reset}`);
  allChecks &= await checkDependency('@playwright/test');
  allChecks &= await checkDependency('react');
  allChecks &= await checkDependency('react-router-dom');

  // Check scripts
  console.log(`\n${colors.yellow}NPM Scripts:${colors.reset}`);
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const hasE2EScript = !!packageJson.scripts['test:e2e'];
    const hasE2EUIScript = !!packageJson.scripts['test:e2e:ui'];

    if (hasE2EScript) {
      console.log(`${colors.green}✓${colors.reset} npm run test:e2e`);
    } else {
      console.log(`${colors.red}✗${colors.reset} npm run test:e2e (missing in package.json)`);
      allChecks = false;
    }

    if (hasE2EUIScript) {
      console.log(`${colors.green}✓${colors.reset} npm run test:e2e:ui`);
    } else {
      console.log(`${colors.yellow}⚠${colors.reset} npm run test:e2e:ui (optional)`);
    }
  } catch (e) {
    console.log(`${colors.red}✗${colors.reset} Could not read package.json`);
    allChecks = false;
  }

// Summary
console.log(`\n${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
if (allChecks) {
  console.log(`${colors.blue}║${colors.green}  ✓ All checks passed! Ready to test.          ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.green}Next steps:${colors.reset}`);
  console.log(`  1. Install Playwright browsers: ${colors.blue}npx playwright install${colors.reset}`);
  console.log(`  2. Run tests: ${colors.blue}npm run test:e2e${colors.reset}`);
  console.log(`  3. View report: ${colors.blue}npx playwright show-report test-results/html-report${colors.reset}\n`);

  console.log(`${colors.yellow}Quick test:${colors.reset}`);
  console.log(`  ${colors.blue}npm run test:e2e:ui${colors.reset} (interactive UI mode)\n`);
} else {
  console.log(`${colors.blue}║${colors.red}  ✗ Some checks failed. See above.             ${colors.blue}║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.red}Please fix the issues above before running tests.${colors.reset}\n`);
  process.exit(1);
}

// Test statistics
console.log(`${colors.yellow}Test Suite Statistics:${colors.reset}`);
console.log(`  Total Test Files: ${colors.green}5${colors.reset}`);
console.log(`  Total Scenarios: ${colors.green}74${colors.reset}`);
console.log(`  Total Browsers: ${colors.green}5${colors.reset} (3 desktop + 2 mobile)`);
console.log(`  Total Executions: ${colors.green}370${colors.reset} (74 scenarios × 5 browsers)`);
console.log(`  Expected Time: ${colors.green}~8-10 minutes${colors.reset} (all browsers)\n`);

  console.log(`${colors.yellow}Documentation:${colors.reset}`);
  console.log(`  ${colors.blue}e2e/README.md${colors.reset} - Complete test suite documentation`);
  console.log(`  ${colors.blue}E2E_QUICK_START.md${colors.reset} - Quick reference guide`);
  console.log(`  ${colors.blue}PHASE_7_E2E_TEST_SUITE.md${colors.reset} - Implementation details\n`);
}

main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
