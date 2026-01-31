# Known Issues & Workarounds

Current known issues in the SwazSolutions vCard editor system. This document is actively maintained and updated as issues are discovered and resolved.

## Issue Severity Levels

- **Critical**: System down or data loss risk → Fix immediately
- **High**: Major functionality broken → Fix within 24 hours
- **Medium**: Feature partially broken → Fix within 1 week
- **Low**: Minor UX issue → Fix when convenient

---

## Current Issues

### Issue #1: Contact Form Spam

**ID**: VCARD-001
**Status**: Monitoring
**Severity**: Medium
**Reported**: 2026-01-31
**Affected**: Contact form submissions

**Description**:
Contact form submissions occasionally include spam. Rate limiting helps but doesn't fully prevent all spam patterns.

**Impact**:
- Manual review required for some submissions
- Server resources used processing spam
- Legitimate messages may be missed if filter is too aggressive

**Current Workaround**:
1. Enable rate limiting (already active):
   - 100 requests/minute for general API
   - 30 requests/15min for auth operations
   - Custom limits on contact form endpoint

2. Manual spam filtering:
   - Check backend logs for suspicious patterns
   - Can manually delete spam entries from database

3. Add to email filters:
   - Watch for keywords common in spam
   - Create automatic rules to quarantine

**Recommended Fix**:
- Implement reCAPTCHA v3 on contact form
- Add IP reputation checking
- Implement email validation
- Add submission deduplication

**Fix ETA**: Phase 2 (Q2 2026)

**Workaround Configuration**:
```bash
# In .env.production
RECAPTCHA_SITE_KEY=your_key
RECAPTCHA_SECRET_KEY=your_secret

# In backend/routes/contact.js
// Add reCAPTCHA verification before processing
const recaptchaScore = await verifyRecaptcha(req.body.captchaToken);
if (recaptchaScore < 0.5) {
    return res.status(400).json({ error: 'Spam detected' });
}
```

---

### Issue #2: Large File Upload Timeout

**ID**: VCARD-002
**Status**: Monitoring
**Severity**: Low
**Reported**: 2026-01-28
**Affected**: Gallery image uploads, vCard imports

**Description**:
Files larger than 50MB may timeout during upload on slower connections.

**Impact**:
- Users cannot upload large media files
- Timeout errors can interrupt upload process
- Network-dependent issue

**Current Workaround**:
1. **File Size Limit**: Currently set to 10MB per file
   - Sufficient for most gallery images
   - Covers typical use cases

2. **Compression Before Upload**:
   - Compress images before uploading
   - Use tools like TinyPNG, ImageOptim
   - Reduces file size by 30-50%

3. **Split Large Files**:
   - Upload multiple smaller files instead
   - 5-10 images instead of one large file

4. **Network Optimization**:
   - Upload on faster connection (WiFi vs mobile)
   - Upload during off-peak hours
   - Close other bandwidth-consuming apps

**Recommended Fix**:
- Implement chunked upload support
- Add client-side compression
- Show upload progress indicator
- Implement resume on failure

**Fix ETA**: Phase 3 (Q3 2026)

**Current Configuration**:
```javascript
// backend/middleware/uploads.js
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const UPLOAD_TIMEOUT = 60000; // 60 seconds
```

---

### Issue #3: Template Thumbnails Loading Slowly

**ID**: VCARD-003
**Status**: Monitoring
**Severity**: Low
**Reported**: 2026-01-29
**Affected**: Template gallery initial load

**Description**:
Template gallery thumbnail load takes 2-3 seconds on first load. Subsequent loads are cached.

**Impact**:
- Initial template selection appears slow
- User may think page is frozen
- Only affects first-time template browsing

**Current Workaround**:
1. **Lazy Loading** (Already implemented):
   - Thumbnails load as user scrolls
   - Reduces initial page load
   - Below-the-fold images load on demand

2. **Browser Caching**:
   - Thumbnails cached after first load
   - Return visit is instant
   - Cache expires after 7 days

3. **Manual Optimization**:
   - Clear browser cache and reload if needed
   - Try different browser if issue persists
   - Check network speed (min 1Mbps recommended)

**Recommended Fix**:
- Generate multiple thumbnail sizes (mobile, tablet, desktop)
- Implement WebP format for better compression
- Add placeholder while loading
- Pre-generate thumbnails on server

**Fix ETA**: Phase 2 (Q2 2026)

