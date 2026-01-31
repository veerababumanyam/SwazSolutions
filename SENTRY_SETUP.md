# Sentry Error Tracking Setup Guide

Complete guide for setting up and configuring Sentry error tracking for the SwazSolutions vCard editor system.

## Overview

Sentry provides:
- Real-time error tracking and alerts
- Performance monitoring and insights
- Session replay for debugging
- Release tracking and deployment monitoring
- Source map support for minified code

---

## Initial Setup

### Step 1: Create Sentry Organization

1. Go to https://sentry.io
2. Sign up or log in with GitHub
3. Create organization: "SwazSolutions"
4. Accept invitation (sent to email)

### Step 2: Create Projects

Create two projects:

**Project 1: Backend**
- Name: `swazsolutions-backend`
- Platform: Node.js
- Environment: Production

**Project 2: Frontend**
- Name: `swazsolutions-frontend`
- Platform: React
- Environment: Production

### Step 3: Get DSN Keys

For each project:
1. Go to Settings > Client Keys (DSN)
2. Copy the DSN URL
3. Add to `.env.production`:

```bash
# Backend DSN
SENTRY_DSN=https://exampleKey@exampleId.ingest.sentry.io/exampleProjectId

# Frontend DSN
VITE_SENTRY_DSN=https://exampleKey@exampleId.ingest.sentry.io/exampleProjectId2
```

---

## Backend Integration

### Installation

```bash
npm install @sentry/node @sentry/profiling-node
```

### Setup in backend/server.js

Add at the very top of the file (before other imports):

```javascript
const fs = require('fs');
const path = require('path');

// Sentry Error Tracking
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

// Initialize Sentry as early as possible
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions

        // Profiling (Premium feature - optional)
        profilesSampleRate: 0.1,
        integrations: [
            new ProfilingIntegration(),
        ],

        // Environment
        environment: process.env.NODE_ENV || 'production',

        // Release tracking
        release: process.env.APP_VERSION || '1.1.1',

        // Custom filters
        beforeSend(event, hint) {
            // Filter out 401 unauthorized errors (expected)
            if (event.status === 401) return null;

            // Filter out 404 not found (not important)
            if (event.status === 404) return null;

            // Filter out health check errors
            if (event.request?.url?.includes('/api/health')) {
                return null;
            }

            return event;
        },

        // Capture Exceptions in Handlers
        attachStacktrace: true,
        maxBreadcrumbs: 50,

        // Ignored Errors
        ignoreErrors: [
            // Browser/network errors (frontend)
            'top.GLOBALS',
            'SecurityError',
            'NetworkError',
            // Ignore 3rd party script errors
            /plugins\/google_analytics/i,
            /gtag/i,
        ],
    });

    console.log('✅ Sentry initialized for backend');
} else {
    console.warn('⚠️  SENTRY_DSN not configured - error tracking disabled');
}
```

### Add Request Handler

After creating Express app, add Sentry middleware:

```javascript
const app = express();

// Sentry request handler (must be first)
app.use(Sentry.Handlers.requestHandler());

// ... other middleware ...

// Sentry error handler (must be last)
app.use(Sentry.Handlers.errorHandler());
```

### Manual Error Capture

Capture specific errors:

```javascript
// In route handlers
try {
    const data = await someAsyncOperation();
} catch (error) {
    // Automatically captured by error handler, or manually:
    Sentry.captureException(error, {
        tags: {
            endpoint: '/api/templates',
            severity: 'high',
        },
        extra: {
            userId: req.user?.id,
            requestId: req.id,
        },
    });

    res.status(500).json({ error: error.message });
}
```

### Capture Messages

For non-critical information:

```javascript
Sentry.captureMessage('User uploaded large file', {
    level: 'info',
    tags: {
        event: 'file_upload',
        size: '100MB',
    },
});
```

### Set User Context

Track which user encountered errors:

```javascript
// In authentication middleware
if (req.user) {
    Sentry.setUser({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
    });
} else {
    Sentry.setUser(null);
}
```

### Add Breadcrumbs

Track important events leading up to errors:

```javascript
Sentry.captureMessage('Processing template');
Sentry.addBreadcrumb({
    category: 'template',
    message: 'User accessed template gallery',
    level: 'info',
    data: {
        templateId: templateId,
        category: category,
    },
});
```

