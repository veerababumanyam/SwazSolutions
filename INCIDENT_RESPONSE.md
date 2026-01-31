# Incident Response Procedures

Emergency response procedures for production incidents with the SwazSolutions vCard editor system.

## Quick Reference

**Application Down?**
```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230
pm2 logs swazsolutions  # Check logs
pm2 status              # Check status
pm2 restart swazsolutions
```

**Health Check**: https://swazdatarecovery.com/api/health

**Escalation Contact**: dev-team@swazsolutions.com

---

## Incident Severity Levels

### Level 1: CRITICAL
- **Definition**: Complete application outage or data loss
- **Impact**: All users affected, business impact immediate
- **Response Time**: 15 minutes maximum
- **Escalation**: Immediate CTO/Lead notification

**Examples**:
- API returning 500 errors
- Database completely down
- Application not starting
- Data corruption detected

### Level 2: HIGH
- **Definition**: Significant functionality broken
- **Impact**: Multiple users or core features affected
- **Response Time**: 1 hour maximum
- **Escalation**: Dev team lead notification

**Examples**:
- Authentication not working
- File uploads failing
- Critical API endpoint down
- Memory leak causing crashes

### Level 3: MEDIUM
- **Definition**: Minor functionality broken
- **Impact**: Some users or non-critical features affected
- **Response Time**: 4 hours
- **Escalation**: Slack notification to team

**Examples**:
- Gallery thumbnails not loading
- Analytics data missing
- Theme customization broken
- Non-critical API endpoint down

### Level 4: LOW
- **Definition**: Cosmetic issue or workaround available
- **Impact**: Limited user impact
- **Response Time**: Next business day
- **Escalation**: Log issue, schedule for next sprint

**Examples**:
- UI alignment issue
- Typo in error message
- Minor performance degradation
- Offline feature not working

---

## Incident Response Workflow

### 1. DETECT (Immediately)

**Who detects?**
- UptimeRobot monitoring
- Sentry error tracking
- User reports
- Team member notification

**Action**:
```
⏱️  Record incident start time
📋 Assess severity level
📢 Notify on-call engineer immediately
```

**Detection Verification**:
```bash
# Verify issue is real
curl https://swazdatarecovery.com/api/health

# Check public status
# Try accessing app in browser
# Ask another team member to verify
```

### 2. TRIAGE (Within 5 minutes)

**Assess the situation**:

```
□ What is affected? (API, frontend, database, etc.)
□ Who is affected? (All users, specific feature, admin only)
□ Since when? (Time of failure)
□ Severity level? (Critical/High/Medium/Low)
□ Known cause? (Check KNOWN_ISSUES.md)
□ Impact scope? (Small/Medium/Large)
```

**Quick Decision Tree**:

```
Is app responding? NO
  ├─ YES → Partial Outage (Level 2-3)
  └─ NO → Full Outage (Level 1) → SKIP TO REMEDIATION

Is database accessible? NO
  └─ Database Emergency (Level 1) → Restore from backup

Is error in logs? YES
  └─ Check error pattern → Run diagnostics

Is this in KNOWN_ISSUES.md? YES
  └─ Follow documented workaround

Is this related to recent deployment? YES
  └─ Prepare for rollback
```

### 3. COMMUNICATE (Within 10 minutes)

**Internal Communication**:
```
Slack #incidents channel:
---
⚠️ INCIDENT: [Severity] [Service] [Brief Description]

Status: INVESTIGATING
Severity: [CRITICAL/HIGH/MEDIUM/LOW]
Affected: [API/Frontend/Database/etc]
Started: [Time]
Lead: [Your Name]

Will update every 15 minutes.
```

**Update Status Every 15 Minutes**:
```
⏰ UPDATE #1 (10:15 AM)
Status: INVESTIGATING
Finding: API returning 500 errors
Next Step: Checking application logs
ETA: 5 minutes
```

**External Communication** (If critical and ongoing > 30 minutes):
```
Email to users@swazsolutions.com:
---
Subject: Service Disruption - We're Investigating

We're aware of issues with SwazSolutions vCard Editor
and are actively investigating. We apologize for the
inconvenience and will update you shortly.

Current Status: Investigating
Started: [Time]
Updates: https://status.swazsolutions.com (if available)

- The Team
```

### 4. DIAGNOSE (10-30 minutes)

**Access Server**:
```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230
```

**Run Diagnostics** (In order):

**A) Check Application Status**
```bash
pm2 status                      # Running?
pm2 logs swazsolutions -l 100   # Recent logs
pm2 monit                       # CPU/Memory
```

