/**
 * Browser Storage Utilities for Persistent Data
 * Handles API Keys, Chat History, User Preferences, and Settings
 * Updated for Language Persistence
 */

export interface StorageKeys {
  API_KEY: 'swaz_gemini_api_key';
  CHAT_HISTORY: 'swaz_chat_history';
  USER_PREFERENCES: 'swaz_user_preferences';
  HQ_TAGS: 'swaz_hq_tags';
  LAST_SETTINGS: 'swaz_last_settings';
}

export const STORAGE_KEYS: StorageKeys = {
  API_KEY: 'swaz_gemini_api_key',
  CHAT_HISTORY: 'swaz_chat_history',
  USER_PREFERENCES: 'swaz_user_preferences',
  HQ_TAGS: 'swaz_hq_tags',
  LAST_SETTINGS: 'swaz_last_settings'
};

/**
 * Safely get item from localStorage with error handling
 * Handles migration from plain string values to JSON-stringified values
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;

    try {
      // Try parsing as JSON first
      return JSON.parse(item);
    } catch (parseError) {
      // If parsing fails and the default is a string type, return the raw value
      // This handles legacy API keys stored as plain strings
      if (typeof defaultValue === 'string') {
        return item as T;
      }
      throw parseError;
    }
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Safely set item in localStorage with error handling
 */
export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (${key}):`, error);
  }
};

/**
 * Clear all app-related storage (for reset functionality)
 */
export const clearAppStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
};

/**
 * Chat History Management
 */
export interface ChatMessage {
  role: 'user' | 'ai' | 'log';
  content: string;
  timestamp: number;
}

const MAX_CHAT_HISTORY = 100; // Keep last 100 messages

export const saveChatHistory = (messages: ChatMessage[]): boolean => {
  // Keep only recent messages to avoid storage limits
  const trimmed = messages.slice(-MAX_CHAT_HISTORY);
  return setStorageItem(STORAGE_KEYS.CHAT_HISTORY, trimmed);
};

export const loadChatHistory = (): ChatMessage[] => {
  return getStorageItem<ChatMessage[]>(STORAGE_KEYS.CHAT_HISTORY, []);
};

export const clearChatHistory = (): void => {
  removeStorageItem(STORAGE_KEYS.CHAT_HISTORY);
};

/**
 * User Preferences Management
 */
export interface UserPreferences {
  hqTags: string[];
  defaultModel: string;
  autoSave: boolean;
  theme: string;
  fontSize: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  hqTags: ['High Fidelity', 'Masterpiece', 'Studio Quality'],
  defaultModel: 'gemini-2.5-flash',
  autoSave: true,
  theme: 'system',
  fontSize: 14
};

export const saveUserPreferences = (prefs: Partial<UserPreferences>): boolean => {
  const current = loadUserPreferences();
  const updated = { ...current, ...prefs };
  return setStorageItem(STORAGE_KEYS.USER_PREFERENCES, updated);
};

export const loadUserPreferences = (): UserPreferences => {
  return getStorageItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
};

/**
 * API Key Management
 */
export const saveApiKey = (key: string): boolean => {
  if (!key || key.trim().length === 0) {
    removeStorageItem(STORAGE_KEYS.API_KEY);
    return false;
  }
  return setStorageItem(STORAGE_KEYS.API_KEY, key.trim());
};

export const loadApiKey = (): string => {
  return getStorageItem<string>(STORAGE_KEYS.API_KEY, '');
};

export const clearApiKey = (): void => {
  removeStorageItem(STORAGE_KEYS.API_KEY);
};

/**
 * Validate API Key format
 */
export const isValidApiKey = (key: string): boolean => {
  // Gemini API keys start with "AIza" and are typically 39 characters
  return key.startsWith('AIza') && key.length >= 35;
};

/**
 * Storage size estimation
 */
export const getStorageSize = (): number => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total; // bytes
};

/**
 * Check if storage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};
/**
 * Last Used Settings Management (Language, etc.)
 */
export interface LastSettings {
  language?: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

export const saveLastSettings = (settings: Partial<LastSettings>): boolean => {
  const current = loadLastSettings();
  const updated = { ...current, ...settings };
  return setStorageItem(STORAGE_KEYS.LAST_SETTINGS, updated);
};

export const loadLastSettings = (): LastSettings => {
  return getStorageItem<LastSettings>(STORAGE_KEYS.LAST_SETTINGS, {});
};
