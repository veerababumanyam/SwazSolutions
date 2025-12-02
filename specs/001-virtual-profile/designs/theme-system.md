# Theme System Design

**Feature**: Virtual Profile - Theme Selection & AI Generation
**Created**: December 2, 2025
**Status**: Design Specification

## Overview

The theme system allows users to customize their public profile's visual appearance through:
1. **Pre-built themes** (8-12 professionally designed)
2. **AI-generated themes** (based on user preferences)
3. **Manual customization** (fine-tune any theme)

## Pre-Built Theme Gallery

### Theme Categories

**Professional** (3 themes)
- Classic Blue: Corporate, trustworthy, traditional
- Executive Gray: Sophisticated, minimal, elegant
- Corporate Teal: Modern professional, tech-friendly

**Creative** (3 themes)
- Vibrant Gradient: Bold, colorful, artistic
- Neon Night: Dark mode, tech-savvy, modern
- Pastel Dream: Soft, friendly, approachable

**Minimal** (3 themes)
- Pure White: Clean, simple, scandinavian
- Dark Elegance: Sleek, mysterious, premium
- Monochrome: Black & white, timeless, bold

**Bold** (2-3 themes)
- Sunset Orange: Warm, energetic, startup vibe
- Electric Purple: Unique, memorable, standout
- Forest Green: Nature-inspired, calming, eco-friendly

### Theme Preview UI

```
┌─────────────────────────────────────┐
│  Choose Your Theme                  │
│                                     │
│  [Professional] [Creative] [Minimal] [Bold]
│                                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ Blue   │ │ Gray   │ │ Teal   │ │
│  │ ████   │ │ ████   │ │ ████   │ │
│  │ ████   │ │ ████   │ │ ████   │ │
│  └────────┘ └────────┘ └────────┘ │
│  [Preview]   [Apply]    [Preview]  │
│                                     │
│  🤖 [Generate AI Theme]             │
└─────────────────────────────────────┘
```

## Theme Data Structure

### Theme JSON Schema

```json
{
  "themeId": "classic-blue",
  "themeName": "Classic Blue",
  "themeType": "system",
  "category": "professional",
  "colors": {
    "background": "#f5f7fa",
    "backgroundGradient": null,
    "primary": "#0066cc",
    "secondary": "#5c7cfa",
    "accent": "#339af0",
    "text": "#1a1a1a",
    "textSecondary": "#666666",
    "cardBackground": "#ffffff",
    "cardBorder": "#e1e4e8"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "headingSize": "2rem",
    "bodySize": "1rem",
    "lineHeight": 1.6
  },
  "layout": {
    "spacing": "comfortable",
    "cardRadius": "12px",
    "cardShadow": "0 4px 6px rgba(0,0,0,0.1)",
    "cardOpacity": 1.0,
    "maxWidth": "600px"
  },
  "avatar": {
    "shape": "circle",
    "size": "120px",
    "border": "4px solid #0066cc"
  },
  "backgroundImage": null,
  "logoUrl": null,
  "previewImage": "/themes/previews/classic-blue.png"
}
```

## AI Theme Generation

### User Input Dialog

```
┌──────────────────────────────────────┐
│  🤖 Generate Your Perfect Theme      │
│                                      │
│  Describe your style (optional):    │
│  ┌────────────────────────────────┐ │
│  │ professional, tech, modern     │ │
│  └────────────────────────────────┘ │
│                                      │
│  Brand Colors (optional):            │
│  ┌────┐ ┌────┐ ┌────┐              │
│  │ #  │ │ #  │ │ #  │ [+ Add]     │
│  └────┘ └────┘ └────┘              │
│                                      │
│  Mood/Vibe:                          │
│  ○ Energetic  ○ Calm                │
│  ○ Bold       ○ Minimal             │
│  ○ Playful    ○ Serious             │
│                                      │
│  [Cancel]        [Generate Theme ✨] │
└──────────────────────────────────────┘
```

### AI Theme Generation Prompt