**B) Check System Resources**
```bash
top                             # CPU, memory usage
df -h                           # Disk space
free -h                         # RAM available
netstat -tulpn | grep 3000      # Port 3000 listening?
```

**C) Check Database**
```bash
ls -lh /var/www/swazsolutions/backend/music.db
sqlite3 /var/www/swazsolutions/backend/music.db "SELECT COUNT(*) FROM users;"
```

**D) Check nginx**
```bash
systemctl status nginx
nginx -t                        # Config valid?
tail -20 /var/log/nginx/error.log
```

**E) Check Network**
```bash
curl http://localhost:3000/api/health  # Local test
curl -v https://swazdatarecovery.com/api/health  # Public test
```

### 5. REMEDIATE (30 minutes or less)

**Most Common Issues & Fixes**:

#### Issue: Application Won't Start

```bash
# Check logs
pm2 logs swazsolutions

# Common causes and fixes
# Cause 1: Port already in use
lsof -i :3000
kill -9 [PID]
pm2 restart swazsolutions

# Cause 2: Node process error
cd /var/www/swazsolutions
npm install  # Reinstall dependencies
pm2 restart swazsolutions

# Cause 3: Out of memory
free -h
pm2 kill  # Kill all PM2 processes
pm2 start npm --name "swazsolutions" -- start

# Cause 4: Invalid configuration
# Check .env file
cat /var/www/swazsolutions/.env
# Fix configuration issues
nano /var/www/swazsolutions/.env
pm2 restart swazsolutions
```

#### Issue: Application Running but Returning 500 Errors

```bash
# Check application logs
pm2 logs swazsolutions -l 200

# Look for:
# - Database connection errors
# - Missing environment variables
# - Memory leaks (heap exhaustion)
# - Dependency issues

# Fix based on log messages
# Common: Restart with fresh database
pm2 restart swazsolutions

# If database corrupted:
cp /var/www/swazsolutions/backend/music.db.backup \
   /var/www/swazsolutions/backend/music.db
pm2 restart swazsolutions
```

#### Issue: Database Errors

```bash
# Check database integrity
sqlite3 /var/www/swazsolutions/backend/music.db "PRAGMA integrity_check;"

# If corrupted:
# Restore from backup
cp /var/www/swazsolutions/backend/music.db.backup.latest \
   /var/www/swazsolutions/backend/music.db

# Verify
sqlite3 /var/www/swazsolutions/backend/music.db "SELECT COUNT(*) FROM users;"

# Restart app
pm2 restart swazsolutions
```

#### Issue: High Memory Usage / Memory Leak

```bash
# Check memory
pm2 monit

# Force restart
pm2 kill
sleep 5
pm2 start npm --name "swazsolutions" -- start

# Monitor for recurrence
watch -n 1 'pm2 status'
```

#### Issue: nginx Not Serving Static Files

```bash
# Test nginx config
sudo nginx -t

# Check logs
tail -50 /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx

# Verify
curl https://swazdatarecovery.com -I
```

#### Issue: SSL Certificate Error

```bash
# Check certificate
certbot certificates

# If < 7 days to expiration
sudo certbot renew --force-renewal

# Restart nginx
sudo systemctl restart nginx

# Verify
curl -Iv https://swazdatarecovery.com 2>&1 | grep expire
```

### 6. VERIFY (Before closing incident)

**Verification Checklist**:

```bash
# 1. Application responds
curl https://swazdatarecovery.com/api/health

# 2. Health check shows healthy
curl https://swazdatarecovery.com/api/health | jq '.status'

# 3. Critical endpoints work
curl https://swazdatarecovery.com/profile
curl https://swazdatarecovery.com/api/templates

# 4. No new errors in logs
pm2 logs swazsolutions -l 20

# 5. System resources normal
pm2 monit  # CPU < 50%, Memory < 80%

# 6. Database responsive
sqlite3 /var/www/swazsolutions/backend/music.db "SELECT COUNT(*) FROM users;"
```

**Automated Verification**:
```bash
# Run verification script
npm run verify-deployment
```

### 7. COMMUNICATE RESOLUTION (Immediately)

**Slack Update**:
```
✅ RESOLVED - [Service Name]

Status: RESOLVED
Root Cause: [Brief explanation]
Fix Applied: [What was done]
Verification: All systems operational
Resolution Time: [XX minutes]
```

**If > 30 minutes downtime, send follow-up email**:
```
Subject: Service Restoration - SwazSolutions vCard Editor

We've resolved the issue that affected our service from
[Start Time] to [End Time].

Root Cause: [Technical explanation]
Duration: [XX minutes]
Impact: [Number] of users affected
Next Steps: We're implementing [preventive measure]

Apologies for the inconvenience.
- The Team
```

