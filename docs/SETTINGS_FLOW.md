# Settings Synchronization Architecture

## Overview
This document details the settings synchronization system that ensures context-based ceremony selections automatically configure all fine-tuning parameters while respecting user overrides.

## Settings Priority Hierarchy

```
1. User Explicit Choice (highest priority)
   ↓
2. Context/Ceremony Default Settings
   ↓
3. AI Emotion Analysis Suggestions
   ↓
4. Hardcoded System Defaults (lowest priority)
```

## Data Flow

### 1. User Selects Ceremony (UI Layer)
**File:** `components/LyricSidebar.tsx`

```typescript
handleCeremonySelect(category, event) {
  // Apply all ceremony defaults
  onSettingChange('category', category);
  onSettingChange('ceremony', event.id);
  onSettingChange('theme', event.label);
  onSettingChange('mood', event.defaultMood);
  onSettingChange('style', event.defaultStyle);
  onSettingChange('complexity', event.defaultComplexity);
  onSettingChange('rhymeScheme', event.defaultRhyme);
  onSettingChange('singerConfig', event.defaultSinger);
  
  // Clear any custom overrides
  onSettingChange('customTheme', '');
  onSettingChange('customMood', '');
  onSettingChange('customStyle', '');
  onSettingChange('customRhymeScheme', '');
  onSettingChange('customSingerConfig', '');
}
```

**Example:** User selects "Sangeet" ceremony
- Sets mood: "Energetic"
- Sets style: "Bollywood Dance"
- Sets complexity: "Moderate"
- Sets rhyme: "AABB (Couplets)"
- Sets singer: "Duet"

### 2. Settings Stored in Parent State
**File:** `pages/LyricStudio.tsx`

```typescript
const [generationSettings, setGenerationSettings] = useState<GenerationSettings>({
  category: '',
  ceremony: '',
  theme: '',
  mood: '',
  style: '',
  // ... all settings
});

const handleSettingChange = (key: string, value: string) => {
  setGenerationSettings(prev => ({ ...prev, [key]: value }));
};
```

### 3. Settings Passed to Workflow
**File:** `pages/LyricStudio.tsx`

```typescript
const result = await runLyricGenerationWorkflow(
  input,
  languageSettings,
  generationSettings, // Complete settings object with ceremony defaults
  handleProgress,
  apiKey
);
```

### 4. Settings Resolution (Orchestrator)
**File:** `agents/orchestrator.ts`

```typescript
const resolveSettings = (userSettings, analysis) => {
  const hasCeremony = userSettings.ceremony && 
                      userSettings.ceremony !== 'None' && 
                      userSettings.ceremony !== '';
  
  const resolveWithContext = (val, custom, aiVal, defaultVal) => {
    // 1. Custom value takes precedence
    if (val === "Custom" && custom) return custom;
    
    // 2. Ceremony setting overrides AUTO
    if (hasCeremony && val && val !== AUTO_OPTION) return val;
    
    // 3. Fall back to AI or default
    if (!val || val === AUTO_OPTION) return aiVal || defaultVal;
    
    return val;
  };

  return {
    ...userSettings,
    mood: resolveWithContext(userSettings.mood, userSettings.customMood, 
                             analysis.suggestedMood, "Romantic"),
    style: resolveWithContext(userSettings.style, userSettings.customStyle, 
                              analysis.suggestedStyle, "Cinematic"),
    // ... all settings resolved
  };
};
```

**Resolution Examples:**

| Scenario | User Input | Ceremony | AI Suggests | Final Value | Reason |
|----------|------------|----------|-------------|-------------|--------|
| Case 1 | Auto | Sangeet: "Energetic" | "Joyful" | "Energetic" | Ceremony default overrides AUTO |
| Case 2 | "Romantic" | Sangeet: "Energetic" | "Joyful" | "Romantic" | User explicit choice wins |
| Case 3 | "Custom: Melancholic" | Sangeet: "Energetic" | "Joyful" | "Melancholic" | Custom value highest priority |
| Case 4 | Auto | No ceremony | "Joyful" | "Joyful" | AI suggestion used |
| Case 5 | Auto | No ceremony | None | "Romantic" | System default |

### 5. Settings Validation & Logging
**File:** `agents/orchestrator.ts`

