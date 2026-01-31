/**
 * ToggleGroup - Container for toggle button group
 * Provides styling and layout for related toggle buttons
 */

import React from 'react';

interface ToggleGroupProps {
  label?: string;
  children?: React.ReactNode;
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({ label, children }) => (
  <div className="space-y-2">
    {label && (
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
    )}
    <div className="flex bg-gray-100 dark:bg-white/5 rounded-lg p-1 border border-gray-200 dark:border-white/5">
      {children}
    </div>
  </div>
);

export default ToggleGroup;