### 8. POST-INCIDENT (Within 24 hours)

**Write Incident Report**:

```markdown
# Incident Report: [YYYY-MM-DD] [Service] Outage

## Summary
- Duration: XX minutes
- Severity: Level [1-4]
- Impact: [Description of impact]

## Timeline
- 10:15 - Incident detected
- 10:20 - Diagnosis began
- 10:35 - Fix implemented
- 10:45 - Service restored

## Root Cause
[Technical explanation of what caused the issue]

## Resolution
[What was done to fix it]

## Lessons Learned
- [Learning point 1]
- [Learning point 2]

## Preventive Actions
- [ ] Action 1 - Assigned to [Owner] - Due [Date]
- [ ] Action 2 - Assigned to [Owner] - Due [Date]

## Owner: [Your Name]
## Reviewed By: [Lead Name]
```

**Add to Documentation**:
- Update KNOWN_ISSUES.md if applicable
- Update PRODUCTION_MONITORING.md with new checks
- Add monitoring alert if missing
- Update runbooks for future incidents

---

## Quick Runbooks

### Application Won't Restart

```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# Step 1: Check what's running
pm2 status
ps aux | grep node

# Step 2: Kill stuck processes
pm2 kill
killall node

# Step 3: Free up memory
sync && echo 3 > /proc/sys/vm/drop_caches

# Step 4: Restart
pm2 start npm --name "swazsolutions" -- start
pm2 logs swazsolutions

# Step 5: Verify
curl http://localhost:3000/api/health
```

### Database Corruption Recovery

```bash
# Stop application
pm2 stop swazsolutions

# Locate backups
ls -la /var/www/swazsolutions/backend/music.db*

# Restore from most recent backup
cp /var/www/swazsolutions/backend/music.db.backup.latest \
   /var/www/swazsolutions/backend/music.db

# Verify restored database
sqlite3 /var/www/swazsolutions/backend/music.db "SELECT COUNT(*) FROM users;"

# Restart application
pm2 restart swazsolutions
pm2 logs swazsolutions
```

### Complete System Restart

```bash
# Use only if all else fails
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# 1. Stop all services
pm2 kill
sudo systemctl stop nginx

# 2. Wait for clean shutdown
sleep 10

# 3. Check system health
free -h
df -h
ps aux | grep node

# 4. Start services
cd /var/www/swazsolutions
pm2 start npm --name "swazsolutions" -- start
sudo systemctl start nginx

# 5. Verify
pm2 status
systemctl status nginx
curl https://swazdatarecovery.com/api/health
```

---

## Escalation Chart

| Situation | Action | Contact |
|-----------|--------|---------|
| Can't access server via SSH | Try password login, then call sysadmin | Sysadmin phone |
| Can't restart app via PM2 | Full system restart, then escalate | CTO |
| Database is corrupted | Restore from backup, escalate | DBA/Lead |
| SSL certificate error | Attempt renewal, escalate if fails | DevOps/Lead |
| Unable to diagnose after 30min | Call in additional resources | Tech Lead |
| Continuous failures after fixes | Rollback to previous version | CTO/Tech Lead |

---

## Prevention Checklist

**Before Deployments**:
- [ ] Run full test suite (`npm test`)
- [ ] Run E2E tests (`npm run test:e2e`)
- [ ] Verify no breaking database changes
- [ ] Test in staging environment first
- [ ] Have rollback plan ready

**Weekly**:
- [ ] Test backup restoration procedure
- [ ] Review error logs in Sentry
- [ ] Check system resource usage
- [ ] Verify SSL certificate expiration

**Monthly**:
- [ ] Disaster recovery drill
- [ ] Incident response procedure review
- [ ] Update runbooks if needed
- [ ] Security audit

---

## Contact Information

| Role | Name | Email | Phone |
|------|------|-------|-------|
| On-Call Lead | TBD | dev-team@example.com | +1-XXX-XXX-XXXX |
| Tech Lead | TBD | lead@example.com | +1-XXX-XXX-XXXX |
| DevOps | TBD | devops@example.com | +1-XXX-XXX-XXXX |
| CTO | TBD | cto@example.com | +1-XXX-XXX-XXXX |

**Incident Status Page**: https://status.swazdatarecovery.com (if available)

---

## Related Documents

- [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md) - Monitoring procedures
- [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) - Known issues and workarounds
- [CLAUDE.md](./CLAUDE.md) - Deployment procedures and configuration
