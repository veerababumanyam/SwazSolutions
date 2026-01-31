/**
 * Preferences API Service
 * Handles all API calls for user preferences
 */

import {
  UserPreferences,
  PreferenceCategoryKey,
  UpdatePreferencesRequest,
  GetPreferencesResponse,
  UpdatePreferencesResponse,
} from '../types/preferences';

const API_BASE = '/api/users';

/**
 * Get all user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const response = await fetch(`${API_BASE}/preferences`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch preferences: ${response.statusText}`);
    }

    const data: GetPreferencesResponse = await response.json();
    return data.preferences;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw error;
  }
}

/**
 * Update a specific preference category
 */
export async function updatePreferences<T extends PreferenceCategoryKey>(
  category: T,
  settings: Partial<UserPreferences[T]>
): Promise<UserPreferences> {
  try {
    const payload: UpdatePreferencesRequest = {
      category,
      settings: settings as any,
    };

    const response = await fetch(`${API_BASE}/preferences`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update preferences: ${response.statusText}`);
    }

    const data: UpdatePreferencesResponse = await response.json();
    return data.preferences;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

/**
 * Update appearance preferences
 */
export async function updateAppearance(settings: any): Promise<UserPreferences> {
  return updatePreferences('appearance', settings);
}

/**
 * Update notification preferences
 */
export async function updateNotifications(settings: any): Promise<UserPreferences> {
  return updatePreferences('notifications', settings);
}

/**
 * Update music preferences
 */
export async function updateMusicPreferences(settings: any): Promise<UserPreferences> {
  return updatePreferences('music', settings);
}

/**
 * Update AI preferences
 */
export async function updateAIPreferences(settings: any): Promise<UserPreferences> {
  return updatePreferences('ai', settings);
}

/**
 * Update privacy preferences (within preferences page)
 */
export async function updatePrivacyPreferences(settings: any): Promise<UserPreferences> {
  return updatePreferences('privacy', settings);
}

/**
 * Update general preferences
 */
export async function updateGeneralPreferences(settings: any): Promise<UserPreferences> {
  return updatePreferences('general', settings);
}
