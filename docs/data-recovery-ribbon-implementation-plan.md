# Data Recovery Ribbon Implementation Plan

**Project**: SwazSolutions Website - Production Deployment Enhancement  
**Feature**: Non-Intrusive Data Recovery Promotion Ribbon  
**Date**: November 22, 2025  
**Status**: Planning Phase  

---

## 📋 Executive Summary

This document outlines the implementation strategy for adding a subtle, professional data recovery promotion ribbon across all pages of the SwazSolutions website. The ribbon will highlight the core business (data recovery services) while maintaining the existing functionality of secondary features (Music, Lyric Studio, Camera Updates) that drive traffic and engagement.

### Business Objectives
- **Primary Goal**: Promote core data recovery business across all pages
- **Secondary Goal**: Maintain seamless UX for traffic-driving features
- **Design Goal**: Elegant, non-intrusive, premium appearance using index.css for consistent styling
- **Technical Goal**: Zero impact on existing functionality

---

## 🎨 Design Specifications

### Visual Design

#### Desktop Layout (≥768px)
```
┌─────────────────────────────────────────────────────────────────────┐
│  🛡️  Emergency Data Recovery Available 24/7 • [Get Free Eval]    [✕]      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Mobile Layout (<768px)
```
┌──────────────────────────────────────────────┐
│  🛡️  24/7 Data Recovery Available           │
│                            [Free Eval]  [✕]  │
└──────────────────────────────────────────────┘
```

### Color Scheme

**Styling Approach**: All styles will be defined in `index.css` using custom CSS classes for consistency and maintainability.

**Background**: Brand Gradient (Red 600 → Orange 600)
```css
/* Defined in index.css */
.data-recovery-banner {
  background: linear-gradient(135deg, rgb(220, 38, 38), rgb(234, 88, 12));
}
```

**Text**: White with 90% opacity for secondary elements
```css
/* Defined in index.css */
.data-recovery-banner {
  color: rgb(255, 255, 255);
}
```

**Hover States**: 
- Close button: Defined with `.banner-close-btn` class in index.css
- CTA button: Defined with `.banner-cta-btn` class in index.css

### Dimensions

| Element | Desktop | Mobile |
|---------|---------|--------|
| Banner Height | 48px | 40px |
| Horizontal Padding | 16px | 12px |
| Vertical Padding | 12px | 10px |
| Icon Size | 20px × 20px | 18px × 18px |
| Close Button Size | 16px × 16px | 16px × 16px |
| Touch Target (Mobile) | min 44px × 44px | min 44px × 44px |

### Typography

| Element | Desktop | Mobile | Weight |
|---------|---------|--------|--------|
| Main Message | 14px (text-sm) | 13px (text-xs) | 700 (bold) |
| CTA Button | 12px (text-xs) | 11px | 600 (semibold) |

---

## 🏗️ Technical Architecture

### Component Structure

```
components/
  └── DataRecoveryBanner.tsx (NEW)
```

### Z-Index Hierarchy

```
Layer 100: Toast Notifications (z-[100])
Layer 60:  Data Recovery Banner (z-[60]) ← NEW
Layer 50:  Header (z-50)
Layer 40:  Mobile Menu Overlay (z-40)
Layer 30:  Modals & Dialogs
Layer 20:  Dropdown Menus
Layer 10:  Sticky Elements
Layer 0:   Page Content
```

### State Management

**Local State** (useState):
- `isDismissed`: Boolean - Controls banner visibility

**localStorage Keys**:
- `data-recovery-banner-dismissed`: String (ISO timestamp)
- **Persistence**: 7 days (configurable)

**Logic**:
```typescript
// Check localStorage on mount
const dismissedTimestamp = localStorage.getItem('data-recovery-banner-dismissed');
const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

