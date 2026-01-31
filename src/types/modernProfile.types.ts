/**
 * Modern Profile Types
 *
 * Type definitions for the vCard/profile system including link blocks,
 * templates, and visual customization.
 *
 * @module modernProfile.types
 */

// ============================================================================
// LINK BLOCK TYPES
// ============================================================================

/**
 * Available link block types for profile customization.
 *
 * @remarks
 * - VIDEO_UPLOAD has been removed in favor of VIDEO_EMBED (YouTube/Vimeo only)
 * - BOOKING is kept in the database for backward compatibility but hidden from UI
 */
export enum LinkType {
    /** Standard clickable link with title and URL */
    CLASSIC = 'CLASSIC',

    /** Section header for grouping links */
    HEADER = 'HEADER',

    /** Image gallery with multiple images */
    GALLERY = 'GALLERY',

    /** Embedded video from YouTube, Vimeo, etc. */
    VIDEO_EMBED = 'VIDEO_EMBED',

    /** Contact form for visitor inquiries */
    CONTACT_FORM = 'CONTACT_FORM',

    /** Embedded map showing a location */
    MAP_LOCATION = 'MAP_LOCATION',

    /** Downloadable file link (PDF, images, etc.) */
    FILE_DOWNLOAD = 'FILE_DOWNLOAD',

    /** Fully customizable link with custom icon/logo */
    CUSTOM_LINK = 'CUSTOM_LINK',

    /**
     * Booking/appointment integration
     * @deprecated Hidden from UI but kept for backward compatibility
     */
    BOOKING = 'BOOKING',

    /**
     * Uploaded video file
     * @deprecated Removed from UI - use VIDEO_EMBED instead. Kept for backward compatibility with existing data.
     */
    VIDEO_UPLOAD = 'VIDEO_UPLOAD'
}

/**
 * Link types available for creating new blocks in the UI.
 * Excludes deprecated types (VIDEO_UPLOAD, BOOKING) that are only kept for backward compatibility.
 */
export type AvailableLinkType = Exclude<LinkType, LinkType.VIDEO_UPLOAD | LinkType.BOOKING>;

/**
 * Gallery image item for GALLERY link type.
 */
export interface GalleryImage {
    /** Unique identifier for the image */
    id: string;

    /** Image URL (can be absolute or relative path) */
    url: string;

    /** Optional caption displayed below the image */
    caption?: string;
}

/**
 * Contact form field definition for CONTACT_FORM link type.
 */
export interface ContactFormField {
    /** Unique identifier for the field */
    id: string;

    /** Field type determining input rendering */
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';

    /** Display label for the field */
    label: string;

    /** Placeholder text for input fields */
    placeholder?: string;

    /** Whether this field is required */
    required: boolean;

    /** Options for select fields */
    options?: string[];

    /** Display order within the form */
    order: number;
}

/**
 * Contact form configuration for CONTACT_FORM link type.
 */
export interface ContactFormConfig {
    /** Email address to receive form submissions */
    recipientEmail: string;

    /** Custom fields in the form */
    fields: ContactFormField[];

    /** Submit button text */
    submitButtonText?: string;

    /** Success message after submission */
    successMessage?: string;

    /** Whether to send confirmation to submitter */
    sendConfirmation?: boolean;

    /** reCAPTCHA site key for spam protection */
    recaptchaSiteKey?: string;
}

/**
 * Map location configuration for MAP_LOCATION link type.
 */
export interface MapLocationConfig {
    /** Full address string for display and geocoding */
    address: string;

    /** Latitude coordinate (optional if address is provided) */
    latitude?: number;

    /** Longitude coordinate (optional if address is provided) */
    longitude?: number;

    /** Zoom level for the map (1-20) */
    zoom?: number;

    /** Map provider preference */
    provider?: 'google' | 'openstreetmap' | 'mapbox';

    /** Whether to show a marker at the location */
    showMarker?: boolean;

    /** Custom marker label */
    markerLabel?: string;
}

/**
 * File download configuration for FILE_DOWNLOAD link type.
 */
export interface FileDownloadConfig {
    /** URL of the file to download */
    fileUrl: string;

    /** Original filename for display */
    fileName: string;

    /** File size in bytes */
    fileSize?: number;

    /** MIME type of the file */
    mimeType?: string;

    /** Whether to track download count */
    trackDownloads?: boolean;

    /** Optional password protection */
    password?: string;

    /** Expiration date for the download link */
    expiresAt?: string;
}

/**
 * Custom link configuration for CUSTOM_LINK link type.
 */
export interface CustomLinkConfig {
    /** Custom icon/logo URL */
    iconUrl?: string;

    /** Base64 encoded icon (alternative to URL) */
    iconBase64?: string;

