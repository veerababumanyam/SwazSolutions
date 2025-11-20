
import { ScenarioCategory } from './types';

export const MOOD_OPTIONS = ["Joyful", "Melancholic", "Romantic", "Energetic", "Devotional", "Patriotic", "Custom"];
export const STYLE_OPTIONS = ["Cinematic", "Folk", "Classical", "Pop", "Rap/Hip-Hop", "Ghazal", "Custom"];
export const COMPLEXITY_OPTIONS = ["Low", "Medium", "High"];
export const RHYME_SCHEME_OPTIONS = ["AABB", "ABAB", "Free Verse", "AAAB", "Custom"];
export const SINGER_CONFIG_OPTIONS = ["Solo Male", "Solo Female", "Duet", "Chorus", "Custom"];
export const THEME_OPTIONS = ["Love", "Heartbreak", "Nature", "Celebration", "Philosophy", "Custom"];
export const AUTO_OPTION = "Auto-Detect";

export const SCENARIO_KNOWLEDGE_BASE: ScenarioCategory[] = [
    {
        id: "wedding",
        label: "Wedding & Rituals",
        events: [
            { id: "sangeet", label: "Sangeet", defaultMood: "Energetic", defaultStyle: "Pop", defaultComplexity: "Medium", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Pre-wedding dance celebration" },
            { id: "vows", label: "Vows", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "High", defaultRhyme: "Free Verse", defaultSinger: "Solo Male", promptContext: "Exchange of wedding vows" }
        ]
    },
    {
        id: "cinema",
        label: "Cinema & Story",
        events: [
            { id: "intro", label: "Hero Intro", defaultMood: "Energetic", defaultStyle: "Rap/Hip-Hop", defaultComplexity: "Medium", defaultRhyme: "AABB", defaultSinger: "Solo Male", promptContext: "Protagonist introduction song" },
            { id: "montage", label: "Love Montage", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "Low", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Falling in love sequence" }
        ]
    }
];