**Current Implementation**:
```javascript
// src/components/VCardEditor/TemplateSelector.tsx
const lazyLoadThumb = useCallback((src) => {
    const img = new Image();
    img.src = src;
}, []);

// Render with intersection observer
<img
    src={placeholder}
    data-src={thumbnail}
    loading="lazy"
    onIntersection={() => lazyLoadThumb(thumbnail)}
/>
```

---

### Issue #4: Mobile Keyboard Covers Input

**ID**: VCARD-004
**Status**: Monitoring
**Severity**: Low
**Reported**: 2026-01-30
**Affected**: Mobile editing, text input fields

**Description**:
On some mobile devices, the virtual keyboard covers input fields at the bottom of forms.

**Impact**:
- User cannot see what they're typing on mobile
- Affects bottom text fields and buttons
- Only occurs on older Android devices

**Current Workaround**:
1. **Scroll to Input**:
   - Manually scroll up to see input
   - Input automatically scrolls when focused
   - Works on most devices

2. **Use Landscape Mode**:
   - Rotate device to landscape
   - More screen space available
   - Keyboard takes less space

3. **Try Different Browser**:
   - Chrome has better keyboard handling
   - Firefox also handles well
   - Safari on iOS works well

**Recommended Fix**:
- Implement viewport-meta adjustments for keyboard
- Add scroll-to-focus logic
- Test on more devices
- Consider keyboard-aware layout

**Fix ETA**: Phase 2 (Q2 2026)

**Suggested Implementation**:
```javascript
// In mobile input handler
const handleInputFocus = (e) => {
    setTimeout(() => {
        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 300); // Wait for keyboard to appear
};
```

---

### Issue #5: Database Connection Pool Exhaustion

**ID**: VCARD-005
**Status**: Monitoring
**Severity**: Medium
**Reported**: 2026-01-25
**Affected**: High-traffic periods

**Description**:
Under high concurrent load (>100 simultaneous users), database connection pool can become exhausted, causing request timeouts.

**Impact**:
- Requests timeout with "ENOENT" errors
- User experiences slow page loads or timeouts
- Occurs only during peak traffic

**Current Workaround**:
1. **Connection Pool Settings**:
   - Configured to handle 50 concurrent connections
   - Sufficient for normal traffic
   - Expand if needed:

```javascript
// backend/config/database.js
const POOL_CONFIG = {
    max: 50,
    min: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
```

2. **Manual Expansion** (If needed):
   - Increase `max` pool size
   - Monitor memory impact
   - May need more server RAM

3. **Monitor Connections**:
```bash
# Check active connections
SELECT COUNT(*) FROM sqlite_master; -- Basic check
ps aux | grep node
```

4. **Restart if Stuck**:
```bash
pm2 restart swazsolutions
```

**Recommended Fix**:
- Implement connection pooling for multiple processes
- Add queue management for overflow requests
- Implement database read replicas
- Optimize long-running queries

**Fix ETA**: Phase 3 (Q3 2026)

---

### Issue #6: SSL Certificate Auto-Renewal Fails

**ID**: VCARD-006
**Status**: Resolved (Monitoring)
**Severity**: Critical
**Reported**: 2026-01-20
**Resolution**: Manual renewal script added

**Description**:
Certbot automatic renewal occasionally fails silently, requiring manual intervention.

**Impact**:
- SSL certificate can expire if renewal fails
- Browser security warnings after expiration
- Severe impact on user trust and SEO

**Current Workaround**:
1. **Automatic Checks** (Already implemented):
```bash
# Cron job - runs daily at 2 AM
0 2 * * * certbot renew --quiet
```

2. **Manual Verification**:
```bash
# Check certificate expiration
certbot certificates

# Check remaining days
curl -Iv https://swazdatarecovery.com 2>&1 | grep "expire"

# Output example:
# expire date: Feb 28, 2026 (expires in 28 days)
```

3. **Manual Renewal** (If auto-renewal fails):
```bash
# Stop nginx
sudo systemctl stop nginx

# Renew certificate
sudo certbot renew --force-renewal

# Start nginx
sudo systemctl start nginx

# Verify
certbot certificates
```

4. **Alert Setup**:
```bash
# Check weekly via monitoring
Monday morning checklist: certbot certificates
```

**Resolution**:
- Implemented automatic renewal check
- Added monitoring alert for expiration
- Created manual renewal script

**Prevention**:
- Check certificate status weekly
- Alert if < 30 days to expiration
- Renew manually if auto-renewal fails

---

### Issue #7: Profile Image Cache Invalidation