    /** Icon background color */
    iconBackgroundColor?: string;

    /** Icon size in pixels */
    iconSize?: number;

    /** Custom CSS class for additional styling */
    customClass?: string;

    /** Whether to open link in new tab */
    openInNewTab?: boolean;
}

/**
 * Union type for all block-specific metadata configurations.
 */
export type LinkMetadata =
    | { type: 'contact_form'; config: ContactFormConfig }
    | { type: 'map_location'; config: MapLocationConfig }
    | { type: 'file_download'; config: FileDownloadConfig }
    | { type: 'custom_link'; config: CustomLinkConfig }
    | { type: 'gallery'; config: { columns?: number; spacing?: number; lightbox?: boolean } }
    | { type: 'video_embed'; config: { autoplay?: boolean; muted?: boolean; loop?: boolean } }
    | { type: 'header'; config: { size?: 'small' | 'medium' | 'large'; alignment?: 'left' | 'center' | 'right' } };

/**
 * Link item representing a block on the profile page.
 *
 * @remarks
 * This interface supports all block types through the polymorphic metadata field.
 * Backward compatibility is maintained with existing fields.
 */
export interface LinkItem {
    /** Unique identifier for the link */
    id: string;

    /** Type of link block */
    type: LinkType;

    /** Display title for the link */
    title: string;

    /** Target URL for clickable links */
    url?: string;

    /** Thumbnail image URL */
    thumbnail?: string;

    /** Whether the link is visible on the profile */
    isActive: boolean;

    /** Number of clicks/interactions */
    clicks: number;

    /** Platform hint for styling and icons */
    platform?: 'spotify' | 'youtube' | 'instagram' | 'tiktok' | 'vimeo' | 'generic';

    // --- Gallery-specific fields ---

    /** Images for GALLERY type */
    galleryImages?: GalleryImage[];

    /** Layout mode for galleries */
    layout?: 'grid' | 'carousel' | 'list';

    // --- Scheduling ---

    /** Time-based visibility scheduling */
    schedule?: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };

    // --- Block-specific metadata (new) ---

    /**
     * Type-specific configuration for advanced block types.
     * Contains settings for contact forms, maps, file downloads, etc.
     */
    metadata?: LinkMetadata;

    // --- Styling overrides ---

    /** Custom background color for this block */
    backgroundColor?: string;

    /** Custom text color for this block */
    textColor?: string;

    /** Custom border radius in pixels */
    borderRadius?: number;

    // --- Legacy support ---

    /** Display order for sorting (legacy, use array position instead) */
    displayOrder?: number;
}

// ============================================================================
// SOCIAL LINK TYPES
// ============================================================================

/**
 * Supported social media platforms.
 */
export type SocialPlatform =
    | 'instagram'
    | 'twitter'
    | 'linkedin'
    | 'email'
    | 'website'
    | 'youtube'
    | 'tiktok'
    | 'github'
    | 'facebook'
    | 'spotify'
    | 'twitch'
    | 'discord'
    | 'custom';

/**
 * Social media link for the profile header.
 */
export interface SocialLink {
    /** Unique identifier */
    id: string;

    /** Social platform type */
    platform: SocialPlatform;

    /** Profile/page URL */
    url: string;

    /** Whether the link is visible */
    isActive: boolean;

    /** Custom icon for platform='custom' */
    customIconUrl?: string;

    /** Display label for custom links */
    label?: string;

    /** Display order for sorting */
    displayOrder?: number;
}

// ============================================================================
// PROFILE DATA TYPES
// ============================================================================

/**
 * Profile data containing user information and settings.
 */
export interface ProfileData {
    /** Unique username (URL slug) */
    username: string;

    /** Display name shown on profile */
    displayName: string;

    /** Bio/description text */
    bio: string;

    /** Avatar image URL */
    avatarUrl: string;

    /** Original uncropped avatar source */
    avatarSource?: string;

    /** Avatar crop settings */
    avatarCrop?: { x: number; y: number; scale: number };

    /** Professional title/role */
    profession?: string;

    /** Social media links */
    socials: SocialLink[];

    /** SEO metadata */
    seo?: {
        title: string;
        description: string;
        keywords: string;
    };

    // --- Legacy field mappings ---

    /** @deprecated Use displayName instead */
    firstName?: string;

    /** @deprecated Use displayName instead */
    lastName?: string;

    /** Company/organization name */
    company?: string;

    /** Database ID */
    id?: number;
}

// ============================================================================
// VISUAL CUSTOMIZATION TYPES
// ============================================================================

/**
 * Background configuration settings.
 */
export interface ThemeConfig {
    /** Background scale factor (1 to 3) */
    bgScale: number;

