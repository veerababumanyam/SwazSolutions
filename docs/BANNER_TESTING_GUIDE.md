# Data Recovery Banner - Quick Test Guide

## 🧪 Manual Testing Instructions

### 1. View the Banner
1. Open: http://localhost:5174/
2. Banner should appear at the top with red→orange gradient
3. Shield icon should pulse gently

### 2. Test Dismissal
1. Click the X button on the right
2. Banner should slide up smoothly
3. Refresh the page - banner should NOT appear (stored in localStorage)

### 3. Reset Banner (To Test Again)
Open browser console (F12) and run:
```javascript
localStorage.removeItem('data-recovery-banner-dismissed');
location.reload();
```

### 4. Test CTA Button
1. Click "Get Free Eval" button
2. Should navigate to landing page contact section
3. Page should scroll smoothly to contact form

### 5. Test Responsive Design

**Desktop (>768px)**:
- Message: "Emergency Data Recovery Available 24/7"
- CTA: "Get Free Eval"

**Mobile (<768px)**:
- Message: "24/7 Data Recovery Available"
- CTA: "Free Eval"

Resize browser window to test breakpoints.

### 6. Test Keyboard Navigation
1. Press `Tab` to focus on CTA button
2. Press `Tab` again to focus on close button
3. Press `Enter` or `Space` to activate focused button
4. Focus indicators should be visible (white outline)

### 7. Test Dark Mode
1. Click theme toggle (sun/moon icon in header)
2. Banner gradient should brighten in dark mode
3. Banner should remain visible and readable

### 8. Test Across Pages
Visit each page and verify banner appears:
- `/` - Landing Page ✓
- `/music` - Music Page ✓
- `/studio` - Lyric Studio ✓
- `/camera-updates` - Camera Updates ✓
- `/help` - Help Page ✓
- `/about` - About Page ✓

### 9. Test Z-Index
1. Open a toast notification (if available)
2. Toast should appear ABOVE the banner
3. Banner should be ABOVE the header
4. Mobile menu should NOT overlap banner

### 10. Test Performance
1. Open DevTools → Performance tab
2. Record page load
3. Banner animation should be smooth (60fps)
4. No layout shifts (CLS score should be good)

## 🎨 Visual Inspection Checklist

- [ ] Banner has red→orange gradient background
- [ ] Text is white and readable
- [ ] Shield icon pulses subtly
- [ ] CTA button has hover effect (slight scale + brighter background)
- [ ] Close button has hover effect (subtle white background)
- [ ] Banner height: 40px (mobile), 48px (desktop)
- [ ] No text overflow or clipping
- [ ] Proper spacing between elements
- [ ] Banner doesn't overlap header content

## 🔍 Console Check

Open DevTools Console (F12 → Console tab):
- [ ] No red errors
- [ ] No yellow warnings related to banner
- [ ] No React hydration errors

## 📱 Mobile Testing (Optional)

Test on actual devices:
1. iPhone/Android - Portrait mode
2. iPhone/Android - Landscape mode
3. iPad/Tablet - Portrait mode
4. iPad/Tablet - Landscape mode

## ✅ Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Page Load | Banner slides down smoothly |
| Click X | Banner slides up and stores dismissal |
| Refresh after dismiss | Banner stays hidden for 7 days |
| Click CTA | Navigates to contact section |
| Resize window | Responsive text changes appropriately |
| Toggle theme | Banner adjusts for dark mode |
| Navigate pages | Banner persists across all pages |
| Keyboard Tab | Focus moves to CTA → Close button |
| Press Enter | Activates focused button |

## 🐛 Common Issues & Fixes

### Banner doesn't appear
```javascript
// Run in console:
localStorage.removeItem('data-recovery-banner-dismissed');
location.reload();
```

### Banner overlaps header
- Check if padding is applied in App.tsx
- Verify z-index: 60 in index.css

### CTA doesn't scroll
- Ensure contact section has `id="contact"`
- Check if HashRouter is working correctly

### Animation stutters
- Enable hardware acceleration in browser
- Check CPU usage in DevTools

---

## 🎯 Success Criteria

Banner implementation is successful if:
- ✅ Appears on all pages on first visit
- ✅ Smoothly animates in and out
- ✅ Dismissal persists for 7 days
- ✅ CTA navigates to contact section
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Accessible via keyboard
- ✅ No console errors
- ✅ No impact on existing functionality
- ✅ Matches design specifications
- ✅ Works in light and dark mode

---

*Quick Test Time: ~5 minutes*  
*Comprehensive Test Time: ~15 minutes*
