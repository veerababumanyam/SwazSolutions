/**
 * Digital Invitations Type Definitions
 * Complete type system for the digital invitation feature
 */

// ============================================================================
// VIEW STATES
// ============================================================================

export enum InviteViewState {
  DASHBOARD = 'DASHBOARD',
  CREATE_INVITE = 'CREATE_INVITE',
  EDIT_INVITE = 'EDIT_INVITE',
  TEMPLATE_LIBRARY = 'TEMPLATE_LIBRARY',
  TEMPLATE_MARKETPLACE = 'TEMPLATE_MARKETPLACE',
  GUEST_MANAGEMENT = 'GUEST_MANAGEMENT',
  ANALYTICS = 'ANALYTICS',
  CHECK_IN = 'CHECK_IN',
  SETTINGS = 'SETTINGS'
}

// ============================================================================
// LANGUAGE SUPPORT
// ============================================================================

export interface Language {
  code: string;
  label: string;
  native: string;
}

export const SUPPORTED_INVITE_LANGUAGES: Language[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'sd', label: 'Sindhi', native: 'سنڌي' }
];

export type BilingualLayout = 'sideBySide' | 'stacked' | 'tabs';

// ============================================================================
// EVENT CONFIGURATION
// ============================================================================

export type EventType =
  | 'wedding'
  | 'engagement'
  | 'housewarming'
  | 'birthday'
  | 'anniversary'
  | 'baby-shower'
  | 'corporate'
  | 'festival'
  | 'custom';

export interface SubEvent {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  city: string;
  details?: string;
  dressCode?: string;
  mapLink?: string;
  requiresRsvp: boolean;
  colorTheme: string;
}

export interface IndianEventConfig {
  enabled: boolean;
  muhuratDate?: string;
  muhuratTime?: string;
  religiousSymbol?: 'ganesh' | 'om' | 'khanda' | 'cross' | 'moon' | 'swastika' | 'none';
  regionalGreeting?: string;
  showHaldi?: boolean;
}

export interface ReligiousSymbolOption {
  value: string;
  label: string;
}

export const RELIGIOUS_SYMBOLS: ReligiousSymbolOption[] = [
  { value: 'none', label: 'None' },
  { value: 'ganesh', label: 'Lord Ganesha (Hindu)' },
  { value: 'om', label: 'Om (Hindu/Spiritual)' },
  { value: 'khanda', label: 'Khanda (Sikh)' },
  { value: 'cross', label: 'Cross (Christian)' },
  { value: 'moon', label: 'Crescent Moon (Islamic)' },
  { value: 'swastika', label: 'Swastika (Vedic)' }
];

export const REGIONAL_GREETINGS = [
  { value: '', label: 'Select a traditional greeting...' },
  { value: '|| Shree Ganeshay Namah ||', label: 'Shree Ganeshay Namah' },
  { value: 'Om Namah Shivay', label: 'Om Namah Shivay' },
  { value: 'Waheguru Ji Ka Khalsa', label: 'Waheguru Ji Ka Khalsa' },
  { value: 'Bismillah ir-Rahman ir-Rahim', label: 'Bismillah ir-Rahman ir-Rahim' },
  { value: 'Jai Jinendra', label: 'Jai Jinendra' },
  { value: 'Subh Vivah', label: 'Subh Vivah (Generic)' },
  { value: 'Shubh Mangal', label: 'Shubh Mangal' }
];

// ============================================================================
// VISUAL CONFIGURATION
// ============================================================================

export interface SectionStyle {
  fontSize: string;
  color: string;
  fontFamily: string;
  fontWeight: string;
  italic: boolean;
  underline: boolean;
  uppercase: boolean;
  letterSpacing: string;
  textAlign: string;
}

export interface CardSection {
  id: string;
  text: string;
  translations?: Record<string, string>;
  style: SectionStyle;
}

export interface Template {
  id: string;
  name: string;
  category: EventType;
  previewUrl: string;
  bg: string;
  font: string;
  overlay: string;
  accent: string;
}

export type Tone = 'Formal' | 'Casual' | 'Poetic' | 'Witty' | 'Traditional' | 'Modern';

// ============================================================================
// MEDIA CONFIGURATION
// ============================================================================

export interface BackgroundMusic {
  type: 'upload' | 'library' | 'url';
  url: string;
  name?: string;
  volume: number;
  autoPlay: boolean;
  loop: boolean;
}

export interface VideoEmbed {
  type: 'upload' | 'youtube' | 'vimeo' | 'instagram';
  url: string;
  thumbnail?: string;
}

export interface AudioMessage {
  url: string;
  duration?: number;
}

export interface MediaConfig {
  backgroundMusic?: BackgroundMusic;
  video?: VideoEmbed;
  audioMessage?: AudioMessage;
}

// ============================================================================
// MAIN INVITATION TYPES
// ============================================================================

export type InviteStatus = 'draft' | 'published' | 'expired' | 'archived';

export interface DigitalInvite {
  id: string;
  userId: string;
  eventType: EventType;
  hostName: string;