    /** Background blur amount in pixels (0 to 20) */
    bgBlur: number;

    /** Background overlay opacity (0 to 0.9) */
    bgOverlay: number;

    /** Vertical position as percentage (0 to 100) */
    bgPositionY: number;

    /** Optional overlay color (hex or rgba) */
    overlayColor?: string;
}

/**
 * Typography configuration for text elements.
 */
export interface Typography {
    /** Font family name */
    family: string;

    /** Text color (hex or rgba) */
    color: string;

    /** Size multiplier relative to base (0.8 to 2.0) */
    size: number;

    /** Font weight */
    weight: 'normal' | 'bold' | '800';

    /** Font style */
    style: 'normal' | 'italic';

    /** Text transform */
    transform?: 'none' | 'uppercase' | 'lowercase';

    /** Text decoration */
    decoration?: 'none' | 'underline';

    /** Letter spacing (e.g., '0em', '0.1em') */
    letterSpacing?: string;
}

/**
 * Button styling configuration.
 */
export interface ButtonStyle {
    /** Button shape preset */
    shape: 'rounded' | 'square' | 'pill' | 'hard-shadow' | 'glass' | 'outline' | 'soft-shadow';

    /** Background color (hex or rgba) */
    backgroundColor: string;

    /** Border color (hex or rgba) */
    borderColor: string;

    /** Border width in pixels */
    borderWidth: number;

    /** Text color (hex or rgba) */
    textColor: string;

    /** Font family override */
    fontFamily: string;

    /** Font weight */
    fontWeight: string;

    /** Shadow color for shadow shapes */
    shadowColor?: string;
}

/**
 * Theme category for filtering and organization.
 */
export type ThemeCategory =
    | 'All'
    | 'Wedding'
    | 'Photography'
    | 'Makeup'
    | 'Fashion'
    | 'Fitness'
    | 'Music'
    | 'Business'
    | 'Creator';

/**
 * Complete theme configuration for a profile.
 */
export interface Theme {
    /** Unique theme identifier */
    id: string;

    /** Theme display name */
    name: string;

    /** Theme category for filtering */
    category: ThemeCategory;

    // --- Background ---

    /** Background type */
    bgType: 'color' | 'image' | 'gradient';

    /** Background value (color, URL, or gradient CSS) */
    bgValue: string;

    /** Background configuration settings */
    bgConfig?: ThemeConfig;

    // --- Profile typography ---

    /** Profile section typography */
    profile: {
        name: Typography;
        profession: Typography;
        bio: Typography;
    };

    /** Header block typography */
    headers: Typography;

    /** Social icons styling */
    socials: {
        color: string;
        style: 'filled' | 'outline' | 'minimal' | 'glass';
        /** @deprecated Use array position instead */
        displayOrder?: number;
    };

    /** Link button styling */
    buttons: ButtonStyle;

    /** Accent color for CTAs and highlights */
    accentColor: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Daily analytics data point.
 */
export interface AnalyticsData {
    /** Date string (ISO format) */
    date: string;

    /** Number of profile views */
    views: number;

    /** Number of link clicks */
    clicks: number;
}

// ============================================================================
// TEMPLATE SYSTEM TYPES
// ============================================================================

/**
 * Template category for organization and discovery.
 */
export type TemplateCategory =
    | 'personal'
    | 'business'
    | 'portfolio'
    | 'event'
    | 'restaurant'
    | 'real-estate'
    | 'healthcare'
    | 'education'
    | 'nonprofit'
    | 'entertainment'
    | 'custom';

/**
 * Template block defining a pre-configured link item.
 */
export interface TemplateBlock {
    /** Block type */
    type: LinkType;

    /** Default title (can be customized by user) */
    defaultTitle: string;

    /** Placeholder or example URL */
    defaultUrl?: string;

    /** Whether this block is required in the template */
    required: boolean;

    /** Help text explaining the block's purpose */
    helpText?: string;

    /** Default metadata configuration */
    defaultMetadata?: LinkMetadata;

    /** Block-specific validation rules */
    validation?: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        customValidator?: string;
    };
}

/**
 * Template section grouping related blocks.
 */
export interface TemplateSection {
    /** Section identifier */
    id: string;

    /** Section title */
    title: string;

    /** Section description */
    description?: string;

    /** Blocks within this section */
    blocks: TemplateBlock[];

    /** Whether the entire section is collapsible */
    collapsible?: boolean;

    /** Whether the section starts collapsed */
    defaultCollapsed?: boolean;
}

/**
 * vCard template configuration for guided profile creation.
 *
 * @remarks
 * Templates provide pre-configured structures for different use cases,
 * making it easier for users to create professional profiles quickly.
 */
