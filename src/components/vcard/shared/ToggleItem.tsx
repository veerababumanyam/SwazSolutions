/**
 * ToggleItem - Individual toggle button with icon
 * Used within ToggleGroup for styling selections
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToggleItemProps {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  title?: string;
  label?: string;
}

const ToggleItem: React.FC<ToggleItemProps> = ({ active, onClick, icon: Icon, title, label }) => (
  <button
    onClick={onClick}
    title={title || label}
    className={`flex-1 flex items-center justify-center py-2 rounded-md transition-all duration-200 ${
      active
        ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm'
        : 'text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white/70'
    }`}
  >
    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
  </button>
);

export default ToggleItem;