```
System: You are a professional UI/UX designer specializing in personal 
branding and web design. Generate a cohesive color theme for a 
professional profile page.

User Input:
- Keywords: {keywords}
- Brand Colors: {colors}
- Mood: {mood}

Generate a JSON theme with:
1. Background color (solid or gradient)
2. Primary, secondary, and accent colors
3. Text colors (ensure WCAG AA contrast)
4. Typography recommendation
5. Layout spacing and style
6. Avatar styling

Requirements:
- All colors must be WCAG AA compliant for accessibility
- Colors should be harmonious and professional
- Consider mobile-first design
- Provide reasoning for color choices
```

### AI Response Processing

```javascript
async function generateAITheme(userInput) {
  const prompt = buildPrompt(userInput);
  
  // Call AI API (OpenAI, Claude, etc.)
  const response = await aiService.generate({
    model: 'gpt-4',
    prompt: prompt,
    temperature: 0.7,
    maxTokens: 1000
  });
  
  // Parse and validate response
  const theme = JSON.parse(response.content);
  
  // Validate accessibility (contrast ratios)
  const validated = validateTheme(theme);
  
  // Generate preview image
  const previewUrl = await generatePreview(validated);
  
  return {
    ...validated,
    themeType: 'ai-generated',
    previewImage: previewUrl,
    generatedAt: new Date()
  };
}
```

## Manual Theme Customization

### Customization Panel

```
┌──────────────────────────────────────┐
│  Customize Theme                     │
│                                      │
│  Colors:                             │
│  Background:  [#f5f7fa] 🎨          │
│  Primary:     [#0066cc] 🎨          │
│  Accent:      [#339af0] 🎨          │
│  Text:        [#1a1a1a] 🎨          │
│                                      │
│  Typography:                         │
│  Font: [Inter ▼]                    │
│  Size: [● 14px  ○ 16px  ○ 18px]    │
│                                      │
│  Layout:                             │
│  Spacing: [Compact | Comfortable | Spacious]
│  Card Radius: [────●────] 12px      │
│  Card Opacity: [────────●] 100%     │
│                                      │
│  Avatar:                             │
│  Shape: [○ Circle  □ Square  ◇ Rounded]
│  Size: [────●────] 120px            │
│                                      │
│  Background:                         │
│  ○ Solid Color                      │
│  ○ Gradient                         │
│  ○ Pattern                          │
│  ○ Custom Image [Upload]            │
│                                      │
│  [Reset to Default] [Save Changes]  │
└──────────────────────────────────────┘
```

## Theme Preview System

### Live Preview

```
Side-by-side view:

┌──────────────┬──────────────┐
│ Customization│ Live Preview │
│ Panel        │              │
│              │  ┌────────┐  │
│ [Colors]     │  │ Photo  │  │
│ [Typography] │  └────────┘  │
│ [Layout]     │   John Doe   │
│ [Avatar]     │  Engineer    │
│              │              │
│              │  [LinkedIn]  │
│              │  [Twitter]   │
│              │              │
│              │  [Contact]   │
│              │              │
└──────────────┴──────────────┘

Changes apply instantly to preview →
```

## Database Schema

```sql
-- Themes table
CREATE TABLE themes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id), -- NULL for system themes
  theme_name VARCHAR(100) NOT NULL,
  theme_type VARCHAR(50) NOT NULL, -- 'system', 'custom', 'ai-generated'
  category VARCHAR(50), -- 'professional', 'creative', 'minimal', 'bold'
  
  -- Colors (JSON)
  colors JSONB NOT NULL,
  -- {
  --   background, backgroundGradient, primary, secondary, 
  --   accent, text, textSecondary, cardBackground, cardBorder
  -- }
  
  -- Typography (JSON)
  typography JSONB NOT NULL,
  -- { fontFamily, headingSize, bodySize, lineHeight }
  
  -- Layout (JSON)
  layout JSONB NOT NULL,
  -- { spacing, cardRadius, cardShadow, cardOpacity, maxWidth }
  
  -- Avatar (JSON)
  avatar JSONB NOT NULL,
  -- { shape, size, border }
  
  background_image_url TEXT,
  logo_url TEXT,
  preview_image_url TEXT,
  
  is_active BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false, -- Can others use this theme?
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT one_active_theme_per_user 
    CHECK (
      NOT EXISTS (
        SELECT 1 FROM themes t2 
        WHERE t2.user_id = themes.user_id 
        AND t2.is_active = true 
        AND t2.id != themes.id
      ) OR is_active = false
    )
);

-- Theme usage tracking (analytics)
CREATE TABLE theme_usage (
  id UUID PRIMARY KEY,
  theme_id UUID REFERENCES themes(id),
  user_id UUID REFERENCES users(id),
  applied_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_theme_popularity (theme_id, applied_at)
);
```

