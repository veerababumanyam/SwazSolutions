# Production Monitoring & Verification

Comprehensive monitoring and verification procedures for the SwazSolutions vCard editor system deployed on production.

## Quick Links

- **Application**: https://swazdatarecovery.com
- **Health Check**: https://swazdatarecovery.com/api/health
- **SSH Access**: `ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230`
- **PM2 Status**: Check via SSH then run `pm2 status`
- **Logs**: `pm2 logs swazsolutions`

## Monitoring Stack

### 1. Error Tracking (Sentry)

**Status**: To be configured
**URL**: https://sentry.io/organizations/swaz-solutions/

#### Setup Instructions

```bash
# 1. Create project in Sentry
# Project: SwazSolutions vCard
# Platform: Node.js for backend, React for frontend

# 2. Add to .env.production
SENTRY_DSN=https://your-key@sentry.io/your-project-id
VITE_SENTRY_DSN=https://your-key@sentry.io/your-project-id

# 3. Backend initialization (backend/server.js)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter out 401 errors (expected for unauthenticated requests)
    if (event.status === 401) return null;
    return event;
  }
});

// 4. Frontend initialization (src/main.tsx)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

#### Monitoring Dashboard

- **Error Count**: Should be < 5/day in production
- **Critical Errors**: Immediate alerting required
- **User Impact**: Track affected user count
- **Performance**: Monitor transaction traces

### 2. Uptime Monitoring (UptimeRobot)

**Status**: To be configured
**URL**: https://uptimerobot.com

#### Setup Instructions

```
Monitor Name: SwazSolutions vCard Editor
URL: https://swazdatarecovery.com/api/health
Check Interval: 5 minutes
Timeout: 30 seconds
Notification: Email on downtime
Alert Contacts: dev-team@swazsolutions.com
```

#### Expected Response

```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.1.1",
  "components": {
    "database": "operational",
    "fileStorage": "operational",
    "api": "operational"
  }
}
```

### 3. Health Check Endpoints

#### GET /api/health (Public)

Returns basic health status for monitoring systems.

```bash
curl https://swazdatarecovery.com/api/health
```

**Response (200 OK - Healthy)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00Z",
  "uptime": 3600,
  "version": "1.1.1",
  "components": {
    "database": "operational",
    "fileStorage": "operational",
    "api": "operational"
  },
  "performance": {
    "memory": {
      "heapUsed": 45,
      "heapTotal": 120,
      "heapPercent": 37.5,
      "rss": 85
    }
  }
}
```

#### GET /api/health/deep (Diagnostic)

Detailed system diagnostics. Useful for troubleshooting.

```bash
curl https://swazdatarecovery.com/api/health/deep
```

#### GET /api/health/metrics (Monitoring)

Operational metrics for dashboards and monitoring tools.

```bash
curl https://swazdatarecovery.com/api/health/metrics
```

## Server Monitoring

### Access Server

```bash
# SSH using SSH key (primary method)
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# If SSH key fails, use password
ssh root@185.199.52.230
# Password: Veeru@098765
```

### PM2 Application Management

```bash
# View application status
pm2 status

# View real-time logs
pm2 logs swazsolutions

# Monitor CPU/memory usage
pm2 monit

# Restart application
pm2 restart swazsolutions

# Stop application
pm2 stop swazsolutions

# Start application
pm2 start npm --name "swazsolutions" -- start

# Save PM2 configuration
pm2 save
```

### nginx Monitoring

```bash
# Check status
systemctl status nginx

# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log

# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx
```

### System Resource Monitoring

```bash
# CPU and memory usage
top

# Disk space
df -h

# Memory usage details
free -h

# Network connections
netstat -tulpn

# Process list for node
ps aux | grep node
```

### Database Monitoring

```bash
# Database location
ls -lh /var/www/swazsolutions/backend/music.db

# Backup database
cp /var/www/swazsolutions/backend/music.db \
   /var/www/swazsolutions/backend/music.db.backup.$(date +%Y%m%d_%H%M%S)

# Check database size
du -h /var/www/swazsolutions/backend/music.db
```

## Daily Monitoring Checklist

Run every morning to verify system health.

```
[ ] Check /api/health endpoint (should be "healthy")
[ ] Review PM2 logs for errors (pm2 logs swazsolutions)
[ ] Check memory usage (pm2 monit)
[ ] Verify disk space (df -h, should be > 10GB free)
[ ] Check database size (du -h backend/music.db)
[ ] Verify nginx is running (systemctl status nginx)
[ ] Check SSL certificate expiration (30+ days remaining)
[ ] Review error count in Sentry (should be < 5 new)
[ ] Check uptime in UptimeRobot (should be 100%)
[ ] Test critical endpoints manually
```

## Weekly Monitoring Checklist

Run every Monday.

```
[ ] Run npm audit (check for security vulnerabilities)
[ ] Review performance metrics (response times, memory trends)
[ ] Check error rate trend in Sentry (should be decreasing or stable)
[ ] Review user feedback and contact form submissions
[ ] Test responsive design on mobile devices
[ ] Test keyboard navigation
[ ] Backup database (backup to external storage)
[ ] Review nginx access logs for unusual patterns
[ ] Check SSL certificate expiration (renew if < 30 days)
[ ] Review disk space growth trend
```

## Monthly Monitoring Checklist

Run on the 1st of each month.

```
[ ] Full security audit (npm audit, dependency check)
[ ] Update dependencies (npm update)
[ ] Performance review and optimization
[ ] Capacity planning (disk, database, memory)
[ ] Review all error types in Sentry
[ ] User feedback analysis
[ ] Team meeting to discuss metrics
[ ] Document any issues found
[ ] Update monitoring procedures
[ ] Review and update incident response procedures
```

