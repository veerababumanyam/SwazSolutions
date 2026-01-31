/**
 * AI Profile Enhancement Service - Backend Proxy Version
 *
 * Uses backend API endpoints that respect user's encrypted Gemini API key
 * instead of calling the SDK directly from the frontend
 */

export interface EnhanceHeadlineParams {
  currentHeadline: string;
  profileType?: string;
  tone?: string;
}

export interface EnhanceBioParams {
  currentBio: string;
  profileType?: string;
  tone?: string;
}

export interface EnhancementResult {
  success: boolean;
  data?: {
    original: string;
    enhanced: string;
  };
  error?: string;
}

/**
 * Enhance profile headline using backend AI service
 */
export const enhanceHeadline = async (
  params: EnhanceHeadlineParams
): Promise<EnhancementResult> => {
  try {
    const response = await fetch('/api/ai/enhance-headline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enhance headline');
    }

    return await response.json();
  } catch (error) {
    console.error('Headline enhancement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Enhance profile bio using backend AI service
 */
export const enhanceBio = async (
  params: EnhanceBioParams
): Promise<EnhancementResult> => {
  try {
    const response = await fetch('/api/ai/enhance-bio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to enhance bio');
    }

    return await response.json();
  } catch (error) {
    console.error('Bio enhancement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
