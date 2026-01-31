# Performance Monitoring & Optimization Guide

Comprehensive guide for monitoring, analyzing, and optimizing the performance of the SwazSolutions vCard editor system.

## Quick Performance Checks

### Health Check Endpoints

```bash
# Basic health status
curl https://swazdatarecovery.com/api/health

# Detailed diagnostics
curl https://swazdatarecovery.com/api/health/deep

# Operational metrics
curl https://swazdatarecovery.com/api/health/metrics
```

### Server Resource Monitoring

```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# Real-time monitoring
pm2 monit

# Memory snapshot
pm2 monit --short

# Detailed process info
ps aux | grep node
```

---

## Performance Baselines

Establish baseline metrics for comparison and alerting.

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| **Response Time** | < 300ms | 500ms | > 2s |
| **Memory Usage** | < 80MB | 150MB | > 500MB |
| **Heap % Used** | < 50% | 80% | > 90% |
| **CPU Usage** | < 30% | 70% | > 90% |
| **Error Rate** | 0 errors | < 1/min | > 10/min |
| **Uptime** | 99.95% | < 99.5% | < 99% |
| **Database Latency** | < 10ms | 50ms | > 100ms |

---

## Frontend Performance Monitoring

### Google Lighthouse Metrics

Key metrics to track:

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8s
- **Time to Interactive (TTI)**: < 3.8s

### Lighthouse CI Integration

```bash
# Install Lighthouse CLI
npm install -g @lhci/cli@latest

# Run local audit
lhci autorun --config=lighthouserc.json

# View results
lhci upload  # Requires Lighthouse CI account
```

### Lighthouserc Configuration

```json
{
  "ci": {
    "collect": {
      "url": [
        "https://swazdatarecovery.com",
        "https://swazdatarecovery.com/profile"
      ],
      "numberOfRuns": 3,
      "headless": true,
      "chromePath": "/usr/bin/google-chrome"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.90 }],
        "categories:seo": ["error", { "minScore": 0.90 }],
        "categories:pwa": ["warn", { "minScore": 0.50 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## Backend Performance Monitoring

### Key Metrics

**Response Times by Endpoint**:

```bash
# Monitor using pm2 logs
pm2 logs swazsolutions | grep "ms"  # Look for response times

# Or add custom logging in backend
console.time('api-call');
const result = await db.query(...);
console.timeEnd('api-call');
```

**Memory Usage Tracking**:

```bash
# Watch memory over time
pm2 monit

# Or script for continuous monitoring
watch -n 1 'pm2 monit'

# Get detailed memory info
node -e "console.log(process.memoryUsage())"
```

### Database Performance

**Query Performance**:

```javascript
// In backend/routes/templates.js or other routes
const startTime = Date.now();

const templates = await db.all('SELECT * FROM templates');

const queryTime = Date.now() - startTime;
console.log(`Query took ${queryTime}ms`);

// Add to response headers for monitoring
res.set('X-Query-Time', `${queryTime}ms`);
```

**Database Size Monitoring**:

```bash
# Check database size
du -h /var/www/swazsolutions/backend/music.db

# Check table sizes
sqlite3 /var/www/swazsolutions/backend/music.db << 'EOF'
SELECT
  name,
  SUM(pgsize) as size_bytes
FROM (
  SELECT name, SUM(pgoffset + pgsize) as pgsize FROM pgmap
  UNION ALL
  SELECT name, 0 as pgsize FROM sqlite_master WHERE type='table'
)
GROUP BY name
ORDER BY size_bytes DESC;
EOF
```

---

## Monitoring Tools Setup

### 1. PM2 Plus (Optional)

```bash
# Create PM2 Plus account
# https://app.pm2.io

# Link server
pm2 link <secret> <public>

# Install PM2 Plus monitoring
pm2 install pm2-auto-pull

# Features enabled:
# - Real-time monitoring
# - Advanced metrics
# - Auto-restart
# - Log aggregation
```

### 2. Grafana Dashboards

Create custom Grafana dashboard for visualization:

```bash
# Example Grafana queries:
rate(http_requests_total[5m])
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
```

### 3. Prometheus Metrics

```javascript
// Add to backend/server.js
const prometheus = require('prom-client');

// Create default metrics
prometheus.collectDefaultMetrics();

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.end(prometheus.register.metrics());
});
```

---

## Performance Optimization Strategies

### Frontend Optimization

#### 1. Code Splitting

```javascript
// Use React.lazy for route-based splitting
const Profile = React.lazy(() => import('./pages/Profile'));
const Editor = React.lazy(() => import('./pages/Editor'));

