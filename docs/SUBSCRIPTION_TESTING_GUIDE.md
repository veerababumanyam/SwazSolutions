# Subscription System Testing Guide

**Date:** January 26, 2026  
**Purpose:** Comprehensive guide for testing subscription expiration logic

---

## Overview

This guide covers testing procedures for the subscription expiration system, including free trials, paid subscriptions, and automatic expiration handling.

---

## Test Scripts

### 1. Test Subscription Expiration Logic

**Script:** `backend/scripts/test-subscription-expiration.js`

**Purpose:** Comprehensive test suite for subscription expiration functionality

**Usage:**
```bash
node backend/scripts/test-subscription-expiration.js
```

**What it tests:**
- ✅ Expired subscriptions detection
- ✅ Middleware blocking expired users
- ✅ Database status updates
- ✅ Active subscription access
- ✅ Admin bypass functionality
- ✅ Background job simulation
- ✅ Subscription status distribution
- ✅ Missing data detection

**Output:** Detailed test results with warnings and recommendations

---

### 2. Fix Expired Subscriptions (Migration)

**Script:** `backend/scripts/fix-expired-subscriptions.js`

**Purpose:** One-time migration to fix existing expired subscriptions

**Usage:**
```bash
# Dry run (no changes)
node backend/scripts/fix-expired-subscriptions.js --dry-run

# Apply changes
node backend/scripts/fix-expired-subscriptions.js
```

**What it does:**
- Finds all users with expired subscriptions not marked as 'expired'
- Updates their status to 'expired'
- Provides detailed summary of changes
- Shows statistics by status

**When to use:**
- After deploying expiration fixes
- To clean up existing data inconsistencies
- As part of database maintenance

---

## Manual Testing Procedures

### Test 1: Free Trial Expiration

**Steps:**
1. Register a new user (or use existing test user)
2. Verify user has `subscription_status = 'free'` and `subscription_end_date = +30 days`
3. Manually update database:
   ```sql
   UPDATE users 
   SET subscription_end_date = datetime('now', '-1 day') 
   WHERE id = <user_id>;
   ```
4. Try to access protected route (e.g., `/api/subscription/status`)
5. **Expected:** 403 error with `SUBSCRIPTION_EXPIRED` code
6. Check database:
   ```sql
   SELECT subscription_status FROM users WHERE id = <user_id>;
   ```
7. **Expected:** `subscription_status = 'expired'`

**Verification:**
- ✅ Middleware blocks access
- ✅ Status updated in database
- ✅ Log shows expiration event

---

### Test 2: Paid Subscription Expiration

**Steps:**
1. Create user with `subscription_status = 'active'` or `'paid'`
2. Set `subscription_end_date` to past date
3. Try to access protected route
4. **Expected:** 403 error
5. Check database status
6. **Expected:** Status updated to 'expired'

**Verification:**
- ✅ Both 'active' and 'paid' statuses handled
- ✅ Expiration detected correctly
- ✅ Status updated

---

### Test 3: Status Endpoint Updates

**Steps:**
1. Create user with expired subscription (status = 'free', end_date = past)
2. Call `GET /api/subscription/status` with valid auth token
3. **Expected Response:**
   ```json
   {
     "status": "expired",
     "endDate": "2025-01-01T00:00:00.000Z",
     "isExpired": true
   }
   ```
4. Check database
5. **Expected:** Status updated to 'expired'

**Verification:**
- ✅ Endpoint detects expiration
- ✅ Returns correct status
- ✅ Updates database

---

### Test 4: Active Subscription Access

**Steps:**
1. Create user with `subscription_status = 'active'` and future `subscription_end_date`
2. Try to access protected route
3. **Expected:** Request succeeds (200 OK)
4. Check logs
5. **Expected:** No expiration messages

**Verification:**
- ✅ Active users can access
- ✅ No false positives
- ✅ No unnecessary database updates

---

### Test 5: Admin Bypass

**Steps:**
1. Create admin user (`role = 'admin'`)
2. Set expired subscription
3. Try to access protected route
4. **Expected:** Request succeeds (admin bypass)

**Verification:**
- ✅ Admins bypass subscription check
- ✅ No expiration blocking for admins

---

### Test 6: Background Job

**Steps:**
1. Create multiple users with expired subscriptions (status = 'free', end_date = past)
2. Wait for hourly background job (or manually trigger in code)
3. Check database:
   ```sql
   SELECT COUNT(*) FROM users 
   WHERE subscription_status = 'expired';
   ```
4. Check server logs
5. **Expected:** Log shows "Updated X expired subscription(s)"

**Verification:**
- ✅ Background job runs hourly
- ✅ Updates expired subscriptions
- ✅ Logs update count

---

## API Testing

### Endpoints to Test

#### 1. GET `/api/subscription/status`
**Auth:** Required  
**Tests:**
- Returns current subscription status
- Updates expired subscriptions
- Handles all status types correctly

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/subscription/status \
  -H "Authorization: Bearer <token>"
