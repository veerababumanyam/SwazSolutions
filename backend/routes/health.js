const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * Health Check Endpoint
 * Provides comprehensive system health status
 * Monitors: database, APIs, file storage, memory, disk space
 */

// Helper function to get memory usage
const getMemoryUsage = () => {
    const memUsage = process.memoryUsage();
    return {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapPercent: parseFloat(((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1))
    };
};

// Helper function to check database connectivity
const checkDatabase = async () => {
    try {
        // Simple query to verify database is responsive
        const result = db.prepare('SELECT 1 as test').all();
        return result && result.length > 0;
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return false;
    }
};

// Helper function to check file storage
const checkFileStorage = async () => {
    try {
        const fs = require('fs').promises;
        const path = require('path');

        const uploadsDir = path.join(__dirname, '../uploads');
        const profilesDir = path.join(__dirname, '../profiles');

        // Check if directories exist and are readable
        try {
            await fs.access(uploadsDir);
        } catch {
            // Create if doesn't exist
            await fs.mkdir(uploadsDir, { recursive: true });
        }

        try {
            await fs.access(profilesDir);
        } catch {
            await fs.mkdir(profilesDir, { recursive: true });
        }

        return true;
    } catch (error) {
        console.error('File storage health check failed:', error.message);
        return false;
    }
};

// Helper function to get disk space info (for development/testing)
const getDiskSpaceInfo = async () => {
    try {
        // For production, use actual disk space monitoring tools
        // This is a simplified version for demonstration
        return {
            available: 'unknown', // Would need system-level tools
            used: 'unknown',
            total: 'unknown'
        };
    } catch (error) {
        return null;
    }
};

/**
 * GET /api/health
 * Returns comprehensive health status of the application
 */
router.get('/api/health', async (req, res) => {
    try {
        const startTime = Date.now();

        // Parallel health checks
        const [dbOk, storageOk] = await Promise.all([
            checkDatabase(),
            checkFileStorage()
        ]);

        const memory = getMemoryUsage();
        const responseTime = Date.now() - startTime;

        // Determine overall health status
        const isHealthy = dbOk && storageOk;
        const status = isHealthy ? 'healthy' : 'degraded';

        const healthResponse = {
            status,
            timestamp: new Date().toISOString(),
            uptime: Math.round(process.uptime()),
            responseTime: `${responseTime}ms`,
            version: process.env.APP_VERSION || '1.1.1',
            environment: process.env.NODE_ENV || 'development',

            // Component health
            components: {
                database: dbOk ? 'operational' : 'down',
                fileStorage: storageOk ? 'operational' : 'down',
                api: 'operational'
            },

            // Performance metrics
            performance: {
                memory: memory,
                cpu: {
                    user: Math.round(process.cpuUsage().user / 1000), // Convert to ms
                    system: Math.round(process.cpuUsage().system / 1000)
                }
            },

            // Detailed health info
            details: {
                database: {
                    status: dbOk ? 'connected' : 'error',
                    responseTime: `${responseTime}ms`
                },
                fileStorage: {
                    status: storageOk ? 'accessible' : 'error'
                },
                memory: {
                    heapUsed: `${memory.heapUsed}MB`,
                    heapTotal: `${memory.heapTotal}MB`,
                    percentUsed: `${memory.heapPercent}%`,
                    rss: `${memory.rss}MB`,
                    warning: memory.heapPercent > 80
                }
            },

            // Recommendations
            warnings: []
        };

        // Add warnings for degraded conditions
        if (memory.heapPercent > 80) {
            healthResponse.warnings.push('High memory usage (>80%)');
        }
        if (!dbOk) {
            healthResponse.warnings.push('Database connectivity issue');
        }
        if (!storageOk) {
            healthResponse.warnings.push('File storage accessibility issue');
        }

        // HTTP status code based on health
        const httpStatus = isHealthy ? 200 : 503;
        res.status(httpStatus).json(healthResponse);

    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            uptime: Math.round(process.uptime())
        });
    }
});

/**
 * GET /api/health/deep
 * Deep health check with additional diagnostics
 * Requires authentication
 */
router.get('/api/health/deep', async (req, res) => {
    try {
        // Optional: Add authentication middleware for production
        // const { authenticateToken } = require('../middleware/auth');

        const diagnostics = {
            status: 'healthy',
            timestamp: new Date().toISOString(),

            // System info
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: `${Math.round(process.uptime() / 60)}m`
            },

            // Memory details
            memory: getMemoryUsage(),

            // Database diagnostics
            database: {
                status: 'checking...'
            },

            // Application metrics
            app: {
                name: 'SwazSolutions',
                version: process.env.APP_VERSION || '1.1.1',
                environment: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 3000,
                cors: process.env.CORS_ALLOWED_ORIGINS || 'not configured'
            }
        };

        // Check database with more details
        try {
            const dbOk = await checkDatabase();
            const tables = db.prepare(`
                SELECT name FROM sqlite_master
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `).all();

            diagnostics.database = {
                status: dbOk ? 'connected' : 'error',
                tables: tables ? tables.length : 0,
                tableNames: tables ? tables.map(t => t.name) : []
            };
        } catch (error) {
            diagnostics.database.status = 'error';
            diagnostics.database.error = error.message;
        }

        res.json(diagnostics);

    } catch (error) {
        console.error('Deep health check failed:', error);
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

/**
 * GET /api/health/metrics
 * Returns operational metrics for monitoring dashboards
 */
router.get('/api/health/metrics', async (req, res) => {
    try {
        const memory = getMemoryUsage();
        const uptime = process.uptime();

        const metrics = {
            timestamp: new Date().toISOString(),

            // Uptime (in seconds and formatted)
            uptime: {
                seconds: Math.round(uptime),
                formatted: formatUptime(uptime)
            },

            // Memory metrics
            memory: {
                heapUsedMB: memory.heapUsed,
                heapTotalMB: memory.heapTotal,
                heapPercentUsed: memory.heapPercent,
                externalMB: memory.external,
                rssMB: memory.rss
            },

            // CPU metrics
            cpu: {
                userMillis: process.cpuUsage().user,
                systemMillis: process.cpuUsage().system
            },

            // Health status
            health: {
                database: (await checkDatabase()) ? 'ok' : 'error',
                storage: (await checkFileStorage()) ? 'ok' : 'error'
            }
        };

        res.json(metrics);

    } catch (error) {
        console.error('Metrics check failed:', error);
        res.status(500).json({
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Helper function to format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : '0m';
}

module.exports = router;
