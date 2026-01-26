# Gemini API Proxy Migration Guide

## ✅ Completed: Backend Proxy Infrastructure

The backend proxy is now in place to protect the Gemini API key:

- **Backend Route**: `/api/gemini-proxy/generate` (backend/routes/gemini-proxy.js)
- **Frontend Utility**: `src/utils/geminiProxy.ts`
- **Server Integration**: Mounted in `backend/server.js`

## 🔒 Security Benefits

- API key stored only on server-side (never exposed to browser)
- Server-side rate limiting and validation
- Request logging and monitoring
- Protection against API key theft via XSS

## 📋 Migration Status

### ✅ Infrastructure Complete
- [x] Backend proxy endpoint created
- [x] Frontend proxy client utility created
- [x] Server route mounted
- [x] Config file updated with deprecation notice

### ⏳ Agent Migration Required (14 files)

The following agent files still use direct API calls and need migration:

1. `src/agents/emotion.ts`
2. `src/agents/research.ts`
3. `src/agents/lyricist.ts`
4. `src/agents/review.ts`
5. `src/agents/formatter.ts`
6. `src/agents/chat.ts`
7. `src/agents/melody.ts`
8. `src/agents/rhymeMaster.ts`
9. `src/agents/magicRhymeOptimizer.ts`
10. `src/agents/culturalTranslator.ts`
11. `src/agents/culturalMetaphorEngine.ts`
12. `src/agents/hookGenerator.ts`
13. `src/agents/structureArchitect.ts`
14. `src/agents/qualityAssurance.ts`

## 🔄 Migration Steps for Each Agent

### Before (Direct API call - INSECURE):
```typescript
import { GoogleGenAI } from "@google/genai";
import { API_KEY, MODEL_FAST } from "./config";

// INSECURE: API key exposed in browser
const ai = new GoogleGenAI({ apiKey: API_KEY });

const result = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: [...],
    generationConfig: {...},
    safetySettings: [...]
});
```

### After (Proxy call - SECURE):
```typescript
import { createGeminiProxyClient, MODEL_FAST } from "./config";

// SECURE: API key stays on server
const ai = createGeminiProxyClient();

const result = await ai.models.generateContent({
    model: MODEL_FAST,
    contents: [...],
    generationConfig: {...},
    safetySettings: [...]
});
```

## 🛠️ Migration Checklist for Each Agent

For each agent file:

1. **Update imports**:
   ```typescript
   // Remove this:
   import { GoogleGenAI } from "@google/genai";
   import { API_KEY, ... } from "./config";

   // Add this:
   import { createGeminiProxyClient, ... } from "./config";
   ```

2. **Replace AI client initialization**:
   ```typescript
   // Replace this:
   const ai = new GoogleGenAI({ apiKey: API_KEY });

   // With this:
   const ai = createGeminiProxyClient();
   ```

3. **Test the agent**:
   - Verify lyrics generation still works
   - Check error handling
   - Ensure rate limiting works correctly

4. **Update agent file status** in this document

## 🚀 Quick Migration Script

Run this command to see which files need updating:
```bash
# Find direct GoogleGenAI usage
grep -r "new GoogleGenAI" src/agents/

# Find API_KEY imports
grep -r "import.*API_KEY" src/agents/
```

## ⚠️ Important Notes

### Environment Variables
**Remove from frontend `.env`:**
```bash
# REMOVE THIS (security risk):
VITE_GEMINI_API_KEY=your_key_here
```

**Add to backend `.env`:**
```bash
# ADD THIS (secure):
GEMINI_API_KEY=your_key_here
```

### Error Handling
The proxy client handles common errors:
- `RATE_LIMIT_EXCEEDED`: API rate limit hit
- `SAFETY_FILTER_BLOCKED`: Content blocked by safety
- `API_KEY_MISSING`: Server misconfiguration
- `INVALID_MODEL`: Invalid model name

### Testing
After migration, test all agent functionality:
```bash
# Run the lyric generation workflow
npm run dev
# Test each ceremony type
# Verify all 14 agents work correctly
```

## 📊 Progress Tracker

| Agent | Status | Migrated By | Date |
|-------|--------|-------------|------|
| emotion | ⏳ Pending | - | - |
| research | ⏳ Pending | - | - |
| lyricist | ⏳ Pending | - | - |
| review | ⏳ Pending | - | - |
| formatter | ⏳ Pending | - | - |
| chat | ⏳ Pending | - | - |
| melody | ⏳ Pending | - | - |
| rhymeMaster | ⏳ Pending | - | - |
| magicRhymeOptimizer | ⏳ Pending | - | - |
| culturalTranslator | ⏳ Pending | - | - |
| culturalMetaphorEngine | ⏳ Pending | - | - |
| hookGenerator | ⏳ Pending | - | - |
| structureArchitect | ⏳ Pending | - | - |
| qualityAssurance | ⏳ Pending | - | - |

## 🎯 Estimated Effort

- **Per agent migration**: 15-20 minutes
- **Total estimated time**: 3-4 hours
- **Testing**: 1-2 hours
- **Total**: ~5-6 hours

## 🔐 Security Impact

**CRITICAL**: Until migration is complete, the API key remains exposed in the browser bundle.

**Priority**: HIGH - Complete agent migration in next sprint.