```

**Expected Response (Active):**
```json
{
  "status": "active",
  "endDate": "2026-02-26T00:00:00.000Z",
  "isExpired": false
}
```

**Expected Response (Expired):**
```json
{
  "status": "expired",
  "endDate": "2025-01-01T00:00:00.000Z",
  "isExpired": true
}
```

---

#### 2. GET `/api/subscription/monitor`
**Auth:** Required (Admin only)  
**Tests:**
- Returns subscription system health metrics
- Shows status distribution
- Identifies issues (expired needing update, expiring soon)

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/subscription/monitor \
  -H "Authorization: Bearer <admin_token>"
```

**Expected Response:**
```json
{
  "timestamp": "2026-01-26T12:00:00.000Z",
  "statusDistribution": {
    "free": 10,
    "active": 5,
    "expired": 3
  },
  "issues": {
    "expiredNeedingUpdate": 0,
    "expiringSoon": 2
  },
  "metrics": {
    "activeSubscriptions": 5,
    "recentExpirations": 1
  },
  "system": {
    "backgroundJobEnabled": true,
    "lastCheck": "See server logs for background job execution"
  }
}
```

---

#### 3. POST `/api/subscription/create-order`
**Auth:** Required  
**Tests:**
- Prevents duplicate orders for active/paid users
- Handles all subscription statuses correctly

---

## Database Queries for Testing

### Check Expired Subscriptions
```sql
SELECT id, username, subscription_status, subscription_end_date
FROM users
WHERE subscription_status IN ('free', 'active', 'paid')
  AND subscription_end_date < datetime('now')
  AND subscription_status != 'expired';
```

### Check Status Distribution
```sql
SELECT 
    subscription_status,
    COUNT(*) as count
FROM users
WHERE subscription_status IS NOT NULL
GROUP BY subscription_status;
```

### Find Expiring Soon (Next 7 Days)
```sql
SELECT id, username, subscription_status, subscription_end_date
FROM users
WHERE subscription_status IN ('free', 'active', 'paid')
  AND subscription_end_date BETWEEN datetime('now') AND datetime('now', '+7 days')
ORDER BY subscription_end_date ASC;
```

### Set User to Expired (For Testing)
```sql
UPDATE users 
SET subscription_end_date = datetime('now', '-1 day')
WHERE id = <user_id>;
```

### Restore User Subscription (For Testing)
```sql
UPDATE users 
SET subscription_status = 'active',
    subscription_end_date = datetime('now', '+30 days')
WHERE id = <user_id>;
```

---

## Monitoring

### Log Messages to Watch

**Expiration Events:**
- `⏰ Free trial expired for user {id} (username: {username})`
- `⏰ Subscription expired for user {id} (was {status})`
- `⏰ Subscription status updated to expired for user {id}`

**Background Job:**
- `✅ Updated {count} expired subscription(s) to 'expired' status`

**Errors:**
- `❌ Error checking expired subscriptions: {error}`
- `❌ Subscription expiration check error: {error}`

---

## Troubleshooting

### Issue: Expired users not being blocked

**Check:**
1. Verify middleware is applied to route
2. Check database for correct `subscription_end_date`
3. Verify user has valid auth token
4. Check logs for errors

**Fix:**
- Run test script to identify issues
- Check middleware logic
- Verify database connection

---

### Issue: Status not updating to 'expired'

**Check:**
1. Verify database write permissions
2. Check for SQL errors in logs
3. Verify `subscription_end_date` is not NULL
4. Check if user exists

**Fix:**
- Run migration script: `fix-expired-subscriptions.js`
- Check database constraints
- Verify SQL syntax

---

### Issue: Background job not running

**Check:**
1. Verify server started successfully
2. Check for errors in server startup logs
3. Verify `subscriptionExpirationIntervalId` is set
4. Check server.js for job initialization

**Fix:**
- Restart server
- Check server logs for initialization errors
- Verify database is ready before job starts

---

## Best Practices

1. **Test Before Deploy:** Always run test scripts before deploying changes
2. **Monitor Logs:** Watch for expiration events in production
3. **Regular Maintenance:** Run migration script periodically
4. **Database Backups:** Backup before running migration scripts
5. **Dry Run First:** Always use `--dry-run` before applying changes

---

## Continuous Integration

### Recommended CI Tests

1. **Unit Tests:**
   - Test middleware with various subscription states
   - Test status endpoint logic
   - Test background job function

2. **Integration Tests:**
   - Test full subscription flow
   - Test expiration detection
   - Test database updates

3. **E2E Tests:**
   - Test user registration → expiration flow
   - Test payment → activation flow
   - Test expiration blocking

---

## Performance Testing

### Load Test Scenarios

1. **Concurrent Expiration Checks:**
   - Multiple users accessing protected routes simultaneously
   - Verify no database locks
   - Check response times

2. **Background Job Performance:**
   - Test with large number of expired subscriptions
   - Verify job completes within reasonable time
   - Check database load

3. **Status Endpoint Load:**
   - Multiple concurrent status checks
   - Verify caching if implemented
   - Check response times

---

## Conclusion

This testing guide provides comprehensive procedures for validating the subscription expiration system. Regular testing ensures the system works correctly and maintains data consistency.

For questions or issues, refer to:
- `docs/SUBSCRIPTION_VERIFICATION_REPORT.md` - Original analysis
- `docs/SUBSCRIPTION_FIXES_APPLIED.md` - Implementation details
