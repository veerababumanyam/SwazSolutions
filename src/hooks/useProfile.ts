// useProfile Hook (T050)
// Custom hook for profile state management and operations

import { useState, useEffect, useCallback } from 'react';
import { profileService, ProfileData } from '../services/profileService';

interface UseProfileReturn {
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  exists: boolean;
  saving: boolean;
  createProfile: (data: Partial<ProfileData>) => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  togglePublish: (published: boolean) => Promise<void>;
  checkUsername: (username: string) => Promise<{ available: boolean; suggestions?: string[] }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useProfile = (): UseProfileReturn => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  /**
   * Load user's profile on mount
   */
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getMyProfile();
      
      if (data) {
        setProfile(data);
        setExists(true);
      } else {
        setProfile(null);
        setExists(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new profile
   */
  const createProfile = useCallback(async (data: Partial<ProfileData>) => {
    try {
      setSaving(true);
      setError(null);
      const newProfile = await profileService.createProfile(data);
      setProfile(newProfile);
      setExists(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create profile';
      setError(message);
      throw err; // Re-throw for component-level handling
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Update existing profile
   */
  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    try {
      setSaving(true);
      setError(null);
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err; // Re-throw for component-level handling
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Delete profile
   */
  const deleteProfile = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      await profileService.deleteProfile();
      setProfile(null);
      setExists(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete profile';
      setError(message);
      throw err; // Re-throw for component-level handling
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Toggle publish status
   */
  const togglePublish = useCallback(async (published: boolean) => {
    try {
      setSaving(true);
      setError(null);
      const updatedProfile = await profileService.togglePublish(published);
      setProfile(updatedProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle publish status';
      setError(message);
      throw err; // Re-throw for component-level handling
    } finally {
      setSaving(false);
    }
  }, []);

  /**
   * Check username availability
   */
  const checkUsername = useCallback(async (username: string) => {
    try {
      setError(null);
      const result = await profileService.checkUsername(username);
      return {
        available: result.available,
        suggestions: result.suggestions,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check username';
      setError(message);
      throw err; // Re-throw for component-level handling
    }
  }, []);

  /**
   * Refresh profile data
   */
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    exists,
    saving,
    createProfile,
    updateProfile,
    deleteProfile,
    togglePublish,
    checkUsername,
    refreshProfile,
    clearError,
  };
};
