# Production Deployment Checklist

## Pre-Deployment (Execute Before Deploying)

### Code Readiness
- [x] All code changes committed to git
- [x] Git status is clean (no uncommitted changes)
- [x] No merge conflicts
- [x] Latest code pushed to origin (optional but recommended)

### Build Verification
- [x] `npm run build` completes successfully
- [x] No build errors in output
- [x] dist/ folder exists with 30+ MB
- [x] dist/index.html is present
- [x] dist/assets/ contains JS/CSS bundles
- [x] service-worker.js generated
- [x] sitemaps generated

### Environment Preparation
- [ ] SSH key located at: `~/.ssh/id_ed25519_swazsolutions`
- [ ] SSH key is readable: `chmod 600 ~/.ssh/id_ed25519_swazsolutions`
- [ ] Can SSH to server: `ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230`
- [ ] Server .env file is configured with all required variables
  - [ ] NODE_ENV=production
  - [ ] VITE_GEMINI_API_KEY set
  - [ ] VITE_GOOGLE_CLIENT_ID set
  - [ ] GOOGLE_CLIENT_SECRET set
  - [ ] JWT_SECRET set (min 32 chars)
  - [ ] CORS_ALLOWED_ORIGINS set
  - [ ] DB_PATH set to /var/www/swazsolutions/backend/music.db

### Deployment Scripts Ready
- [x] scripts/deploy.sh created and contains deployment logic
- [x] scripts/verify-deployment.sh created for post-deploy checks
- [x] scripts/rollback.sh created for emergency rollback
- [x] scripts/check-logs.sh created for log viewing
- [x] scripts/health-check.sh created for monitoring

### Documentation Review
- [x] DEPLOYMENT.md reviewed and understood
- [x] DEPLOYMENT_QUICKSTART.md reviewed
- [x] EXECUTE_DEPLOYMENT.md reviewed
- [x] PHASE_8_DEPLOYMENT_SUMMARY.md reviewed

### Final System Check
- [ ] Network connection stable
- [ ] Sufficient disk space locally (> 500MB free)
- [ ] Server disk space adequate (check with: df -h)
- [ ] Server uptime normal
- [ ] No other deployment/maintenance in progress on server

---

## Deployment Execution

### Step 1: Run Deployment Script
```bash
cd /c/Users/admin/Desktop/SwazSolutions
bash scripts/deploy.sh
```

**Monitor for:**
- ✓ Build verification passes
- ✓ SSH connection established
- ✓ Files uploading (2-3 minutes)
- ✓ npm install completing
- ✓ Application restarting
- ✓ Health check passing

**On Error:**
- [ ] Check error message carefully
- [ ] Review DEPLOYMENT.md Troubleshooting section
- [ ] Do NOT retry immediately if network error
- [ ] Check server logs: `bash scripts/check-logs.sh 100`

---

## Post-Deployment (Within 5 Minutes)

### Immediate Verification
- [ ] Deployment script completed without errors
- [ ] Check application status:
  ```bash
  ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 status swazsolutions'
  ```
  **Expected:** "online" status

- [ ] Check recent logs (no errors):
  ```bash
  bash scripts/check-logs.sh 20
  ```
  **Expected:** No 5xx errors, normal operation logs

- [ ] Test HTTP endpoint:
  ```bash
  curl -I https://swazdatarecovery.com/profile
  ```
  **Expected:** HTTP 200 or 301/302 redirect

- [ ] Run verification script:
  ```bash
  bash scripts/verify-deployment.sh
  ```
  **Expected:** All checks pass (or mostly pass for network reasons)

### Browser Testing (5-10 minutes)
- [ ] Open: https://swazdatarecovery.com/profile
- [ ] Page loads without errors
- [ ] Portfolio tab is active
- [ ] No JavaScript console errors
- [ ] CSS styles loading correctly
- [ ] Images loading correctly
- [ ] Click to Aesthetics tab - loads without lag
- [ ] Click to Insights tab - loads without lag
- [ ] No 404 errors for static assets

### Feature Testing (10-15 minutes)
- [ ] Portfolio tab functional:
  - [ ] Can see existing content
  - [ ] Can edit content
  - [ ] Drag-and-drop works
  - [ ] Save button works
