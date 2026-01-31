/**
 * ThemeGallery - Theme selection grid with category filters
 * Displays 50+ themes with live preview cards
 */

import React, { useState } from 'react';
import { Theme, ThemeCategory } from '@/types/modernProfile.types';
import { Layout, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';

interface ThemeGalleryProps {
  themes: Theme[];
  currentTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
  categories: ThemeCategory[];
}

const ThemeGallery: React.FC<ThemeGalleryProps> = ({
  themes,
  currentTheme,
  onSelectTheme,
  categories,
}) => {
  const { trigger } = useHaptic();
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = themes.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 dark:bg-white rounded-lg text-white dark:text-black">
            <Layout size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Themes</h2>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              trigger(5);
              setActiveCategory(cat);
            }}
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

      {/* Theme Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredThemes.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                trigger(10);
                onSelectTheme(t);
              }}
              className={`group relative aspect-[9/16] rounded-[20px] overflow-hidden shadow-lg transition-all duration-300 ${
                currentTheme.id === t.id
                  ? 'ring-[3px] ring-blue-500 ring-offset-4 ring-offset-white dark:ring-offset-black scale-[1.02]'
                  : 'hover:shadow-xl hover:-translate-y-1 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Background Preview */}
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                style={{
                  background:
                    t.bgType === 'color' || t.bgType === 'gradient'
                      ? t.bgValue
                      : `url(${t.bgValue}) center/cover`,
                  filter: t.bgConfig ? `blur(${t.bgConfig.bgBlur}px)` : 'none',
                }}
              />

              {/* Mock UI Preview */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 gap-2 z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md shadow-lg border border-white/20" />
                <div className="w-16 h-2 rounded-full bg-white/40 backdrop-blur-sm" />
                <div
                  className="w-full h-8 mt-2 opacity-90 shadow-sm"
                  style={{
                    background: t.buttons.backgroundColor,
                    borderRadius: t.buttons.shape === 'pill' ? 99 : 8,
                  }}
                />
                <div
                  className="w-full h-8 opacity-70 shadow-sm"
                  style={{
                    background: t.buttons.backgroundColor,
                    borderRadius: t.buttons.shape === 'pill' ? 99 : 8,
                  }}
                />
              </div>

              {/* Theme Name */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent pt-8 text-white text-[10px] font-bold text-center uppercase tracking-widest z-20">
                {t.name}
              </div>

              {/* Selected Badge */}
              {currentTheme.id === t.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg z-30">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredThemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No themes found matching your search.</p>
        </div>
      )}
    </section>
  );
};

export default ThemeGallery;
