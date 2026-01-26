/**
 * Utility script to kill process using a specific port
 * Usage: node backend/scripts/kill-port-process.js [port]
 */

const { handlePortConflict } = require('../utils/portManager');

const port = parseInt(process.argv[2]) || 3000;

console.log(`Checking for processes using port ${port}...`);

handlePortConflict(port, true).then(success => {
  if (success) {
    console.log(`✅ Port ${port} is now available`);
    process.exit(0);
  } else {
    console.error(`❌ Failed to free port ${port}`);
    process.exit(1);
  }
});
