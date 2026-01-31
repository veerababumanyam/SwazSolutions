/**
 * vCard Components - Main barrel export
 * All vCard editor and management components
 */

// Links management components
export { SortableLinkItem, AddLinkMenu, LinksPanel } from './links';

// Shared UI components
export {
  SectionHeader,
  ColorPicker,
  RangeSlider,
  ToggleGroup,
  ToggleItem,
  TypographyEditor,
} from './shared';

// Appearance customization components
export {
  ThemeGallery,
  ProfileCustomizer,
  BlocksCustomizer,
  GlobalCustomizer,
  AppearancePanel,
} from './appearance';

// Section components
export { ProfileSection, SocialsSection, BlocksSection } from './sections';

// Tab components (Phase 2)
export { default as TabNavigation } from './TabNavigation';
export { default as PortfolioTab } from './PortfolioTab';
export { default as AestheticsTab } from './AestheticsTab';
export { default as InsightsTab } from './InsightsTab';

// Editor components
export { GlobalSaveBar } from './GlobalSaveBar';
export { PreviewPane } from './PreviewPane';

// Shared utilities
export { getLinkTypeIcon, getLinkTypeLabel, getLinkTypeDescription } from './shared/linkTypeUtils';
