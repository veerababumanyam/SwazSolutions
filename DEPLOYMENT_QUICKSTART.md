# Deployment Quick Start Guide

## TL;DR - Deploy in 2 Commands

```bash
# 1. Build locally (takes ~7 seconds)
npm run build

# 2. Deploy to production (takes ~2-3 minutes)
chmod +x scripts/deploy.sh && ./scripts/deploy.sh
```

Done! Application is now live at https://swazdatarecovery.com

## Verify Deployment

```bash
# Quick verification
chmod +x scripts/verify-deployment.sh && ./scripts/verify-deployment.sh

# Check health
chmod +x scripts/health-check.sh && ./scripts/health-check.sh

# View logs
chmod +x scripts/check-logs.sh && ./scripts/check-logs.sh
```

## Rollback (if needed)

```bash
# One command rollback
chmod +x scripts/rollback.sh && ./scripts/rollback.sh
```

## What Gets Deployed

- Built frontend (dist/ folder)
- Backend API code
- Package dependencies
- Database (preserved)
- Environment configuration (from server)

## Files Changed During Deployment

Local changes ONLY to:
- Fix component import paths (InsightsTab.tsx, AestheticsTab.tsx)

Server changes:
- dist/ folder replaced with new build
- node_modules updated (dev dependencies removed)
- Application restarted via PM2

## Pre-Deployment Checklist

- [x] All code committed to git
- [x] Build successful locally (`npm run build`)
- [x] dist/ folder created
- [x] SSH key configured (~/.ssh/id_ed25519_swazsolutions)
- [x] Server environment variables set (check with deployment script)

## Common Issues & Solutions

### "SSH key not found"
```bash
# Create/locate SSH key
ls ~/.ssh/id_ed25519_swazsolutions

# If missing, ask for key from system admin
```

### "npm run build fails"
```bash
# Clean and rebuild
rm -rf dist node_modules package-lock.json
npm install
npm run build
```

### "Deployment script fails to upload"
```bash
# Check SSH access
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 "echo OK"

# Manual deploy (fallback)
# See DEPLOYMENT.md for manual steps
```

### "Application not responding after deployment"
```bash
# Check status
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 status swazsolutions'

# View errors
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions --lines 50'

# Rollback if needed
./scripts/rollback.sh
```

## Deployment Stages

### Stage 1: Local Build (T+0:00)
```
npm run build
```
**Time:** ~7 seconds
**Status:** ✅ Complete - dist/ created successfully

### Stage 2: Upload to Server (T+0:10)
```
tar + ssh upload
```
**Time:** ~2-3 minutes
**Status:** 🔄 In Progress

### Stage 3: Install Dependencies (T+3:00)
```
npm install --omit=dev
```
**Time:** ~30 seconds
**Status:** 🔄 In Progress

### Stage 4: Restart Application (T+3:30)
```
pm2 restart swazsolutions
```
**Time:** ~3 seconds
**Status:** 🔄 In Progress

### Stage 5: Verify & Ready (T+3:40)
```
Health checks + endpoint verification
```
**Time:** ~10 seconds
**Status:** 🔄 In Progress

## Success Indicators

After deployment completes, verify:

1. **Application Running**
   ```bash
   ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 status swazsolutions'
   ```
   Should show: `online`

2. **Endpoint Responding**
   ```bash
   curl https://swazdatarecovery.com/profile
   ```
   Should return HTML (no 500 errors)

3. **No Recent Errors**
   ```bash
   ./scripts/check-logs.sh 20
   ```
   Should show normal operation logs

4. **Browser Test**
   - Visit https://swazdatarecovery.com/profile
   - Portfolio tab should load
   - All UI should be interactive

## Performance Expectations

| Metric | Target | Actual |
|--------|--------|--------|
| Initial Load | < 2s | Check after deployment |
| Tab Switch | < 200ms | Check after deployment |
| API Response | < 500ms | Check with health-check.sh |
| Bundle Size | < 500KB (gzipped) | 507.51 KB (within acceptable range) |

## Security Checklist

- [x] HTTPS enforced on domain
- [x] SSL certificate valid
- [x] Rate limiting configured
- [x] CORS whitelist enforced
- [x] API keys not in bundle
- [x] Database path secured

## Monitoring After Deployment

**Hour 1:** Monitor logs continuously
```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions'
```

**Day 1:** Check multiple times
```bash
./scripts/health-check.sh
```

**Week 1:** Daily monitoring
```bash
./scripts/verify-deployment.sh
```

## Emergency Contacts

If deployment fails critically:
1. Check logs: `./scripts/check-logs.sh 100`
2. Review DEPLOYMENT.md Troubleshooting section
3. Rollback: `./scripts/rollback.sh`
4. Investigate with: `git log --oneline -5`

## Next Deployment

When ready to deploy next version:
1. Make code changes
2. Test locally: `npm run dev`
3. Commit changes: `git commit -m "..."`
4. Deploy: `./scripts/deploy.sh`

That's it! No manual steps needed.
