/**
 * Port Management Utility
 * Handles port conflict detection and process management
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Check if a port is in use
 * @param {number} port - Port number to check
 * @returns {Promise<{inUse: boolean, pid: number|null}>}
 */
async function checkPortInUse(port) {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      // Windows: Use netstat
      const { stdout } = await execPromise(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n');

      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parseInt(parts[parts.length - 1]);
          return { inUse: true, pid };
        }
      }
    } else {
      // Linux/Mac: Use lsof
      const { stdout } = await execPromise(`lsof -i :${port} -t`);
      const pid = parseInt(stdout.trim());
      if (pid) {
        return { inUse: true, pid };
      }
    }

    return { inUse: false, pid: null };
  } catch (error) {
    // If command fails, port is likely not in use
    return { inUse: false, pid: null };
  }
}

/**
 * Kill process using a specific port
 * @param {number} pid - Process ID to kill
 * @returns {Promise<boolean>} Success status
 */
async function killProcessByPID(pid) {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      await execPromise(`taskkill /F /PID ${pid}`);
    } else {
      await execPromise(`kill -9 ${pid}`);
    }

    console.log(`✅ Successfully terminated process ${pid}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to kill process ${pid}:`, error.message);
    return false;
  }
}

/**
 * Get process name by PID
 * @param {number} pid - Process ID
 * @returns {Promise<string|null>} Process name or null
 */
async function getProcessName(pid) {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      const { stdout } = await execPromise(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
      const match = stdout.match(/"([^"]+)"/);
      return match ? match[1] : null;
    } else {
      const { stdout } = await execPromise(`ps -p ${pid} -o comm=`);
      return stdout.trim();
    }
  } catch (error) {
    return null;
  }
}

/**
 * Handle port conflict - prompt user or auto-kill based on config
 * @param {number} port - Port number
 * @param {boolean} autoKill - Whether to automatically kill conflicting process
 * @returns {Promise<boolean>} Whether port was freed
 */
async function handlePortConflict(port, autoKill = false) {
  const { inUse, pid } = await checkPortInUse(port);

  if (!inUse) {
    return true; // Port is free
  }

  const processName = await getProcessName(pid);
  console.error(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   ⚠️  PORT CONFLICT DETECTED                           ║
║                                                        ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║   Port ${port} is already in use                          ║
║   Process ID: ${pid}                                       ║
║   Process Name: ${processName || 'Unknown'}                        ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);

  if (autoKill) {
    console.log(`🔄 Attempting to terminate process ${pid}...`);
    const killed = await killProcessByPID(pid);

    if (killed) {
      // Wait a moment for port to be released
      await new Promise(resolve => setTimeout(resolve, 1000));
      const { inUse: stillInUse } = await checkPortInUse(port);
      return !stillInUse;
    }
  } else {
    console.error(`
To resolve this issue, you can:
1. Kill the process manually:
   Windows: taskkill /F /PID ${pid}
   Linux/Mac: kill -9 ${pid}

2. Use a different port:
   Set PORT environment variable in .env

3. Restart with AUTO_KILL_PORT_CONFLICT=true to auto-terminate
  `);
  }

  return false;
}

module.exports = {
  checkPortInUse,
  killProcessByPID,
  getProcessName,
  handlePortConflict
};