// Wrap in Suspense
<Suspense fallback={<Spinner />}>
    <Profile />
</Suspense>
```

#### 2. Image Optimization

```javascript
// Use WebP with fallback
<picture>
    <source srcSet="image.webp" type="image/webp" />
    <img src="image.jpg" alt="Description" />
</picture>

// Lazy load images
<img loading="lazy" src="..." />

// Responsive images
<img
    srcSet="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
    sizes="(max-width: 600px) 480px, (max-width: 1000px) 800px, 1200px"
    src="medium.jpg"
    alt="Description"
/>
```

#### 3. CSS Optimization

```bash
# Check CSS bundle size
npm run build
# Look for dist/index-*.css size

# Purge unused CSS (Tailwind)
# Already configured in tailwind.config.js
```

#### 4. JavaScript Bundle Optimization

```bash
# Analyze bundle
npm install -g webpack-bundle-analyzer
# Check dist/index-*.js files

# Minify
npm run build  # Already minified by Vite

# Tree-shake unused code
# Already handled by Vite in production mode
```

### Backend Optimization

#### 1. Database Query Optimization

```javascript
// Bad: N+1 queries
const users = await db.all('SELECT * FROM users');
for (const user of users) {
    const profile = await db.get('SELECT * FROM profiles WHERE user_id = ?', [user.id]);
}

// Good: Join query
const users = await db.all(`
    SELECT u.*, p.*
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
`);
```

#### 2. Caching Strategy

```javascript
// In-memory cache for templates
let templatesCache = null;
let cacheExpiry = null;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

