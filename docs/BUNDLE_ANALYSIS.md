# Bundle Analysis Guide

This guide explains how to analyze your application's bundle size and identify optimization opportunities.

## Quick Start

### 1. Install Bundle Visualization Tool

```bash
npm install --save-dev rollup-plugin-visualizer
```

### 2. Enable Plugin in Vite Config

Edit `vite.config.ts`:

```typescript
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,  // Automatically open in browser
      filename: 'dist/stats.html',
      title: 'Swaz Solutions Bundle Analysis',
      template: 'treemap' // Options: sunburst, treemap, networkD3, raw-data
    })
  ]
});
```

### 3. Run Build and View Analysis

```bash
npm run build
# Browser automatically opens dist/stats.html with interactive visualization
```

## Reading the Bundle Visualization

### Treemap View
- **Size of box** = Size of module in bundle
- **Color intensity** = Module weight relative to others
- **Larger boxes** = Biggest contributors to bundle size

### Key Metrics Explained

- **Gzipped**: File size after gzip compression (what users download)
- **Raw**: Uncompressed file size
- **Module**: Individual package or code chunk
- **Dependencies**: Modules required by that package

## Interpreting Results

### Good Bundle Distribution

```
Main bundle: 300-400KB (gzipped)
├── React & dependencies: ~100KB
├── React Router: ~30KB
├── Framer Motion: ~40KB
├── Lucide Icons: ~30KB
├── Other utilities: ~100KB
└── Application code: ~100KB

Tab bundles (lazy): 50-100KB each
├── Tab-specific components: ~30KB
├── Shared utilities: ~20KB
└── Dependencies: ~20KB
```

### Warning Signs

```
⚠️ Main bundle > 500KB
   Action: Enable code splitting for large features

⚠️ Duplicate dependencies
   Action: Check for version mismatches or redundant packages

⚠️ Large library (>50KB)
   Action: Look for lighter alternatives or manual implementation

⚠️ Unused code > 20%
   Action: Tree-shake and remove dead code
```

## Common Optimization Patterns

### Identify Large Dependencies

```bash
# Analyze node_modules sizes
npm list --all --depth=0
```

Find the largest packages and evaluate:
1. Are they necessary?
2. Is there a lighter alternative?
3. Can they be lazy-loaded?
4. Can you implement the functionality yourself?

### Example: Replace Heavy Libraries

```typescript
// ❌ Heavy: date-fns (60KB gzipped)
import { formatDistanceToNow } from 'date-fns';

// ✓ Lighter alternative: Use built-in Date methods
function timeAgo(date: Date): string {
  const seconds = (Date.now() - date.getTime()) / 1000;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

### Lazy Load Heavy Libraries

```typescript
// ❌ Always loaded
import * as recharts from 'recharts';

// ✓ Loaded on demand
const Charts = lazy(() => import('@/components/Charts'));
<Suspense fallback={<Skeleton />}>
  <Charts />
</Suspense>
```

## Monitoring Bundle Size

### Set Performance Budget

Add to `package.json`:

```json
{
  "bundleSize": [
    {
      "path": "./dist/main.*.js",
      "maxSize": "500 KB",
      "compression": "gzip"
    },
    {
      "path": "./dist/style.*.css",
      "maxSize": "100 KB",
      "compression": "gzip"
    }
  ]
}
```

### Track Over Time

1. Create baseline: `npm run build > baseline.txt`
2. After changes: `npm run build > current.txt`
3. Compare sizes manually or with tools like `bundlesize`

### CI/CD Integration

GitHub Actions example:

```yaml
- name: Check Bundle Size
  run: |
    npm run build
    # Compare dist/ size against previous builds
    du -sh dist/
```

## Alternative Tools

### webpack-bundle-analyzer
For webpack projects (not applicable to Vite but useful reference):

```bash
npm install --save-dev webpack-bundle-analyzer
```

### source-map-explorer
Analyze what's actually in your bundle:

```bash
npm install --save-dev source-map-explorer

