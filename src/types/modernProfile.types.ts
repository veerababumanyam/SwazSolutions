
export enum LinkType {
    CLASSIC = 'CLASSIC',
    GALLERY = 'GALLERY',
    VIDEO_EMBED = 'VIDEO_EMBED',
    VIDEO_UPLOAD = 'VIDEO_UPLOAD',
    HEADER = 'HEADER',
    BOOKING = 'BOOKING'
}

export interface GalleryImage {
    id: string;
    url: string;
    caption?: string;
}

export interface LinkItem {
    id: string;
    type: LinkType;
    title: string;
    url?: string;
    thumbnail?: string;
    isActive: boolean;
    clicks: number;
    platform?: 'spotify' | 'youtube' | 'instagram' | 'tiktok' | 'vimeo' | 'generic';

    // Specific fields
    galleryImages?: GalleryImage[];
    layout?: 'grid' | 'carousel' | 'list'; // For galleries

    schedule?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };

    // Legacy support
    displayOrder?: number;
}

export type SocialPlatform = 'instagram' | 'twitter' | 'linkedin' | 'email' | 'website' | 'youtube' | 'tiktok' | 'github' | 'facebook' | 'spotify' | 'twitch' | 'discord' | 'custom';

export interface SocialLink {
    id: string;
    platform: SocialPlatform;
    url: string;
    isActive: boolean;
    customIconUrl?: string; // Base64 or URL for custom uploaded icons
    label?: string; // Optional label for custom links
    displayOrder?: number;
}

export interface ProfileData {
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    avatarSource?: string; // The original uncropped image
    avatarCrop?: { x: number; y: number; scale: number }; // Saved crop settings
    profession?: string; // e.g., "Editorial Photographer"
    socials: SocialLink[];
    seo?: {
        title: string;
        description: string;
        keywords: string;
    };

    // Legacy fields mapping
    firstName?: string;
    lastName?: string;
    company?: string;
    id?: number;
}

// --- VISUAL CUSTOMIZATION TYPES ---

export interface ThemeConfig {
    bgScale: number; // 1 to 3
    bgBlur: number; // 0 to 20
    bgOverlay: number; // 0 to 0.9
    bgPositionY: number; // 0 to 100 (%)
    overlayColor?: string; // Additional overlay color
}

export interface Typography {
    family: string;
    color: string;
    size: number; // Scale relative multiplier (0.8 - 2.0)
    weight: 'normal' | 'bold' | '800';
    style: 'normal' | 'italic';
    transform?: 'none' | 'uppercase' | 'lowercase';
    decoration?: 'none' | 'underline';
    letterSpacing?: string; // e.g. '0em', '0.1em'
}

export interface ButtonStyle {
    shape: 'rounded' | 'square' | 'pill' | 'hard-shadow' | 'glass' | 'outline' | 'soft-shadow';
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    textColor: string;
    fontFamily: string; // override
    fontWeight: string;
    shadowColor?: string;
}

export type ThemeCategory = 'All' | 'Wedding' | 'Photography' | 'Makeup' | 'Fashion' | 'Fitness' | 'Music' | 'Business' | 'Creator';

export interface Theme {
    id: string;
    name: string;
    category: ThemeCategory;

    // Background
    bgType: 'color' | 'image' | 'gradient';
    bgValue: string;
    bgConfig?: ThemeConfig;

    // Granular Styles
    profile: {
        name: Typography;
        profession: Typography;
        bio: Typography;
    };

    headers: Typography;

    socials: {
        color: string;
        style: 'filled' | 'outline' | 'minimal' | 'glass';
        // Legacy support
        displayOrder?: number;
    };

    buttons: ButtonStyle;

    accentColor: string; // Used for CTA buttons (Save, Share) and highlights
}

export interface AnalyticsData {
    date: string;
    views: number;
    clicks: number;
}