router.get('/api/templates', async (req, res) => {
    // Check cache
    if (templatesCache && Date.now() < cacheExpiry) {
        return res.json(templatesCache);
    }

    // Fetch fresh data
    const templates = await db.all('SELECT * FROM templates');

    // Update cache
    templatesCache = templates;
    cacheExpiry = Date.now() + CACHE_TTL;

    res.json(templates);
});
```

#### 3. Connection Pooling

```javascript
// Already configured in backend/config/database.js
const pool = {
    max: 50,              // Maximum concurrent connections
    min: 10,              // Minimum idle connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
```

#### 4. Request Compression

```javascript
// In backend/server.js
const compression = require('compression');
app.use(compression()); // Gzip compression

// Already configured with Express
```

### Server Optimization

#### 1. nginx Caching

```nginx
# /etc/nginx/sites-available/swazsolutions

# Cache static assets
location ~ \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

# Cache API responses
location /api/templates {
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
    add_header X-Cache-Status $upstream_cache_status;
}
```

#### 2. Database Optimization

```bash
# Analyze table structure
sqlite3 /var/www/swazsolutions/backend/music.db << 'EOF'
-- Analyze query performance
EXPLAIN QUERY PLAN
SELECT * FROM templates WHERE category = 'modern';

-- Vacuum database (cleanup fragmentation)
VACUUM;

-- Analyze table statistics
ANALYZE;
EOF
```

#### 3. Memory Management

```bash
# Set Node.js heap size
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Monitor heap usage
node --expose-gc backend/server.js  # Allow manual garbage collection
```

---

## Monitoring Alerts Configuration

### Alert Rules

#### Critical Alerts

```
Alert: Application Down
  Condition: /api/health not responding for 5 minutes
  Action: Page on-call engineer immediately

Alert: High Error Rate
  Condition: > 10 errors/minute for 5 minutes
  Action: Notify dev team, begin investigation

Alert: Memory Critical
  Condition: Heap usage > 90% for 10 minutes
  Action: Restart application, investigate memory leak
```

#### Warning Alerts

```
Alert: Slow Response Time
  Condition: Response time > 2s for 10 minutes
  Action: Investigate slow queries, optimize code

Alert: High Memory Usage
  Condition: Heap usage 80-90% for 10 minutes
  Action: Monitor and plan optimization

Alert: Disk Space Low
  Condition: < 5GB free space
  Action: Cleanup logs, prepare for expansion
```

### Setting Up Email Alerts

```bash
# Using Postfix for email notifications
sudo apt install postfix

# Configure alert script
cat > /var/www/swazsolutions/alert-check.sh << 'EOF'
#!/bin/bash
HEALTH=$(curl -s https://swazdatarecovery.com/api/health)
STATUS=$(echo $HEALTH | jq -r '.status')

if [ "$STATUS" != "healthy" ]; then
    echo "$HEALTH" | mail -s "Alert: API is down" admin@example.com
fi
EOF

# Schedule check every 5 minutes
(crontab -l; echo "*/5 * * * * /var/www/swazsolutions/alert-check.sh") | crontab -
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Simple load test
ab -n 1000 -c 10 https://swazdatarecovery.com/api/health

# Test with higher concurrency
ab -n 5000 -c 100 https://swazdatarecovery.com/api/health

# Output shows:
# - Requests per second
# - Time per request
# - Failed requests
# - Percentiles
```

### Load Testing with wrk

```bash
# Install wrk
git clone https://github.com/wg/wrk.git
cd wrk
make

# Run test
./wrk -t4 -c100 -d30s https://swazdatarecovery.com/api/health

# Results:
# - Throughput (req/sec)
# - Latency (avg, p50, p99)
# - Error rate
```

### Stress Testing

```bash
# Using Node.js autocannon
npm install -g autocannon

autocannon -d 30 -c 100 -l https://swazdatarecovery.com

# Or with siege
sudo apt install siege
siege -c100 -d30 https://swazdatarecovery.com/api/health
```

---

## Performance Tracking Dashboard

### Metrics to Track Weekly

Create a simple CSV for trending:

```bash
#!/bin/bash
# save-metrics.sh - Run weekly to track performance

DATE=$(date +%Y-%m-%d)
RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s https://swazdatarecovery.com/api/health)
MEMORY=$(pm2 show swazsolutions | grep "Memory usage" | awk '{print $NF}')
UPTIME=$(pm2 show swazsolutions | grep "Uptime" | awk '{print $NF}')

echo "$DATE, $RESPONSE_TIME, $MEMORY, $UPTIME" >> performance.csv

# View trends
tail -20 performance.csv
```

### Weekly Performance Report

Template for weekly report:

```markdown
# Weekly Performance Report - Week of Jan 31, 2026

## Summary
- Average Response Time: 250ms (Target: 300ms) ✓
- Peak Memory Usage: 95MB (Target: 80MB) ⚠
- Error Rate: 0.02% (Target: 0%) ✓
- Uptime: 99.98% (Target: 99.95%) ✓

## Top Slow Endpoints
1. /api/profiles/{id}/appearance - 500ms
2. /api/templates - 350ms
3. /api/block-types - 280ms

## Optimization Actions
- [ ] Optimize /profiles/appearance endpoint
- [ ] Add caching to templates endpoint
- [ ] Profile database queries

## Next Week
- Implement caching layer
- Optimize database indexes
- Deploy performance improvements
```

---

## Production Deployment Performance Checklist

Before deploying to production:

```bash
# 1. Run full test suite
npm test
npm run test:e2e

# 2. Build and analyze bundle
npm run build
# Check bundle size is reasonable

# 3. Run Lighthouse audit
lhci autorun

# 4. Load test in staging
ab -n 10000 -c 100 https://staging.swazdatarecovery.com/

# 5. Monitor for 24 hours
# Check error rates, response times, resource usage

# 6. Compare to baseline
# Ensure no regression from previous version
```

---

## Troubleshooting Performance Issues

### Problem: Slow API Response Times

**Diagnosis**:
```bash
# Check database query time
sqlite3 /var/www/swazsolutions/backend/music.db
EXPLAIN QUERY PLAN SELECT * FROM large_table WHERE expensive_condition;

# Profile Node.js
node --prof backend/server.js
# Generate isolate file, analyze with:
node --prof-process isolate-*.log > profile.txt
```

**Solutions**:
1. Add database indexes on frequently queried columns
2. Optimize queries with better WHERE clauses
3. Implement caching for static data
4. Use connection pooling

### Problem: High Memory Usage

**Diagnosis**:
```bash
pm2 monit              # Watch memory growth
pm2 logs swazsolutions # Look for warnings

# Check for memory leaks
node --inspect backend/server.js
# Open chrome://inspect, use DevTools to find leaks
```

**Solutions**:
1. Identify and close unclosed database connections
2. Clear caches periodically
3. Profile with Chrome DevTools
4. Implement garbage collection hints

### Problem: Database Locks

**Diagnosis**:
```bash
lsof | grep music.db
# Check which processes hold database locks
```

**Solutions**:
1. Restart application to release locks
2. Check for long-running transactions
3. Implement connection timeout handling
4. Use WAL (Write-Ahead Logging) mode:
```sql
PRAGMA journal_mode=WAL;
```

---

## References

- [Lighthouse Metrics](https://web.dev/vitals/)
- [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
- [SQLite Optimization](https://www.sqlite.org/optoverview.html)
- [nginx Performance](https://nginx.org/en/docs/)
