/**
 * Phase 2 Integration Example
 * Shows how to use TabNavigation and all three tabs together
 * This is a reference implementation - adapt to your needs
 */

import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { TabNavigation, PortfolioTab, AestheticsTab, InsightsTab } from '.';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, AlertCircle } from 'lucide-react';

/**
 * VCardEditorWithTabs - Complete editor with tabbed interface
 *
 * This component demonstrates the full Phase 2 implementation
 * with all three tabs and proper state management.
 */
const VCardEditorWithTabs: React.FC = () => {
  const {
    profile,
    links,
    theme,
    isLoading,
    error,
    fetchProfile,
    setTheme,
    saveThemeCustomization,
  } = useProfile();

  // Tab state
  const [activeTab, setActiveTab] = useState<'portfolio' | 'aesthetics' | 'insights'>('portfolio');

  // Track unsaved changes
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize profile data
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Handle save action
   * In a real implementation, this would sync all changes to the backend
   */
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement backend sync
      console.log('Saving profile...', {
        profile,
        links,
        theme,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle tab changes
   * Could add confirmation if there are unsaved changes
   */
  const handleTabChange = async (tab: 'portfolio' | 'aesthetics' | 'insights') => {
    if (isDirty) {
      // Optional: Show confirmation dialog
      console.warn('There are unsaved changes. Switching tabs anyway.');
    }
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black/50">
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30 px-6 py-4 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-red-900 dark:text-red-300">Error</h3>
            <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header with Save Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              vCard Editor
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Customize your digital profile
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold flex items-center gap-2 shadow-lg transition-colors"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        {/* Unsaved Changes Indicator */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-sm text-orange-900 dark:text-orange-300">
                You have unsaved changes
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasUnsavedChanges={isDirty}
        />

        {/* Tab Content - Animated */}
        <AnimatePresence mode="wait">
          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && profile && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PortfolioTab
                profile={profile}
                links={links}
                socials={profile.socials}
              />
            </motion.div>
          )}

          {/* Aesthetics Tab */}
          {activeTab === 'aesthetics' && (
            <motion.div
              key="aesthetics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AestheticsTab
                theme={theme}
                onThemeChange={(newTheme) => {
                  setTheme(newTheme);
                  setIsDirty(true);
                }}
              />
            </motion.div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && profile && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <InsightsTab profileId={String(profile.id || '')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Help Text */}
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4 border-t border-gray-200 dark:border-white/5">
          <p>Tip: Use arrow keys to navigate between tabs</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Minimal Example - Just the tabs without surrounding UI
 */
export const VCardEditorMinimal: React.FC = () => {
  const { profile, links, theme } = useProfile();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'aesthetics' | 'insights'>('portfolio');

  return (
    <div className="space-y-6">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'portfolio' && profile && (
        <PortfolioTab profile={profile} links={links} socials={profile.socials} />
      )}

      {activeTab === 'aesthetics' && (
        <AestheticsTab theme={theme} onThemeChange={() => {}} />
      )}

      {activeTab === 'insights' && profile && (
        <InsightsTab profileId={String(profile.id || '')} />
      )}
    </div>
  );
};

/**
 * Two-Column Layout Example - Editor on left, preview on right
 */
export const VCardEditorWithPreview: React.FC = () => {
  const { profile, links, theme } = useProfile();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'aesthetics' | 'insights'>('portfolio');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Editor */}
      <div className="lg:col-span-2 space-y-6">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'portfolio' && profile && (
          <PortfolioTab profile={profile} links={links} socials={profile.socials} />
        )}

        {activeTab === 'aesthetics' && (
          <AestheticsTab theme={theme} onThemeChange={() => {}} />
        )}

        {activeTab === 'insights' && profile && (
          <InsightsTab profileId={String(profile.id || '')} />
        )}
      </div>

      {/* Preview */}
      <div className="lg:col-span-1 sticky top-8">
        <div className="rounded-2xl bg-white dark:bg-white/10 p-6 border border-gray-200 dark:border-white/10">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Preview</h3>
          {profile && (
            <div className="space-y-4">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-16 h-16 rounded-full"
              />
              <h4 className="font-bold text-gray-900 dark:text-white">
                {profile.displayName}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {profile.profession}
              </p>
              {/* TODO: Embed actual profile preview */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VCardEditorWithTabs;