```typescript
console.log('⚙️  Settings Resolution:', {
  hasCeremony: finalSettings.ceremony !== '',
  ceremony: finalSettings.ceremony,
  category: finalSettings.category,
  finalSettings: {
    mood: finalSettings.mood,
    style: finalSettings.style,
    theme: finalSettings.theme,
    rhymeScheme: finalSettings.rhymeScheme,
    singerConfig: finalSettings.singerConfig,
    complexity: finalSettings.complexity
  },
  aiSuggestions: {
    mood: emotionData.suggestedMood,
    style: emotionData.suggestedStyle,
    theme: emotionData.suggestedTheme
  }
});
```

### 6. Settings Used by Agents
**File:** `agents/lyricist.ts`

```typescript
export const runLyricistAgent = async (
  researchData,
  userRequest,
  languageProfile,
  emotionData,
  generationSettings, // Contains resolved ceremony settings
  apiKey,
  selectedModel
) => {
  console.log('🎵 Lyricist Agent - Received Settings:', {
    ceremony: generationSettings.ceremony,
    mood: generationSettings.mood,
    style: generationSettings.style,
    // ... all settings logged
  });

  // Build prompt with resolved settings
  const prompt = `
    STRICT CONFIGURATION:
    - Theme: ${generationSettings.theme}
    - Mood: ${generationSettings.mood}
    - Musical Style: ${generationSettings.style}
    - Complexity: ${generationSettings.complexity}
    - SINGER CONFIGURATION: ${generationSettings.singerConfig}
    - RHYME SCHEME: ${generationSettings.rhymeScheme}
  `;
  
  // Generate lyrics using these settings
};
```

## Testing Verification

### Test Case 1: Sangeet Ceremony Selection
1. Select "Sangeet" from Wedding Ceremonies
2. Verify console logs show:
   ```
   ⚙️ Settings Resolution:
     ceremony: 'sangeet'
     finalSettings:
       mood: 'Energetic'
       style: 'Bollywood Dance'
       rhymeScheme: 'AABB (Couplets)'
       singerConfig: 'Duet'
   
   🎵 Lyricist Agent - Received Settings:
     mood: 'Energetic'
     style: 'Bollywood Dance'
   ```
3. Generate lyrics and verify they match Sangeet style

### Test Case 2: User Override
1. Select "Sangeet" (sets mood: "Energetic")
2. Manually change mood to "Romantic"
3. Verify final settings use "Romantic" (user choice wins)
4. Generate lyrics and verify romantic mood

### Test Case 3: Custom Value
1. Select "Sangeet"
2. Change mood to "Custom" and enter "Melancholic"
3. Verify final settings use "Melancholic"
4. Generate lyrics with melancholic tone

### Test Case 4: AUTO with No Ceremony
1. Ensure no ceremony selected
2. Set mood to "Auto"
3. Enter request: "A sad breakup song"
4. Verify AI emotion analysis suggests appropriate mood
5. Verify final settings use AI suggestion

## Key Files Modified

1. **components/LyricSidebar.tsx**
   - Enhanced `handleCeremonySelect` to clear custom overrides
   - Ensures clean state when ceremony changes

2. **agents/orchestrator.ts**
   - Enhanced `resolveSettings` with context-aware priority logic
   - Added comprehensive logging for debugging
   - Respects: Custom > Ceremony > AI > Default

3. **agents/lyricist.ts**
   - Added input validation logging
   - Confirms settings are received correctly by agent

## Benefits

✅ **Intelligent Auto-Configuration**: Selecting a ceremony automatically sets appropriate mood, style, rhyme, etc.

✅ **User Control Preserved**: Users can always override auto-configured settings

✅ **Context-Aware**: Ceremony defaults take precedence over generic AUTO settings

✅ **Transparent**: Console logs show exactly how settings are resolved

✅ **Consistent**: All agents receive the same resolved settings

✅ **Maintainable**: Clear priority hierarchy documented and enforced

## Future Enhancements

- [ ] Add visual indicators in UI showing which settings are ceremony-derived vs user-selected
- [ ] Add "Reset to Ceremony Defaults" button
- [ ] Store ceremony selection history for quick access
- [ ] Add preset configurations for common ceremony types
- [ ] Implement A/B testing for different ceremony defaults