## API Endpoints

```
GET    /api/themes/system          # Get all system themes
GET    /api/themes/user/:userId    # Get user's custom themes
POST   /api/themes/generate-ai     # Generate AI theme
POST   /api/themes                 # Save custom theme
PUT    /api/themes/:themeId        # Update theme
DELETE /api/themes/:themeId        # Delete custom theme
POST   /api/themes/:themeId/apply  # Apply theme to profile
GET    /api/themes/:themeId/preview # Get theme preview
```

## CSS Variable System

### Dynamic Theme Application

```css
/* Theme variables injected dynamically */
:root {
  /* Colors */
  --color-background: #f5f7fa;
  --color-primary: #0066cc;
  --color-secondary: #5c7cfa;
  --color-accent: #339af0;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-card-bg: #ffffff;
  --color-card-border: #e1e4e8;
  
  /* Typography */
  --font-family: Inter, system-ui, sans-serif;
  --font-size-heading: 2rem;
  --font-size-body: 1rem;
  --line-height: 1.6;
  
  /* Layout */
  --spacing: 1rem; /* comfortable */
  --card-radius: 12px;
  --card-shadow: 0 4px 6px rgba(0,0,0,0.1);
  --card-opacity: 1.0;
  --max-width: 600px;
  
  /* Avatar */
  --avatar-shape: 50%; /* circle */
  --avatar-size: 120px;
  --avatar-border: 4px solid var(--color-primary);
}

/* Profile card uses theme variables */
.profile-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  opacity: var(--card-opacity);
  max-width: var(--max-width);
  padding: var(--spacing);
  font-family: var(--font-family);
  color: var(--color-text);
}

.profile-name {
  color: var(--color-primary);
  font-size: var(--font-size-heading);
}

.social-link {
  color: var(--color-accent);
}

.avatar {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: var(--avatar-shape);
  border: var(--avatar-border);
}
```

### Theme Switching

```javascript
function applyTheme(theme) {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
  
  // Apply typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--font-size-heading', theme.typography.headingSize);
  root.style.setProperty('--font-size-body', theme.typography.bodySize);
  root.style.setProperty('--line-height', theme.typography.lineHeight);
  
  // Apply layout
  root.style.setProperty('--card-radius', theme.layout.cardRadius);
  root.style.setProperty('--card-shadow', theme.layout.cardShadow);
  root.style.setProperty('--card-opacity', theme.layout.cardOpacity);
  
  // Apply avatar
  const avatarShape = theme.avatar.shape === 'circle' ? '50%' : 
                      theme.avatar.shape === 'square' ? '0' : '8px';
  root.style.setProperty('--avatar-shape', avatarShape);
  root.style.setProperty('--avatar-size', theme.avatar.size);
  root.style.setProperty('--avatar-border', theme.avatar.border);
  
  // Apply background image if present
  if (theme.backgroundImage) {
    document.body.style.backgroundImage = `url(${theme.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
  }
}
```

## Accessibility Compliance

### Color Contrast Validation

```javascript
function validateColorContrast(theme) {
  const contrastChecks = [
    {
      fg: theme.colors.text,
      bg: theme.colors.background,
      minRatio: 4.5, // WCAG AA for normal text
      label: 'Text on Background'
    },
    {
      fg: theme.colors.primary,
      bg: theme.colors.background,
      minRatio: 3.0, // WCAG AA for large text
      label: 'Primary on Background'
    },
    {
      fg: theme.colors.text,
      bg: theme.colors.cardBackground,
      minRatio: 4.5,
      label: 'Text on Card'
    }
  ];
  
  const results = contrastChecks.map(check => {
    const ratio = calculateContrastRatio(check.fg, check.bg);
    return {
      ...check,
      ratio,
      passes: ratio >= check.minRatio
    };
  });
  
  const allPass = results.every(r => r.passes);
  
  return {
    valid: allPass,
    checks: results
  };
}

