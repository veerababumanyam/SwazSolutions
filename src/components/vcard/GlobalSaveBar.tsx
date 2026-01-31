/**
 * GlobalSaveBar - Sticky bottom save/publish bar
 *
 * Features:
 * - Fixed position at bottom of page with semi-transparent dark background
 * - Unsaved changes indicator (orange dot + text)
 * - Action buttons: Cancel, Save, Publish
 * - Loading states with spinner
 * - Confirmation dialog on cancel
 * - Keyboard shortcut (Ctrl/Cmd+S) to save
 * - Toast notifications for success/error
 * - Dark mode support
 * - Mobile-responsive (auto-hide on very small screens)
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Save, X, Globe, AlertCircle } from 'lucide-react';
import { AccessibleButton } from '@/components/common/AccessibleButton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';

interface GlobalSaveBarProps {
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Whether the profile is published */
  isPublished: boolean;
  /** Whether currently saving */
  isSaving?: boolean;
  /** Callback to save profile */
  onSave: () => Promise<void>;
  /** Callback to cancel changes */
  onCancel: () => void;
  /** Callback to toggle publish status */
  onPublish: (published: boolean) => Promise<void>;
}

/**
 * GlobalSaveBar Component
 * Provides save/cancel/publish actions at the bottom of the editor
 */
export const GlobalSaveBar: React.FC<GlobalSaveBarProps> = ({
  hasUnsavedChanges,
  isPublished,
  isSaving = false,
  onSave,
  onCancel,
  onPublish,
}) => {
  const { showToast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving && !isPublishing) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, isSaving, isPublishing]);

  const handleSave = useCallback(async () => {
    try {
      await onSave();
      showToast('Profile saved successfully', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save profile',
        'error'
      );
    }
  }, [onSave, showToast]);

  const handleCancelClick = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  }, [hasUnsavedChanges, onCancel]);

  const handleConfirmCancel = useCallback(async () => {
    setShowCancelConfirm(false);
    onCancel();
  }, [onCancel]);

  const handlePublish = useCallback(async () => {
    try {
      setIsPublishing(true);
      await onPublish(!isPublished);
      showToast(
        isPublished ? 'Profile unpublished' : 'Profile published successfully',
        'success'
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update publish status',
        'error'
      );
    } finally {
      setIsPublishing(false);
    }
  }, [isPublished, onPublish, showToast]);

  // Hide on very small screens to avoid keyboard interference
  useEffect(() => {
    const handleResize = () => {
      setIsHidden(window.innerHeight < 500);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isHidden) {
    return null;
  }

  return (
    <>
      {/* Save Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-700/50 dark:border-white/5 px-4 py-4 transition-all duration-300"
        role="region"
        aria-label="Save changes bar"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Unsaved changes indicator */}
          <div className="flex items-center gap-2 text-sm">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-orange-400">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse"
                  aria-label="Unsaved changes"
                />
                <span className="text-gray-200">Unsaved changes</span>
              </div>
            )}
            {!hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-gray-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">All changes saved</span>
              </div>
            )}
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            {/* Cancel button */}
            <AccessibleButton
              variant="ghost"
              size="md"
              onClick={handleCancelClick}
              disabled={isSaving || isPublishing}
              aria-label="Cancel changes"
              className="text-gray-400 hover:text-gray-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </AccessibleButton>

            {/* Publish toggle */}
            <AccessibleButton
              variant="ghost"
              size="md"
              onClick={handlePublish}
              loading={isPublishing}
              disabled={isSaving || isPublishing}
              aria-label={isPublished ? 'Unpublish profile' : 'Publish profile'}
              className={
                isPublished
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }
            >
              <Globe className="w-4 h-4" />
              {isPublished ? 'Published' : 'Publish'}
            </AccessibleButton>

            {/* Save button */}
            <AccessibleButton
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={isSaving}
              disabled={!hasUnsavedChanges || isSaving || isPublishing}
              aria-label="Save profile changes"
              className="ml-2"
            >
              <Save className="w-4 h-4" />
              Save
            </AccessibleButton>
          </div>
        </div>

        {/* Keyboard hint (mobile-hidden) */}
        <div className="hidden md:block mt-2 text-xs text-gray-500 text-center">
          Press Ctrl+S / Cmd+S to save
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <ConfirmDialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        variant="warning"
        confirmText="Discard"
        cancelText="Keep editing"
      />

      {/* Spacer to prevent content overlap */}
      {!isHidden && <div className="h-20" />}
    </>
  );
};

export default GlobalSaveBar;