## Alert Thresholds

### Critical Alerts (Immediate Action Required)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Application Down | N/A | Execute incident response |
| Error Rate | > 10/min | Check logs, identify cause |
| Memory Usage | > 90% | Investigate memory leak |
| Disk Space | < 1GB free | Free space or expand disk |
| Database Error | Any | Restore from backup |
| SSL Cert Expiration | < 7 days | Renew certificate |

### Warning Alerts (Monitor & Plan)

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | 5-10/min | Log and monitor |
| Memory Usage | 80-90% | Plan for optimization |
| Disk Space | 1-5GB free | Plan cleanup/expansion |
| Response Time | > 2s | Identify slow endpoints |
| CPU Usage | > 80% | Monitor and optimize |

### Informational Alerts

| Metric | Threshold | Action |
|--------|-----------|--------|
| Disk Space | > 10GB free | No action needed |
| Memory Usage | < 80% | Normal |
| Response Time | < 500ms | Optimal |
| Error Rate | < 1/min | Normal |
| Uptime | 99.9%+ | Excellent |

## Performance Optimization

### Memory Management

```bash
# Check heap size
node --max_old_space_size=2048 backend/server.js

# Monitor garbage collection
pm2 start backend/server.js -- --expose-gc

# Profile memory usage
node --inspect backend/server.js
# Open chrome://inspect in Chrome DevTools
```

### Database Optimization

```bash
# Analyze database
sqlite3 /var/www/swazsolutions/backend/music.db

# Check table sizes
SELECT name, page_count * page_size as size
FROM pragma_page_count(), pragma_page_size(),
     (SELECT name FROM sqlite_master WHERE type='table')
ORDER BY page_count DESC;

# Vacuum to optimize
VACUUM;
```

### nginx Optimization

```bash
# Edit nginx configuration
sudo nano /etc/nginx/sites-available/swazsolutions

# Add caching headers
add_header Cache-Control "public, max-age=3600";
add_header X-Content-Type-Options "nosniff";

# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json;
```

## Troubleshooting

### Application Crashes

```bash
# Check PM2 logs
pm2 logs swazsolutions

# Check system logs
journalctl -u pm2-root -f

# Restart application
pm2 restart swazsolutions

# If restart fails, check disk space and memory
df -h
free -h
```

### High Memory Usage

```bash
# Identify memory leak
pm2 monit

# Check for stuck connections
netstat -tulpn | grep 3000

# Force restart
pm2 kill
pm2 start npm --name "swazsolutions" -- start
```

### Database Errors

```bash
# Check database integrity
sqlite3 /var/www/swazsolutions/backend/music.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
cp /var/www/swazsolutions/backend/music.db.backup \
   /var/www/swazsolutions/backend/music.db

# Restart application
pm2 restart swazsolutions
```

### nginx Configuration Issues

```bash
# Test configuration
sudo nginx -t

# Check syntax errors
sudo nginx -T

# Reload if valid
sudo systemctl reload nginx
```

## Alerting

### Configure Email Alerts

**Sentry Email Notifications**:
1. Go to Sentry Project Settings
2. Alerts → New Alert Rule
3. Set conditions (error count, frequency)
4. Add email recipients

**UptimeRobot Email Alerts**:
1. Go to UptimeRobot Dashboard
2. Create Contact → Email
3. Add email address
4. Add to Monitor notifications

**Server Alerts (Optional)**:
```bash
# Install monitoring agent (optional)
sudo apt install monitoring-plugins

# Configure alert script
cat > /var/www/swazsolutions/alert.sh << 'EOF'
#!/bin/bash
# Alert if API is down
curl -s https://swazdatarecovery.com/api/health || \
  mail -s "Alert: API Down" admin@example.com
EOF

# Schedule check every 5 minutes
(crontab -l; echo "*/5 * * * * /var/www/swazsolutions/alert.sh") | crontab -
```

## Documentation

- **Deployment Guide**: See CLAUDE.md for deployment procedures
- **Incident Response**: See INCIDENT_RESPONSE.md for procedures
- **Known Issues**: See KNOWN_ISSUES.md for documented issues
- **Architecture**: See ARCHITECTURE.md for system design

## Performance Baseline

Establish baseline metrics for comparison:

| Metric | Baseline | Target | Current |
|--------|----------|--------|---------|
| Response Time | < 500ms | < 300ms | — |
| Memory Usage | < 100MB | < 80MB | — |
| Error Rate | 0.1% | < 0.05% | — |
| Uptime | 99.9% | 99.95% | — |
| CSS Bundle Size | < 100KB | < 80KB | — |
| JS Bundle Size | < 500KB | < 400KB | — |

## Automation Scripts

### Automatic Daily Backup

```bash
#!/bin/bash
# Add to crontab: 0 2 * * * /var/www/swazsolutions/backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/var/www/swazsolutions/backups"
mkdir -p $BACKUP_DIR

cp /var/www/swazsolutions/backend/music.db \
   $BACKUP_DIR/music.db.backup.$DATE

# Keep only last 7 backups
find $BACKUP_DIR -name "music.db.backup.*" -mtime +7 -delete
```

### Automatic Log Rotation

```bash
# Already configured with logrotate
/etc/logrotate.d/nginx
/etc/logrotate.d/pm2

# Manual rotation if needed
pm2 logrotate
```

## Contact & Escalation

| Severity | Contact | Time |
|----------|---------|------|
| Critical | On-call Engineer | Immediate |
| High | Dev Team Lead | 15 minutes |
| Medium | Dev Team | 1 hour |
| Low | Next day standup | — |

## Related Documents

- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - How to respond to incidents
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) - Known issues and workarounds
- [DEPLOYMENT_GUIDE.md](./CLAUDE.md) - Deployment procedures
