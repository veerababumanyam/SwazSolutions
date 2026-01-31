# Monitoring Quick Reference Card

Ultra-quick reference for common monitoring and incident response tasks.

## Health Checks

```bash
# Public health check
curl https://swazdatarecovery.com/api/health

# Detailed diagnostics (contains system info)
curl https://swazdatarecovery.com/api/health/deep

# Metrics for dashboards
curl https://swazdatarecovery.com/api/health/metrics
```

## Server Access

```bash
# SSH into production server
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# Fallback password login (if SSH fails)
ssh root@185.199.52.230  # Password: Veeru@098765
```

## PM2 Commands

```bash
pm2 status              # Show running processes
pm2 logs swazsolutions  # View application logs
pm2 logs swazsolutions -l 50  # Last 50 lines
pm2 monit               # Monitor CPU/memory
pm2 restart swazsolutions     # Restart app
pm2 stop swazsolutions        # Stop app
pm2 start swazsolutions       # Start app
pm2 kill                # Kill all PM2 processes
```

## System Checks

```bash
top                     # CPU/memory usage
df -h                   # Disk space
free -h                 # RAM available
ps aux | grep node      # Find Node processes
netstat -tulpn | grep 3000  # Check port 3000
```

## Database Checks

```bash
# SSH to server first
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# Database file size
ls -lh /var/www/swazsolutions/backend/music.db

# Check database integrity
sqlite3 /var/www/swazsolutions/backend/music.db "PRAGMA integrity_check;"

# Backup database
cp /var/www/swazsolutions/backend/music.db \
   /var/www/swazsolutions/backend/music.db.backup.$(date +%Y%m%d)

# Row count check
sqlite3 /var/www/swazsolutions/backend/music.db "SELECT COUNT(*) FROM users;"
```

## nginx Checks

```bash
# Check status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View access logs
tail -f /var/log/nginx/access.log

# View error logs
tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

## Emergency Procedures

### App Won't Restart

```bash
pm2 kill
killall node
sleep 5
pm2 start npm --name "swazsolutions" -- start
pm2 logs swazsolutions
```

### App Crashed

```bash
pm2 status                    # Check status
pm2 logs swazsolutions -l 100 # Check logs
pm2 restart swazsolutions     # Restart
curl http://localhost:3000/api/health  # Test
```

### High Memory

```bash
pm2 monit           # Check usage
pm2 restart swazsolutions
pm2 logs swazsolutions  # Monitor
```

### Database Error

```bash
sqlite3 /var/www/swazsolutions/backend/music.db "PRAGMA integrity_check;"

# If corrupted, restore backup
cp /var/www/swazsolutions/backend/music.db.backup \
   /var/www/swazsolutions/backend/music.db

pm2 restart swazsolutions
```

## Testing

```bash
# Run deployment verification
npm run verify-deployment

# Test individual endpoint
curl -i https://swazdatarecovery.com/api/health

# Load test (measure performance)
ab -n 100 -c 10 https://swazdatarecovery.com/api/health
```

## Deployment

```bash
# Build
npm run build

# Deploy to server
tar czf - --exclude='node_modules' --exclude='.git' . | \
  ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && tar xzf -'

# Install deps on server
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && npm install --omit=dev'

# Restart on server
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'pm2 restart swazsolutions'
```

## Monitoring Dashboards

| Tool | URL |
|------|-----|
| Sentry | https://sentry.io/organizations/swaz-solutions |
| UptimeRobot | https://uptimerobot.com |
| Google Analytics | https://analytics.google.com |
| PM2 Plus | https://app.pm2.io (if configured) |

## Log Locations

```bash
# Application logs
pm2 logs swazsolutions

# nginx access logs
/var/log/nginx/access.log

# nginx error logs
/var/log/nginx/error.log

# System journal
journalctl -u pm2-root -f
```

## File Locations

```bash
# Application root
/var/www/swazsolutions/

# Database
/var/www/swazsolutions/backend/music.db

# Environment config
/var/www/swazsolutions/.env

# Built frontend
/var/www/swazsolutions/dist/

# nginx config
/etc/nginx/sites-available/swazsolutions
```

## Alert Severity Response Times

| Severity | Response | Contact |
|----------|----------|---------|
| CRITICAL | < 15 min | On-call lead |
| HIGH | < 1 hour | Dev team lead |
| MEDIUM | < 4 hours | Dev team |
| LOW | Next day | Backlog |

## Documentation Quick Links

- **Monitoring**: [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md)
- **Incidents**: [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
- **Known Issues**: [KNOWN_ISSUES.md](./KNOWN_ISSUES.md)
- **Performance**: [PERFORMANCE_MONITORING.md](./PERFORMANCE_MONITORING.md)
- **Sentry Setup**: [SENTRY_SETUP.md](./SENTRY_SETUP.md)

## Critical Commands by Situation

### App Down
```bash
# 1. Check status
pm2 status

# 2. Check logs
pm2 logs swazsolutions

# 3. Restart
pm2 restart swazsolutions

# 4. Verify
curl https://swazdatarecovery.com/api/health
```

### Errors Spiking
```bash
# 1. Check Sentry dashboard
# https://sentry.io

# 2. Check logs
pm2 logs swazsolutions | grep ERROR

# 3. Check system resources
pm2 monit

# 4. Investigate recent changes
git log --oneline -10
```

### Slow Performance
```bash
# 1. Check response times
curl -w "Time: %{time_total}s\n" https://swazdatarecovery.com/

# 2. Monitor resources
pm2 monit

# 3. Check database
pm2 logs swazsolutions | grep "Query took"

# 4. Run Lighthouse
lhci autorun
```

### High Memory
```bash
# 1. Check current usage
pm2 monit

# 2. Look for leaks
pm2 logs swazsolutions | grep -i memory

# 3. Restart
pm2 restart swazsolutions

# 4. Monitor recovery
watch -n 1 'pm2 status'
```

## Monitoring Checklist

### Morning (2 min)
- [ ] Health check returns healthy
- [ ] No new errors in Sentry
- [ ] UptimeRobot shows 100%
- [ ] Disk space > 10GB

### Weekly (15 min)
- [ ] Response time < 300ms
- [ ] Memory usage stable
- [ ] Error rate < 0.1%
- [ ] Run verification script

### Monthly (30 min)
- [ ] Review Sentry errors
- [ ] Analyze performance trends
- [ ] Update known issues
- [ ] Plan optimizations

## Escalation Contacts

| Role | Contact Method |
|------|-----------------|
| On-call | Slack @oncall |
| Dev Lead | dev-lead@example.com |
| DevOps | devops@example.com |
| CTO | cto@example.com |

## Success Indicators

Green light when:
- ✅ Health check returns 200
- ✅ No critical errors
- ✅ Response time < 500ms
- ✅ Uptime > 99%
- ✅ Memory usage < 150MB

---

**Last Updated**: 2026-01-31
**Version**: 1.1.1
**Status**: Production Ready ✅
