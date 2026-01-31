/**
 * User Preferences Types
 * Defines all preference categories and interfaces for the Preferences Page
 */

export interface AppearancePreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  reduceMotion: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  duration: number; // milliseconds, 1000-10000
}

export interface MusicPreferences {
  autoplay: boolean;
  crossfadeDuration: number; // 0-10 seconds
  volumeNormalization: boolean;
  downloadQuality: 'low' | 'medium' | 'high' | 'lossless';
}

export interface AIPreferences {
  defaultLanguage: string;
  defaultCeremony: string;
  temperaturePreference: 'precise' | 'balanced' | 'creative';
  autoSaveDrafts: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private';
  analyticsTracking: boolean;
  activityStatus: boolean;
}

export interface GeneralPreferences {
  language: string;
  dateFormat: string;
  timezone: string;
}

export interface UserPreferences {
  appearance: AppearancePreferences;
  notifications: NotificationPreferences;
  music: MusicPreferences;
  ai: AIPreferences;
  privacy: PrivacyPreferences;
  general: GeneralPreferences;
}

/**
 * Category identifiers for preference updates
 */
export type PreferenceCategoryKey = keyof UserPreferences;

/**
 * API Response types
 */
export interface GetPreferencesResponse {
  preferences: UserPreferences;
}

export interface UpdatePreferencesRequest {
  category: PreferenceCategoryKey;
  settings: Partial<UserPreferences[PreferenceCategoryKey]>;
}

export interface UpdatePreferencesResponse {
  success: boolean;
  message: string;
  preferences: UserPreferences;
}