if (dismissedTimestamp && parseInt(dismissedTimestamp) > sevenDaysAgo) {
  setIsDismissed(true);
}
```

---

## 📂 Implementation Steps

### Phase 1: Component Creation

#### Step 1.1: Create DataRecoveryBanner.tsx

**Location**: `/components/DataRecoveryBanner.tsx`

**Dependencies**:
```typescript
import React, { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { Link } from 'react-router-dom';
```

**Component Structure**:
```typescript
export default function DataRecoveryBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissal
    const dismissedTimestamp = localStorage.getItem('data-recovery-banner-dismissed');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    if (dismissedTimestamp && parseInt(dismissedTimestamp) > sevenDaysAgo) {
      setIsDismissed(true);
    } else {
      // Show banner after brief delay for smooth entry
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem('data-recovery-banner-dismissed', Date.now().toString());
    }, 300); // Match animation duration
  };

  if (isDismissed) return null;

  return (
    <div
      className={`data-recovery-banner ${isVisible ? 'visible' : 'hidden'}`}
      role="banner"
      aria-label="Data recovery services promotion"
    >
      <div className="banner-container">
        
        {/* Left: Icon + Message */}
        <div className="banner-content">
          <Shield className="banner-icon" aria-hidden="true" />
          <p className="banner-message">
            <span className="banner-message-desktop">Emergency Data Recovery Available 24/7</span>
            <span className="banner-message-mobile">24/7 Data Recovery</span>
          </p>
        </div>

        {/* Right: CTA + Dismiss */}
        <div className="banner-actions">
          <Link
            to="/#contact"
            className="banner-cta-btn"
            aria-label="Get free data recovery evaluation"
          >
            <span className="banner-cta-full">Get Free Eval</span>
            <span className="banner-cta-short">Free Eval</span>
          </Link>
          
          <button
            onClick={handleDismiss}
            className="banner-close-btn"
            aria-label="Dismiss banner"
          >
            <X className="banner-close-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Key Features**:
- ✅ Smooth slide-down animation on mount (defined in index.css)
- ✅ Smooth slide-up animation on dismiss (defined in index.css)
- ✅ localStorage persistence (7 days)
- ✅ Responsive text (full message on desktop, shortened on mobile via CSS media queries)
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Pulsing shield icon for attention (animation in index.css)
- ✅ Hover effects on CTA and close button (defined in index.css)
- ✅ All styling centralized in index.css for easy maintenance

---

### Phase 2: App Integration

#### Step 2.1: Modify App.tsx

**File**: `/App.tsx`

**Changes**:
1. Import the banner component
2. Add banner above Header
3. Add top padding to prevent content overlap

**Before**:
```tsx
<div className="flex flex-col min-h-screen">
  <Header />
  <Routes>
    {/* Routes */}
  </Routes>
</div>
```

**After**:
```tsx
import DataRecoveryBanner from './components/DataRecoveryBanner';

<div className="flex flex-col min-h-screen">
  <DataRecoveryBanner />
  <div className="pt-0 md:pt-[48px]"> {/* Spacer for banner */}
    <Header />
  </div>
  <Routes>
    {/* Routes */}
  </Routes>
</div>
```

**Alternative Approach** (More dynamic):
```tsx
import DataRecoveryBanner from './components/DataRecoveryBanner';
import { useState, useEffect } from 'react';

function App() {
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem('data-recovery-banner-dismissed');
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    setBannerVisible(!(dismissed && parseInt(dismissed) > sevenDaysAgo));
  }, []);

  return (
    <div className="flex flex-col min-h-screen" 
         style={{ paddingTop: bannerVisible ? '48px' : '0' }}>
      <DataRecoveryBanner />
      <Header />
      <Routes>
        {/* Routes */}
      </Routes>
    </div>
  );
}
```

---

### Phase 3: Styling Enhancement

#### Step 3.1: Add Custom Styles to index.css

**File**: `/index.css`

**Add at the end of file** (before closing comments):

```css
/* ===================================
   DATA RECOVERY BANNER
   =================================== */

.data-recovery-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  background: linear-gradient(135deg, rgb(220, 38, 38), rgb(234, 88, 12));
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
}

.data-recovery-banner.visible {
  transform: translateY(0);
  opacity: 1;
}

.data-recovery-banner.hidden {
  transform: translateY(-100%);
  opacity: 0;
}

/* Banner Container */
.banner-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (min-width: 768px) {
  .banner-container {
    padding: 12px 16px;
  }
}

/* Banner Content - Left Side */
.banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

@media (min-width: 768px) {
  .banner-content {
    gap: 12px;
  }
}

/* Banner Icon */
.banner-icon {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
  animation: icon-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (min-width: 768px) {
  .banner-icon {
    width: 20px;
    height: 20px;
  }
}

@keyframes icon-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Banner Message */
.banner-message {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 768px) {
  .banner-message {
    font-size: 14px;
  }
}

.banner-message-desktop {
  display: none;
}

@media (min-width: 768px) {
  .banner-message-desktop {
    display: inline;
  }
}

.banner-message-mobile {
  display: inline;
}

@media (min-width: 768px) {
  .banner-message-mobile {
    display: none;
  }
}

/* Banner Actions - Right Side */
.banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* CTA Button */
.banner-cta-btn {
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s ease;
  outline: none;
  text-decoration: none;
  color: white;
  display: inline-block;
}

@media (min-width: 768px) {
  .banner-cta-btn {
    padding: 6px 16px;
    font-size: 14px;
  }
}

.banner-cta-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.banner-cta-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.banner-cta-full {
  display: none;
}

@media (min-width: 640px) {
  .banner-cta-full {
    display: inline;
  }
}

.banner-cta-short {
  display: inline;
}

@media (min-width: 640px) {
  .banner-cta-short {
    display: none;
  }
}

/* Close Button */
.banner-close-btn {
  padding: 8px;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.banner-close-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.banner-close-icon {
  width: 16px;
  height: 16px;
  color: white;
}

/* Ensure banner doesn't interfere with header */
.header-with-banner {
  margin-top: 48px;
}

@media (max-width: 767px) {
  .header-with-banner {
    margin-top: 40px;
  }
}

/* Dark mode adjustments */
[data-theme="dark"] .data-recovery-banner {
  background: linear-gradient(135deg, rgb(239, 68, 68), rgb(249, 115, 22));
}
```

**Note**: All styling is now centralized in index.css. The component only uses class names without inline Tailwind utilities for consistent styling across the application.

---

### Phase 4: Testing & Validation

#### Test Checklist

**Functional Testing**:
- [ ] Banner appears on page load (first visit)
- [ ] Banner slides down smoothly with animation
- [ ] Close button dismisses banner
- [ ] Banner slides up smoothly on dismiss
- [ ] localStorage correctly stores dismissal timestamp
- [ ] Banner stays hidden after dismissal
- [ ] Banner reappears after 7 days (can test by manually clearing localStorage)
- [ ] CTA button navigates to `/#contact` section
- [ ] Shield icon pulses continuously

**Responsive Testing**:
- [ ] Desktop (≥1024px): Full message visible
- [ ] Tablet (768px-1023px): Full message visible
- [ ] Mobile (≤767px): Shortened message visible
- [ ] Touch targets ≥44×44px on mobile
- [ ] No horizontal scroll on any screen size
- [ ] Text truncates properly on very small screens

**Accessibility Testing**:
- [ ] Keyboard navigation works (Tab to CTA, Tab to Close, Enter/Space to activate)
- [ ] Screen reader announces banner content
- [ ] ARIA labels present and descriptive
- [ ] Focus indicators visible
- [ ] Color contrast ratio ≥4.5:1 (white on red/orange gradient)
- [ ] Banner role="banner" for semantic HTML

**Cross-Page Testing**:
- [ ] Landing Page (`/`): Banner visible
- [ ] Music Page (`/music`): Banner visible
- [ ] Lyric Studio (`/studio`): Banner visible
- [ ] Camera Updates (`/camera-updates`): Banner visible
- [ ] About Page (`/about`): Banner visible
- [ ] All routes maintain banner state consistently

**Theme Testing**:
- [ ] Light mode: Gradient visible and readable
- [ ] Dark mode: Gradient visible and readable
- [ ] Theme toggle doesn't affect banner visibility

**Performance Testing**:
- [ ] No layout shift on page load
- [ ] Animation smooth (60fps)
- [ ] No console errors
- [ ] Bundle size impact minimal (<5KB)

**Z-Index Testing**:
- [ ] Banner appears above Header (z-50)
- [ ] Toast notifications appear above Banner (z-100)
- [ ] Mobile menu overlay (z-40) doesn't overlap banner

**Edge Cases**:
- [ ] Rapid dismiss/reload doesn't break state
- [ ] Works with ad blockers enabled
- [ ] Works with JavaScript disabled (graceful degradation)
- [ ] Works on slow connections (banner doesn't flash)

---

## 🎯 Configuration Options

### Dismissal Duration

**Current**: 7 days  
**Configurable via**:

```typescript
// In DataRecoveryBanner.tsx
const DISMISSAL_DURATION_DAYS = 7; // Change this value

const dismissalDuration = DISMISSAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
const expiryTime = Date.now() - dismissalDuration;
```

**Alternatives**:
- **1 day**: More frequent reminders
- **30 days**: Less intrusive
- **Session-based**: `sessionStorage` instead of `localStorage` (shows once per browser session)
- **Never**: Remove dismiss button entirely (not recommended)

### Message Variations

**Current Message**:
```
Desktop: "Emergency Data Recovery Available 24/7"
Mobile:  "24/7 Data Recovery"
```

**Alternative Messages**:

1. **Trust-focused**:
   - Desktop: "Trusted Data Recovery Since 2010 • 95% Success Rate • Free Diagnosis"
   - Mobile: "Trusted Data Recovery • 95% Success • Free Diagnosis"

2. **Urgency-focused**:
   - Desktop: "Lost Critical Data? Emergency Recovery Available Now • Free Consultation"
   - Mobile: "Lost Data? Emergency Recovery Available Now"

3. **Value-focused**:
   - Desktop: "Professional Data Recovery • Same-Day Service Available"
   - Mobile: "Pro Data Recovery • Same-Day Service"

4. **Rotating Messages** (Advanced):
   ```typescript
   const messages = [
     "Emergency Data Recovery Available 24/7",
     "95% Success Rate • Free Diagnosis",
     "Professional Data Recovery Services"
   ];
   const [messageIndex, setMessageIndex] = useState(0);
   
   useEffect(() => {
     const interval = setInterval(() => {
       setMessageIndex(prev => (prev + 1) % messages.length);
     }, 5000); // Rotate every 5 seconds
     return () => clearInterval(interval);
   }, []);
   ```

### CTA Button Options

**Current**: "Get Free Eval"

**Alternatives**:
- "Free Diagnosis" → `/#contact`
- "Get Quote" → `/#contact`
- "Contact Us" → `/#contact`
- "Learn More" → `/about` (then add data recovery section)
- "Call Now" → `tel:+1234567890` (if phone number available)

### Icon Options

**Current**: Shield (from lucide-react)

**Alternatives**:
```typescript
import { Shield, HardDrive, AlertCircle, Zap, CheckCircle } from 'lucide-react';

// Shield: Security/trust
// HardDrive: Direct association with storage
// AlertCircle: Urgency
// Zap: Speed/emergency service
// CheckCircle: Reliability
```

---

## 📊 Analytics Tracking (Recommended)

### Track User Interactions

Add analytics events to measure banner effectiveness:

```typescript
// In DataRecoveryBanner.tsx

const handleDismiss = () => {
  // Track dismissal
  if (window.gtag) {
    window.gtag('event', 'banner_dismissed', {
      banner_type: 'data_recovery',
      page_path: window.location.pathname
    });
  }
  
  setIsVisible(false);
  setTimeout(() => {
    setIsDismissed(true);
    localStorage.setItem('data-recovery-banner-dismissed', Date.now().toString());
  }, 300);
};

// Track CTA clicks
<Link
  to="/#contact"
  onClick={() => {
    if (window.gtag) {
      window.gtag('event', 'banner_cta_click', {
        banner_type: 'data_recovery',
        cta_text: 'Get Free Eval',
        page_path: window.location.pathname
      });
    }
  }}
>
```

### Metrics to Track

| Metric | Description | Implementation |
|--------|-------------|----------------|
| **Impressions** | How many users see the banner | Track on component mount |
| **Dismissals** | How many users dismiss the banner | Track on dismiss button click |
| **CTA Clicks** | How many users click "Get Free Eval" | Track on CTA button click |
| **Conversion Rate** | (CTA Clicks / Impressions) × 100 | Calculate from above metrics |
| **Time to Dismiss** | How quickly users dismiss | Track time between mount and dismiss |
| **Page-specific Performance** | Which pages have highest CTR | Include `page_path` in events |

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] All tests passed (functional, responsive, accessibility)
- [ ] No console errors in development
- [ ] No TypeScript errors
- [ ] Bundle size impact verified (<5KB)
- [ ] Analytics tracking tested (if implemented)

### Deployment
- [ ] Create feature branch: `git checkout -b feature/data-recovery-banner`
- [ ] Commit changes with descriptive message
- [ ] Push to remote repository
- [ ] Create pull request with this document linked
- [ ] Deploy to staging environment
- [ ] QA testing on staging
- [ ] Deploy to production

### Post-Deployment
- [ ] Verify banner appears on production (all pages)
- [ ] Test dismiss functionality on production
- [ ] Check analytics data (if implemented)
- [ ] Monitor for console errors (first 24 hours)
- [ ] Collect user feedback (informal)
- [ ] Monitor conversion metrics (first week)

---

## 🔧 Troubleshooting Guide

### Issue: Banner doesn't appear

**Possible Causes**:
1. localStorage has dismissal timestamp
2. Component not imported in App.tsx
3. Z-index conflict with other elements
4. CSS transition preventing visibility

**Solutions**:
```javascript
// Clear localStorage to test
localStorage.removeItem('data-recovery-banner-dismissed');

// Check component import
import DataRecoveryBanner from './components/DataRecoveryBanner';

// Verify z-index in DevTools
// Banner should be z-[60], Header z-50
```

---

### Issue: Banner overlaps header

**Cause**: Missing top padding on app container

**Solution**:
```tsx
// Add padding to app container
<div className="flex flex-col min-h-screen pt-[48px] md:pt-[48px]">
```

---

### Issue: CTA doesn't navigate to contact section

**Cause**: Hash routing not scrolling to element

**Solution**:
```tsx
// In App.tsx or Header.tsx, add scroll handler
useEffect(() => {
  if (window.location.hash === '#contact') {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}, [window.location.hash]);
```

---

### Issue: Banner flashes on every page load

**Cause**: Delayed visibility check

**Solution**:
```typescript
// Check localStorage before first render
const [isDismissed, setIsDismissed] = useState(() => {
  const dismissed = localStorage.getItem('data-recovery-banner-dismissed');
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  return dismissed && parseInt(dismissed) > sevenDaysAgo;
});
```

---

### Issue: Animation stutters

**Cause**: Hardware acceleration not enabled

**Solution**:
```css
/* Add to .data-recovery-banner */
.data-recovery-banner {
  will-change: transform;
  transform: translateZ(0); /* Force GPU acceleration */
}
```

---

### Issue: Text overflows on small screens

**Cause**: Long text without truncation

**Solution**:
```tsx
// Add truncate class and min-width
<p className="text-xs md:text-sm font-bold truncate min-w-0">
```

---

## 📈 Success Metrics

### Week 1 Goals
- ✅ Zero critical bugs reported
- ✅ <1% user complaints about intrusiveness
- ✅ Banner visible on 100% of pages
- ✅ CTA click rate >2% (industry average for banners)

### Month 1 Goals
- ✅ 5-10% increase in contact form submissions
- ✅ 10-15% increase in data recovery service inquiries
- ✅ Positive user feedback on design integration
- ✅ No negative impact on bounce rate

### Quarter 1 Goals
- ✅ Measurable ROI from banner conversions
- ✅ A/B test different messages (if applicable)
- ✅ Optimize dismissal duration based on data
- ✅ Consider expanding to seasonal promotions

---

## 🔄 Future Enhancements (Optional)

### Phase 2 Features (Post-Launch)

1. **A/B Testing Framework**
   - Test different messages
   - Test different colors (gradient vs solid)
   - Test CTA button text
   - Implement winner based on conversion data

2. **Dynamic Messaging**
   - Show different messages based on page context
   - Example: "Lost wedding photos? Expert recovery available" on Music page
   - Example: "Studio files corrupted? 24/7 emergency recovery" on Lyric Studio

3. **Urgency Indicators**
   - Add countdown timer for limited-time offers
   - Show live availability status ("3 lab technicians available now")

4. **Multi-Banner System**
   - Support multiple banners for different campaigns
   - Rotate banners based on priority
   - Example: Data recovery (high priority) + seasonal promotion (low priority)

5. **Geo-Targeting**
   - Show location-specific messages
   - Example: "Local data recovery in [City] • Same-day pickup available"

6. **Smart Dismissal**
   - Only show banner to new visitors (first 3 visits)
   - Show different messages to returning visitors
   - Increase visibility for high-intent pages (e.g., Contact, About)

---

## 📝 Code Review Checklist

Before submitting PR, ensure:

**Code Quality**:
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Consistent code style (matches project conventions)
- [ ] No hardcoded values (use constants)
- [ ] Proper error handling (localStorage access)

**Component Design**:
- [ ] Component is reusable
- [ ] Props interface defined (if accepting props)
- [ ] Default exports used consistently
- [ ] No unnecessary re-renders (proper use of useEffect dependencies)

**Performance**:
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Animations use CSS transforms (GPU-accelerated)
- [ ] localStorage accessed efficiently (once on mount)

**Accessibility**:
- [ ] ARIA labels present
- [ ] Keyboard navigation works
- [ ] Color contrast sufficient
- [ ] Semantic HTML (role="banner")

**Documentation**:
- [ ] Component has JSDoc comments
- [ ] Complex logic explained with inline comments
- [ ] README updated (if necessary)

---

## 📞 Support & Maintenance

### Point of Contact
- **Developer**: [Your Name]
- **Designer**: [Designer Name if applicable]
- **Product Owner**: [PO Name]

### Documentation Updates
This document should be updated when:
- Banner design changes
- New features added
- Configuration options changed
- Bugs discovered and fixed

### Version History
| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-22 | Initial implementation plan | GitHub Copilot |

---

## 🎓 References

### Design Inspiration
- **Stripe**: Clean, minimal top banners for announcements
- **GitHub**: Dismissible banners with clear CTAs
- **Vercel**: Gradient backgrounds with white text

### Technical Resources
- [React Router v6 Documentation](https://reactrouter.com/)
- [Tailwind CSS Utilities](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/)
- [Web Accessibility Guidelines (WCAG 2.1)](https://www.w3.org/WAI/WCAG21/quickref/)

### Related Files
- `/components/Header.tsx` - Main navigation
- `/App.tsx` - Application root
- `/index.css` - Global styles
- `/tailwind.config.cjs` - Tailwind configuration
- `/contexts/ToastContext.tsx` - Toast notification system (for reference)

---

## ✅ Implementation Summary

**Estimated Time**: 2-3 hours

**Breakdown**:
- Component creation: 1 hour
- App integration: 30 minutes
- Testing (all devices/browsers): 1 hour
- Bug fixes & polish: 30 minutes

**Dependencies**: None (uses existing libraries)

**Risk Level**: Low (isolated component, easy to rollback)

**User Impact**: Minimal (non-intrusive design, dismissible)

---

**Status**: ✅ Ready for Implementation

*This plan provides a complete roadmap for implementing the data recovery ribbon banner. Follow each phase sequentially, complete the testing checklist, and track success metrics post-deployment.*

---

*Last Updated: November 22, 2025*
*Document Version: 1.0*
