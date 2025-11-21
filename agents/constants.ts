
import { ScenarioCategory } from './types';

export const INDIAN_LANGUAGES = [
    "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", 
    "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", 
    "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", 
    "Sindhi", "Tamil", "Telugu", "Urdu"
];

// Create a sorted copy to avoid mutation issues
export const ALL_LANGUAGES = [...INDIAN_LANGUAGES].sort();

export const MOOD_OPTIONS = [
    "Joyful", "Melancholic", "Romantic", "Energetic", "Devotional", "Patriotic", 
    "Nostalgic", "Aggressive", "Chill", "Ethereal", "Mysterious", "Hopeful", 
    "Heartbroken", "Groovy", "Spiritual", "Epic", "Whimsical", "Dark", 
    "Philosophical", "Festive", "Traditional", "Peaceful", "Playful", "Powerful", 
    "Melodious", "Sentimental", "Gratitude", "Emotional", "Auto", "Custom"
];

export const STYLE_OPTIONS = [
    "Cinematic", "Folk", "Classical", "Pop", "Rap/Hip-Hop", "Ghazal", 
    "Sufi", "Qawwali", "EDM", "Trap", "R&B", "Lofi", "Synthwave", 
    "Rock", "Metal", "Punk", "Bollywood", "Tollywood Mass", "Bhangra", 
    "Reggaeton", "Jazz", "Blues", "Opera", "Vedic Chant", "Bhajan", 
    "Garba", "Carol", "Gospel", "Chant", "Damru/Tandav", "Flute/Classical", 
    "Folk (Kavadi)", "Punjabi Folk", "Melody", "Auto", "Custom"
];

export const COMPLEXITY_OPTIONS = ["Simple", "Moderate", "Complex", "Auto"];

