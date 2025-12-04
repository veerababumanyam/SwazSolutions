// Share Tracking Hook (T142)
// Custom hook for tracking share events with analytics

import { useState, useCallback } from 'react';
import { trackShare } from '../services/shareService';

interface UseShareTrackingReturn {
  trackShareEvent: (method: string, platform?: string) => Promise<void>;
  isTracking: boolean;
  error: string | null;
}

export const useShareTracking = (profileId: number): UseShareTrackingReturn => {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackShareEvent = useCallback(async (method: string, platform?: string) => {
    setIsTracking(true);
    setError(null);

    try {
      await trackShare(profileId, method, platform);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track share');
      console.error('Share tracking error:', err);
    } finally {
      setIsTracking(false);
    }
  }, [profileId]);

  return {
    trackShareEvent,
    isTracking,
    error
  };
};
