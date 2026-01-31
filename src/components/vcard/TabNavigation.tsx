/**
 * TabNavigation - Tab switcher for vCard editor
 * Features: Active state highlighting, unsaved changes indicator, keyboard navigation
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Palette, Briefcase } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'portfolio' | 'aesthetics' | 'insights';
  onTabChange: (tab: 'portfolio' | 'aesthetics' | 'insights') => void;
  hasUnsavedChanges?: boolean;
}

interface Tab {
  id: 'portfolio' | 'aesthetics' | 'insights';
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const TABS: Tab[] = [
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'aesthetics', label: 'Aesthetics', icon: Palette },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

/**
 * TabNavigation Component
 * Displays three main tabs for the vCard editor with:
 * - Icon and label for each tab
 * - Active tab highlighting (blue underline + bg)
 * - Unsaved changes indicator (orange dot)
 * - Keyboard navigation (Arrow keys)
 * - Smooth Framer Motion transitions
 * - Full accessibility (ARIA attributes, semantic HTML)
 *
 * @param activeTab - Currently active tab
 * @param onTabChange - Callback when tab changes
 * @param hasUnsavedChanges - Shows indicator on tab if true
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  hasUnsavedChanges = false,
}) => {
  // Handle keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;

      e.preventDefault();
      const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);

      if (e.key === 'ArrowLeft') {
        const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        onTabChange(TABS[prevIndex].id);
      } else if (e.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % TABS.length;
        onTabChange(TABS[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onTabChange]);

  return (
    <div
      role="tablist"
      className="flex gap-1 bg-gray-50 dark:bg-black/20 rounded-2xl p-1.5 border border-gray-200 dark:border-white/5 mb-6"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 relative group ${
              isActive
                ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Icon size={16} className={isActive ? 'text-blue-500' : ''} />
            <span>{tab.label}</span>

            {/* Unsaved changes indicator dot */}
            {hasUnsavedChanges && isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-orange-500 ml-1"
                aria-label="Unsaved changes"
              />
            )}

            {/* Active tab underline */}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