function calculateContrastRatio(color1, color2) {
  // Convert hex to RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  // Calculate relative luminance
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  
  // Calculate contrast ratio
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}
```

## Theme Analytics

### Track Theme Popularity

```sql
-- Most popular system themes
SELECT 
  t.theme_name,
  t.category,
  COUNT(tu.user_id) as times_applied,
  COUNT(DISTINCT tu.user_id) as unique_users
FROM themes t
LEFT JOIN theme_usage tu ON t.id = tu.theme_id
WHERE t.theme_type = 'system'
GROUP BY t.id, t.theme_name, t.category
ORDER BY unique_users DESC
LIMIT 10;

-- AI theme generation success rate
SELECT 
  COUNT(*) as total_generated,
  COUNT(CASE WHEN is_active = true THEN 1 END) as applied,
  ROUND(
    COUNT(CASE WHEN is_active = true THEN 1 END)::numeric / 
    COUNT(*)::numeric * 100, 
    2
  ) as success_rate_percent
FROM themes
WHERE theme_type = 'ai-generated';
```

## Performance Optimization

### Theme Caching

```javascript
// Cache theme in localStorage for instant application
function cacheTheme(userId, theme) {
  const cacheKey = `theme_${userId}`;
  localStorage.setItem(cacheKey, JSON.stringify(theme));
}

function loadCachedTheme(userId) {
  const cacheKey = `theme_${userId}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached theme', e);
      return null;
    }
  }
  
  return null;
}

// On public profile load
async function loadProfileTheme(username) {
  // 1. Try cache first (instant)
  const cached = loadCachedTheme(username);
  if (cached) {
    applyTheme(cached);
  }
  
  // 2. Fetch from API (background)
  const theme = await fetchTheme(username);
  
  // 3. Apply if different from cache
  if (JSON.stringify(theme) !== JSON.stringify(cached)) {
    applyTheme(theme);
    cacheTheme(username, theme);
  }
}
```

## Testing Strategy

### Visual Regression Testing

```javascript
// Use Percy, Chromatic, or similar
describe('Theme System', () => {
  test('Classic Blue theme renders correctly', async () => {
    await page.goto('/u/testuser?theme=classic-blue');
    await page.waitForSelector('.profile-card');
    
    // Capture screenshot
    await percySnapshot(page, 'Classic Blue Theme - Desktop');
    
    // Mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await percySnapshot(page, 'Classic Blue Theme - Mobile');
  });
  
  test('AI-generated theme applies correctly', async () => {
    const theme = await generateAITheme({
      keywords: 'tech, minimal',
      colors: ['#0066cc'],
      mood: 'professional'
    });
    
    await applyThemeToTestProfile(theme);
    await percySnapshot(page, 'AI Generated Theme');
  });
});
```

### Accessibility Testing

```javascript
test('Theme meets WCAG AA standards', async () => {
  const theme = loadTheme('classic-blue');
  
  const validation = validateColorContrast(theme);
  expect(validation.valid).toBe(true);
  
  // Run axe-core accessibility audit
  const results = await new AxePuppeteer(page).analyze();
  expect(results.violations).toHaveLength(0);
});
```

## Implementation Roadmap

### Phase 1: Pre-Built Themes (Week 1-2)
- [ ] Design 8-12 theme presets
- [ ] Build theme data structure
- [ ] Implement CSS variable system
- [ ] Build theme preview UI
- [ ] Theme application and persistence

### Phase 2: Manual Customization (Week 3)
- [ ] Build customization panel
- [ ] Color picker integration
- [ ] Real-time preview
- [ ] Save custom themes

### Phase 3: AI Generation (Week 4)
- [ ] AI prompt engineering
- [ ] API integration (OpenAI/Claude)
- [ ] Response validation
- [ ] Error handling and retry

### Phase 4: Polish & Optimization (Week 5)
- [ ] Theme caching
- [ ] Accessibility validation
- [ ] Visual regression tests
- [ ] Performance optimization
- [ ] Analytics tracking

---

**Next Steps**: Begin with Phase 1 (pre-built themes) as foundation for all other features.
