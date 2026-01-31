import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export interface UserMenuItemProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;

  /** Display label */
  label: string;

  /** Optional badge text (e.g., "Pro", "New") */
  badge?: string;

  /** Badge variant */
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info';

  /** Visual style variant */
  variant?: 'normal' | 'danger';

  /** onClick handler for action items */
  onClick?: () => void;

  /** href for navigation items */
  href?: string;

  /** Whether the item is currently active (for navigation) */
  isActive?: boolean;

  /** Whether the item is disabled */
  disabled?: boolean;

  /** Optional keyboard shortcut display */
  shortcut?: string;
}

/**
 * Reusable menu item component for user menus
 * Renders either a button (onClick) or link (href)
 * Supports icons, badges, variants, and keyboard shortcuts
 */
export const UserMenuItem: React.FC<UserMenuItemProps> = ({
  icon: Icon,
  label,
  badge,
  badgeVariant = 'primary',
  variant = 'normal',
  onClick,
  href,
  isActive = false,
  disabled = false,
  shortcut,
}) => {
  const baseClass =
    'flex items-center justify-between gap-3 px-4 py-3 min-h-[44px] rounded-xl transition-colors cursor-pointer w-full text-left';

  const normalClass =
    'text-foreground hover:bg-accent/5 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed';
  const activeClass = 'bg-accent/10 text-accent font-semibold';
  const dangerClass =
    'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20';

  const variantClass =
    variant === 'danger'
      ? dangerClass
      : isActive
        ? `${normalClass} ${activeClass}`
        : normalClass;

  const badgeColorClass = {
    primary: 'bg-accent/10 text-accent',
    success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    warning:
      'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    info: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  };

  const itemContent = (
    <>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        {badge && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${badgeColorClass[badgeVariant]}`}
          >
            {badge}
          </span>
        )}
        {shortcut && (
          <span className="text-xs text-muted opacity-50 ml-2">{shortcut}</span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={`${baseClass} ${variantClass}`}
        role="menuitem"
      >
        {itemContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass}`}
      role="menuitem"
    >
      {itemContent}
    </button>
  );
};
