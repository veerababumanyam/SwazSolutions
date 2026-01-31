# Production Deployment Guide

**Phase 8: vCard Editor System Deployment to Production**

## Server Details

- **IP Address:** 185.199.52.230
- **Domain:** https://swazdatarecovery.com
- **Hostname:** srv1035265.hstgr.cloud
- **OS:** Ubuntu 22.04.5 LTS
- **User:** root
- **Path:** /var/www/swazsolutions/

## Prerequisites

- [ ] All changes committed to git
- [ ] Production build successful (npm run build)
- [ ] dist/ folder created with no errors
- [ ] SSH key configured: `~/.ssh/id_ed25519_swazsolutions`
- [ ] Server environment variables configured

## Deployment Steps

### 1. Build Locally

```bash
cd /c/Users/admin/Desktop/SwazSolutions
npm run build
```

**Verification:**
- ✅ No build errors
- ✅ dist/ folder exists
- ✅ index.html present in dist/
- ✅ assets/ folder with JS/CSS bundles

### 2. Deploy to Server

**Method 1: Using Deployment Script (Recommended)**

```bash
# Run the automated deployment script
./scripts/deploy.sh
```

**Method 2: Manual Deployment (if script fails)**

```bash
# From project root
tar czf - --exclude='node_modules' --exclude='.git' --exclude='coverage' --exclude='.cache' --exclude='dist' dist backend package.json package-lock.json | \
  ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && tar xzf - && npm install --omit=dev'
```

### 3. Restart Application

```bash
# Via script
./scripts/restart-app.sh

# Or manually
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && pm2 restart swazsolutions && pm2 save'
```

### 4. Verify Deployment

```bash
# Run verification script
./scripts/verify-deployment.sh

# Or manually:

# Check PM2 status
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 status swazsolutions'

# Check logs
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions --lines 50'

# Test endpoint
curl https://swazdatarecovery.com/profile
```

## Configuration

### Server Environment Variables

SSH into server and check/update `.env` file:

```bash
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230
nano /var/www/swazsolutions/.env
```

**Required variables:**
```bash
NODE_ENV=production
PORT=3000
DB_PATH=/var/www/swazsolutions/backend/music.db

# API Keys (keep secure)
VITE_GEMINI_API_KEY=your_key
VITE_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
JWT_SECRET=your_secret_min_32_chars

# CORS
CORS_ALLOWED_ORIGINS=https://swazdatarecovery.com,https://www.swazdatarecovery.com
```

## Deployment Timeline

| Time | Action | Status |
|------|--------|--------|
| T+0 | Execute deployment script | [  ] |
| T+5 | Verify server running | [  ] |
| T+10 | Test /profile endpoint | [  ] |
| T+15 | Run verification script | [  ] |
| T+30 | Internal team testing | [  ] |
| T+1h | Full verification checklist | [  ] |
| T+24h | Monitor logs and metrics | [  ] |

## Rollback Procedures

### Quick Rollback (< 5 minutes)

If deployment fails or critical errors occur:

```bash
# Stop application
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && pm2 stop swazsolutions'

# Restore previous dist (from git)
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && git checkout HEAD~1 -- dist/'

# Restart
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && pm2 start swazsolutions'

# Verify
curl https://swazdatarecovery.com/
```

### Full Rollback

```bash
# Run rollback script
./scripts/rollback.sh

# Or manually:
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && git revert HEAD && npm run build && pm2 restart swazsolutions'
```

## Post-Deployment Tasks

### Day 1 Monitoring

- [ ] Error rate < 0.1%
- [ ] Load time < 2s
- [ ] Database functioning normally
- [ ] SSL certificate valid
- [ ] No critical errors in logs

### Verification Checklist

**Functional Tests:**
- [ ] /profile page loads
- [ ] Portfolio tab active and functional
- [ ] Aesthetics tab functional
- [ ] Insights tab functional
- [ ] Save/Publish/Cancel buttons work
- [ ] Template system works
- [ ] All 8 block types functional

**Performance Tests:**
- [ ] Initial load < 2s (Lighthouse)
- [ ] Tab switching < 200ms
- [ ] No memory leaks (stable < 100MB)
- [ ] CSS and JS properly minified

**Security Tests:**
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] No security warnings in console

**Browser Compatibility:**
- [ ] Chrome 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+

## Useful Commands

### Application Management

```bash
# View application logs (real-time)
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions'

# View last 100 lines of logs
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions --lines 100'

# Restart application
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 restart swazsolutions'

# Stop application
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 stop swazsolutions'

# Start application
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 start swazsolutions'

# Monitor CPU/Memory
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 monit'
```

### Server Monitoring

```bash
# Check nginx status
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'systemctl status nginx'

# Check disk space
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'df -h'

# View nginx access logs
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'tail -f /var/log/nginx/access.log'

# View nginx error logs
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'tail -f /var/log/nginx/error.log'
```

### SSL Certificate Management

```bash
# List certificates
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'certbot certificates'

# Check certificate expiration
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'openssl s_client -connect swazdatarecovery.com:443 -servername swazdatarecovery.com 2>/dev/null | grep -A2 "Not After"'

# Renew certificate (if needed)
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'certbot renew'
```

### Database Management

```bash
# Backup database
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cp /var/www/swazsolutions/backend/music.db /var/www/swazsolutions/backend/music.db.backup.$(date +%Y%m%d)'

# Check database size
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'ls -lah /var/www/swazsolutions/backend/music.db'
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs for errors
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions --lines 100'

# Check PM2 status
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 status'

# Verify node_modules
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && npm install --omit=dev'

# Check port availability
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'netstat -tlnp | grep 3000'
```

### Database Errors

```bash
# Check database file
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'file /var/www/swazsolutions/backend/music.db'

# Restore from backup
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cp /var/www/swazsolutions/backend/music.db.backup /var/www/swazsolutions/backend/music.db'

# Restart application after restore
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 restart swazsolutions'
```

### High CPU/Memory Usage

```bash
# Check what processes are running
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'ps aux | grep node'

# Monitor in real-time
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 monit'

# Check for memory leaks in logs
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 'pm2 logs swazsolutions | grep -i "heap"'
```

## Success Criteria

### Functional Requirements Met

- [x] Build succeeds locally without errors
- [ ] Deployment to server completes
- [ ] Application starts on server
- [ ] /profile endpoint returns HTML
- [ ] All 3 tabs render correctly
- [ ] Templates apply properly
- [ ] Forms submit successfully

### Performance Requirements Met

- [ ] Initial load time < 2s
- [ ] Tab switching < 200ms
- [ ] Bundle size < 500KB (gzipped)
- [ ] Memory usage < 100MB
- [ ] Error rate < 0.1%

### Security Requirements Met

- [ ] HTTPS enforced
- [ ] CORS whitelist enforced
- [ ] Rate limiting active
- [ ] No exposed API keys
- [ ] SSL certificate valid

## Post-Deployment Monitoring

### Day 1
- Monitor error logs every 30 minutes
- Check performance metrics
- Verify database functioning
- Test all major features

### Day 1-3
- Daily error log review
- Performance monitoring
- Database size monitoring
- User feedback collection

### Week 1
- Review deployment success metrics
- Monitor error trends
- Check SSL certificate expiration
- Plan for any optimizations needed

## Contact & Support

For deployment issues or questions:
1. Check server logs: `pm2 logs swazsolutions`
2. Review this documentation
3. Consult CLAUDE.md for project context
4. Check git history for recent changes
