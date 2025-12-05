// Profile Enhancement Constants for AI-powered Headline & Bio enhancement

export interface ProfileType {
  id: string;
  label: string;
  description: string;
  keywords: string[];
}

export interface EnhancementTone {
  id: string;
  label: string;
  description: string;
  temperature: number;
}

// Profile types for contextual AI enhancement
export const PROFILE_TYPES: ProfileType[] = [
  {
    id: 'sales_professional',
    label: 'Sales Professional',
    description: 'Business development, account management, revenue growth',
    keywords: ['sales', 'business development', 'revenue', 'clients', 'negotiation']
  },
  {
    id: 'musician',
    label: 'Musician',
    description: 'Music creation, performance, composition',
    keywords: ['music', 'songs', 'composition', 'performance', 'instruments', 'melody']
  },
  {
    id: 'dancer',
    label: 'Dancer',
    description: 'Dance performance, choreography, movement arts',
    keywords: ['dance', 'choreography', 'performance', 'movement', 'rhythm']
  },
  {
    id: 'lyricist',
    label: 'Lyricist / Songwriter',
    description: 'Songwriting, lyrics creation, poetry',
    keywords: ['lyrics', 'songwriting', 'poetry', 'words', 'verses']
  },
  {
    id: 'painter',
    label: 'Painter / Visual Artist',
    description: 'Visual arts, painting, illustration',
    keywords: ['art', 'painting', 'visual', 'canvas', 'illustration', 'creativity']
  },
  {
    id: 'developer',
    label: 'Software Developer',
    description: 'Software engineering, coding, technology',
    keywords: ['software', 'code', 'engineering', 'development', 'technology', 'programming']
  },
  {
    id: 'architect',
    label: 'Enterprise Architect',
    description: 'System design, enterprise solutions, technical leadership',
    keywords: ['architecture', 'enterprise', 'solutions', 'systems', 'design', 'strategy']
  },
  {
    id: 'data_scientist',
    label: 'Data Scientist / AI Engineer',
    description: 'Machine learning, AI, data analysis',
    keywords: ['AI', 'machine learning', 'data', 'analytics', 'models', 'algorithms']
  },
  {
    id: 'entrepreneur',
    label: 'Entrepreneur',
    description: 'Startup founder, business innovation, leadership',
    keywords: ['startup', 'founder', 'innovation', 'business', 'venture', 'leadership']
  },
  {
    id: 'consultant',
    label: 'Consultant',
    description: 'Advisory services, strategy, expertise',
    keywords: ['consulting', 'strategy', 'advisory', 'expertise', 'solutions']
  },
  {
    id: 'marketing',
    label: 'Marketing Professional',
    description: 'Brand management, digital marketing, campaigns',
    keywords: ['marketing', 'brand', 'campaigns', 'digital', 'growth', 'engagement']
  },
  {
    id: 'designer',
    label: 'Designer (UX/UI/Graphic)',
    description: 'Design thinking, user experience, visual design',
    keywords: ['design', 'UX', 'UI', 'creative', 'visual', 'user experience']
  },
  {
    id: 'writer',
    label: 'Writer / Content Creator',
    description: 'Content creation, storytelling, copywriting',
    keywords: ['writing', 'content', 'storytelling', 'copywriting', 'narrative']
  },
  {
    id: 'photographer',
    label: 'Photographer / Videographer',
    description: 'Visual storytelling, photography, videography',
    keywords: ['photography', 'video', 'visual', 'camera', 'storytelling', 'media']
  },
  {
    id: 'teacher',
    label: 'Teacher / Educator',
    description: 'Education, mentoring, knowledge sharing',
    keywords: ['education', 'teaching', 'mentor', 'learning', 'knowledge']
  },
  {
    id: 'healthcare',
    label: 'Healthcare Professional',
    description: 'Medical services, patient care, wellness',
    keywords: ['healthcare', 'medical', 'patient', 'wellness', 'health']
  },
  {
    id: 'finance',
    label: 'Finance Professional',
    description: 'Financial services, investment, accounting',
    keywords: ['finance', 'investment', 'accounting', 'financial', 'banking']
  },
  {
    id: 'general',
    label: 'General / Other',
    description: 'General professional profile',
    keywords: ['professional', 'work', 'career', 'skills']
  }
];

// Enhancement tones for different communication styles
export const ENHANCEMENT_TONES: EnhancementTone[] = [
  {
    id: 'professional',
    label: 'Professional',
    description: 'Formal, polished, business-appropriate',
    temperature: 0.6
  },
  {
    id: 'casual',
    label: 'Casual & Friendly',
    description: 'Approachable, warm, conversational',
    temperature: 0.8
  },
  {
    id: 'creative',
    label: 'Creative & Bold',
    description: 'Unique, artistic, attention-grabbing',
    temperature: 0.95
  },
  {
    id: 'concise',
    label: 'Concise & Direct',
    description: 'Brief, impactful, to-the-point',
    temperature: 0.5
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    description: 'Narrative, engaging, personal journey',
    temperature: 0.85
  },
  {
    id: 'authoritative',
    label: 'Authoritative',
    description: 'Expert, confident, thought leader',
    temperature: 0.65
  },
  {
    id: 'inspiring',
    label: 'Inspiring',
    description: 'Motivational, uplifting, visionary',
    temperature: 0.75
  }
];

// Default selections
export const DEFAULT_PROFILE_TYPE = 'general';
export const DEFAULT_ENHANCEMENT_TONE = 'professional';

// Character limits (matching the form constraints)
export const HEADLINE_MAX_LENGTH = 100;
export const BIO_MAX_LENGTH = 500;
