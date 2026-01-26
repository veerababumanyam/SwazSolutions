/**
 * Response Caching Middleware
 * Implements multi-tier caching for API responses
 *
 * Usage:
 *   const { cacheMiddleware } = require('./middleware/responseCache');
 *   router.get('/api/profiles/:id', cacheMiddleware(60), handler);
 */

const NodeCache = require('node-cache');

// Create cache instance with default TTL of 60 seconds
// stdTTL: Time to live in seconds
// checkperiod: Automatic delete check interval in seconds
// useClones: Store clones to prevent mutations
const cache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: true,
    maxKeys: 1000  // Prevent unbounded memory growth
});

/**
 * Generate cache key from request
 * Includes method, path, query params, and user ID for personalized caching
 */
function generateCacheKey(req) {
    const userId = req.user?.id || 'anonymous';
    const method = req.method;
    const path = req.originalUrl || req.url;
    const queryString = JSON.stringify(req.query);

    return `${method}:${path}:${queryString}:user${userId}`;
}

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds (optional, uses default if not specified)
 * @param {function} shouldCache - Optional function to determine if response should be cached
 * @returns {function} Express middleware
 */
function cacheMiddleware(ttl, shouldCache) {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = generateCacheKey(req);

        // Check if response is cached
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            console.log(`[Cache HIT] ${key}`);
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('X-Cache-Key', key);
            return res.json(cachedResponse);
        }

        console.log(`[Cache MISS] ${key}`);
        res.setHeader('X-Cache', 'MISS');

        // Override res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = function(data) {
            // Check if we should cache this response
            const status = res.statusCode;
            const shouldCacheResponse = shouldCache ? shouldCache(req, res, data) : true;

            // Only cache successful responses (2xx)
            if (status >= 200 && status < 300 && shouldCacheResponse) {
                const ttlToUse = ttl || cache.options.stdTTL;
                cache.set(key, data, ttlToUse);
                console.log(`[Cache SET] ${key} (TTL: ${ttlToUse}s)`);
            }

            return originalJson(data);
        };

        next();
    };
}

/**
 * Invalidate cache by pattern
 * @param {string|RegExp} pattern - Pattern to match cache keys
 */
function invalidateCache(pattern) {
    const keys = cache.keys();
    let invalidatedCount = 0;

    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

    for (const key of keys) {
        if (regex.test(key)) {
            cache.del(key);
            invalidatedCount++;
        }
    }

    console.log(`[Cache INVALIDATE] Pattern: ${pattern}, Keys deleted: ${invalidatedCount}`);
    return invalidatedCount;
}

/**
 * Invalidate cache for a specific user
 * @param {number} userId - User ID
 */
function invalidateUserCache(userId) {
    return invalidateCache(`user${userId}`);
}

/**
 * Invalidate cache for a specific route pattern
 * @param {string} routePattern - Route pattern (e.g., '/api/profiles')
 */
function invalidateRouteCache(routePattern) {
    return invalidateCache(routePattern);
}

/**
 * Clear all cache
 */
function clearCache() {
    const keyCount = cache.keys().length;
    cache.flushAll();
    console.log(`[Cache CLEAR] All ${keyCount} keys deleted`);
    return keyCount;
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        keys: cache.keys().length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        ksize: cache.getStats().ksize,
        vsize: cache.getStats().vsize
    };
}

/**
 * Middleware to invalidate cache after mutation operations
 * Use this after POST, PUT, PATCH, DELETE handlers
 */
function invalidateCacheMiddleware(patterns) {
    return (req, res, next) => {
        // Store original send/json methods
        const originalSend = res.send.bind(res);
        const originalJson = res.json.bind(res);

        // Override to invalidate cache after successful response
        const invalidateAfterResponse = (data) => {
            const status = res.statusCode;

            // Only invalidate on successful mutations (2xx except 204)
            if (status >= 200 && status < 300 && status !== 204) {
                if (Array.isArray(patterns)) {
                    patterns.forEach(pattern => invalidateCache(pattern));
                } else if (typeof patterns === 'function') {
                    // Allow dynamic pattern generation based on req/res
                    const dynamicPatterns = patterns(req, res, data);
                    if (Array.isArray(dynamicPatterns)) {
                        dynamicPatterns.forEach(pattern => invalidateCache(pattern));
                    } else {
                        invalidateCache(dynamicPatterns);
                    }
                } else {
                    invalidateCache(patterns);
                }

                // Also invalidate user's cache if authenticated
                if (req.user?.id) {
                    invalidateUserCache(req.user.id);
                }
            }

            return data;
        };

        res.send = function(data) {
            invalidateAfterResponse(data);
            return originalSend(data);
        };

        res.json = function(data) {
            invalidateAfterResponse(data);
            return originalJson(data);
        };

        next();
    };
}

module.exports = {
    cacheMiddleware,
    invalidateCache,
    invalidateUserCache,
    invalidateRouteCache,
    invalidateCacheMiddleware,
    clearCache,
    getCacheStats,
    cache  // Export for advanced usage
};
