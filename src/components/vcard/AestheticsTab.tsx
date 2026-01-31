/**
 * AestheticsTab - Theme and appearance customization
 * Combines template system, theme gallery, typography editor, and background settings
 */

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Theme, VCardTemplate } from '@/types/modernProfile.types';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/contexts/ToastContext';
import {
  TypographyEditor,
} from './shared';
import { ThemeGallery, GlobalCustomizer } from './appearance';
import { TemplateGallery } from '../templates/TemplateGallery';
import { TemplatePreviewModal } from '../templates/TemplatePreviewModal';
import { TemplateApplyModal } from '../templates/TemplateApplyModal';

interface AestheticsTabProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const AestheticsTab: React.FC<AestheticsTabProps> = ({ theme, onThemeChange }) => {
  const { saveThemeCustomization, links } = useProfile();
  const { showToast } = useToast();

  // Template system state
  const [previewingTemplate, setPreviewingTemplate] = useState<VCardTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showApplyMode, setShowApplyMode] = useState(false);
  const [appliedTemplate, setAppliedTemplate] = useState<VCardTemplate | null>(null);

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

  /**
   * Handle template preview
   */
  const handlePreviewTemplate = useCallback((templateId: string) => {
    // Fetch template details and show preview
    // For now, create a mock template for demonstration
    const mockTemplate: VCardTemplate = {
      id: templateId,
      name: 'Template',
      description: 'Template description',
      category: 'personal',
      isPremium: false,
      isFeatured: false,
      version: '1.0',
      tags: [],
      sections: [],
      usageCount: 0,
      rating: 5
    };
    setPreviewingTemplate(mockTemplate);
    setShowPreview(true);
  }, []);

  /**
   * Handle template application
   */
  const handleApplyTemplate = useCallback(async (
    mode: 'replace' | 'merge' | 'theme-only',
    options: any
  ) => {
    if (!previewingTemplate) return;

    try {
      // Apply template based on mode
      // TODO: Implement actual template application logic
      // This would involve syncing with the backend API

      if (mode === 'theme-only' && previewingTemplate.defaultTheme) {
        // Apply only theme
        const updatedTheme: Theme = {
          ...theme,
          ...previewingTemplate.defaultTheme
        };
        onThemeChange(updatedTheme);
        await saveThemeCustomization(updatedTheme.id, updatedTheme);
      } else if (mode === 'replace' || mode === 'merge') {
        // TODO: Apply blocks according to mode
        // This requires updating the profile links via context
      }

      setAppliedTemplate(previewingTemplate);
      showToast(`${previewingTemplate.name} applied successfully!`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply template';
      showToast(message, 'error');
      throw error;
    }
  }, [previewingTemplate, theme, onThemeChange, saveThemeCustomization, showToast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* Template System Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Browse Templates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose from 15+ professional templates to get started with your profile
            </p>
          </div>
        </div>

        {appliedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800"
          >
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              <span className="font-bold">Currently using:</span> {appliedTemplate.name}
            </p>
            <button
              onClick={() => setShowPreview(true)}
              className="text-xs text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 mt-2 underline"
            >
              Browse other templates
            </button>
          </motion.div>
        )}
      </div>

      {/* Template Gallery */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <TemplateGallery
          onApplyTemplate={(templateId) => {
            handlePreviewTemplate(templateId);
            setShowApplyMode(true);
          }}
          onPreviewTemplate={handlePreviewTemplate}
        />
      </div>

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

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewingTemplate}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onApply={() => {
          setShowPreview(false);
          setShowApplyMode(true);
        }}
      />

      {/* Template Apply Mode Modal */}
      {previewingTemplate && (
        <TemplateApplyModal
          template={previewingTemplate}
          hasExistingBlocks={links && links.length > 0}
          isOpen={showApplyMode}
          onClose={() => setShowApplyMode(false)}
          onApply={handleApplyTemplate}
        />
      )}
    </motion.div>
  );
};

export default AestheticsTab;
