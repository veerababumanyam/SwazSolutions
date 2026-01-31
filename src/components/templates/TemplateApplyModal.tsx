/**
 * TemplateApplyModal Component
 * Template application mode selection with options
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { VCardTemplate } from '@/types/modernProfile.types';
import { useToast } from '@/contexts/ToastContext';

interface TemplateApplyModalProps {
  template: VCardTemplate;
  hasExistingBlocks: boolean;
  isOpen: boolean;
  onClose: () => void;
  onApply: (
    mode: 'replace' | 'merge' | 'theme-only',
    options: ApplyOptions
  ) => Promise<void>;
}

interface ApplyOptions {
  keepExistingBlocks?: boolean;
  keepSocialProfiles?: boolean;
}

type ApplyMode = 'replace' | 'merge' | 'theme-only';

export const TemplateApplyModal: React.FC<TemplateApplyModalProps> = ({
  template,
  hasExistingBlocks,
  isOpen,
  onClose,
  onApply
}) => {
  const { showToast } = useToast();
  const [selectedMode, setSelectedMode] = useState<ApplyMode | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [keepExistingBlocks, setKeepExistingBlocks] = useState(true);
  const [keepSocialProfiles, setKeepSocialProfiles] = useState(true);

  const handleApply = useCallback(async () => {
    if (!selectedMode) return;

    // Validate replace mode confirmation
    if (selectedMode === 'replace' && !confirmReplace) {
      showToast('Please confirm you understand this will remove your current blocks', 'error');
      return;
    }

    setIsApplying(true);
    try {
      const options: ApplyOptions = {};

      if (selectedMode === 'merge') {
        options.keepExistingBlocks = keepExistingBlocks;
        options.keepSocialProfiles = keepSocialProfiles;
      }

      await onApply(selectedMode, options);
      showToast(`Template applied successfully (${selectedMode} mode)`, 'success');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply template';
      showToast(message, 'error');
    } finally {
      setIsApplying(false);
    }
  }, [selectedMode, confirmReplace, keepExistingBlocks, keepSocialProfiles, onApply, onClose, showToast]);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedMode(null);
      setConfirmReplace(false);
      setKeepExistingBlocks(true);
      setKeepSocialProfiles(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canApply = selectedMode && (selectedMode !== 'replace' || confirmReplace);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Apply Template
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How do you want to apply {template.name}?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose how the template should be applied to your profile
              </p>
            </div>

            {/* Mode Options */}
            <div className="space-y-4">
              {/* Replace Mode */}
              <ModeOption
                id="replace"
                title="Replace"
                description="Clear all current blocks and use template blocks"
                selected={selectedMode === 'replace'}
                onChange={() => setSelectedMode('replace')}
                icon={<AlertCircle className="w-5 h-5" />}
                iconColor="text-red-500"
              >
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      Warning: This action cannot be undone
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      All your current blocks will be removed and replaced with template blocks
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmReplace}
                      onChange={(e) => setConfirmReplace(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      I understand this will remove all my current blocks
                    </span>
                  </label>
                </div>
              </ModeOption>

              {/* Merge Mode */}
              {hasExistingBlocks && (
                <ModeOption
                  id="merge"
                  title="Merge"
                  description="Keep your blocks, apply template theme and add new block types"
                  selected={selectedMode === 'merge'}
                  onChange={() => setSelectedMode('merge')}
                  icon={<CheckCircle className="w-5 h-5" />}
                  iconColor="text-blue-500"
                  badge="Recommended"
                >
                  <div className="mt-4 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepExistingBlocks}
                        onChange={(e) => setKeepExistingBlocks(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Keep my existing blocks
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Your current blocks will remain and new template blocks will be added
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keepSocialProfiles}
                        onChange={(e) => setKeepSocialProfiles(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Keep my social profiles
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Your existing social links will not be affected
                        </p>
                      </div>
                    </label>
                  </div>
                </ModeOption>
              )}

              {/* Theme-Only Mode */}
              <ModeOption
                id="theme-only"
                title="Theme Only"
                description="Just apply the colors and fonts, keep everything else"
                selected={selectedMode === 'theme-only'}
                onChange={() => setSelectedMode('theme-only')}
                icon={<CheckCircle className="w-5 h-5" />}
                iconColor="text-green-500"
              >
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Only the visual styling from this template will be applied. All your content remains unchanged.
                  </p>
                </div>
              </ModeOption>
            </div>

            {/* Selected Mode Summary */}
            {selectedMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Mode:</strong> {getModeLabel(selectedMode)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  {getModeDescription(selectedMode, template)}
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex gap-3 justify-end sticky bottom-0">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!canApply || isApplying}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Apply Template'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Mode Option Component
interface ModeOptionProps {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  iconColor: string;
  badge?: string;
  children?: React.ReactNode;
}

const ModeOption: React.FC<ModeOptionProps> = ({
  id,
  title,
  description,
  selected,
  onChange,
  icon,
  iconColor,
  badge,
  children
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
          selected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-start gap-3">
          <input
            id={id}
            type="radio"
            checked={selected}
            onChange={onChange}
            className="mt-1 w-4 h-4 cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={iconColor}>{icon}</span>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {title}
              </h4>
              {badge && (
                <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {selected && children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-7 border-l-2 border-blue-300 dark:border-blue-700"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </div>
  );
};

// Helper Functions
function getModeLabel(mode: ApplyMode): string {
  switch (mode) {
    case 'replace':
      return 'Replace All Blocks';
    case 'merge':
      return 'Merge with Existing Content';
    case 'theme-only':
      return 'Apply Theme Only';
    default:
      return '';
  }
}

function getModeDescription(mode: ApplyMode, template: VCardTemplate): string {
  switch (mode) {
    case 'replace':
      return `${template.sections.flatMap(s => s.blocks).length} template blocks will replace your current content.`;
    case 'merge':
      return 'Your blocks will be preserved, new template blocks will be added, and the theme will be updated.';
    case 'theme-only':
      return `Only the template's colors, fonts, and styling will be applied to your profile.`;
    default:
      return '';
  }
}

export default TemplateApplyModal;
