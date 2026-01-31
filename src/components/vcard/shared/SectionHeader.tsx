/**
 * SectionHeader - Reusable section header with icon and title
 * Used across all customization panels
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-white/5">
    <Icon size={18} className="text-blue-500" />
    <div className="flex flex-col">
      <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      {subtitle && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export default SectionHeader;