npm run build
npx source-map-explorer 'dist/*.js'
```

### bundlewatch
Automated bundle size monitoring:

```bash
npm install --save-dev bundlewatch
```

## Vite-Specific Optimization

### 1. Tree-shaking Configuration

Ensure `package.json` in dependencies have:
```json
{
  "sideEffects": false,
  "exports": {
    ".": {
      "import": "./es/index.js"
    }
  }
}
```

### 2. Pre-bundle Dependencies

In `vite.config.ts`:

```typescript
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  }
});
```

### 3. Manual Chunks Configuration

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom', 'react-router-dom'],
        'animation': ['framer-motion'],
        'icons': ['lucide-react'],
      }
    }
  }
}
```

## Analyzing Specific Metrics

### Main Bundle Growth

Track over time:
```bash
# Before optimization
npm run build
ls -lh dist/main.*.js

# After optimization
npm run build
ls -lh dist/main.*.js

# Calculate reduction
echo "Saved X KB"
```

### Tab Bundle Sizes

Should each be < 150KB gzipped:
```bash
ls -lh dist/*.js | grep -E "(portfolio|aesthetics|insights)"
```

## Performance Budget Enforcement

### Create custom check script

`scripts/check-bundle-size.js`:

```javascript
const fs = require('fs');
const path = require('path');

const limits = {
  'main': 500 * 1024,      // 500KB
  'css': 100 * 1024,       // 100KB
  'tab': 150 * 1024,       // 150KB per lazy bundle
};

const distDir = path.join(__dirname, '../dist');
const files = fs.readdirSync(distDir);

let exceeded = false;

files.forEach(file => {
  const size = fs.statSync(path.join(distDir, file)).size;
  let limit = null;

  if (file.includes('main')) limit = limits.main;
  else if (file.endsWith('.css')) limit = limits.css;
  else if (file.includes('lazy')) limit = limits.tab;

  if (limit && size > limit) {
    console.error(`❌ ${file}: ${(size/1024).toFixed(1)}KB > ${(limit/1024).toFixed(1)}KB`);
    exceeded = true;
  }
});

process.exit(exceeded ? 1 : 0);
```

Run before deployment:
```bash
node scripts/check-bundle-size.js
```

## Advanced Analysis Techniques

### 1. Identify Dead Code

```bash
npm install --save-dev unimported
unimported --listRelated
```

### 2. Check for Duplicates

```bash
npm list --duplicates
```

### 3. Analyze Dependencies

```bash
npm install --save-dev depcheck
depcheck
```

### 4. Review Import Paths

Large bundles often have circular dependencies:
```typescript
// ❌ Bad: Circular import
// moduleA imports moduleB
// moduleB imports moduleA (creates dead code)

// ✓ Good: Extract shared logic to third module
// moduleA imports shared
// moduleB imports shared
// No circularity
```

## Reporting Results

### Create Bundle Report

```markdown
## Bundle Analysis Report - January 31, 2026

### Main Bundle
- **Gzipped**: 350KB ✓ (Target: < 500KB)
- **Raw**: 1.2MB
- **Largest Dependencies**: React (90KB), Framer Motion (40KB), React Router (30KB)

### Tab Bundles
- **Portfolio Tab**: 80KB ✓ (Target: < 150KB)
- **Aesthetics Tab**: 95KB ✓ (Target: < 150KB)
- **Insights Tab**: 70KB ✓ (Target: < 150KB)

### Summary
- Total bundle size: 595KB (gzipped)
- All targets met ✓
- No optimization needed at this time

### Recommendations
- Monitor growth as features are added
- Set up automated bundle size tracking
- Review quarterly for optimization opportunities
```

---

**Need Help?**
- Vite Docs: https://vitejs.dev/guide/build.html
- Rollup Visualizer: https://github.com/btakita/rollup-plugin-visualizer
- Bundle Size Best Practices: https://web.dev/reduce-javascript-payloads-with-code-splitting/
