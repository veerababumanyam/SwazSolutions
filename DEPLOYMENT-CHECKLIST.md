# SEO Optimization Deployment Checklist

## Pre-Deployment Verification

### 1. Local Testing (Development)
```bash
# Start development server
npm run dev

# Test these URLs locally (http://localhost:5173):
```
- [ ] http://localhost:5173/
- [ ] http://localhost:5173/services/data-recovery
- [ ] http://localhost:5173/services/hard-drive-recovery
- [ ] http://localhost:5173/services/ssd-recovery
- [ ] http://localhost:5173/services/raid-recovery
- [ ] http://localhost:5173/services/ransomware-recovery
- [ ] http://localhost:5173/about
- [ ] http://localhost:5173/contact

**Verify:**
- [ ] No hash (#) in URLs
- [ ] Pages load correctly
- [ ] Browser back/forward works
- [ ] Direct URL entry works
- [ ] No console errors

### 2. Schema Validation
Visit Google Rich Results Test: https://search.google.com/test/rich-results

Test these URLs after deployment:
- [ ] https://swazdatarecovery.com/services/data-recovery
- [ ] https://swazdatarecovery.com/services/hard-drive-recovery
- [ ] https://swazdatarecovery.com/services/ssd-recovery
- [ ] https://swazdatarecovery.com/services/raid-recovery
- [ ] https://swazdatarecovery.com/services/ransomware-recovery

**Check for:**
- [ ] FAQPage schema valid
- [ ] Service schema valid
- [ ] LocalBusiness schema valid
- [ ] BreadcrumbList schema valid
- [ ] No errors or warnings

### 3. Build & Deploy

```bash
# Build frontend
npm run build

# Test production build locally
npm start
# Visit http://localhost:3000
```

**Verify production build:**
- [ ] All routes work
- [ ] Assets load correctly
- [ ] No console errors

### 4. Deploy to Production

**Using SSH Key (Primary):**
```bash
# Build locally first
npm run build

# Deploy files to server
tar czf - --exclude='node_modules' --exclude='.git' --exclude='coverage' --exclude='.cache' . | \
  ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230 \
  'cd /var/www/swazsolutions && tar xzf -'

# Connect to server
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# Install dependencies (on server)
cd /var/www/swazsolutions
npm install --omit=dev

# Restart application
pm2 restart swazsolutions

# Check status
pm2 logs swazsolutions --lines 50
```

**Fallback (if SSH key fails):**
```bash
ssh root@185.199.52.230
# Password: Veeru@098765
```

### 5. Post-Deployment Testing

**Test Production URLs:**
- [ ] https://swazdatarecovery.com/
- [ ] https://swazdatarecovery.com/services/data-recovery
- [ ] https://swazdatarecovery.com/services/hard-drive-recovery
- [ ] https://swazdatarecovery.com/services/ssd-recovery
- [ ] https://swazdatarecovery.com/services/raid-recovery
- [ ] https://swazdatarecovery.com/services/ransomware-recovery

**Verify:**
- [ ] Clean URLs (no hash)
- [ ] Pages load correctly
- [ ] Direct URL navigation works
- [ ] SSL certificate valid
- [ ] No mixed content warnings

### 6. Crawler Testing

**Test SSR Middleware:**
```bash
# Simulate Googlebot
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1)" https://swazdatarecovery.com/services/data-recovery

# Should return pre-rendered HTML with schema in <script type="application/ld+json">

# Simulate GPTBot (AI)
curl -A "GPTBot/1.0" https://swazdatarecovery.com/services/data-recovery

# Should return pre-rendered HTML optimized for AI extraction
```

**Verify:**
- [ ] HTML contains schema markup
- [ ] Content is in HTML (not requiring JS execution)
- [ ] Meta tags present
- [ ] Canonical URL correct

### 7. AI Content Endpoints

Test structured data endpoints:
- [ ] https://swazdatarecovery.com/api/ai/company-info
- [ ] https://swazdatarecovery.com/api/ai/services-catalog
- [ ] https://swazdatarecovery.com/api/ai/data-recovery-guide
- [ ] https://swazdatarecovery.com/api/ai/faq
- [ ] https://swazdatarecovery.com/ai-sitemap.json

**Verify:**
- [ ] Returns valid JSON
- [ ] Schema structure correct
- [ ] No errors

### 8. Sitemap Submission

**Google Search Console:**
1. Log in to https://search.google.com/search-console
2. Select property: www.swazsolutions.com
3. Go to Sitemaps
4. Submit sitemaps:
   - [ ] https://swazdatarecovery.com/sitemap.xml
   - [ ] https://swazdatarecovery.com/sitemap-main.xml
   - [ ] https://swazdatarecovery.com/sitemap-data-recovery.xml
   - [ ] https://swazdatarecovery.com/ai-sitemap.json

5. Request indexing for priority pages:
   - [ ] /services/data-recovery
   - [ ] /services/hard-drive-recovery
   - [ ] /services/ssd-recovery
   - [ ] /services/raid-recovery
   - [ ] /services/ransomware-recovery

### 9. Performance Testing

**PageSpeed Insights:** https://pagespeed.web.dev/
- [ ] Test homepage
- [ ] Test data recovery page
- [ ] Target: 90+ score
- [ ] Core Web Vitals: All green

**GTmetrix:** https://gtmetrix.com/
- [ ] Test homepage
- [ ] Target: A grade
- [ ] Load time: <3 seconds

### 10. Google Business Profile Setup

**Complete later (requires exact address):**
- [ ] Create/claim listing at google.com/business
- [ ] Add business name: Swaz Solutions - Data Recovery Services
- [ ] Add phone: +91-9701087446
- [ ] Add website: https://swazdatarecovery.com
- [ ] Add category: Data Recovery Service
- [ ] Add hours: Open 24/7
- [ ] Add description (750 chars)
- [ ] Upload 20+ photos
- [ ] Verify listing (postcard)
- [ ] Request initial reviews

## Missing Information (TODO)

**⚠️ ACTION REQUIRED:**

Update these files with exact business address:

1. **src/components/Schema.tsx** (Line 58-59):
   ```typescript
   streetAddress: 'TODO: Exact street address needed from user',
   postalCode: 'TODO: Postal code needed from user',
   ```

2. **backend/data/seo-pages.js** - Update all address references

**Once you have the exact address:**
- Search/replace "TODO: Exact street address needed from user"
- Search/replace "TODO: Postal code needed from user"
- Redeploy

## Rollback Plan (If Issues)

```bash
# SSH to server
ssh -i ~/.ssh/id_ed25519_swazsolutions root@185.199.52.230

# Check PM2 status
pm2 status

# View logs
pm2 logs swazsolutions --lines 100

# If app crashes, restart
pm2 restart swazsolutions

# If major issues, restore from git
cd /var/www/swazsolutions
git status
git log
# git reset --hard <previous-commit-hash>
pm2 restart swazsolutions
```

## Success Metrics (Track Over 90 Days)

**Week 1:**
- [ ] All pages indexed in Google (Search Console)
- [ ] Schema validation passing
- [ ] No crawl errors

**Week 2-4:**
- [ ] Pages ranking for brand name + service keywords
- [ ] First AI citations in Perplexity/ChatGPT
- [ ] 10+ Google Business Profile reviews

**Week 4-8:**
- [ ] Top 20 rankings for 3+ primary keywords
- [ ] Local pack appearance for "data recovery Hyderabad"
- [ ] 200% traffic increase

**Week 8-12:**
- [ ] Top 10 rankings for primary keywords
- [ ] Regular AI citations (3+ engines)
- [ ] 500% traffic increase vs baseline

## Monitoring Tools

**Google Search Console:**
- Monitor indexing status
- Track keyword rankings
- Check for crawl errors
- Review Core Web Vitals

**Google Analytics 4:**
- Track organic traffic growth
- Monitor conversion rates
- Analyze user behavior

**Manual AI Testing (Weekly):**
- Search "data recovery services Hyderabad" in Perplexity
- Search "best RAID recovery India" in ChatGPT
- Check if Swaz Solutions appears in results

## Support

- **Issues:** Report at https://github.com/anthropics/claude-code/issues
- **Emergency Server Access:** SSH key in `~/.ssh/id_ed25519_swazsolutions`
- **Phone:** +91-9701087446

---

**Deployment Date:** _______________
**Deployed By:** _______________
**All Checks Passed:** [ ] Yes [ ] No