export interface VCardTemplate {
    /** Unique template identifier */
    id: string;

    /** Template display name */
    name: string;

    /** Template description */
    description: string;

    /** Template category */
    category: TemplateCategory;

    /** Preview image URL */
    previewImageUrl?: string;

    /** Preview thumbnail URL (smaller) */
    thumbnailUrl?: string;

    /** Whether this is a premium template */
    isPremium: boolean;

    /** Whether this template is featured */
    isFeatured: boolean;

    /** Template version for updates */
    version: string;

    /** Template author/creator */
    author?: string;

    /** Tags for search and discovery */
    tags: string[];

    // --- Template structure ---

    /** Sections containing template blocks */
    sections: TemplateSection[];

    /** Default theme to apply with this template */
    defaultTheme?: Partial<Theme>;

    /** Suggested social platforms for this template */
    suggestedSocials?: SocialPlatform[];

    /** Default profile settings */
    defaultProfile?: Partial<ProfileData>;

    // --- Metadata ---

    /** Number of times this template has been used */
    usageCount?: number;

    /** Average user rating (1-5) */
    rating?: number;

    /** Creation timestamp */
    createdAt?: string;

    /** Last update timestamp */
    updatedAt?: string;
}

/**
 * Template usage tracking data.
 */
export interface TemplateUsage {
    /** Template ID */
    templateId: string;

    /** User ID who used the template */
    userId: number;

    /** Timestamp when template was applied */
    appliedAt: string;

    /** Customizations made by the user */
    customizations?: {
        blocksAdded: number;
        blocksRemoved: number;
        themeModified: boolean;
    };
}

/**
 * Template filter options for browsing.
 */
export interface TemplateFilterOptions {
    /** Filter by category */
    category?: TemplateCategory;

    /** Filter by premium status */
    isPremium?: boolean;

    /** Filter by featured status */
    isFeatured?: boolean;

    /** Search query for name/description/tags */
    searchQuery?: string;

    /** Sort field */
    sortBy?: 'name' | 'usageCount' | 'rating' | 'createdAt';

    /** Sort direction */
    sortOrder?: 'asc' | 'desc';

    /** Pagination offset */
    offset?: number;

    /** Pagination limit */
    limit?: number;
}

// ============================================================================
// EDITOR STATE TYPES
// ============================================================================

/**
 * Block drag-and-drop state for the editor.
 */
export interface BlockDragState {
    /** ID of the block being dragged */
    draggedBlockId: string | null;

    /** Index where the block is being dragged over */
    dragOverIndex: number | null;

    /** Whether a drag operation is in progress */
    isDragging: boolean;
}

/**
 * Editor undo/redo history entry.
 */
export interface EditorHistoryEntry {
    /** Timestamp of the change */
    timestamp: number;

    /** Description of the change */
    description: string;

    /** Snapshot of links at this point */
    links: LinkItem[];

    /** Snapshot of profile data at this point */
    profile: ProfileData;

    /** Snapshot of theme at this point */
    theme: Theme;
}

/**
 * Editor state for managing profile editing session.
 */
export interface EditorState {
    /** Current links/blocks */
    links: LinkItem[];

    /** Current profile data */
    profile: ProfileData;

    /** Current theme */
    theme: Theme;

    /** Whether there are unsaved changes */
    isDirty: boolean;

    /** Whether the editor is in preview mode */
    isPreviewMode: boolean;

    /** Currently selected block ID (for editing) */
    selectedBlockId: string | null;

    /** Drag and drop state */
    dragState: BlockDragState;

    /** Undo/redo history */
    history: EditorHistoryEntry[];

    /** Current position in history (for undo/redo) */
    historyIndex: number;

    /** Template that was used to create this profile (if any) */
    appliedTemplateId?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard helper for checking LinkType.
 */
export type LinkTypeGuard<T extends LinkType> = LinkItem & { type: T };

/**
 * Extract metadata type for a specific link type.
 */
export type ExtractMetadata<T extends LinkMetadata['type']> = Extract<
    LinkMetadata,
    { type: T }
>['config'];

/**
 * Partial deep type for nested partial updates.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Profile update payload type.
 */
export type ProfileUpdatePayload = DeepPartial<ProfileData> & {
    links?: LinkItem[];
    theme?: DeepPartial<Theme>;
};

/**
 * Link creation payload (id is auto-generated).
 */
export type LinkCreatePayload = Omit<LinkItem, 'id' | 'clicks'> & {
    id?: string;
    clicks?: number;
};

/**
 * Template creation payload.
 */
export type TemplateCreatePayload = Omit<
    VCardTemplate,
    'id' | 'usageCount' | 'rating' | 'createdAt' | 'updatedAt'
>;
