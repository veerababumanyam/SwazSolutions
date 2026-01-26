# Subscription Pricing Migration: Monthly to Yearly

**Date:** January 26, 2026  
**Migration:** ₹50/month (30 days) → ₹200/year (365 days)

## Overview

The subscription model has been migrated from monthly to yearly pricing. This document outlines all changes made and provides instructions for migrating existing subscribers.

---

## Changes Summary

### Pricing Changes

| Item | Before | After |
|------|--------|-------|
| **Price** | ₹50 | ₹200 |
| **Period** | 30 days (1 month) | 365 days (1 year) |
| **Price per day** | ₹1.67/day | ₹0.55/day |
| **Savings** | - | 67% discount vs monthly |

### Files Modified

1. **Payment Services:**
   - `backend/services/cashfreeService.js`
   - `backend/services/phonePeService.js`
   - `backend/services/rupeePaymentsService.js`

2. **Subscription Logic:**
   - `backend/routes/subscription.js`

3. **Frontend UI:**
   - `src/components/Subscription/SubscriptionModal.tsx`

4. **New Files:**
   - `backend/scripts/migrate-monthly-to-yearly.js` (migration script)

---

## Technical Details

### Payment Service Updates

**Cashfree Service:**
```javascript
// Before
order_amount: 50.00,
order_note: 'Monthly Subscription - 1 Month Access'

// After
order_amount: 200.00,
order_note: 'Yearly Subscription - 1 Year Access'
```

**PhonePe Service:**
```javascript
// Before
amount: 50 * 100, // 50 INR in paise

// After
amount: 200 * 100, // 200 INR in paise
```

**RupeePayments Service:**
```javascript
// Before
console.log(`Creating RupeePayments order for ${user.username}, Amount: 50 INR`);

// After
console.log(`Creating RupeePayments order for ${user.username}, Amount: 200 INR`);
```

### Subscription Period Update

**Subscription Route:**
```javascript
// Before
const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

// After
const newEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
```

### Frontend UI Update

**Subscription Modal:**
```tsx
// Before
<span className="text-gray-300">Monthly Subscription</span>
<span className="text-2xl font-bold text-white">₹50<span className="text-sm font-normal text-gray-400">/mo</span></span>

// After
<span className="text-gray-300">Yearly Subscription</span>
<span className="text-2xl font-bold text-white">₹200<span className="text-sm font-normal text-gray-400">/yr</span></span>
```

---

## Migration Process

### For Existing Subscribers

All existing monthly subscribers need to be migrated to yearly subscriptions. This is done using the migration script.

### Migration Script

**Location:** `backend/scripts/migrate-monthly-to-yearly.js`

**Features:**
- Finds all active/paid subscribers
- Calculates remaining days until expiration
- Extends subscription to exactly 365 days from migration date
- Supports dry-run mode for safe testing
- Provides detailed migration summary

**Usage:**
```bash
# Step 1: Dry run (recommended)
node backend/scripts/migrate-monthly-to-yearly.js --dry-run

# Step 2: Review output and verify changes

# Step 3: Apply migration
node backend/scripts/migrate-monthly-to-yearly.js
```

**What the script does:**
1. Finds all users with `subscription_status = 'active'` or `'paid'`
2. For each user:
   - Calculates days remaining until expiration
   - If days remaining > 0: Extends to exactly 365 days from now
   - If expired or no days remaining: Sets to 365 days from now
3. Logs all migrations with details
4. Provides summary statistics

**Example Output:**
```
🔄 Migrating Monthly Subscriptions to Yearly

✅ Database ready

📊 Found 5 active subscriber(s) to migrate:

   1. User ID: 1
      Username: john_doe
      Email: john@example.com
      Current Status: active
      Current End Date: 2026-02-15T00:00:00.000Z
      Days Remaining: 20
      New End Date: 2027-01-26T00:00:00.000Z
      Extension: +345 days

   ...

🔄 Applying migrations...

   ✅ Migrated user 1 (john_doe)
   ✅ Migrated user 2 (jane_doe)
   ...

✅ Migration complete! Migrated 5 subscription(s)

📈 Migration Summary:
   - Total subscriptions migrated: 5
   - Total days extended: 1725
   - Average extension: 345 days

📊 Verification: 5 active subscription(s) now have 365+ days remaining
```

---

## Impact Analysis

### Benefits

1. **Customer Value:** 67% discount compared to monthly pricing
2. **Revenue Predictability:** Annual payments provide better cash flow
3. **Reduced Churn:** Longer commitment period
4. **Simplified Billing:** Fewer payment transactions

### Considerations

1. **Existing Subscribers:** Must be migrated using the migration script
2. **Free Trial:** Remains 30 days (unchanged)
3. **Payment Providers:** All three providers (Cashfree, PhonePe, RupeePayments) updated
4. **Backward Compatibility:** Existing monthly subscriptions continue until migrated

---

## Testing Checklist

After deployment, verify:

- [ ] New subscription orders show ₹200
- [ ] Payment links work with new pricing
- [ ] Subscription end date is set to 365 days after payment
- [ ] Frontend displays "Yearly Subscription ₹200/yr"
- [ ] Migration script runs successfully
- [ ] Existing subscribers are migrated correctly
- [ ] Free trial remains 30 days
- [ ] All payment providers (Cashfree, PhonePe, RupeePayments) work correctly

---

## Rollback Plan

If issues occur, rollback steps:

1. **Revert Payment Services:**
   - Change amounts back to ₹50
   - Update order notes back to "Monthly"

2. **Revert Subscription Period:**
   - Change period back to 30 days in `subscription.js`

3. **Revert Frontend:**
   - Change UI back to "Monthly ₹50/mo"

4. **Reverse Migration (if needed):**
   - Create reverse migration script to subtract 335 days from migrated users
   - Or manually adjust subscription end dates

---

## Post-Migration Monitoring

After migration, monitor:

1. **Payment Success Rate:** Ensure ₹200 payments are processing correctly
2. **Subscription Activations:** Verify new subscriptions are set to 365 days
3. **Migration Status:** Check that all existing subscribers were migrated
4. **Customer Support:** Watch for any pricing-related inquiries

---

## Support Notes

### Common Questions

**Q: What happens to my current monthly subscription?**  
A: It will be automatically migrated to yearly, extending your subscription to 365 days from the migration date.

**Q: Do I need to pay again?**  
A: No, existing subscribers are migrated automatically. Only new subscriptions require payment.

**Q: Can I still pay monthly?**  
A: No, we've moved to yearly subscriptions only. This provides better value at ₹200/year vs ₹600/year if paid monthly.

**Q: What about my free trial?**  
A: Free trial remains 30 days, unchanged.

---

## Conclusion

The migration from monthly to yearly subscriptions is complete. All payment services, subscription logic, and UI have been updated. Existing subscribers should be migrated using the provided migration script.

For questions or issues, refer to:
- `docs/SUBSCRIPTION_FIXES_APPLIED.md` - Subscription system documentation
- `backend/scripts/migrate-monthly-to-yearly.js` - Migration script