**ID**: VCARD-007
**Status**: Monitoring
**Severity**: Low
**Reported**: 2026-01-27
**Affected**: Profile avatar updates

**Description**:
After updating profile avatar, old image may display due to browser cache.

**Impact**:
- User uploads new avatar but old one shows
- Confusing for users
- Resolves automatically after cache expires (7 days)

**Current Workaround**:
1. **Browser Cache Clear**:
   - Clear browser cache manually
   - Hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)
   - Works immediately

2. **Cache Busting** (Already implemented):
   - Image URLs include timestamp: `/avatar.jpg?t=1234567890`
   - Automatic on upload
   - May take 1-2 page loads to apply

3. **Incognito Mode**:
   - Open in incognito/private window
   - No cache loaded
   - Verify fix this way

**Recommended Fix**:
- Implement service worker cache versioning
- Add cache-control headers
- Force cache invalidation on upload

**Fix ETA**: Phase 2 (Q2 2026)

**Current Implementation**:
```javascript
// src/services/apiClient.ts
const getAvatarUrl = (userId: string, timestamp: number) => {
    return `/api/profiles/${userId}/avatar?t=${timestamp}`;
};

// Upload handler
const updateAvatar = async (file: File) => {
    const res = await uploadFile(file);
    // Force refresh with new timestamp
    setAvatarTimestamp(Date.now());
};
```

---

### Issue #8: Gemini API Rate Limiting

**ID**: VCARD-008
**Status**: Monitoring
**Severity**: Medium
**Reported**: 2026-01-26
**Affected**: AI bio generation, block content generation

**Description**:
Gemini API rate limiting causes requests to fail during high concurrency.

**Impact**:
- AI generation fails with "429 Too Many Requests"
- Users see error message instead of generated content
- Affects peak usage hours

**Current Workaround**:
1. **Rate Limiting** (Already implemented):
   - 800ms delay between API calls
   - Prevents most rate limit errors
   - Configured in agent system

2. **Retry Logic**:
   - Automatic retry with exponential backoff
   - Up to 3 attempts per request
   - 1s, 2s, 4s delays

3. **User Workaround**:
   - Wait and try again after 1 minute
   - Use during off-peak hours
   - Try with smaller/simpler prompts

4. **Check API Status**:
```bash
# Monitor API usage
curl https://api.google.com/status # Check Gemini status
```

**Configuration**:
```javascript
// src/agents/config.ts
const RATE_LIMIT_DELAY = 800; // milliseconds between calls
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff
```

**Recommended Fix**:
- Upgrade Gemini API quota if available
- Implement request queuing
- Use cheaper models for simple tasks
- Batch similar requests

**Fix ETA**: Phase 2 (Q2 2026) - Pending Gemini API quota increase

---

## Non-Issues / Expected Behavior

These are not bugs but expected behavior:

1. **401 Unauthorized on /api/auth/me without token** ✓ Expected
2. **Slow first-time build** ✓ Expected (happens once)
3. **Database file size grows over time** ✓ Expected (run VACUUM periodically)
4. **CSP warnings for external resources** ✓ Fixed and expected
5. **Socket.io reconnection on page reload** ✓ Expected behavior

---

## Fixed Issues (Resolved)

### VCARD-FIX-001: CSP Violations with External Resources
- **Status**: Resolved ✓
- **Fix**: Added service worker resource filtering
- **Resolution**: Implemented in Phase 7

### VCARD-FIX-002: 401 Error on /api/auth/me for Unauthenticated Users
- **Status**: Resolved ✓
- **Fix**: Added proper error handling
- **Resolution**: Implemented in Phase 7

---

## Issue Reporting

To report a new issue:

1. **Verify it's not in this list**
2. **Document the issue**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (browser, OS, device)
   - Screenshots/logs if applicable

3. **Submit issue**:
   - Create issue in GitHub/project tracking
   - Reference this document
   - Tag with appropriate label

4. **Severity Assessment**:
   - Does it break core functionality?
   - How many users affected?
   - Is there a workaround?

---

## Monitoring & Resolution Timeline

| Severity | SLA Target | Action |
|----------|-----------|--------|
| Critical | 1 hour | Immediate investigation |
| High | 8 hours | Same-day fix or workaround |
| Medium | 48 hours | Fix within 1-2 days |
| Low | 1 week | Fix when convenient |

---

## Related Documents

- [PRODUCTION_MONITORING.md](./PRODUCTION_MONITORING.md) - Monitoring procedures
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - How to respond to incidents
- [CLAUDE.md](./CLAUDE.md) - Deployment and setup guide