export const RHYME_SCHEME_OPTIONS = [
    // Basic Patterns
    "AABB (Couplets)", 
    "ABAB (Alternate)", 
    "ABCB (Ballad)", 
    "ABBA (Enclosed)",
    "AAAA (Monorhyme)",
    
    // Complex Western Patterns
    "AABA (Rubaiyat)",
    "AABCCB (Sestet)",
    "ABABCC (Shakespearean Tail)",
    "ABABBCC (Rhyme Royal)",
    "ABABCDCD (Ottava Rima Style)",
    "Terza Rima (ABA BCB CDC)",
    "Limerick (AABBA)",
    "Villanelle (Complex Repeat)",
    "Sonnet (14 Lines ABAB CDCD EFEF GG)",
    
    // Indian Classical Patterns
    "Sanskrit Slokas (Anushtubh)",
    "Doha (Hindi Couplet)",
    "Chaupai (AABB Quatrain)",
    "Kavita (Muktaka - Free Standing)",
    "Ghazal (AA BA CA DA...)",
    "Bhajan (Devotional Repeat)",
    
    // Song Structure Patterns
    "Verse-Chorus (AABB + CCDD)",
    "Call-Response (ABAB)",
    "Pallavi-Charanam (Carnatic)",
    "Sthayi-Antara (Hindustani)",
    "Hip-Hop Flow (Internal Rhymes)",
    "Rap Multisyllabic",
    
    // Modern & Experimental
    "Free Verse (No Rhyme)",
    "Blank Verse (Unrhymed Iambic)",
    "Slant Rhyme (Near Rhymes)",
    "Internal Rhyme (Within Lines)",
    "Chain Rhyme (Linking Stanzas)",
    
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
        id: "birth_child",
        label: "Birth & Child Ceremonies",
        events: [
            { id: "namakarana", label: "Namakarana (Naming)", defaultMood: "Joyful", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Naming the newborn, blessings, whispering name, family joy" },
            { id: "annaprashana", label: "Annaprashana (First Food)", defaultMood: "Festive", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "First solid food feeding, maternal love, playful baby" },
            { id: "chudakarana", label: "Chudakarana (Mundan)", defaultMood: "Traditional", defaultStyle: "Folk", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "First haircut, shedding past life, purification, family gathering" },
            { id: "karnavedha", label: "Karnavedha (Ear Piercing)", defaultMood: "Joyful", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Ear piercing ceremony, decorative ornaments, child's milestone" },
            { id: "seemantham", label: "Seemantham (Baby Shower)", defaultMood: "Devotional", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Blessing pregnant mother, bangles ceremony, safe delivery prayers" },
            { id: "vidyarambham", label: "Vidyarambham (Learning)", defaultMood: "Spiritual", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Male Solo", promptContext: "Initiation of learning, writing on rice/sand, Saraswati puja" },
            { id: "upanayana", label: "Upanayana (Thread Ceremony)", defaultMood: "Spiritual", defaultStyle: "Vedic Chant", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Sacred thread ceremony, gayatri mantra, father-son bond, spiritual birth" }
        ]
    },
    {
        id: "wedding",
        label: "Wedding & Related Functions",
        events: [
            // Pre-Wedding Ceremonies
            { id: "roka", label: "Roka / Engagement", defaultMood: "Joyful", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Formal announcement, ring exchange, union of families" },
            { id: "sagai", label: "Sagai (Ring Ceremony)", defaultMood: "Romantic", defaultStyle: "Melody", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Formal engagement, ring exchange, promises, family blessings" },
            { id: "tilak", label: "Tilak / Sagan Ceremony", defaultMood: "Traditional", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Groom's family visiting bride's home, applying tilak, accepting proposal" },
            { id: "chunni", label: "Chunni Ceremony", defaultMood: "Sentimental", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Mother-in-law covering bride with dupatta, welcoming into family" },
            { id: "mangni", label: "Mangni (Betrothal)", defaultMood: "Joyful", defaultStyle: "Bollywood", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Official betrothal ceremony, gifts exchange, sweets, celebration" },
            
            // Main Pre-Wedding Functions
            { id: "mehendi", label: "Mehendi", defaultMood: "Festive", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Henna application, intricate designs, bride's beauty, teasing songs" },
            { id: "sangeet", label: "Sangeet", defaultMood: "Energetic", defaultStyle: "Bollywood", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Music and dance night, family performances, high energy celebration" },
            { id: "ladies_sangeet", label: "Ladies Sangeet", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Women-only celebration, teasing songs, traditional dances, masti" },
            { id: "haldi", label: "Haldi / Pellikuthuru", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Turmeric ceremony, cleansing, yellow theme, playful splashing" },
            { id: "ubtan", label: "Ubtan Ceremony", defaultMood: "Traditional", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Pre-wedding beauty ritual, herbal paste, glowing skin, blessings" },
            
            // Groom's Ceremonies
            { id: "panche_vani", label: "Panche / Vani Function", defaultMood: "Traditional", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Groom's attire ceremony, Saraswati puja, auspicious beginning" },
            { id: "sehrabandi", label: "Sehrabandi", defaultMood: "Emotional", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Tying sehra on groom, sister's affection, emotional farewell" },
            { id: "tel_baan", label: "Tel Baan", defaultMood: "Playful", defaultStyle: "Bhangra", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Oil application on groom, friends teasing, pre-wedding fun" },
            
            // Wedding Day
            { id: "baraat", label: "Baraat (Groom's Procession)", defaultMood: "Energetic", defaultStyle: "Bhangra", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Groom's arrival, dancing on streets, horse/car, grand entry" },
            { id: "milni", label: "Milni Ceremony", defaultMood: "Emotional", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Families meeting, elders exchanging garlands, respect, unity" },
            { id: "varmala", label: "Varmala / Jaimala", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "Moderate", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Garland exchange, playful lifting, first union moment, cheers" },
            { id: "kanyadaan", label: "Kanyadaan", defaultMood: "Emotional", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Father giving away daughter, tearful moment, sacred duty, blessings" },
            { id: "wedding_ceremony", label: "Wedding Ceremony (Main)", defaultMood: "Spiritual", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Chorus", promptContext: "Jaimala, Kanyadaan, Pheras, sacred fire, mantras, solemn union" },
            { id: "saat_phere", label: "Saat Phere (Seven Vows)", defaultMood: "Spiritual", defaultStyle: "Vedic Chant", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "Seven circles around fire, sacred vows, eternal promises, divine witness" },
            { id: "mangala_dharanam", label: "Mangala Dharanam / Mangalsutra", defaultMood: "Emotional", defaultStyle: "Cinematic", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Tying the Mangalsutra, peak emotional moment, eternal bond, sindoor" },
            { id: "sindoor_daan", label: "Sindoor Daan", defaultMood: "Traditional", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Applying vermillion, symbol of marriage, red color, auspicious moment" },
            
            // Post-Wedding
            { id: "vidaai", label: "Vidaai (Bride's Farewell)", defaultMood: "Melancholic", defaultStyle: "Melody", defaultComplexity: "Moderate", defaultRhyme: "ABCB", defaultSinger: "Female Solo", promptContext: "Bride leaving home, throwing rice, crying, emotional goodbye" },
            { id: "reception", label: "Reception", defaultMood: "Romantic", defaultStyle: "Jazz", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Post-wedding party, meeting guests, couple's first dance, celebrations" },
            { id: "griha_pravesh", label: "Griha Pravesh (Bride's Entry)", defaultMood: "Hopeful", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Bride entering groom's home, kicking rice pot, new beginnings, aarti" },
            { id: "mooh_dikhai", label: "Mooh Dikhai", defaultMood: "Joyful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Bride's face-showing ceremony, receiving gifts, meeting relatives" },
            { id: "pag_phera", label: "Pag Phera / Mukh Dekhai", defaultMood: "Nostalgic", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "ABCB", defaultSinger: "Female Solo", promptContext: "Bride returning to parents' home, gifts, introduction to in-laws" },
            { id: "chauthi", label: "Chauthi (Fourth Day)", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Fourth day ceremony, couple visiting bride's home, fun, games" },
            
            // Regional/Special
            { id: "kalire", label: "Kalire Ceremony", defaultMood: "Playful", defaultStyle: "Punjabi Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Shaking kalire over unmarried girls, teasing, predicting next bride" },
            { id: "joota_chupai", label: "Joota Chupai", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Stealing groom's shoes, negotiations, fun, playful bargaining" },
            { id: "bidaai_games", label: "Bidaai Games", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Post-wedding games between couple, finding ring in milk, ice-breaking" }
        ]
    },
    {
        id: "milestone",
        label: "Age & Milestone Ceremonies",
        events: [
            { id: "sashti_poorti", label: "Sashti Poorti (60th)", defaultMood: "Gratitude", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "60th birthday, renewal of vows, family gathering, gratitude for life" },
            { id: "bhima_ratha", label: "Bhima Ratha (70th)", defaultMood: "Peaceful", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "70th birthday, wisdom, health, overcoming mortality fear" },
            { id: "sashtabhishekam", label: "Sashtabhishekam (80th)", defaultMood: "Devotional", defaultStyle: "Vedic Chant", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "80th birthday, witnessing 1000 moons, divine blessings" },
            { id: "retirement", label: "Retirement", defaultMood: "Nostalgic", defaultStyle: "Melody", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Male Solo", promptContext: "End of career, new freedom, looking back at service, relaxation" }
        ]
    },
    {
        id: "religious_festival",
        label: "Religious & Festival Events",
        events: [
            // Hindu Pujas & Rituals
            { id: "satyanarayana", label: "Satyanarayana Puja", defaultMood: "Devotional", defaultStyle: "Bhajan", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Family puja, story of Lord Satyanarayana, prasad, blessings" },
            { id: "lakshmi_puja", label: "Lakshmi Puja", defaultMood: "Devotional", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Wealth goddess worship, prosperity, gold coins, lotus, business success" },
            { id: "durga_puja", label: "Durga Puja", defaultMood: "Powerful", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "Goddess Durga worship, Mahishasura, strength, pandals, Bengal tradition" },
            { id: "rudrabhishek", label: "Rudrabhishek", defaultMood: "Spiritual", defaultStyle: "Vedic Chant", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Male Solo", promptContext: "Lord Shiva abhishekam, holy water, bilva leaves, Rudram chanting, powerful" },
            { id: "ayush_homam", label: "Ayush Homam", defaultMood: "Spiritual", defaultStyle: "Vedic Chant", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Male Solo", promptContext: "Ritual for longevity, health, fire sacrifice, mantras, protection" },
            { id: "navagraha_puja", label: "Navagraha Puja", defaultMood: "Spiritual", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "Nine planets worship, astrological remedy, peace, harmony" },
            { id: "vastu_shanti", label: "Vastu Shanti / Bhoomi Puja", defaultMood: "Peaceful", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "House warming, harmonizing elements, worship of land/home, peace" },
            
            // Major Hindu Festivals
            { id: "diwali", label: "Diwali / Deepavali", defaultMood: "Festive", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Festival of lights, victory of good, crackers, sweets, Lakshmi puja, diyas" },
            { id: "holi", label: "Holi", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Festival of colors, Radha-Krishna love, spring, fun, frolic, gulal" },
            { id: "navratri", label: "Navratri / Durga Puja", defaultMood: "Energetic", defaultStyle: "Garba", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Nine nights, Goddess Durga, Garba/Dandiya dance, victory over evil, fasting" },
            { id: "ganesh_chaturthi", label: "Ganesh Chaturthi", defaultMood: "Energetic", defaultStyle: "Devotional", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Lord Ganesha festival, Ganpati Bappa Morya, immersion, modak, procession" },
            { id: "janmashtami", label: "Krishna Janmashtami", defaultMood: "Joyful", defaultStyle: "Bhajan", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Birth of Krishna, Dahi Handi, playful butter thief, midnight celebration, flute" },
            { id: "ram_navami", label: "Ram Navami", defaultMood: "Devotional", defaultStyle: "Bhajan", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Lord Rama's birth, Ayodhya, righteousness, Jai Shri Ram, procession" },
            { id: "mahashivratri", label: "Mahashivratri", defaultMood: "Spiritual", defaultStyle: "Chant", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "Great night of Shiva, fasting, all-night vigil, Om Namah Shivaya, rudraksha" },
            { id: "ugadi", label: "Ugadi / Gudi Padwa", defaultMood: "Festive", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "New Year, fresh start, neem-jaggery, pachadi, new beginnings, spring" },
            { id: "pongal", label: "Pongal / Makar Sankranti", defaultMood: "Festive", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Harvest festival, Sun god, kites, sugarcane, prosperity, gratitude" },
            { id: "onam", label: "Onam", defaultMood: "Traditional", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Kerala harvest festival, King Mahabali, boat race, pookalam, sadya feast" },
            
            // Family & Social Festivals
            { id: "raksha_bandhan", label: "Raksha Bandhan", defaultMood: "Sentimental", defaultStyle: "Melody", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Brother-sister bond, tying rakhi, promise of protection, love, gifts" },
            { id: "bhai_dooj", label: "Bhai Dooj", defaultMood: "Sentimental", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Sister blessing brother, tilak ceremony, sibling love, sweets" },
            { id: "karwa_chauth", label: "Karwa Chauth", defaultMood: "Romantic", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Wife fasting for husband, moon sighting, love, sacrifice, sargi" },
            { id: "vat_savitri", label: "Vat Savitri Vrat", defaultMood: "Devotional", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Married women fasting, banyan tree worship, husband's longevity, Savitri legend" },
            
            // Regional Festivals
            { id: "bihu", label: "Bihu", defaultMood: "Energetic", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Assamese New Year, harvest, dance, dhol, spring, youth, celebration" },
            { id: "lohri", label: "Lohri", defaultMood: "Festive", defaultStyle: "Bhangra", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Bonfire festival, harvest, Punjab, winter, popcorn, gajak, dance around fire" },
            { id: "baisakhi", label: "Baisakhi / Vaisakhi", defaultMood: "Energetic", defaultStyle: "Bhangra", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Sikh harvest festival, Khalsa, gurdwara, nagar kirtan, dhol, bhangra" },
            { id: "chhath_puja", label: "Chhath Puja", defaultMood: "Devotional", defaultStyle: "Folk", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Sun god worship, Bihar, river bank, fasting, arghya, dawn and dusk" },
            { id: "bonalu", label: "Bonalu", defaultMood: "Energetic", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Telangana goddess festival, pots on head, dance, Mahankali, mother goddess" },
            
            // Temple & Pilgrimage
            { id: "temple_aarti", label: "Temple Aarti", defaultMood: "Devotional", defaultStyle: "Bhajan", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Evening ritual, oil lamps, bells, synchronized singing, divine presence" },
            { id: "abhishekam", label: "Abhishekam", defaultMood: "Spiritual", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "Deity bathing ritual, holy water, milk, honey, flowers, sacred purification" },
            { id: "chariot_festival", label: "Chariot Festival / Ratha Yatra", defaultMood: "Energetic", defaultStyle: "Devotional", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Pulling divine chariot, Jagannath, Puri, procession, devotees, ropes" },
            { id: "kumbh_mela", label: "Kumbh Mela / Pilgrimage", defaultMood: "Spiritual", defaultStyle: "Bhajan", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Mass pilgrimage, holy dip, Ganga, spiritual gathering, moksha, sadhus" },
            
            // Islamic
            { id: "eid_ul_fitr", label: "Eid-ul-Fitr", defaultMood: "Festive", defaultStyle: "Sufi", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "End of Ramadan, brotherhood, feast, moon sighting, gratitude, sevaiyan" },
            { id: "eid_ul_adha", label: "Eid-ul-Adha / Bakrid", defaultMood: "Devotional", defaultStyle: "Sufi", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Festival of sacrifice, Ibrahim, qurbani, charity, togetherness" },
            { id: "ramadan", label: "Ramadan Fasting", defaultMood: "Spiritual", defaultStyle: "Sufi", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Holy month, fasting, iftar, sehri, Quran, patience, reflection, discipline" },
            { id: "muharram", label: "Muharram", defaultMood: "Melancholic", defaultStyle: "Sufi", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Islamic New Year, mourning, Karbala, Hussain, reflection, sacrifice" },
            
            // Christian
            { id: "christmas", label: "Christmas", defaultMood: "Joyful", defaultStyle: "Carol", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Birth of Jesus, Santa Claus, gifts, peace, joy, winter, star, nativity" },
            { id: "easter", label: "Easter Sunday", defaultMood: "Joyful", defaultStyle: "Gospel", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Resurrection of Christ, new life, hope, eggs, spring, victory over death" },
            { id: "good_friday", label: "Good Friday", defaultMood: "Melancholic", defaultStyle: "Gospel", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Chorus", promptContext: "Crucifixion, sacrifice, sorrow, cross, redemption, solemn" },
            
            // Buddhist
            { id: "buddha_purnima", label: "Buddha Purnima / Vesak", defaultMood: "Peaceful", defaultStyle: "Chant", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Chorus", promptContext: "Buddha's birth, enlightenment, nirvana, peace, meditation, lotus, dharma" },
            
            // Jain
            { id: "mahavir_jayanti", label: "Mahavir Jayanti", defaultMood: "Peaceful", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Lord Mahavira's birth, non-violence, truth, Jain festival, ahimsa" },
            { id: "paryushan", label: "Paryushan / Jain Fasting", defaultMood: "Spiritual", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "Sanskrit Slokas", defaultSinger: "Chorus", promptContext: "Jain holy period, fasting, repentance, forgiveness, purification, soul cleansing" }
        ]
    },
    {
        id: "gods",
        label: "Gods & Deities (Devotional)",
        events: [
            { id: "ganesha", label: "Lord Ganesha", defaultMood: "Devotional", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Remover of obstacles, elephant-headed god, wisdom, new beginnings" },
            { id: "shiva", label: "Lord Shiva", defaultMood: "Powerful", defaultStyle: "Damru/Tandav", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Destroyer, ascetic, Kailash, Ganga, Om Namah Shivaya, power" },
            { id: "vishnu_krishna", label: "Lord Vishnu / Krishna", defaultMood: "Melodious", defaultStyle: "Flute/Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Preserver, avatars, Bhagavad Gita, divine love, flute music" },
            { id: "durga_lakshmi", label: "Goddess Durga / Lakshmi", defaultMood: "Powerful", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Divine mother, strength (Shakti), wealth, prosperity, protection" },
            { id: "murugan", label: "Lord Murugan", defaultMood: "Energetic", defaultStyle: "Folk (Kavadi)", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Tamil god, Vel (spear), peacock, warrior, beauty, knowledge" },
            { id: "ayyappa", label: "Lord Ayyappa", defaultMood: "Devotional", defaultStyle: "Bhajan", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Sabarimala, celibacy, Hariivarasanam, unity, devotion" },
            { id: "hanuman", label: "Lord Hanuman", defaultMood: "Devotional", defaultStyle: "Chant", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Strength, devotion to Rama, Bajrangbali, courage, service" },
            { id: "sai_baba", label: "Sai Baba", defaultMood: "Peaceful", defaultStyle: "Bhajan", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Shirdi, Shraddha (faith), Saburi (patience), universal love" },
            { id: "jesus_christ", label: "Jesus Christ", defaultMood: "Peaceful", defaultStyle: "Gospel", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Savior, love, forgiveness, shepherd, cross, resurrection" },
            { id: "allah", label: "Allah (Islamic Devotional)", defaultMood: "Spiritual", defaultStyle: "Sufi", defaultComplexity: "Complex", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "One God, mercy, compassion, submission, peace, mysticism" }
        ]
    },
    {
        id: "life_event",
        label: "Other Life Events",
        events: [
            { id: "housewarming", label: "Housewarming (Griha Pravesh)", defaultMood: "Joyful", defaultStyle: "Classical", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "New home, prosperity, welcoming guests, new chapter" },
            { id: "anniversary", label: "Anniversary (Silver/Golden)", defaultMood: "Romantic", defaultStyle: "Melody", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Celebrating years of togetherness, enduring love, memories" },
            { id: "vehicle_puja", label: "Vehicle Blessing (Vahana Puja)", defaultMood: "Traditional", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "New car/bike, safety prayers, lemon crushing, gratitude" }
        ]
    },
    {
        id: "film",
        label: "Film Situations",
        events: [
            // Mass/Action Hero Intros
            { id: "hero_entry", label: "Mass Hero Entry", defaultMood: "Energetic", defaultStyle: "Tollywood Mass", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Protagonist introduction, power, swagger, slow-motion walk, mass appeal, Dappankuthu beats" },
            { id: "hero_intro_stylish", label: "Stylish Hero Intro", defaultMood: "Energetic", defaultStyle: "Rap/Hip-Hop", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Modern hero entry, swag, attitude, sunglasses, bike/car, punchlines" },
            { id: "mass_beat", label: "Mass Beat Song", defaultMood: "Aggressive", defaultStyle: "Tollywood Mass", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Heavy percussion, Dappankuthu, hero mass elevation, whistles, cheers" },
            { id: "villain_entry", label: "Villain Entry", defaultMood: "Dark", defaultStyle: "Metal", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Antagonist introduction, fear, dominance, heavy beats, ominous atmosphere" },
            { id: "police_entry", label: "Police/Cop Entry", defaultMood: "Powerful", defaultStyle: "Rock", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "IPS officer intro, justice theme, khaki uniform, duty, valor" },
            
            // Action & Fight Sequences
            { id: "fight_song", label: "Fight/Action Song", defaultMood: "Aggressive", defaultStyle: "EDM", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Pre-fight buildup, adrenaline, bass drops, punches sync with beats" },
            { id: "chase_sequence", label: "Chase Sequence", defaultMood: "Energetic", defaultStyle: "EDM", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "High-speed chase, running, bikes, fast tempo, breathless energy" },
            { id: "revenge_theme", label: "Revenge Theme", defaultMood: "Dark", defaultStyle: "Rock", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Vengeance motivation, past pain, determination, intensity" },
            { id: "bgm_elevation", label: "BGM Elevation Track", defaultMood: "Epic", defaultStyle: "Cinematic", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Chorus", promptContext: "Background score lyrics, hero elevation, epic moments, orchestral" },
            
            // Romance & Love
            { id: "love_montage", label: "Love Montage", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Falling in love sequence, visual storytelling, soft melody, scenic locations" },
            { id: "duet_romantic", label: "Romantic Duet", defaultMood: "Romantic", defaultStyle: "Melody", defaultComplexity: "Moderate", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Pure romance, couple chemistry, dream sequence, beautiful locations" },
            { id: "rain_song", label: "Rain Song", defaultMood: "Romantic", defaultStyle: "Cinematic", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Dancing in rain, getting wet, sensual, chemistry, romantic tension" },
            { id: "proposal_song", label: "Proposal Song", defaultMood: "Romantic", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Male Solo", promptContext: "Hero proposing love, convincing heroine, pleading, hope, persistence" },
            { id: "kuthu_love", label: "Kuthu Love Song", defaultMood: "Playful", defaultStyle: "Tollywood Mass", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Folk-style romance, teasing, playful love, village setting, earthy" },
            
            // Item/Party Numbers
            { id: "item_song", label: "Item Number", defaultMood: "Groovy", defaultStyle: "Tollywood Mass", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "High energy dance number, catchy hooks, party vibe, glamour, bold" },
            { id: "club_song", label: "Club Song", defaultMood: "Energetic", defaultStyle: "EDM", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Nightclub scene, DJ, neon lights, bass drops, party anthem" },
            { id: "beach_party", label: "Beach Party Song", defaultMood: "Chill", defaultStyle: "Reggaeton", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Duet", promptContext: "Beach setting, party, drinks, sunset, vacation vibes, carefree" },
            { id: "college_song", label: "College Anthem", defaultMood: "Energetic", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Campus life, youth, friendship, bunking, fun, rebellion" },
            
            // Emotional & Sentiment
            { id: "mother_sentiment", label: "Mother Sentiment", defaultMood: "Emotional", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Mother's love, sacrifice, emotional flashback, tears, gratitude" },
            { id: "father_son", label: "Father-Son Bond", defaultMood: "Emotional", defaultStyle: "Melody", defaultComplexity: "Moderate", defaultRhyme: "ABAB", defaultSinger: "Male Solo", promptContext: "Father's guidance, sacrifices, son's realization, respect, pride" },
            { id: "friendship_song", label: "Friendship Anthem", defaultMood: "Joyful", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Brotherhood, loyalty, group of friends, fun moments, bond" },
            { id: "separation_sad", label: "Sad Separation", defaultMood: "Melancholic", defaultStyle: "Melody", defaultComplexity: "Moderate", defaultRhyme: "ABCB", defaultSinger: "Male Solo", promptContext: "Loss, death, departure, grief, loneliness, mourning" },
            { id: "flashback_theme", label: "Flashback Theme", defaultMood: "Nostalgic", defaultStyle: "Classical", defaultComplexity: "Moderate", defaultRhyme: "Free Verse", defaultSinger: "Male Solo", promptContext: "Past memories, sepia tone, childhood, origin story, reflection" },
            
            // Comedy & Light
            { id: "comedy_song", label: "Comedy Song", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Funny situations, wordplay, comic timing, laughter, absurdity" },
            { id: "drunk_song", label: "Drunk Song / Tasmac", defaultMood: "Playful", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Alcohol, bar scene, intoxication, silly behavior, philosophy while drunk" },
            
            // Special South Indian Styles
            { id: "gaana_song", label: "Gaana Song", defaultMood: "Energetic", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Chennai Gaana style, raw, street flavor, slang, working class, earthy" },
            { id: "naatu_koothu", label: "Naatu Koothu", defaultMood: "Energetic", defaultStyle: "Folk", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Chorus", promptContext: "Village folk dance, traditional, dhol beats, rustic, celebration" },
            { id: "jalsa_song", label: "Jalsa Song", defaultMood: "Energetic", defaultStyle: "Tollywood Mass", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Mass celebration, festival, fun, rowdy, dhoom dham, jubilation" },
            { id: "intro_bgm", label: "Title BGM / Theme", defaultMood: "Epic", defaultStyle: "Cinematic", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Chorus", promptContext: "Opening credits, establishing tone, goosebumps, film theme, orchestral" },
            
            // Period/Historical
            { id: "war_song", label: "War Song / Battle Cry", defaultMood: "Powerful", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "Free Verse", defaultSinger: "Chorus", promptContext: "War preparation, battle cry, valor, sacrifice, patriotism, drums" },
            { id: "period_romance", label: "Period Romance", defaultMood: "Romantic", defaultStyle: "Classical", defaultComplexity: "Complex", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Historical setting, traditional attire, royal love, poetic, classical instruments" },
            
            // Motivational
            { id: "motivational_anthem", label: "Motivational Anthem", defaultMood: "Hopeful", defaultStyle: "Rock", defaultComplexity: "Moderate", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Overcoming odds, never give up, rise again, inspiration, dreams" },
            { id: "training_montage", label: "Training Montage", defaultMood: "Energetic", defaultStyle: "Rock", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Male Solo", promptContext: "Physical training, getting stronger, preparation, sweat, determination" }
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
        id: "modern",
        label: "Modern / Urban",
        events: [
            { id: "club_anthem", label: "Club Anthem", defaultMood: "Energetic", defaultStyle: "EDM", defaultComplexity: "Simple", defaultRhyme: "AABB", defaultSinger: "Female Solo", promptContext: "Nightlife, dancing, bass drop, repetitive hooks" },
            { id: "road_trip", label: "Road Trip", defaultMood: "Chill", defaultStyle: "Pop", defaultComplexity: "Simple", defaultRhyme: "ABAB", defaultSinger: "Duet", promptContext: "Driving, wind in hair, freedom, adventure" }
        ]
    }
];