---

## Frontend Integration

### Installation

```bash
npm install @sentry/react
```

### Setup in src/main.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';

// Initialize Sentry
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,

        // Performance Monitoring
        tracesSampleRate: 0.1,

        // Session Replay
        integrations: [
            new Sentry.Replay({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0, // Always record when error occurs

        // Environment
        environment: import.meta.env.MODE,

        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || '1.1.1',

        // Filters
        beforeSend(event, hint) {
            // Filter errors from browser extensions
            if (event.exception) {
                const error = hint.originalException;
                if (error?.message?.includes('chrome-extension')) {
                    return null;
                }
            }
            return event;
        },
    });

    console.log('✅ Sentry initialized for frontend');
}

// Wrap App with Sentry Higher Order Component
const SentryApp = Sentry.withProfiler(App);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <SentryApp />
    </React.StrictMode>,
);
```

### React Router Integration

For automatic page view tracking:

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';

function usePageTracking() {
    const location = useLocation();

    useEffect(() => {
        // Capture page view
        Sentry.captureMessage('Page View', {
            level: 'info',
            tags: {
                page: location.pathname,
            },
        });
    }, [location]);
}

// Use in App.tsx
export default function App() {
    usePageTracking();
    // ... rest of app
}
```

### Capture User Errors

```typescript
import * as Sentry from '@sentry/react';

// In your auth context or component
function setAuthUser(user) {
    Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
    });
}

function logout() {
    Sentry.setUser(null);
}
```

### Add Custom Context

```typescript
import * as Sentry from '@sentry/react';

// In profile editor
function updateVCard(profileData) {
    Sentry.setContext('profile', {
        templateId: profileData.templateId,
        hasAvatar: !!profileData.avatar,
        blockCount: profileData.blocks?.length || 0,
    });

    try {
        // Save profile
        await saveProfile(profileData);
    } catch (error) {
        Sentry.captureException(error);
    }
}
```

### Manual Event Tracking

```typescript
import * as Sentry from '@sentry/react';

// Track user actions
function handleBlockAdd(blockType) {
    Sentry.captureMessage('Block Added', {
        level: 'info',
        tags: {
            blockType: blockType,
        },
        extra: {
            timestamp: new Date().toISOString(),
        },
    });
}
```

---

## Environment Variables

### Required .env.production

```bash
# Sentry DSNs
SENTRY_DSN=https://exampleKey@exampleId.ingest.sentry.io/projectId
VITE_SENTRY_DSN=https://exampleKey@exampleId.ingest.sentry.io/projectId

# Application version for release tracking
APP_VERSION=1.1.1
VITE_APP_VERSION=1.1.1

# Environment
NODE_ENV=production
VITE_ENVIRONMENT=production
```

---

## Sentry Dashboard Configuration

### 1. Create Alert Rules

**Alert: High Error Rate**
```
Alert name: High Error Rate
Conditions:
  - Error count > 10 in the last 5 minutes
Actions:
  - Send email to dev-team@example.com
  - Post to Slack #incidents
```

**Alert: New Error Type**
```
Alert name: New Error Type
Conditions:
  - New error groups created
Actions:
  - Send email to dev-team@example.com
```

**Alert: Spike in Errors**
```
Alert name: Error Spike
Conditions:
  - Error rate increased 50% compared to baseline
Actions:
  - Send email to dev-team@example.com
  - Page on-call engineer
```

### 2. Set Up Integrations

**Slack Integration**:
1. Go to Integrations > Slack
2. Connect Slack workspace
3. Select channel: #incidents
4. Enable notifications for:
   - Errors
   - Performance alerts
   - New releases

**Email Integration**:
1. Go to Alerts > Create Alert Rule
2. Set conditions for critical errors
3. Add email recipients
4. Test alert

### 3. Configure Release Tracking

**Add Release on Deployment**:

```bash
#!/bin/bash
# deploy.sh

VERSION=$(npm list --depth=0 | grep "swaz-solutions" | awk '{print $2}')

# Release creation
curl https://sentry.io/api/0/organizations/swaz-solutions/releases/ \
  -X POST \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  -d "{\"version\": \"$VERSION\"}"

# Map source maps (if using minified assets)
# ... source map upload commands
```

---

## Performance Monitoring

