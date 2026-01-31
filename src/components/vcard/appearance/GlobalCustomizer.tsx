/**
 * GlobalCustomizer - Global theme settings
 * Configures background, accent colors, social icons, and SEO settings
 */

import React, { useRef } from 'react';
import { Theme } from '@/types/modernProfile.types';
import { Image as ImageIcon, Palette, Sparkles, Search, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from '@/contexts/ProfileContext';
import { SectionHeader, ColorPicker, RangeSlider } from '../shared';

interface GlobalCustomizerProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const SOCIAL_ICON_STYLES = ['filled', 'outline', 'minimal', 'glass'] as const;
const BG_TYPES = ['color', 'gradient', 'image'] as const;

const GlobalCustomizer: React.FC<GlobalCustomizerProps> = ({ theme, onThemeChange }) => {
  const { profile, updateProfile } = useProfile();
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          onThemeChange({
            ...theme,
            bgType: 'image',
            bgValue: ev.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-10"
    >
      {/* Background Settings */}
      <div className="space-y-6">
        <SectionHeader icon={ImageIcon} title="Background" subtitle="Profile background" />

        {/* Background Type Selector */}
        <div className="flex gap-4 mb-4">
          {BG_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onThemeChange({ ...theme, bgType: type as any })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                theme.bgType === type
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Background Value Picker */}
        {theme.bgType !== 'image' && (
          <ColorPicker
            label={theme.bgType === 'gradient' ? 'Gradient Start' : 'Color'}
            value={theme.bgValue}
            onChange={(v) => onThemeChange({ ...theme, bgValue: v })}
          />
        )}

        {/* Image Background */}
        {theme.bgType === 'image' && (
          <div className="space-y-4">
            <div className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
              {theme.bgValue && theme.bgValue.startsWith('http') ? (
                <img src={theme.bgValue} className="w-full h-full object-cover" alt="bg" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ImageIcon size={24} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <Upload size={14} /> Change
                </button>
              </div>
            </div>
            <input
              ref={bgInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBgUpload}
            />

            {/* Background Effects */}
            {theme.bgConfig && (
              <>
                <RangeSlider
                  label="Blur"
                  value={theme.bgConfig.bgBlur}
                  min={0}
                  max={20}
                  step={1}
                  onChange={(v) =>
                    onThemeChange({
                      ...theme,
                      bgConfig: { ...theme.bgConfig!, bgBlur: v },
                    })
                  }
                  formatValue={(v) => `${v}px`}
                />
                <RangeSlider
                  label="Overlay Opacity"
                  value={theme.bgConfig.bgOverlay}
                  min={0}
                  max={0.9}
                  step={0.05}
                  onChange={(v) =>
                    onThemeChange({
                      ...theme,
                      bgConfig: { ...theme.bgConfig!, bgOverlay: v },
                    })
                  }
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Colors & Accents */}
      <div className="space-y-6">
        <SectionHeader icon={Palette} title="Colors & Accents" subtitle="Global color settings" />

        {/* Accent Color */}
        <div className="space-y-1">
          <ColorPicker
            label="Accent Color"
            value={theme.accentColor}
            onChange={(v) => onThemeChange({ ...theme, accentColor: v })}
          />
        </div>

        {/* Social Icons Section */}
        <div className="pt-6 border-t border-gray-200 dark:border-white/5">
          <SectionHeader icon={Sparkles} title="Social Icons" subtitle="Icon appearance" />
          <div className="grid grid-cols-4 gap-2 mb-4">
            {SOCIAL_ICON_STYLES.map((style) => (
              <button
                key={style}
                onClick={() =>
                  onThemeChange({
                    ...theme,
                    socials: { ...theme.socials, style: style as any },
                  })
                }
                className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                  theme.socials.style === style
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent'
                    : 'border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-400'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
          <ColorPicker
            label="Icon Color"
            value={theme.socials.color}
            onChange={(v) =>
              onThemeChange({
                ...theme,
                socials: { ...theme.socials, color: v },
              })
            }
          />
        </div>

        {/* SEO Settings */}
        <div className="pt-6 border-t border-gray-200 dark:border-white/5">
          <SectionHeader icon={Search} title="SEO Settings" subtitle="Search optimization" />
          <div className="space-y-4">
            {/* Meta Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Meta Title
              </label>
              <input
                type="text"
                value={profile.seo?.title || ''}
                onChange={(e) =>
                  updateProfile({ seo: { ...profile?.seo, title: e.target.value } as any })
                }
                placeholder="Page Title"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-white/20"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Meta Description
              </label>
              <textarea
                rows={3}
                value={profile.seo?.description || ''}
                onChange={(e) =>
                  updateProfile({ seo: { ...profile?.seo, description: e.target.value } as any })
                }
                placeholder="Description for search engines..."
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder-gray-400 dark:placeholder-white/20"
              />
            </div>

            {/* Keywords */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Keywords
              </label>
              <input
                type="text"
                value={profile.seo?.keywords || ''}
                onChange={(e) =>
                  updateProfile({ seo: { ...profile?.seo, keywords: e.target.value } as any })
                }
                placeholder="Separate with commas"
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-white/20"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalCustomizer;
