# Refactoring Quick Start Guide

## Immediate Actions (Do Today)

### 1. Fix Critical TODOs
```bash
# backend/routes/subscription.js
# Line 93: Implement PhonePe verification
# Line 98: Implement RupeePayments validation
```

### 2. Add Database Indexes
```sql
-- Run in your SQLite database:
CREATE INDEX IF NOT EXISTS idx_digital_invites_user_id ON digital_invites(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_invites_slug ON digital_invites(slug);
CREATE INDEX IF NOT EXISTS idx_digital_invites_status ON digital_invites(status);
CREATE INDEX IF NOT EXISTS idx_invite_guests_invite_id ON invite_guests(invite_id);
CREATE INDEX IF NOT EXISTS idx_digital_invites_user_status ON digital_invites(user_id, status);
```

### 3. Enable ESLint with Security Rules
```bash
npm install --save-dev eslint-plugin-security eslint-plugin-sonarjs
```

Add to `eslint.config.js`:
```javascript
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';

// Add to your config:
{
  plugins: { security, sonarjs },
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/cognitive-complexity': ['error', 15]
  }
}
```

---

## Quick Wins (Do This Week)

### 1. Create Error Handler Middleware
```javascript
// backend/middleware/errorHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { asyncHandler, AppError };
```

### 2. Extract Constants
```javascript
// backend/constants/index.js
export const SUBSCRIPTION = {
  DURATION_MS: {
    YEAR: 365 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000
  },
  STATUS: {
    ACTIVE: 'active',
    EXPIRED: 'expired',
    PENDING: 'pending'
  }
};

export const DATABASE = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
};

export const BOOLEAN_FLAG = {
  TRUE: 1,
  FALSE: 0
};
```

### 3. Use Barrel Export (Already Created!)
```javascript
// In your route files, replace:
const { authenticateToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

// With:
const { authenticateToken, apiLimiter } = require('../middleware');
```

---

## Code Quality Checklist

Before committing code, verify:

- [ ] No console.log() - use logger instead
- [ ] All database operations use parameterized queries
- [ ] Error handling with try-catch or asyncHandler
- [ ] Validation before database operations
- [ ] No hardcoded values (use constants)
- [ ] Functions < 20 lines
- [ ] Meaningful variable names
- [ ] JSDoc comments for public functions

---

## Testing Setup

```bash
# Install testing dependencies
npm install --save-dev jest supertest sqlite3

# Create test setup
mkdir -p tests/unit tests/integration

# Add test script to package.json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

---

## Priority Order

1. **CRITICAL** - Payment verification TODOs
2. **CRITICAL** - SQL injection prevention
3. **HIGH** - Transaction support
4. **HIGH** - Database indexes
5. **MEDIUM** - Error handling middleware
6. **MEDIUM** - Extract service layer
7. **LOW** - Code deduplication

---

For detailed analysis, see: [REFACTORING-ANALYSIS.md](./REFACTORING-ANALYSIS.md)
