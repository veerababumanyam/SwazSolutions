/**
 * useProfileTab Hook
 * Manages profile tab navigation via URL query parameters
 * Supports deep linking and browser back/forward history
 */

import { useSearchParams } from 'react-router-dom';

export type ProfileTabId = 'portfolio' | 'aesthetics' | 'insights';

interface UseProfileTabReturn {
  currentTab: ProfileTabId;
  setTab: (tab: ProfileTabId, section?: string) => void;
  getTabUrl: (tab: ProfileTabId, section?: string) => string;
  isTab: (tab: ProfileTabId) => boolean;
}

/**
 * Hook to manage profile tab navigation
 * Uses URL query parameters for deep linking and browser history
 *
 * @example
 * const { currentTab, setTab } = useProfileTab();
 *
 * return (
 *   <>
 *     <Tabs value={currentTab} onChange={(tab) => setTab(tab as ProfileTabId)}>
 *       <TabContent value="portfolio">...</TabContent>
 *     </Tabs>
 *   </>
 * );
 */
export function useProfileTab(): UseProfileTabReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = (searchParams.get('tab') || 'portfolio') as ProfileTabId;
  const section = searchParams.get('section') || undefined;

  const setTab = (tab: ProfileTabId, newSection?: string) => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (newSection) {
      params.set('section', newSection);
    } else if (section) {
      // Remove section if not specified in new tab
      params.delete('section');
    }
    setSearchParams(params);
  };

  const getTabUrl = (tab: ProfileTabId, newSection?: string): string => {
    const params = new URLSearchParams();
    params.set('tab', tab);
    if (newSection) {
      params.set('section', newSection);
    }
    return `/profile?${params.toString()}`;
  };

  const isTab = (tab: ProfileTabId): boolean => {
    return currentTab === tab;
  };

  return {
    currentTab,
    setTab,
    getTabUrl,
    isTab,
  };
}
