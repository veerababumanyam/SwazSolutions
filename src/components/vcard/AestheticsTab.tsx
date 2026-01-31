/**
 * AestheticsTab - Theme and appearance customization
 * Combines theme gallery, typography editor, and background settings
 */

import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Theme } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';
import {
  ThemeGallery,
  TypographyEditor,
} from './shared';
import GlobalCustomizer from './appearance/GlobalCustomizer';

interface AestheticsTabProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const AestheticsTab: React.FC<AestheticsTabProps> = ({ theme, onThemeChange }) => {
  const { saveThemeCustomization } = useProfile();

  /**
   * Handle theme selection from gallery
   */
  const handleThemeSelect = useCallback(
    async (selectedTheme: Theme) => {
      try {
        onThemeChange(selectedTheme);
        await saveThemeCustomization(selectedTheme.id, selectedTheme);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    },
    [onThemeChange, saveThemeCustomization]
  );

  /**
   * Handle theme customization changes
   */
  const handleThemeCustomize = useCallback(
    async (updatedTheme: Theme) => {
      try {
        onThemeChange(updatedTheme);
        await saveThemeCustomization(updatedTheme.id, updatedTheme);
      } catch (error) {
        console.error('Failed to save customization:', error);
      }
    },
    [onThemeChange, saveThemeCustomization]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Theme Gallery */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <ThemeGallery
          selectedTheme={theme}
          onThemeSelect={handleThemeSelect}
        />
      </div>

      {/* Typography Editor */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <TypographyEditor
          typography={theme.profile}
          onTypographyChange={(profile) =>
            handleThemeCustomize({
              ...theme,
              profile,
            })
          }
        />
      </div>

      {/* Global Customizer (Background, Colors, Accents) */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <GlobalCustomizer
          theme={theme}
          onThemeChange={handleThemeCustomize}
        />
      </div>
    </motion.div>
  );
};

export default AestheticsTab;
