/**
 * 14-AGENT LYRIC GENERATION SYSTEM
 * =================================
 *
 * This module exports all 14 specialized agents for lyric generation.
 *
 * AGENT LIST:
 * 1. Prompt Engineer Agent - Enhances and analyzes user requests
 * 2. Emotion Agent - Navarasa emotional analysis
 * 3. Research Agent - Cultural context gathering
 * 4. Melody Agent - Musical structure recommendations
 * 5. Rhyme Master Agent - Rhyme generation and validation
 * 6. Cultural Translator Agent - Cross-cultural adaptation
 * 7. Cultural Metaphor Engine - Region-specific metaphors and cultural context injection
 * 8. Magic Rhyme Optimizer Agent - Advanced phonetic optimization and musicality enhancement
 * 9. Hook Generator Agent - Catchy hooks and chorus creation
 * 10. Structure Architect Agent - Song structure optimization
 * 11. Lyricist Agent - Core lyric composition
 * 12. Review Agent - Quality control and rhyme validation
 * 13. Quality Assurance Agent - Final comprehensive check
 * 14. Formatter Agent - Suno.com tag formatting
 * (Chat Agent - Available separately for conversation)
 *
 * ORCHESTRATOR:
 * - runLyricGenerationWorkflow: Full 14-agent pipeline
 * - runSimplifiedWorkflow: Original 7-agent flow (faster)
 */

// ============ ORIGINAL AGENTS ============
export { runPromptEngineerAgent, runChatAgent } from './chat';
export { runEmotionAgent } from './emotion';
export { runResearchAgent } from './research';
export { runLyricistAgent } from './lyricist';
export { runReviewAgent } from './review';
export { runFormatterAgent } from './formatter';

// ============ NEW SPECIALIZED AGENTS ============
export { runMelodyAgent } from './melody';
export { runRhymeMasterAgent } from './rhymeMaster';
export { runMagicRhymeOptimizerAgent } from './magicRhymeOptimizer';
export { runCulturalTranslatorAgent } from './culturalTranslator';
export { runCulturalMetaphorEngine } from './culturalMetaphorEngine';
export { runHookGeneratorAgent } from './hookGenerator';
export { runStructureArchitectAgent } from './structureArchitect';
export { runQualityAssuranceAgent } from './qualityAssurance';

// ============ ORCHESTRATOR ============
export {
    runLyricGenerationWorkflow,
    runSimplifiedWorkflow,
    type GenerationStep,
    type WorkflowResult
} from './orchestrator';

// ============ TYPES ============
export type {
    LanguageProfile,
    GenerationSettings,
    EmotionAnalysis,
    Message,
    GeneratedLyrics,
    LyricSection,
    MelodyAnalysis,
    RhymeSuggestions,
    MagicRhymeOptimization,
    CulturalAdaptation,
    CulturalMetaphorAnalysis,
    CulturalMetaphor,
    CulturalSymbol,
    IdiomaticExpression,
    MythologyReference,
    FestivalReference,
    DialectVariation,
    HookSuggestion,
    StructureRecommendation,
    QualityReport,
    PromptEnhancementResult,
    AgentStatus,
    SavedSong,
    SavedProfile
} from './types';

// ============ CONSTANTS ============
export {
    INDIAN_LANGUAGES,
    ALL_LANGUAGES,
    LANGUAGE_METADATA,
    MOOD_OPTIONS,
    STYLE_OPTIONS,
    COMPLEXITY_OPTIONS,
    RHYME_SCHEME_OPTIONS,
    SINGER_CONFIG_OPTIONS,
    THEME_OPTIONS,
    SCENARIO_KNOWLEDGE_BASE,
    AUTO_OPTION
} from './constants';

// ============ CONFIG ============
export {
    MODEL_FAST,
    MODEL_QUALITY,
    MODEL_COMPLEX,
    API_KEY,
    RATE_LIMIT_DELAY,
    AGENT_TEMPERATURES,
    AGENT_TOP_P,
    RETRY_CONFIG,
    SAFETY_SETTINGS,
    DEFAULT_HQ_TAGS,
    DEFAULT_RHYME_SCHEME,
    getModelToUse,
    getHQTags,
    delay
} from './config';

/**
 * AGENT OVERVIEW
 * ==============
 *
 * Phase 1 - Input Analysis:
 * - Prompt Engineer: Transforms vague requests into detailed prompts
 *
 * Phase 2 - Parallel Analysis:
 * - Emotion Agent: Detects Navarasa (9 classical emotions)
 * - Research Agent: Gathers cultural context and vocabulary
 *
 * Phase 3 - Parallel Preparation:
 * - Melody Agent: Suggests tempo, key, meter, rhythm
 * - Rhyme Master: Generates rhyme maps and validates schemes
 * - Cultural Translator: Provides localized phrases and metaphors
 * - Cultural Metaphor Engine: Generates region-specific metaphors
 *
 * Phase 3.5 - Phonetic Optimization:
 * - Magic Rhyme Optimizer: Enhances rhymes with advanced phonetic patterns
 *
 * Phase 4 - Parallel Creative:
 * - Hook Generator: Creates catchy hooks and taglines
 * - Structure Architect: Designs song structure and flow
 *
 * Phase 5 - Sequential Composition:
 * - Lyricist: Composes lyrics with all agent inputs
 * - Review Agent: Validates rhymes and script purity
 * - Quality Assurance: Final comprehensive quality check
 * - Formatter: Adds Suno.com meta-tags
 *
 * (Chat Agent: Available separately for user interaction)
 */
