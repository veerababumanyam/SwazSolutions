# Testing Ceremony Settings Synchronization

## Quick Test Guide

### Setup
1. Open browser console (F12 or Cmd+Option+I)
2. Navigate to Lyric Studio page
3. Have the sidebar open and visible

## Test Scenarios

### ✅ Test 1: Basic Ceremony Selection
**Goal:** Verify ceremony defaults are applied

**Steps:**
1. Open the "Wedding Ceremonies" category in Context section
2. Click on "Sangeet" button
3. Check console for log: `⚙️ Settings Resolution`
4. Verify Fine Tuning section shows:
   - Mood: "Energetic"
   - Style: "Bollywood Dance"
   - Singer: "Duet"
   - Rhyme: "AABB (Couplets)"

**Expected Console Output:**
```
⚙️ Settings Resolution: {
  hasCeremony: true,
  ceremony: 'sangeet',
  finalSettings: {
    mood: 'Energetic',
    style: 'Bollywood Dance',
    ...
  }
}
```

### ✅ Test 2: User Override Preservation
**Goal:** Verify manual user changes override ceremony defaults

**Steps:**
1. Select "Sangeet" (mood becomes "Energetic")
2. Manually change mood dropdown to "Romantic"
3. Enter a prompt: "Write a romantic sangeet song"
4. Click Generate
5. Check console for `🎵 Lyricist Agent - Received Settings`
6. Verify mood shows "Romantic" (not "Energetic")

**Expected Behavior:**
- User's manual selection takes precedence
- AI respects user choice over ceremony default

### ✅ Test 3: Custom Value Entry
**Goal:** Verify custom values work correctly

**Steps:**
1. Select "Mehendi" ceremony
2. Change mood to "Custom"
3. Enter custom mood: "Playful and Teasing"
4. Generate lyrics
5. Verify console shows custom mood value
6. Verify lyrics match the custom mood

**Expected Console Output:**
```
🎵 Lyricist Agent - Received Settings: {
  mood: 'Playful and Teasing',
  ...
}
```

### ✅ Test 4: Multiple Ceremony Changes
**Goal:** Verify switching ceremonies updates all settings

**Steps:**
1. Select "Sangeet" - note the settings
2. Select "Haldi" - verify settings change to:
   - Mood: "Playful"
   - Style: "Folk"
3. Select "Baraat" - verify settings change to:
   - Mood: "Energetic"
   - Style: "Dhol"

**Expected Behavior:**
- Each ceremony selection completely replaces previous settings
- No residual settings from previous ceremony

### ✅ Test 5: AUTO Mode (No Ceremony)
**Goal:** Verify AI suggestions work when no ceremony selected

**Steps:**
1. Refresh page or clear ceremony selection
2. Set all Fine Tuning to "Auto"
3. Enter: "A sad song about lost love"
4. Generate
5. Verify console shows AI analyzed emotion
6. Verify final settings use AI suggestions

**Expected Console Output:**
```
⚙️ Settings Resolution: {
  hasCeremony: false,
  aiSuggestions: {
    mood: 'Melancholic',
    style: 'Ballad',
    ...
  }
}
```

### ✅ Test 6: Film Situation Context
**Goal:** Verify film events work like ceremonies

**Steps:**
1. Open "Film Situations" category
2. Select "Mass Hero Entry"
3. Verify settings:
   - Mood: "Powerful"
   - Style: "Mass"
   - Complexity: "Moderate"
4. Generate and verify lyrics match mass hero style

### ✅ Test 7: Religious Festival Context
**Goal:** Verify devotional contexts configure correctly

**Steps:**
1. Open "Religious Festivals" category
2. Select "Diwali"
3. Verify settings:
   - Mood: "Joyful"
   - Style: "Bhajan"
4. Generate and verify devotional tone

## Console Log Checklist

You should see these logs in order when generating lyrics:

```
1. ⚙️ Settings Resolution:
   - Shows ceremony, category
   - Shows all finalSettings
   - Shows aiSuggestions

2. 🎵 Lyricist Agent - Received Settings:
   - Shows all received settings
   - Values should match Settings Resolution output

3. (During generation)
   - Emotion Analysis logs
   - Agent progress logs
```

## Common Issues & Solutions

### Issue: Settings not updating in UI
**Solution:** Check React DevTools, verify `onSettingChange` is called

### Issue: Console shows different values than UI
**Solution:** Check if state is properly synchronized, refresh page

### Issue: Ceremony selected but AUTO values used
**Solution:** Verify `resolveSettings` logic, check `hasCeremony` flag

### Issue: Custom values not persisting
**Solution:** Check localStorage, verify custom fields are saved

## Performance Validation

**Expected Behavior:**
- Settings update instantly when ceremony selected (< 100ms)
- No flickering or UI lag
- Console logs appear in correct sequence
- AI generation starts within 2 seconds of clicking Generate

## Quality Checks

After generating lyrics with ceremony context:

✅ **Cultural Accuracy:** Lyrics match selected ceremony/event
✅ **Mood Consistency:** Emotional tone matches selected mood
✅ **Style Adherence:** Musical style matches configured style
✅ **Rhyme Pattern:** Follows selected rhyme scheme
✅ **Singer Configuration:** Structure matches duet/solo/group
✅ **Complexity Level:** Vocabulary matches selected complexity

## Regression Testing

Run all 7 test scenarios after any changes to:
- `components/LyricSidebar.tsx`
- `agents/orchestrator.ts`
- `agents/lyricist.ts`
- `agents/types.ts`
- `agents/constants.ts`

## Automated Test Ideas (Future)

```typescript
// Example unit test
test('resolveSettings prioritizes ceremony over AI', () => {
  const userSettings = {
    ceremony: 'sangeet',
    mood: 'Energetic',
    // ...
  };
  const aiAnalysis = {
    suggestedMood: 'Romantic',
    // ...
  };
  
  const result = resolveSettings(userSettings, aiAnalysis);
  
  expect(result.mood).toBe('Energetic'); // Ceremony default wins
});
```

## Success Criteria

All tests pass when:
1. ✅ Ceremony selection updates all 8 settings instantly
2. ✅ User overrides always take precedence
3. ✅ Custom values work correctly
4. ✅ AI suggestions used only when appropriate
5. ✅ Console logs show correct data flow
6. ✅ Generated lyrics match configured settings
7. ✅ No TypeScript errors
8. ✅ No React warnings in console