  // Language Configuration
  primaryLang: string;
  secondaryLang?: string;
  bilingualEnabled: boolean;
  bilingualLayout: BilingualLayout;

  // Event Details
  date: string;
  time: string;
  venue: string;
  mapLink?: string;
  details: string;

  // Multi-Event
  multiEventEnabled: boolean;
  events: SubEvent[];

  // Configurations
  sections: CardSection[];
  indianConfig: IndianEventConfig;
  mediaConfig: MediaConfig;

  // Visual Settings
  templateId: string;
  customBg?: string;
  customFontFamily?: string;

  // Features
  showQr: boolean;
  showCountdown: boolean;
  showRsvp: boolean;
  autoExpiry: boolean;

  // Generated Content
  generatedText?: string;
  aiTone?: Tone;

  // Gallery
  galleryImages: string[];

  // Status
  status: InviteStatus;
  slug: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TEMPLATE SYSTEM
// ============================================================================

export interface SavedTemplate {
  id: string;
  userId?: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  isPublic: boolean;
  rating?: number;
  downloads?: number;
  creator?: string;
  data: Partial<DigitalInvite>;
  createdAt?: string;
}

// ============================================================================
// GUEST MANAGEMENT
// ============================================================================

export type GuestCategory = 'Family' | 'Friends' | 'Work' | 'VIP' | 'Other';
export type GuestStatus = 'Pending' | 'Accepted' | 'Declined';

export interface Guest {
  id: string;
  inviteId?: string;
  name: string;
  email: string;
  phone?: string;
  category: GuestCategory;
  status: GuestStatus;
  plusOnes: number;
  dietary?: string;
  isInvited: boolean;

  // Tracking
  lastContacted?: string;
  openCount: number;
  lastOpen?: string;
  deviceInfo?: string;
  location?: string;

  createdAt: string;
}

export interface GuestGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  guestIds: string[];
  createdAt: string;
}

export interface GuestImportData {
  name: string;
  email: string;
  phone?: string;
  category?: string;
}

// ============================================================================
// RSVP
// ============================================================================

export interface RSVPResponse {
  id: string;
  inviteId: string;
  guestId: string;
  response: GuestStatus;
  plusOnes: number;
  dietary?: string;
  message?: string;
  createdAt: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export type AnalyticsEventType = 'open' | 'click' | 'rsvp' | 'view' | 'share' | 'rsvp_response';

export interface AnalyticsEvent {
  id: string;
  inviteId: string;
  eventType: AnalyticsEventType;
  guestId?: string;
  metadata?: {
    device?: string;
    location?: string;
    referrer?: string;
  };
  createdAt: string;
}

// Extended Analytics type for dashboard - includes detailed tracking data
export interface Analytics extends AnalyticsEvent {
  date: string;
  eventType: AnalyticsEventType;
  ipAddress?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  city?: string;
  country?: string;
  userAgent?: string;
  referrer?: string;
}

export interface InviteAnalytics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalRsvped: number;
  openRate: number;
  clickRate: number;
  rsvpRate: number;
  timeline: TimelineDataPoint[];
  rsvpDistribution: RSVPDistribution[];
  deviceBreakdown: DeviceData[];
  geoData: GeoData[];
  guestActivity: GuestActivity[];
}

export interface TimelineDataPoint {
  date: string;
  sent: number;
  opens: number;
  rsvps: number;
}

export interface RSVPDistribution {
  name: GuestStatus;
  value: number;
  color: string;
}

export interface DeviceData {
  name: string;
  value: number;
}

export interface GeoData {
  city: string;
  count: number;
}

export interface GuestActivity {
  guestId: string;
  name: string;
  email: string;
  status: GuestStatus;
  openCount: number;
  lastOpen: string;
  device: string;
  location: string;
}

// ============================================================================
// CHECK-IN
// ============================================================================

export interface CheckIn {
  id: string;
  inviteId: string;
  guestId: string;
  checkedInAt: string;
  checkedInBy: string;
}

// ============================================================================
// SHARING
// ============================================================================

export type ShareChannel = 'whatsapp' | 'instagram' | 'email' | 'link';

export interface ShareConfig {
  channel: ShareChannel;
  inviteUrl: string;
  eventName: string;
  eventDate: string;
  message?: string;
}

// ============================================================================
// AI REQUESTS
// ============================================================================

export interface AiInviteRequest {
  tone: Tone;
  coupleDetails: string;
  venueDetails: string;
  language?: string;
  culturalContext?: string;
}

export interface AiInviteResponse {
  text: string;
  success: boolean;
  error?: string;
}

// ============================================================================
// REMINDERS
// ============================================================================

export type ReminderTriggerEvent = 'event_date' | 'rsvp_deadline';
export type ReminderTargetAudience = 'all' | 'pending' | 'accepted' | 'declined';
export type ReminderOffsetType = 'before' | 'after';

