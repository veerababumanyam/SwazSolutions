
import { ScenarioCategory } from './types';

export const INDIAN_LANGUAGES = [
    "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", 
    "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", 
    "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", 
    "Sindhi", "Tamil", "Telugu", "Urdu"
];

// European languages removed as per requirement
export const ALL_LANGUAGES = INDIAN_LANGUAGES.sort();

export const MOOD_OPTIONS = [
    "Joyful", "Melancholic", "Romantic", "Energetic", "Devotional", "Patriotic", 
    "Nostalgic", "Aggressive", "Chill", "Ethereal", "Mysterious", "Hopeful", 
    "Heartbroken", "Groovy", "Spiritual", "Epic", "Whimsical", "Dark", 
    "Philosophical", "Festive", "Auto", "Custom"
];

export const STYLE_OPTIONS = [
    "Cinematic", "Folk", "Classical", "Pop", "Rap/Hip-Hop", "Ghazal", 
    "Sufi", "Qawwali", "EDM", "Trap", "R&B", "Lofi", "Synthwave", 
    "Rock", "Metal", "Punk", "Bollywood", "Tollywood Mass", "Bhangra", 
    "Reggaeton", "Jazz", "Blues", "Opera", "Auto", "Custom"
];

export const COMPLEXITY_OPTIONS = ["Simple", "Moderate", "Complex", "Auto"];

export const RHYME_SCHEME_OPTIONS = [
    "AABB", 
    "ABAB", 
    "ABCB", 
    "Free Verse", 
    "Auto",
    "Custom"
];

export const SINGER_CONFIG_OPTIONS = ["Male Solo", "Female Solo", "Duet", "Chorus", "Auto", "Custom"];

export const THEME_OPTIONS = [
    "Love", "Heartbreak", "Nature", "Celebration", "Philosophy", 
    "Revolution", "Friendship", "Betrayal", "Journey/Travel", 
    "Devotion", "Social Change", "Fantasy", "Custom"
];

export const AUTO_OPTION = "Auto";

export const SCENARIO_KNOWLEDGE_BASE: ScenarioCategory[] = [
    {
        id: "wedding",
        label: "Wedding Ceremonies",
        events: [
            { id: "pelli_choopulu", label: "Pelli Choopulu", defaultMood: "Joyful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Traditional matchmaking ceremony, teasing and playful" },
            { id: "sangeet", label: "Sangeet", defaultMood: "Energetic", defaultStyle: "Pop", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Pre-wedding dance celebration, high energy" },
            { id: "vows", label: "Vows / Mangal Sutra", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Sacred moment of tying the knot, emotional and heavy" },
            { id: "vidaai", label: "Vidaai", defaultMood: "Melancholic", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "ABCB", defaultSinger: "Female Solo", promptContext: "Bride leaving her home, tearful farewell" }
        ]
    },
    {
        id: "film",
        label: "Film Situations",
        events: [
            { id: "hero_entry", label: "Hero Entry", defaultMood: "Energetic", defaultStyle: "Rap/Hip-Hop", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Protagonist introduction, power, swagger, mass appeal" },
            { id: "villain_entry", label: "Villain Entry", defaultMood: "Dark", defaultStyle: "Metal", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Antagonist introduction, fear, dominance, heavy beats" },
            { id: "item_song", label: "Item Song", defaultMood: "Groovy", defaultStyle: "Tollywood Mass", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "High energy dance number, catchy hooks, party vibe" },
            { id: "love_montage", label: "Love Montage", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Falling in love sequence, visual storytelling, soft melody" }
        ]
    },
    {
        id: "devotional",
        label: "Devotional Contexts",
        events: [
            { id: "temple_prayer", label: "Temple Prayer", defaultMood: "Spiritual", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Morning prayer, Sanskrit slokas, peaceful and divine" },
            { id: "aarti", label: "Aarti", defaultMood: "Devotional", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Evening ritual, rhythmic bells, communal singing" },
            { id: "sufi", label: "Sufi / Qawwali", defaultMood: "Mysterious", defaultStyle: "Sufi", defaultComplexity: "Complex", defaultRhyme: "AABA", defaultSinger: "Group/Choir", promptContext: "Mystical connection with the divine, trance-like state" }
        ]
    },
    {
        id: "romance",
        label: "Romance Situations",
        events: [
            { id: "first_meeting", label: "First Meeting", defaultMood: "Whimsical", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "ABCB", defaultSinger: "Male Solo", promptContext: "Love at first sight, butterflies, hesitation" },
            { id: "soup_song", label: "Soup Song (Heartbreak)", defaultMood: "Heartbroken", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Love failure, self-pity mixed with humor, alcohol references" },
            { id: "long_distance", label: "Long Distance", defaultMood: "Nostalgic", defaultStyle: "Lofi", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Duet", promptContext: "Missing each other, video calls, waiting" }
        ]
    },
    {
        id: "folk",
        label: "Folk & Festival",
        events: [
            { id: "harvest", label: "Harvest Festival", defaultMood: "Festive", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Celebration of crops, nature, community dance" },
            { id: "village_fair", label: "Village Fair", defaultMood: "Joyful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Bustling fair, colors, playful teasing" }
        ]
    },
    {
        id: "modern",
        label: "Modern / Urban",
        events: [
            { id: "club_anthem", label: "Club Anthem", defaultMood: "Energetic", defaultStyle: "EDM", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Nightlife, dancing, bass drop, repetitive hooks" },
            { id: "road_trip", label: "Road Trip", defaultMood: "Chill", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Driving, wind in hair, freedom, adventure" }
        ]
    }
];
