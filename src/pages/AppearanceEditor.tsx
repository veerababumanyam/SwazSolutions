/**
 * AppearanceEditor - Theme customization page
 * Ported from reference vCard app with adaptations for Swaz theme system
 * Features: 50+ themes, typography editor, button customization, background settings, SEO
 */

import React, { useState, useRef } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { THEMES } from '@/constants/themes';
import { ThemeCategory, Typography, ButtonStyle, Theme } from '@/types/modernProfile.types';
import { Check, Image as ImageIcon, Upload, Type, Bold, Italic, Underline, Palette, Sliders, Layout, MousePointer2, Heading, User, AlignLeft, CaseUpper, Minus, Plus, Type as TypeIcon, Globe, Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';

const CATEGORIES: ThemeCategory[] = ['All', 'Wedding', 'Photography', 'Makeup', 'Fashion', 'Fitness', 'Music', 'Business', 'Creator'];

const FONTS = [
    { name: 'Inter', label: 'Inter' },
    { name: 'DM Sans', label: 'DM Sans' },
    { name: 'Space Grotesk', label: 'Space Grotesk' },
    { name: 'Playfair Display', label: 'Playfair' },
    { name: 'Cinzel', label: 'Cinzel' },
    { name: 'Caveat', label: 'Caveat' },
    { name: 'EB Garamond', label: 'Garamond' },
    { name: 'Lora', label: 'Lora' },
    { name: 'Merriweather', label: 'Merriweather' },
];

const WEIGHTS = [
    { value: 'normal', label: 'Regular' },
    { value: 'bold', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
];

// --- Sub-components ---

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-white/5">
        <Icon size={18} className="text-blue-500" />
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
    </div>
);

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="flex items-center justify-between py-2 group">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
    <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-gray-400 dark:text-white/30 uppercase hidden sm:block">{value}</span>
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/20 shadow-sm transition-transform hover:scale-110 active:scale-95">
            <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-[-50%] w-[200%] h-[200%] p-0 cursor-pointer border-none"
            />
        </div>
    </div>
  </div>
);

const RangeSlider = ({ label, value, min, max, step, onChange, formatValue }: { label: string, value: number, min: number, max: number, step: number, onChange: (val: number) => void, formatValue?: (v: number) => string }) => (
    <div className="space-y-3 py-2">
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-mono text-gray-400 dark:text-white/40">{formatValue ? formatValue(value) : value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
        />
    </div>
);

const ToggleGroup = ({ label, children }: { label?: string, children?: React.ReactNode }) => (
    <div className="space-y-2">
        {label && <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>}
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/5">
            {children}
        </div>
    </div>
);