export interface ReminderRule {
  id: string;
  inviteId: string;
  name: string;
  daysOffset: number;
  offsetType: ReminderOffsetType;
  triggerEvent: ReminderTriggerEvent;
  targetAudience: ReminderTargetAudience;
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  message: string;
  isActive: boolean;
  nextRun?: string;
}

export interface NotificationLog {
  id: string;
  recipient: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'push';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  campaign: string;
}

// ============================================================================
// TRANSLATIONS
// ============================================================================

export interface InviteTranslations {
  saveDate: string;
  joinUs: string;
  rsvp: string;
  details: string;
  gallery: string;
  days: string;
  hrs: string;
  mins: string;
  map: string;
  count: string;
  submit: string;
  hosting: string;
  scan: string;
  itinerary: string;
}

export const TRANSLATIONS: Record<string, InviteTranslations> = {
  en: {
    saveDate: "Save the Date",
    joinUs: "Join us to celebrate",
    rsvp: "RSVP",
    details: "Event Details",
    gallery: "Gallery",
    days: "Days",
    hrs: "Hrs",
    mins: "Mins",
    map: "View on Map",
    count: "Number of Guests",
    submit: "Send Confirmation",
    hosting: "Hosting",
    scan: "Scan for Photos",
    itinerary: "Wedding Itinerary"
  },
  hi: {
    saveDate: "शुभ विवाह",
    joinUs: "हमारे जश्न में शामिल हों",
    rsvp: "आमंत्रण उत्तर",
    details: "कार्यक्रम विवरण",
    gallery: "तस्वीरें",
    days: "दिन",
    hrs: "घंटे",
    mins: "मिनट",
    map: "मैप देखें",
    count: "अतिथियों की संख्या",
    submit: "पुष्टि भेजें",
    hosting: "स्वागतकर्ता",
    scan: "फोटो के लिए स्कैन करें",
    itinerary: "विवाह कार्यक्रम"
  }
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const EVENT_CATEGORIES = [
  { id: 'wedding', name: 'Wedding', icon: '💍', label: 'Couple Names' },
  { id: 'engagement', name: 'Engagement', icon: '💑', label: 'Couple Names' },
  { id: 'housewarming', name: 'Housewarming', icon: '🏠', label: 'Family Name' },
  { id: 'birthday', name: 'Birthday', icon: '🎂', label: 'Birthday Person' },
  { id: 'anniversary', name: 'Anniversary', icon: '💕', label: 'Couple Names' },
  { id: 'baby-shower', name: 'Baby Shower', icon: '👶', label: 'Parents Names' },
  { id: 'corporate', name: 'Corporate', icon: '💼', label: 'Company Name' },
  { id: 'festival', name: 'Festival', icon: '🎉', label: 'Festival Name' },
  { id: 'custom', name: 'Custom Event', icon: '✨', label: 'Event Title' }
];

export const EVENT_PRESETS = [
  { name: 'Sangeet', color: '#8B5CF6' },
  { name: 'Mehendi', color: '#10B981' },
  { name: 'Haldi', color: '#F59E0B' },
  { name: 'Wedding', color: '#EF4444' },
  { name: 'Reception', color: '#3B82F6' },
  { name: 'Baraat', color: '#EC4899' }
];

export const THEME_COLORS = [
  '#FFFFFF', // White
  '#FEF3C7', // Amber 100
  '#FCD34D', // Amber 300 (Gold)
  '#FDBA74', // Orange 300 (Peach)
  '#F9A8D4', // Pink 300
  '#E5E7EB', // Gray 200 (Silver)
  '#9CA3AF', // Gray 400
  '#000000', // Black
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899'  // Pink
];

// ============================================================================
// FORM DEFAULTS
// ============================================================================

export const createDefaultInvite = (userId: string): Partial<DigitalInvite> => ({
  id: `invite_${Date.now()}`,
  userId,
  eventType: 'wedding',
  hostName: '',

  // Language Configuration
  primaryLang: 'en',
  secondaryLang: '',
  bilingualEnabled: false,
  bilingualLayout: 'tabs',

  // Event Details
  date: new Date().toISOString().split('T')[0],
  time: '18:30',
  venue: '',
  mapLink: '',
  details: '',

  // Multi-Event
  multiEventEnabled: false,
  events: [],

  // Configurations
  sections: [],
  indianConfig: {
    enabled: false,
    religiousSymbol: 'none',
    regionalGreeting: '',
    showHaldi: false
  },
  mediaConfig: {},

  // Visual Settings
  templateId: 'wc1',
  customBg: '',
  customFontFamily: '',

  // Features
  showQr: false,
  showCountdown: true,
  showRsvp: true,
  autoExpiry: false,

  // Gallery
  galleryImages: [],

  // Status
  status: 'draft',
  slug: '',

  // Timestamps
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface InviteListResponse {
  invites: DigitalInvite[];
  total: number;
  page: number;
  limit: number;
}

export interface GuestListResponse {
  guests: Guest[];
  total: number;
  stats: {
    total: number;
    accepted: number;
    declined: number;
    pending: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
