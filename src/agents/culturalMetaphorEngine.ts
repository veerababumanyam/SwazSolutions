import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_CULTURAL_METAPHOR, getModelToUse, AGENT_TEMPERATURES, AGENT_TOP_P, MODEL_FAST } from "./config";
import { CulturalMetaphorAnalysis, GenerationSettings, LanguageProfile, EmotionAnalysis } from "./types";
import { cleanAndParseJSON, retryWithBackoff, wrapGenAIError } from "../utils/helpers";
import { LANGUAGE_METADATA, SCENARIO_KNOWLEDGE_BASE } from "./constants";

/**
 * CULTURAL METAPHOR ENGINE - Specialized Agent for Region-Specific Cultural Context
 *
 * This agent focuses on injecting authentic regional metaphors and cultural context
 * into lyrics. It provides comprehensive cultural guidance including:
 *
 * - Region-specific metaphors and similes
 * - Cultural symbols and their significance
 * - Idiomatic expressions in native scripts
 * - Mythology and folklore references
 * - Festival and celebration imagery
 * - Dialect variations and colloquialisms
 *
 * The agent supports all 23 Indian languages plus English, with deep cultural
 * context mapping for each region.
 */

// Comprehensive cultural context mapping for each language/region
const REGIONAL_CULTURAL_CONTEXT: Record<string, {
    region: string;
    naturalImagery: string[];
    mythology: string[];
    festivals: string[];
    artForms: string[];
    characteristicMetaphors: string[];
    poeticTraditions: string[];
}> = {
    "Telugu": {
        region: "Andhra Pradesh & Telangana",
        naturalImagery: ["Godavari river", "Krishna river", "Paddy fields", "Mango groves", "Coconut palms", "Red soil", "Deccan plateau"],
        mythology: ["Annamayya poetry", "Potana Bhagavatam", "Tyagaraja Kritis", "Kshetrayya Padams"],
        festivals: ["Sankranti", "Ugadi", "Bathukamma", "Bonalu", "Dasara"],
        artForms: ["Kuchipudi", "Perini", "Burra Katha", "Harikatha", "Veena"],
        characteristicMetaphors: ["Moon face (చంద్రముఖి)", "Lotus eyes (పద్మాక్షి)", "Golden complexion (బంగారు వన్నె)"],
        poeticTraditions: ["Padyam", "Keertana", "Lavani", "Shatakam"]
    },
    "Tamil": {
        region: "Tamil Nadu",
        naturalImagery: ["Kaveri river", "Nilgiri hills", "Jasmine flowers", "Coconut groves", "Temple tanks", "Bay of Bengal", "Palmyra trees"],
        mythology: ["Sangam poetry", "Thirukkural", "Silappadikaram", "Thiruppavai", "Divya Prabandham"],
        festivals: ["Pongal", "Thai Poosam", "Karthigai Deepam", "Chittirai", "Aadi Perukku"],
        artForms: ["Bharatanatyam", "Carnatic music", "Nadaswaram", "Kolam", "Tanjore painting"],
        characteristicMetaphors: ["Tamil Thai (தமிழ் தாய்)", "Tamizh vazhga (தமிழ் வாழ்க)", "Kuyil (குயில் - cuckoo)"],
        poeticTraditions: ["Venba", "Akaval", "Kural", "Kalithurai"]
    },
    "Hindi": {
        region: "Hindi heartland (UP, MP, Bihar, Rajasthan)",
        naturalImagery: ["Ganga river", "Yamuna river", "Wheat fields", "Banyan trees", "Desert dunes", "Himalayan foothills"],
        mythology: ["Ramcharitmanas", "Sur Sagar", "Kabir Dohe", "Meera Bhajans", "Krishna Leela"],
        festivals: ["Diwali", "Holi", "Dussehra", "Chhath Puja", "Teej", "Karva Chauth"],
        artForms: ["Kathak", "Lavani", "Qawwali", "Ghazal", "Thumri"],
        characteristicMetaphors: ["Ganga ki dhara (गंगा की धारा)", "Chandni raat (चाँदनी रात)", "Prem ka ras (प्रेम का रस)"],
        poeticTraditions: ["Doha", "Chaupai", "Soratha", "Ghazal"]
    },
    "Bengali": {
        region: "West Bengal & Bangladesh",
        naturalImagery: ["Hooghly river", "Padma river", "Rice paddies", "Jute fields", "Sundarbans", "Shiuli flowers"],
        mythology: ["Rabindranath Tagore works", "Kazi Nazrul Islam", "Chandidas poetry", "Mangalkavya"],
        festivals: ["Durga Puja", "Kali Puja", "Poila Boishakh", "Saraswati Puja", "Rath Yatra"],
        artForms: ["Rabindra Sangeet", "Nazrul Geeti", "Baul music", "Alpona", "Patachitra"],
        characteristicMetaphors: ["Sharodiya (শারদীয়া - autumn)", "Amar Bangla (আমার বাংলা)", "Bristi (বৃষ্টি - rain)"],
        poeticTraditions: ["Payar", "Tripadi", "Chhanda", "Geet"]
    },
    "Kannada": {
        region: "Karnataka",
        naturalImagery: ["Tungabhadra river", "Western Ghats", "Coffee plantations", "Sandalwood forests", "Hampi ruins"],
        mythology: ["Vachana Sahitya", "Haridasa literature", "Purandaradasa Kritis", "Basavanna Vachanas"],
        festivals: ["Mysore Dasara", "Ugadi", "Ganesh Chaturthi", "Makara Sankranti", "Varamahalakshmi"],
        artForms: ["Yakshagana", "Carnatic music", "Dollu Kunitha", "Mysore painting", "Veena"],
        characteristicMetaphors: ["Kannada Thayi (ಕನ್ನಡ ತಾಯಿ)", "Malnad sugandhа (ಮಲೆನಾಡ ಸುಗಂಧ)"],
        poeticTraditions: ["Vachana", "Shatpadi", "Ragale", "Tripadi"]
    },
    "Malayalam": {
        region: "Kerala",
        naturalImagery: ["Backwaters", "Coconut palms", "Monsoon rains", "Western Ghats", "Arabian Sea", "Spice gardens"],
        mythology: ["Ramayana (Ezhuthachan)", "Krishnagatha", "Kunjan Nambiar Thullal"],
        festivals: ["Onam", "Vishu", "Thrissur Pooram", "Theyyam", "Thiruvathira"],
        artForms: ["Kathakali", "Mohiniyattam", "Theyyam", "Chenda", "Sopana Sangeetham"],
        characteristicMetaphors: ["Malayala bhasha (മലയാള ഭാഷ)", "Onapookalam (ഓണപ്പൂക്കളം)", "Mazha (മഴ - rain)"],
        poeticTraditions: ["Kilippattu", "Thullal", "Vanchipattu", "Oppana"]
    },
    "Punjabi": {
        region: "Punjab",
        naturalImagery: ["Five rivers", "Wheat fields", "Mustard flowers", "Shivalik hills", "Golden harvest"],
        mythology: ["Guru Granth Sahib", "Waris Shah Heer", "Bulleh Shah", "Sultan Bahu"],
        festivals: ["Baisakhi", "Lohri", "Gurpurab", "Diwali", "Teej"],
        artForms: ["Bhangra", "Giddha", "Dhol", "Tumbi", "Sufi Kalam"],
        characteristicMetaphors: ["Sher-e-Punjab (ਸ਼ੇਰ-ਏ-ਪੰਜਾਬ)", "Charkha (ਚਰਖਾ)", "Mitti di khushboo (ਮਿੱਟੀ ਦੀ ਖੁਸ਼ਬੂ)"],
        poeticTraditions: ["Bolian", "Mahiya", "Sufi Kalam", "Qissa"]
    },
    "Marathi": {
        region: "Maharashtra",
        naturalImagery: ["Sahyadri mountains", "Konkan coast", "Deccan plateau", "Godavari", "Krishna river"],
        mythology: ["Sant Tukaram Abhang", "Sant Dnyaneshwar", "Namdev Abhang", "Eknath Bharud"],
        festivals: ["Ganesh Chaturthi", "Gudi Padwa", "Ashadhi Ekadashi", "Diwali", "Makar Sankranti"],
        artForms: ["Lavani", "Powada", "Koli dance", "Dholki", "Natya Sangeet"],
        characteristicMetaphors: ["Maharashtra majha (महाराष्ट्र माझा)", "Sahyadri cha vaara (सह्याद्रीचा वारा)"],
        poeticTraditions: ["Abhang", "Ovi", "Powada", "Lavani"]
    },
    "Gujarati": {
        region: "Gujarat",
        naturalImagery: ["Sabarmati river", "Gir forest", "White Rann", "Gulf of Kutch", "Cotton fields"],
        mythology: ["Narsinh Mehta", "Premanand Bhatt", "Mirabai", "Dayaram"],
        festivals: ["Navratri", "Uttarayan", "Diwali", "Janmashtami", "Rath Yatra"],
        artForms: ["Garba", "Dandiya Raas", "Bhavai", "Sanedo", "Hudo"],
        characteristicMetaphors: ["Gujarat no garvo (ગુજરાત નો ગર્વ)", "Rann ni shobha (રણ ની શોભા)"],
        poeticTraditions: ["Prabhatiya", "Garbi", "Aarti", "Pada"]
    },
    "Urdu": {
        region: "North India (Lucknow, Delhi, Hyderabad)",
        naturalImagery: ["Gulistan (rose garden)", "Bahaar (spring)", "Chaandni (moonlight)", "Saawan (monsoon)"],
        mythology: ["Mir Taqi Mir", "Ghalib", "Faiz Ahmed Faiz", "Allama Iqbal", "Sahir Ludhianvi"],
        festivals: ["Eid", "Shab-e-Barat", "Muharram", "Jashn-e-Bahaar"],
        artForms: ["Ghazal", "Nazm", "Qawwali", "Marsiya", "Kathak"],
        characteristicMetaphors: ["Dil-e-nadan (دل نادان)", "Ishq-e-haqiqi (عشق حقیقی)", "Mehfil (محفل)"],
        poeticTraditions: ["Ghazal", "Nazm", "Rubai", "Qata"]
    },
    "Odia": {
        region: "Odisha",
        naturalImagery: ["Mahanadi river", "Chilika lake", "Bay of Bengal", "Palm trees", "Konark sun"],
        mythology: ["Jayadev Gita Govinda", "Sarala Das Mahabharata", "Jagannath culture"],
        festivals: ["Rath Yatra", "Raja Parba", "Nuakhai", "Kumar Purnima", "Durga Puja"],
        artForms: ["Odissi", "Pattachitra", "Chhau", "Gotipua", "Jatra"],
        characteristicMetaphors: ["Utkal gaurav (ଉତ୍କଳ ଗୌରବ)", "Mahanadi tira (ମହାନଦୀ ତୀର)"],
        poeticTraditions: ["Chautisha", "Chhanda", "Champu", "Koili"]
    },
    "Assamese": {
        region: "Assam",
        naturalImagery: ["Brahmaputra river", "Tea gardens", "Kaziranga", "Majuli island", "Bihu fields"],
        mythology: ["Shankardev Borgeet", "Madhavdev", "Jyoti Prasad Agarwala"],
        festivals: ["Bihu (Bohag, Magh, Kati)", "Durga Puja", "Me-Dam-Me-Phi", "Ali-Aye-Ligang"],
        artForms: ["Bihu dance", "Sattriya", "Borgeet", "Ojapali", "Dhol"],
        characteristicMetaphors: ["Bor Axom (বৰ অসম)", "Kopou phool (কপৌ ফুল)"],
        poeticTraditions: ["Borgeet", "Bihu Geet", "Zikir", "Deh Bisar"]
    },
    "English": {
        region: "Pan-Indian/International",
        naturalImagery: ["Mountains", "Rivers", "Oceans", "Forests", "Sky", "Stars"],
        mythology: ["Universal themes", "Global pop culture", "Modern references"],
        festivals: ["Universal celebrations", "New Year", "Valentine's Day"],
        artForms: ["Pop", "Rock", "Hip-hop", "R&B", "Jazz"],
        characteristicMetaphors: ["Heart on fire", "Ocean of love", "Stars in your eyes"],
        poeticTraditions: ["Free verse", "Sonnet", "Ballad", "Rap"]
    }
};