const ToggleItem = ({ active, onClick, icon: Icon, title }: { active: boolean, onClick: () => void, icon: any, title?: string }) => (
    <button
        onClick={onClick}
        title={title}
        className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all duration-200 ${
            active
            ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm'
            : 'text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white/70'
        }`}
    >
        <Icon size={16} strokeWidth={active ? 2.5 : 2} />
    </button>
);

const TypographyEditor = ({ config, onChange }: { config: Typography, onChange: (c: Typography) => void }) => {
    return (
        <div className="space-y-5">
            {/* Font Family & Weight Row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Font</label>
                    <div className="relative">
                        <select
                            value={config.family}
                            onChange={(e) => onChange({...config, family: e.target.value})}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white appearance-none focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                            {FONTS.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <TypeIcon size={12} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight</label>
                     <div className="relative">
                        <select
                            value={config.weight}
                            onChange={(e) => onChange({...config, weight: e.target.value as any})}
                            className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white appearance-none focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                            {WEIGHTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Color */}
            <ColorPicker label="Text Color" value={config.color} onChange={(val) => onChange({...config, color: val})} />

            {/* Size Slider */}
            <RangeSlider
                label="Size Scale"
                value={config.size}
                min={0.5}
                max={3.0}
                step={0.1}
                onChange={(val) => onChange({...config, size: val})}
                formatValue={(v) => `${v}x`}
            />

            {/* Letter Spacing */}
            {config.letterSpacing !== undefined && (
                 <RangeSlider
                    label="Letter Spacing"
                    value={parseFloat(config.letterSpacing) || 0}
                    min={-0.1}
                    max={0.5}
                    step={0.01}
                    onChange={(val) => onChange({...config, letterSpacing: `${val}em`})}
                    formatValue={(v) => `${v.toFixed(2)}em`}
                />
            )}

            {/* Style Toggles */}
            <ToggleGroup>
                <ToggleItem
                    active={config.transform === 'uppercase'}
                    onClick={() => onChange({...config, transform: config.transform === 'uppercase' ? 'none' : 'uppercase'})}
                    icon={CaseUpper}
                    title="Uppercase"
                />
                <ToggleItem
                    active={config.style === 'italic'}
                    onClick={() => onChange({...config, style: config.style === 'italic' ? 'normal' : 'italic'})}
                    icon={Italic}
                    title="Italic"
                />
                 <ToggleItem
                    active={config.decoration === 'underline'}
                    onClick={() => onChange({...config, decoration: config.decoration === 'underline' ? 'none' : 'underline'})}
                    icon={Underline}
                    title="Underline"
                />
            </ToggleGroup>
        </div>
    );
}

// --- Main Component ---

const AppearanceEditor: React.FC = () => {
  const { theme, setTheme, profile, updateProfile } = useProfile();
  const { trigger } = useHaptic();
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('All');
  const [activeTab, setActiveTab] = useState<'profile' | 'blocks' | 'global'>('profile');
  const bgInputRef = useRef<HTMLInputElement>(null);

  const filteredThemes = activeCategory === 'All' ? THEMES : THEMES.filter(t => t.category === activeCategory);

  const updateProfileTypography = (key: keyof typeof theme.profile, newConfig: Typography) => {
     setTheme({
       ...theme,
       profile: { ...theme.profile, [key]: newConfig }
     });
  };

  const updateButtons = (key: keyof ButtonStyle, val: any) => {
      setTheme({ ...theme, buttons: { ...theme.buttons, [key]: val } });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setTheme({ ...theme, bgType: 'image', bgValue: ev.target.result as string });
              }
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* 1. Theme Gallery */}
      <section>
        <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-gray-900 dark:bg-white rounded-lg text-white dark:text-black">
                     <Layout size={20} />
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Themes</h2>
             </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-6">
            {CATEGORIES.map(cat => (
                <button
                    key={cat}
                    onClick={() => { trigger(5); setActiveCategory(cat); }}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeCategory === cat
                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white shadow-md transform scale-105'
                            : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/30'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredThemes.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { trigger(10); setTheme(t); }}
              className={`group relative aspect-[9/16] rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 ${theme.id === t.id ? 'ring-[3px] ring-blue-500 ring-offset-4 ring-offset-white dark:ring-offset-black scale-[1.02]' : 'hover:shadow-xl hover:-translate-y-1 opacity-80 hover:opacity-100'}`}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{
                  background: t.bgType === 'color' || t.bgType === 'gradient' ? t.bgValue : `url(${t.bgValue}) center/cover`,
                  filter: t.bgConfig ? `blur(${t.bgConfig.bgBlur}px)` : 'none'
                }}
              />
              {/* Mock UI in Card */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-2 z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/20" />
                <div className="w-16 h-2 rounded-full bg-white/40 backdrop-blur-sm" />
                <div className="w-full h-8 mt-2 opacity-90 shadow-sm" style={{ background: t.buttons.backgroundColor, borderRadius: t.buttons.shape === 'pill' ? 99 : 8 }} />
                <div className="w-full h-8 opacity-70 shadow-sm" style={{ background: t.buttons.backgroundColor, borderRadius: t.buttons.shape === 'pill' ? 99 : 8 }} />
              </div>

              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-8 text-white text-[10px] font-bold text-center uppercase tracking-widest z-20">
                {t.name}
              </div>

              {theme.id === t.id && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg z-30">
                      <Check size={12} strokeWidth={3} />
                  </div>
              )}
            </motion.button>
          ))}
        </div>
      </section>

      {/* 2. Customization Deck */}
      <section className="bg-white dark:bg-[#1c1c1e] rounded-[32px] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
         {/* Tabs */}
         <div className="flex border-b border-gray-100 dark:border-white/5 p-2 bg-gray-50 dark:bg-black/20">
             {[
                {id: 'profile', label: 'Profile', icon: User},
                {id: 'blocks', label: 'Blocks', icon: Layout},
                {id: 'global', label: 'Global', icon: Globe}
             ].map(tab => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                    <button
                        key={tab.id}
                        onClick={() => { trigger(5); setActiveTab(tab.id as any); }}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            isActive
                            ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                    >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                    </button>
                 );
             })}
         </div>

         <div className="p-6 md:p-8 min-h-[400px]">
             <AnimatePresence mode="wait">
                 {activeTab === 'profile' && (
                     <motion.div
                        key="profile"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-white/5"
                     >
                         <div className="pb-8 md:pb-0 md:pr-4">
                             <SectionHeader icon={Heading} title="Name" />
                             <TypographyEditor config={theme.profile.name} onChange={(c) => updateProfileTypography('name', c)} />
                         </div>
                         <div className="py-8 md:py-0 md:px-4">
                             <SectionHeader icon={User} title="Profession" />
                             <TypographyEditor config={theme.profile.profession} onChange={(c) => updateProfileTypography('profession', c)} />
                         </div>
                         <div className="pt-8 md:pt-0 md:pl-4">
                             <SectionHeader icon={AlignLeft} title="Bio" />
                             <TypographyEditor config={theme.profile.bio} onChange={(c) => updateProfileTypography('bio', c)} />
                         </div>
                     </motion.div>
                 )}

                 {activeTab === 'blocks' && (
                     <motion.div
                        key="blocks"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                     >
                        {/* Buttons Config */}
                         <div className="space-y-6">
                             <SectionHeader icon={MousePointer2} title="Buttons" />

                             <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Shape</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['rounded', 'pill', 'square', 'glass', 'outline'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => updateButtons('shape', s)}
                                            className={`h-10 border rounded-lg flex items-center justify-center transition-all ${
                                                theme.buttons.shape === s
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                                : 'border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:border-gray-400'
                                            }`}
                                            title={s}
                                        >
                                            <div className={`w-4 h-4 border-2 border-current ${
                                                s === 'rounded' ? 'rounded-md' :
                                                s === 'pill' ? 'rounded-full' :
                                                s === 'square' ? 'rounded-none' : 'rounded-sm'
                                            }`} />
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div className="space-y-1">
                                 <ColorPicker label="Background" value={theme.buttons.backgroundColor} onChange={(v) => updateButtons('backgroundColor', v)} />
                                 <ColorPicker label="Text" value={theme.buttons.textColor} onChange={(v) => updateButtons('textColor', v)} />
                                 <ColorPicker label="Border" value={theme.buttons.borderColor} onChange={(v) => updateButtons('borderColor', v)} />
                                 {theme.buttons.shadowColor && (
                                     <ColorPicker label="Shadow" value={theme.buttons.shadowColor} onChange={(v) => updateButtons('shadowColor', v)} />
                                 )}
                             </div>

                             <RangeSlider
                                label="Border Width"
                                value={theme.buttons.borderWidth}
                                min={0} max={4} step={0.5}
                                onChange={(v) => updateButtons('borderWidth', v)}
                                formatValue={(v) => `${v}px`}
                             />
                         </div>

                         {/* Headers Config */}
                         <div>
                             <SectionHeader icon={Type} title="Section Headers" />
                             <TypographyEditor config={theme.headers} onChange={(c) => setTheme({...theme, headers: c})} />
                         </div>
                     </motion.div>
                 )}

                 {activeTab === 'global' && (
                     <motion.div
                        key="global"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-10"
                     >
                         <div className="space-y-6">
                             <SectionHeader icon={ImageIcon} title="Background" />

                             <div className="flex gap-4 mb-4">
                                 {['color', 'gradient', 'image'].map(type => (
                                     <button
                                        key={type}
                                        onClick={() => setTheme({...theme, bgType: type as any})}
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

                             {theme.bgType !== 'image' && (
                                 <ColorPicker label={theme.bgType === 'gradient' ? 'Gradient Start' : 'Color'} value={theme.bgValue} onChange={(v) => setTheme({...theme, bgValue: v})} />
                             )}

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
                                     <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />

                                     {theme.bgConfig && (
                                         <>
                                            <RangeSlider label="Blur" value={theme.bgConfig.bgBlur} min={0} max={20} step={1} onChange={(v) => setTheme({...theme, bgConfig: {...theme.bgConfig!, bgBlur: v}})} formatValue={(v) => `${v}px`} />
                                            <RangeSlider label="Overlay Opacity" value={theme.bgConfig.bgOverlay} min={0} max={0.9} step={0.05} onChange={(v) => setTheme({...theme, bgConfig: {...theme.bgConfig!, bgOverlay: v}})} formatValue={(v) => `${Math.round(v * 100)}%`} />
                                         </>
                                     )}
                                 </div>
                             )}
                         </div>

                         <div className="space-y-6">
                             <SectionHeader icon={Palette} title="Colors & Accents" />

                             <div className="space-y-1">
                                <ColorPicker label="Accent Color" value={theme.accentColor} onChange={(v) => setTheme({...theme, accentColor: v})} />
                             </div>

                             <div className="pt-6 border-t border-gray-200 dark:border-white/5">
                                 <SectionHeader icon={Sparkles} title="Social Icons" />
                                 <div className="grid grid-cols-4 gap-2 mb-4">
                                     {['filled', 'outline', 'minimal', 'glass'].map(style => (
                                         <button
                                            key={style}
                                            onClick={() => setTheme({...theme, socials: {...theme.socials, style: style as any}})}
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
                                 <ColorPicker label="Icon Color" value={theme.socials.color} onChange={(v) => setTheme({...theme, socials: {...theme.socials, color: v}})} />
                             </div>

                             <div className="pt-6 border-t border-gray-200 dark:border-white/5">
                                <SectionHeader icon={Search} title="SEO Settings" />
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meta Title</label>
                                        <input
                                            type="text"
                                            value={profile.seo?.title || ''}
                                            onChange={(e) => updateProfile({ seo: { ...profile?.seo, title: e.target.value } as any })}
                                            placeholder="Page Title"
                                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-white/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meta Description</label>
                                        <textarea
                                            rows={3}
                                            value={profile.seo?.description || ''}
                                            onChange={(e) => updateProfile({ seo: { ...profile?.seo, description: e.target.value } as any })}
                                            placeholder="Description for search engines..."
                                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder-gray-400 dark:placeholder-white/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Keywords</label>
                                        <input
                                            type="text"
                                            value={profile.seo?.keywords || ''}
                                            onChange={(e) => updateProfile({ seo: { ...profile?.seo, keywords: e.target.value } as any })}
                                            placeholder="Separate with commas"
                                            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-400 dark:placeholder-white/20"
                                        />
                                    </div>
                                </div>
                             </div>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>
         </div>
      </section>
    </div>
  );
};

export default AppearanceEditor;
