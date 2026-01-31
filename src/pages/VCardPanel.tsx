/**
 * VCardPanel - Modern vCard Suite Phase 2 - Main Container
 * Unified vCard editor with split-screen layout, tab navigation, and save management
 * Accessible, responsive, and tracks unsaved changes across all tabs
 *
 * Replaces: LinksEditor, AppearanceEditor, ProfileDashboard (scattered pages)
 * New path: /profile (single unified interface)
 */

import React, { useState, useCallback, useEffect } from 'react';
import { ProfileProvider, useProfile } from '@/contexts/ProfileContext';
import { VCardEditorLayout } from '@/components/vcard/VCardEditorLayout';
import { useNavigate } from 'react-router-dom';
import { useProfileTab } from '@/hooks/useProfileTab';

type TabId = 'portfolio' | 'aesthetics' | 'insights';

interface SaveState {
  lastSavedAt: Date | null;
  lastSavedProfile: any;
  lastSavedLinks: any;
  lastSavedTheme: any;
}

/**
 * Inner component that uses ProfileContext
 * Separated to allow ProfileProvider to wrap the entire panel
 */
const VCardPanelContent: React.FC = () => {
  const { profile, links, theme, updateProfile, reorderLinks, setTheme } = useProfile();
  const navigate = useNavigate();
  const { currentTab, setTab } = useProfileTab();

  // Sync URL tab with local state
  const activeTab = currentTab as TabId;

  // Unsaved changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({
    lastSavedAt: null,
    lastSavedProfile: null,
    lastSavedLinks: null,
    lastSavedTheme: null,
  });

  // Initialize save state with current data
  useEffect(() => {
    if (profile && links && theme) {
      setSaveState({
        lastSavedAt: new Date(),
        lastSavedProfile: JSON.parse(JSON.stringify(profile)),
        lastSavedLinks: JSON.parse(JSON.stringify(links)),
        lastSavedTheme: JSON.parse(JSON.stringify(theme)),
      });
    }
  }, []); // Only on mount

  // Detect unsaved changes
  const checkForChanges = useCallback(() => {
    if (!profile || !links || !theme) return false;

    const profileChanged = JSON.stringify(profile) !== JSON.stringify(saveState.lastSavedProfile);
    const linksChanged = JSON.stringify(links) !== JSON.stringify(saveState.lastSavedLinks);
    const themeChanged = JSON.stringify(theme) !== JSON.stringify(saveState.lastSavedTheme);

    return profileChanged || linksChanged || themeChanged;
  }, [profile, links, theme, saveState]);

  // Update unsaved changes state
  useEffect(() => {
    setHasUnsavedChanges(checkForChanges());
  }, [checkForChanges]);

  // Handle browser close warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Save all changes
  const handleSave = useCallback(async () => {
    try {
      // TODO: Implement backend sync
      // await profileService.saveProfile({
      //   profile,
      //   links,
      //   theme
      // });

      // Update save state
      setSaveState({
        lastSavedAt: new Date(),
        lastSavedProfile: JSON.parse(JSON.stringify(profile)),
        lastSavedLinks: JSON.parse(JSON.stringify(links)),
        lastSavedTheme: JSON.parse(JSON.stringify(theme)),
      });

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      // TODO: Show toast error
    }
  }, [profile, links, theme]);

  // Cancel changes and revert
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      // Show confirmation dialog
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );

      if (!confirmed) return;
    }

    // Revert to last saved state
    if (saveState.lastSavedProfile) {
      // Re-fetch or reset to saved state
      // For now, just reset unsaved state
      setSaveState({
        ...saveState,
        lastSavedAt: new Date(),
      });
      setHasUnsavedChanges(false);
    }

    navigate('/profile/dashboard');
  }, [hasUnsavedChanges, saveState, navigate]);

  // Handle publish profile
  const handlePublish = useCallback(async (published: boolean) => {
    try {
      // TODO: Implement backend publish
      // await profileService.publishProfile(published);

      // Update save state
      setSaveState({
        lastSavedAt: new Date(),
        lastSavedProfile: JSON.parse(JSON.stringify(profile)),
        lastSavedLinks: JSON.parse(JSON.stringify(links)),
        lastSavedTheme: JSON.parse(JSON.stringify(theme)),
      });

      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to publish profile:', error);
      // TODO: Show toast error
    }
  }, [profile, links, theme]);

  return (
    <VCardEditorLayout
      activeTab={activeTab}
      onTabChange={(tab) => setTab(tab as TabId)}
      hasUnsavedChanges={hasUnsavedChanges}
      onUnsavedChange={setHasUnsavedChanges}
      profile={profile}
      links={links}
      theme={theme}
      lastSavedAt={saveState.lastSavedAt}
      onSave={handleSave}
      onCancel={handleCancel}
      onPublish={handlePublish}
    />
  );
};

/**
 * Main VCardPanel component with ProfileProvider wrapper
 * This is the page-level component accessed at /profile route
 */
export const VCardPanel: React.FC = () => {
  return (
    <ProfileProvider>
      <VCardPanelContent />
    </ProfileProvider>
  );
};

export default VCardPanel;