### Setup Performance Alerts

1. **Monitor > Alerts**
2. **Create Alert**:

```
Alert: Slow Transaction
Conditions:
  - p95(transaction.duration) > 2s
  - over the last 15 minutes
Actions:
  - Send email notification
```

### View Performance Metrics

- **Dashboards > Performance**
  - Throughput (requests/sec)
  - Transaction duration (p50, p95, p99)
  - Error rate by endpoint
  - Slowest transactions

### Custom Metrics

```javascript
// Backend: Track custom operations
const startTime = Sentry.now();

// ... operation ...

const duration = Sentry.now() - startTime;
Sentry.captureMessage('Custom Operation', {
    level: 'info',
    tags: {
        operation: 'template_generation',
        duration: `${duration}ms`,
    },
});
```

---

## Debugging with Session Replay

**Replay Configuration**:

```javascript
// Only record on errors (saves bandwidth)
replaysOnErrorSampleRate: 1.0

// This captures:
- Full DOM tree
- User interactions (masked for privacy)
- Console logs
- Network requests
- Redux actions
```

**Viewing Replays**:
1. Go to an error in Sentry
2. Scroll to "Session Replay"
3. Play back the session to see user actions before error

---

## Source Maps

### Generate Source Maps

**Backend** (Vite automatically generates):
```javascript
// vite.config.js
export default {
    build: {
        sourcemap: true, // Generates .js.map files
    }
}
```

**Upload to Sentry**:
```bash
npm install --save-dev @sentry/cli

# Create .sentryclirc
[auth]
token=YOUR_AUTH_TOKEN

# Upload source maps
sentry-cli releases files VERSION upload-sourcemaps ./dist
```

---

## Data Privacy & Security

### PII Data Handling

**Mask Sensitive Data**:

```javascript
// Backend
Sentry.init({
    beforeSend(event) {
        // Remove email addresses
        if (event.request?.headers?.authorization) {
            delete event.request.headers.authorization;
        }
        return event;
    }
});

// Frontend
Sentry.init({
    integrations: [
        new Sentry.Replay({
            maskAllText: true,     // Hide all text
            blockAllMedia: true,   // Hide media
        })
    ]
});
```

### Data Retention

1. Go to **Settings > Data Retention**
2. Set retention policies:
   - Error events: 30 days
   - Replay events: 7 days
   - Transaction events: 30 days

### GDPR Compliance

- Enable "Delete data on removal": Yes
- Set deletion period: 90 days
- Enable consent management if needed

---

## Troubleshooting

### Errors Not Appearing

**Check**:
1. Is DSN configured? `echo $SENTRY_DSN`
2. Is Sentry enabled? Check logs for init message
3. Is error being filtered? Check `beforeSend` function
4. Is network working? Check browser DevTools

**Solution**:
```bash
# Test DSN
curl -X POST -H 'Content-Type: application/json' \
  -d '{"message":"test"}' \
  https://exampleKey@exampleId.ingest.sentry.io/api/1/envelope/
```

### Source Maps Not Working

**Check**:
1. Are `.map` files generated? `ls dist/*.map`
2. Are files uploaded? Check Sentry Settings > Source Maps
3. Is release version correct? Must match `release` field in init

**Solution**:
```bash
# Manual upload
sentry-cli releases files VERSION upload-sourcemaps ./dist
```

### Performance Metrics Missing

**Check**:
1. Is `tracesSampleRate > 0`?
2. Are transactions being created? Check performance section
3. Is network working?

**Solution**:
```javascript
// Explicitly create transaction
const transaction = Sentry.startTransaction({
  name: '/api/templates',
  op: 'http.server',
});
```

---

## Cost Optimization

### Sampling Strategy

```javascript
// Backend: 10% of transactions
tracesSampleRate: 0.1

// Frontend: 5% of sessions, 100% on error
replaysSessionSampleRate: 0.05
replaysOnErrorSampleRate: 1.0
```

### Filtering Events

```javascript
// Backend: Skip health checks
beforeSend(event) {
    if (event.request?.url?.includes('/health')) {
        return null; // Don't send
    }
    return event;
}
```

### Budget Tracking

Monitor monthly quota:
1. Settings > Billing > Plan
2. View current usage
3. Set quota alerts

---

## References

- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/platforms/node/performance/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