// Get fallback context for unsupported languages
const getDefaultContext = () => ({
    region: "General Indian",
    naturalImagery: ["Rivers", "Mountains", "Fields", "Flowers", "Moon", "Stars"],
    mythology: ["Universal Indian themes", "Epic references", "Folk tales"],
    festivals: ["Diwali", "Holi", "Regional festivals"],
    artForms: ["Classical dance", "Folk music", "Traditional instruments"],
    characteristicMetaphors: ["Nature imagery", "Love metaphors", "Devotional themes"],
    poeticTraditions: ["Traditional verse", "Folk songs", "Bhajans"]
});

export const runCulturalMetaphorEngine = async (
    userRequest: string,
    emotionData: EmotionAnalysis,
    generationSettings: GenerationSettings,
    languageProfile: LanguageProfile,
    apiKey: string,
    selectedModel?: string
): Promise<CulturalMetaphorAnalysis> => {
    if (!apiKey) throw new Error("API_KEY_MISSING");

    const ai = new GoogleGenAI({ apiKey });

    // Define structured output schema
    const metaphorSchema = {
        type: Type.OBJECT,
        properties: {
            primaryMetaphors: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        metaphor: { type: Type.STRING, description: "The metaphor in native script" },
                        meaning: { type: Type.STRING, description: "English translation/explanation" },
                        context: { type: Type.STRING, description: "Cultural context or origin" },
                        useCases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Best use cases" },
                        region: { type: Type.STRING, description: "Region where commonly used" }
                    },
                    required: ["metaphor", "meaning", "context", "useCases", "region"]
                },
                description: "Primary cultural metaphors for the theme"
            },
            culturalSymbols: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        symbol: { type: Type.STRING, description: "Symbol name in native script" },
                        symbolism: { type: Type.STRING, description: "What it represents" },
                        significance: { type: Type.STRING, description: "Cultural significance" },
                        usageGuidance: { type: Type.STRING, description: "How to use in lyrics" }
                    },
                    required: ["symbol", "symbolism", "significance", "usageGuidance"]
                },
                description: "Cultural symbols relevant to the region"
            },
            idiomaticExpressions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        expression: { type: Type.STRING, description: "The idiom in native script" },
                        literalMeaning: { type: Type.STRING, description: "Literal translation" },
                        actualMeaning: { type: Type.STRING, description: "Actual meaning/usage" },
                        tone: { type: Type.STRING, description: "Emotional tone" }
                    },
                    required: ["expression", "literalMeaning", "actualMeaning", "tone"]
                },
                description: "Region-specific idiomatic expressions"
            },
            mythologyReferences: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        reference: { type: Type.STRING, description: "Name/title of the reference" },
                        story: { type: Type.STRING, description: "Story or context" },
                        themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Emotional themes" },
                        incorporation: { type: Type.STRING, description: "How to incorporate in lyrics" }
                    },
                    required: ["reference", "story", "themes", "incorporation"]
                },
                description: "Mythology and folklore references"
            },
            natureMetaphors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Nature and environment metaphors from the target region"
            },
            festivalReferences: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        festival: { type: Type.STRING, description: "Festival name" },
                        imagery: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Associated imagery" },
                        traditions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Traditional elements" },
                        lyricSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Usage suggestions" }
                    },
                    required: ["festival", "imagery", "traditions", "lyricSuggestions"]
                },
                description: "Festival and celebration references"
            },
            dialectVariations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        standard: { type: Type.STRING, description: "Standard form" },
                        regional: { type: Type.STRING, description: "Regional variation" },
                        area: { type: Type.STRING, description: "Area where used" },
                        connotation: { type: Type.STRING, description: "Connotation" }
                    },
                    required: ["standard", "regional", "area", "connotation"]
                },
                description: "Regional dialect variations"
            },
            culturalContextSummary: {
                type: Type.STRING,
                description: "Comprehensive cultural context summary for the lyricist"
            },
            usageRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Recommendations for culturally appropriate expression"
            },
            authenticityScore: {
                type: Type.NUMBER,
                description: "Cultural authenticity score (0-100)"
            }
        },
        required: [
            "primaryMetaphors",
            "culturalSymbols",
            "idiomaticExpressions",
            "mythologyReferences",
            "natureMetaphors",
            "festivalReferences",
            "dialectVariations",
            "culturalContextSummary",
            "usageRecommendations",
            "authenticityScore"
        ]
    };

    // Get language metadata
    const langMetadata = LANGUAGE_METADATA[languageProfile.primary];
    const poeticTraditions = langMetadata?.poeticTraditions?.join(", ") || "General";
    const nativeScript = langMetadata?.script || "Latin";

    // Get regional cultural context
    const culturalContext = REGIONAL_CULTURAL_CONTEXT[languageProfile.primary] || getDefaultContext();

    // Get ceremony context if available
    let ceremonyContext = "";
    if (generationSettings.ceremony && generationSettings.ceremony !== "None") {
        for (const category of SCENARIO_KNOWLEDGE_BASE) {
            const ceremony = category.events.find(e => e.id === generationSettings.ceremony);
            if (ceremony) {
                ceremonyContext = `
CEREMONY CONTEXT:
- Event: ${ceremony.label}
- Cultural Significance: ${ceremony.promptContext}
- Category: ${category.label}
- Default Mood: ${ceremony.defaultMood}
- Traditional Style: ${ceremony.defaultStyle}
`;
                break;
            }
        }
    }

    const prompt = `
USER REQUEST: "${userRequest}"

EMOTIONAL ANALYSIS:
- Primary Emotion (Navarasa): ${emotionData.navarasa}
- Sentiment: ${emotionData.sentiment}
- Intensity: ${emotionData.intensity}/10
- Vibe: ${emotionData.vibeDescription}
- Keywords: ${emotionData.suggestedKeywords?.join(", ") || "N/A"}

GENERATION SETTINGS:
- Theme: ${generationSettings.theme || "Love"}
- Mood: ${generationSettings.mood || "Romantic"}
- Style: ${generationSettings.style || "Cinematic"}
- Complexity: ${generationSettings.complexity || "Moderate"}

${ceremonyContext}

TARGET LANGUAGE: ${languageProfile.primary}
NATIVE SCRIPT: ${nativeScript}
POETIC TRADITIONS: ${poeticTraditions}

REGIONAL CONTEXT (${culturalContext.region}):
- Natural Imagery: ${culturalContext.naturalImagery.join(", ")}
- Mythology Sources: ${culturalContext.mythology.join(", ")}
- Major Festivals: ${culturalContext.festivals.join(", ")}
- Art Forms: ${culturalContext.artForms.join(", ")}
- Characteristic Metaphors: ${culturalContext.characteristicMetaphors.join(", ")}
- Poetic Traditions: ${culturalContext.poeticTraditions.join(", ")}

TASK: Generate comprehensive cultural metaphor guidance for creating authentic ${languageProfile.primary} lyrics.

REQUIREMENTS:

1. **PRIMARY METAPHORS** (5-8 metaphors):
   - Each metaphor MUST be in ${nativeScript} script
   - Focus on ${generationSettings.theme} and ${generationSettings.mood}
   - Include metaphors from nature, mythology, and daily life
   - Provide clear meaning and usage context
   - Specify the region/state where each is commonly used

2. **CULTURAL SYMBOLS** (4-6 symbols):
   - Symbols relevant to ${culturalContext.region}
   - Include traditional art, nature, and ceremonial symbols
   - Explain their deep cultural significance
   - Provide guidance on how to weave them into lyrics

3. **IDIOMATIC EXPRESSIONS** (5-8 idioms):
   - All in ${nativeScript} script
   - Match the ${emotionData.navarasa} emotional tone
   - Include proverbs and sayings
   - Specify the emotional register of each

4. **MYTHOLOGY REFERENCES** (3-5 references):
   - Appropriate for ${generationSettings.theme}
   - From ${culturalContext.mythology.slice(0, 3).join(", ")}
   - Include stories that resonate with the mood
   - Explain how to incorporate subtly

5. **NATURE METAPHORS** (6-10):
   - Specific to ${culturalContext.region}
   - Include: rivers, flowers, seasons, landscapes
   - Match the emotional intensity (${emotionData.intensity}/10)

6. **FESTIVAL REFERENCES** (2-3):
   - Relevant to the theme from: ${culturalContext.festivals.join(", ")}
   - Include imagery, traditions, and lyric suggestions

7. **DIALECT VARIATIONS** (3-5):
   - Show standard vs. regional variations
   - Include poetic or colloquial forms
   - Note the connotation of each

8. **CULTURAL CONTEXT SUMMARY**:
   - Comprehensive guidance for the lyricist
   - Key do's and don'ts for ${languageProfile.primary}
   - How to achieve authentic cultural resonance

9. **USAGE RECOMMENDATIONS** (5-8):
   - Practical tips for using these metaphors
   - What to emphasize for ${generationSettings.mood}
   - What to avoid for cultural sensitivity

10. **AUTHENTICITY SCORE**:
    - Rate the overall cultural richness potential (0-100)
    - Consider theme-culture fit, available metaphors, emotional match

CRITICAL INSTRUCTIONS:
- ALL metaphors, idioms, and expressions MUST be in ${nativeScript} script
- Prioritize expressions that sound natural when sung
- Avoid clichés; prefer authentic regional expressions
- Consider the ${generationSettings.complexity} complexity level
- Match the ${emotionData.intensity}/10 intensity level

OUTPUT: Structured JSON with comprehensive cultural metaphor guidance.
`;

    try {
        const response = await retryWithBackoff(
            async () => {
                const result = await ai.models.generateContent({
                    model: getModelToUse(selectedModel, MODEL_FAST),
                    contents: prompt,
                    config: {
                        systemInstruction: SYSTEM_INSTRUCTION_CULTURAL_METAPHOR,
                        responseMimeType: "application/json",
                        responseSchema: metaphorSchema,
                        temperature: AGENT_TEMPERATURES.CULTURAL_METAPHOR,
                        topP: AGENT_TOP_P.CULTURAL_METAPHOR,
                        topK: 40
                    }
                });

                if (!result.text) {
                    throw new Error("No response text from cultural metaphor engine");
                }
                return result;
            },
            2,
            1000
        );

        return cleanAndParseJSON<CulturalMetaphorAnalysis>(response.text);

    } catch (error) {
        console.error("Cultural Metaphor Engine Error:", error);
        if (error instanceof Error && error.message === "API_KEY_MISSING") {
            throw error;
        }
        throw wrapGenAIError(error);
    }
};