- [ ] Aesthetics tab functional:
  - [ ] Theme selector works
  - [ ] Color picker works
  - [ ] Typography controls work
  - [ ] Template gallery works
- [ ] Insights tab functional:
  - [ ] Analytics display loads
  - [ ] No errors in analytics

### Performance Check (15 minutes)
- [ ] Initial load time < 3s
- [ ] Tab switching < 200ms
- [ ] No console errors
- [ ] Memory usage stable
- [ ] CPU usage normal

### Monitoring Script
- [ ] Run health check:
  ```bash
  bash scripts/health-check.sh
  ```
  **Expected:** All checks green, no warnings

---

## Day 1 Monitoring (After Deployment)

### Hour 1
- [ ] Monitor logs continuously
  ```bash
  ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions'
  ```
- [ ] Check for any 5xx errors
- [ ] Verify no database errors
- [ ] Check no authentication failures

### Hours 2-4
- [ ] Run health check every hour:
  ```bash
  bash scripts/health-check.sh
  ```
- [ ] Monitor error rate (should be < 0.1%)
- [ ] Check memory usage (should be < 100MB)
- [ ] Monitor CPU usage (should be < 50%)

### Hours 4-24
- [ ] Monitor periodically (every 4 hours)
- [ ] Watch for error spikes
- [ ] Verify database size stable
- [ ] Check SSL certificate still valid

---

## Week 1 Monitoring

### Daily Tasks
- [ ] Run health check
  ```bash
  bash scripts/health-check.sh
  ```
- [ ] Check logs for errors
  ```bash
  bash scripts/check-logs.sh 100
  ```
- [ ] Verify uptime (should be 99.9%+)
- [ ] Check performance metrics

### Functional Verification
- [ ] Test all 8 block types
- [ ] Test template application
- [ ] Test form submission
- [ ] Test file uploads
- [ ] Test public profiles
- [ ] Test QR code generation
- [ ] Test vCard download

### Performance Verification
- [ ] Load time < 2s (Lighthouse)
- [ ] Lighthouse score > 90
- [ ] No memory leaks
- [ ] Bundle size acceptable

### Security Verification
- [ ] HTTPS enforced
- [ ] SSL certificate valid
- [ ] CORS working properly
- [ ] Rate limiting active
- [ ] No security warnings

---

## If Deployment Fails

### Immediate Actions
1. [ ] STOP - Do not make changes
2. [ ] CHECK - Review error message carefully
3. [ ] DIAGNOSE - Run:
   ```bash
   bash scripts/check-logs.sh 100
   ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 status swazsolutions'
   ```
