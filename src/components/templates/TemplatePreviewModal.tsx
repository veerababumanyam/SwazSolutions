/**
 * TemplatePreviewModal Component
 * Full template preview with theme showcase and block examples
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Download, User, Eye } from 'lucide-react';
import { VCardTemplate, LinkType } from '@/types/modernProfile.types';
import { useToast } from '@/contexts/ToastContext';

interface TemplatePreviewModalProps {
  template: VCardTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (templateId: string) => void;
}

const BLOCK_TYPE_ICONS: Record<LinkType, string> = {
  [LinkType.CLASSIC]: '🔗',
  [LinkType.HEADER]: '📝',
  [LinkType.GALLERY]: '🖼️',
  [LinkType.VIDEO_EMBED]: '🎬',
  [LinkType.CONTACT_FORM]: '📧',
  [LinkType.MAP_LOCATION]: '📍',
  [LinkType.FILE_DOWNLOAD]: '📥',
  [LinkType.CUSTOM_LINK]: '✨',
  // Deprecated types - kept for backward compatibility
  [LinkType.VIDEO_UPLOAD]: '📹',
  [LinkType.BOOKING]: '📅'
};

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  isOpen,
  onClose,
  onApply
}) => {
  const { showToast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'blocks'>('theme');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleApply = useCallback(async () => {
    if (!template) return;

    setIsApplying(true);
    try {
      // Trigger apply callback to open apply mode selection modal
      onApply(template.id);
      onClose();
    } catch (error) {
      showToast('Failed to apply template', 'error');
    } finally {
      setIsApplying(false);
    }
  }, [template, onApply, onClose, showToast]);

  if (!isOpen || !template) return null;

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
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {template.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {template.category && (
                  <>
                    <span className="capitalize">{template.category}</span>
                    {template.author && <span> • By {template.author}</span>}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close preview"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {template.description && (
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {template.description}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {template.usageCount !== undefined && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {template.usageCount}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Times Used
                  </p>
                </div>
              )}
              {template.rating !== undefined && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {template.rating.toFixed(1)}
                    </span>
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Average Rating
                  </p>
                </div>
              )}
              {template.isPremium && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                    Premium Template
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Full featured
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {template.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('theme')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'theme'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  Theme Preview
                </button>
                <button
                  onClick={() => setActiveTab('blocks')}
                  className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'blocks'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                  }`}
                >
                  Block Types
                </button>
              </div>
            </div>

            {/* Theme Preview Tab */}
            {activeTab === 'theme' && (
              <ThemePreview template={template} />
            )}

            {/* Blocks Preview Tab */}
            {activeTab === 'blocks' && (
              <BlocksPreview template={template} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex gap-3 justify-end sticky bottom-0">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <span className="animate-spin">⟳</span> Applying...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" /> Apply Template
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Theme Preview Component
const ThemePreview: React.FC<{ template: VCardTemplate }> = ({ template }) => {
  const defaultTheme = template.defaultTheme;

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Color Palette
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {defaultTheme?.accentColor && (
            <ColorSwatch
              label="Accent"
              color={defaultTheme.accentColor}
            />
          )}
          {defaultTheme?.buttons?.backgroundColor && (
            <ColorSwatch
              label="Button Background"
              color={defaultTheme.buttons.backgroundColor}
            />
          )}
          {defaultTheme?.buttons?.textColor && (
            <ColorSwatch
              label="Button Text"
              color={defaultTheme.buttons.textColor}
            />
          )}
          {defaultTheme?.socials?.color && (
            <ColorSwatch
              label="Social Icons"
              color={defaultTheme.socials.color}
            />
          )}
        </div>
      </div>

      {/* Typography */}
      {defaultTheme?.profile && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Typography
          </h3>
          <div className="space-y-4">
            {defaultTheme.profile.name && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4
                  style={{
                    fontFamily: defaultTheme.profile.name.family,
                    fontSize: `${defaultTheme.profile.name.size}rem`,
                    fontWeight: defaultTheme.profile.name.weight as any,
                    color: defaultTheme.profile.name.color
                  }}
                  className="font-bold mb-1"
                >
                  Your Name Here
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {defaultTheme.profile.name.family} • {defaultTheme.profile.name.weight}
                </p>
              </div>
            )}
            {defaultTheme.profile.profession && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p
                  style={{
                    fontFamily: defaultTheme.profile.profession.family,
                    fontSize: `${defaultTheme.profile.profession.size}rem`,
                    fontWeight: defaultTheme.profile.profession.weight as any,
                    color: defaultTheme.profile.profession.color
                  }}
                >
                  Professional Title
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {defaultTheme.profile.profession.family}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Button Styles */}
      {defaultTheme?.buttons && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Button Styles
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              style={{
                backgroundColor: defaultTheme.buttons.backgroundColor,
                color: defaultTheme.buttons.textColor,
                borderColor: defaultTheme.buttons.borderColor,
                borderWidth: defaultTheme.buttons.borderWidth,
                borderRadius: defaultTheme.buttons.shape === 'pill' ? '9999px' :
                             defaultTheme.buttons.shape === 'square' ? '0px' : '8px'
              }}
              className="px-6 py-2 font-medium transition-opacity hover:opacity-90"
            >
              Sample Button
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Color Swatch Component
const ColorSwatch: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  return (
    <div>
      <div
        className="w-full aspect-square rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        style={{ backgroundColor: color }}
      />
      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">
        {label}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
        {color}
      </p>
    </div>
  );
};

// Blocks Preview Component
const BlocksPreview: React.FC<{ template: VCardTemplate }> = ({ template }) => {
  const blocks = template.sections.flatMap(s => s.blocks);

  if (blocks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No block types configured for this template
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        This template includes {blocks.length} block types
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{BLOCK_TYPE_ICONS[block.type]}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                  {block.type.replace(/_/g, ' ').toLowerCase()}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {block.defaultTitle}
                </p>
                {block.helpText && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {block.helpText}
                  </p>
                )}
              </div>
              {block.required && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded">
                  Required
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
