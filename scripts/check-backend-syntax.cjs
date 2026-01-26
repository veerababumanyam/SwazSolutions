#!/usr/bin/env node
/**
 * Backend Syntax Checker
 * Validates syntax of all backend JavaScript files
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkSyntax(filePath) {
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

function getJsFiles(dir, recursive = true) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && recursive) {
      files.push(...getJsFiles(fullPath, recursive));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  log('\n🔍 Checking backend JavaScript syntax...\n', 'blue');

  const backendDir = path.join(process.cwd(), 'backend');
  const files = getJsFiles(backendDir);

  if (files.length === 0) {
    log('⚠️  No JavaScript files found in backend/\n', 'yellow');
    process.exit(0);
  }

  log(`Found ${files.length} JavaScript file(s) to check\n`, 'blue');

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file);
    process.stdout.write(`  ◼ ${relativePath}... `);

    if (checkSyntax(file)) {
      log('✓', 'green');
      passed++;
    } else {
      log('✗', 'red');
      failed++;
    }
  }

  console.log('');
  log(`Results: ${passed} passed, ${failed} failed\n`, failed > 0 ? 'red' : 'green');

  if (failed > 0) {
    log('\n❌ Syntax check failed!\n', 'red');
    process.exit(1);
  }

  log('✅ All files have valid syntax!\n', 'green');
  process.exit(0);
}

main();
