/**
 * AppearancePanel - Main appearance/theme customization wrapper
 * Combines all customization sections with tabbed interface
 */

import React, { useState } from 'react';
import { Theme, ThemeCategory } from '@/types/modernProfile.types';
import { User, Layout, Globe } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import ProfileCustomizer from './ProfileCustomizer';
import BlocksCustomizer from './BlocksCustomizer';
import GlobalCustomizer from './GlobalCustomizer';

interface AppearancePanelProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

type TabId = 'profile' | 'blocks' | 'global';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size: number }>;
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'blocks', label: 'Blocks', icon: Layout },
  { id: 'global', label: 'Global', icon: Globe },
];

const AppearancePanel: React.FC<AppearancePanelProps> = ({ theme, onThemeChange }) => {
  const { trigger } = useHaptic();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <section className="bg-white dark:bg-[#1c1c1e] rounded-[32px] border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100 dark:border-white/5 p-2 bg-gray-50 dark:bg-black/20">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                trigger(5);
                setActiveTab(tab.id);
              }}
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

      {/* Tab Content */}
      <div className="p-6 md:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <ProfileCustomizer key="profile" theme={theme} onThemeChange={onThemeChange} />
          )}
          {activeTab === 'blocks' && (
            <BlocksCustomizer key="blocks" theme={theme} onThemeChange={onThemeChange} />
          )}
          {activeTab === 'global' && (
            <GlobalCustomizer key="global" theme={theme} onThemeChange={onThemeChange} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AppearancePanel;