4. [ ] ASSESS - Is error critical?
   - Critical (app won't start) → Rollback immediately
   - Non-critical (performance) → Investigate further

### Rollback Procedure
If deployment is critically broken:

1. [ ] Stop application:
   ```bash
   ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 stop swazsolutions'
   ```

2. [ ] Restore previous version:
   ```bash
   bash scripts/rollback.sh
   ```

3. [ ] Verify rollback:
   ```bash
   bash scripts/verify-deployment.sh
   ```

4. [ ] Test in browser:
   - Open https://swazdatarecovery.com/profile
   - Verify it works

5. [ ] Investigate issue:
   - Check git logs: `git log --oneline -5`
   - Review changes: `git show HEAD`
   - Fix issue locally
   - Retry deployment

### Common Issues

**"Connection timed out"**
- [ ] Check network connectivity
- [ ] Check VPN is connected
- [ ] Verify SSH key permissions
- [ ] Try again in 1-2 minutes

**"npm install fails"**
- [ ] Check package.json syntax
- [ ] Verify package-lock.json
- [ ] Try manual: `npm install --omit=dev`

**"Application won't start"**
- [ ] Check logs: `pm2 logs swazsolutions`
- [ ] Check environment variables
- [ ] Verify dist/ folder exists
- [ ] Check database permissions

**"Database connection error"**
- [ ] Check database file: `/var/www/swazsolutions/backend/music.db`
- [ ] Check permissions: `ls -la`
- [ ] Restore from backup if needed

---

## Success Criteria - Final Verification

### ✓ Must Be True:
- [ ] `pm2 status swazsolutions` shows "online"
- [ ] `curl https://swazdatarecovery.com/profile` returns 200
- [ ] Browser loads https://swazdatarecovery.com/profile without errors
- [ ] Console has no 5xx errors
- [ ] Application logs show no critical errors

### ✓ Should Be True:
- [ ] Initial load time < 2 seconds
- [ ] Lighthouse score > 90
- [ ] No console warnings
- [ ] All features responsive
- [ ] Database accessible

### ✓ Long-term:
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%
- [ ] Memory stable
- [ ] CPU usage normal
- [ ] No cascading errors

---

## Post-Success Actions

### Immediate (After Verification)
- [ ] Notify team of successful deployment
- [ ] Update deployment log with timestamp
- [ ] Document any issues encountered
- [ ] Schedule follow-up monitoring

### Short-term (First Week)
- [ ] Monitor daily for errors
- [ ] Gather user feedback
- [ ] Track performance metrics
- [ ] Document any improvements needed

### Long-term (Ongoing)
- [ ] Weekly monitoring
- [ ] Monthly security reviews
- [ ] Quarterly performance analysis
- [ ] Plan optimizations for next phase

---

## Deployment Rollback Decision Tree

```
Deployment Complete
    |
    +-- No Errors → Continue Monitoring ✓
    |
    +-- Minor Errors (non-critical)
    |       |
    |       +-- Can Fix → Investigate & Fix
    |       |
    |       +-- Cannot Fix → Accept & Monitor
    |
    +-- Critical Errors
            |
            +-- Application Won't Start → ROLLBACK ✗
            |
            +-- Database Connection Failed → ROLLBACK ✗
            |
            +-- High Error Rate (>1%) → ROLLBACK ✗
            |
            +-- Security Issues → ROLLBACK ✗
            |
            +-- Performance Critical (>10s load) → ROLLBACK ✗
```

---

## Emergency Contacts & Escalation

### Level 1: Self-Help
- [ ] Review logs: `bash scripts/check-logs.sh`
- [ ] Run health check: `bash scripts/health-check.sh`
- [ ] Check DEPLOYMENT.md troubleshooting
- [ ] Review error in browser console

### Level 2: Investigate
- [ ] SSH to server and investigate
- [ ] Check application code
- [ ] Check environment variables
- [ ] Review recent git changes

### Level 3: Rollback
- [ ] Execute rollback: `bash scripts/rollback.sh`
- [ ] Verify rollback successful
- [ ] Identify root cause
- [ ] Plan fix for next deployment

### Level 4: Escalation
- [ ] Contact hosting provider (if infrastructure issue)
- [ ] Contact team lead (if major issue)
- [ ] Document incident for postmortem

---

## Deployment Statistics Template

**Deployment Date:** [DATE]
**Deployment Time:** [START] - [END]
**Duration:** [MINUTES] minutes
**Commits Deployed:** [NUMBER]
**Build Size:** 33 MB
**Gzipped Size:** 507.51 KB

**Results:**
- Status: [SUCCESS/PARTIAL/FAILED]
- Errors: [NUMBER]
- Warnings: [NUMBER]
- Tests Passed: [NUMBER]
- Rollback Required: [YES/NO]

**Performance Metrics (Post-Deploy):**
- Load Time: [TIME]s
- Lighthouse Score: [SCORE]
- Memory Usage: [MB]
- CPU Usage: [%]
- Error Rate: [%]

---

## Sign-Off Checklist

**Deployer Name:** ___________________

**Pre-Deployment Review:**
- [ ] Signed off on code changes
- [ ] Reviewed deployment plan
- [ ] Confirmed environment ready

**Post-Deployment Verification:**
- [ ] Verified application running
- [ ] Tested in browser
- [ ] Confirmed no critical errors
- [ ] Monitored for 24 hours

**Final Approval:**
- [ ] Deployment successful
- [ ] Ready for production use
- [ ] No issues detected

**Date/Time of Deployment:** ___________________

**Notes:**
_________________________________________________
_________________________________________________

---

## Archival (After Successful Deployment)

After 7 days of stable operation:

- [ ] Archive deployment logs
- [ ] Document any issues found
- [ ] Update deployment procedures
- [ ] Plan optimizations for next phase
- [ ] Celebrate successful deployment! 🎉
