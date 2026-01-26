// Profile Service (T049)
// API wrapper for all profile-related operations

interface ProfileData {
  id?: number; // T140: Added for share tracking
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  logo?: string;
  headline?: string;
  company?: string;
  bio?: string;
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  pronouns?: string;
  published?: boolean;
  indexingOptIn?: boolean;
  // Contact visibility toggles (personal)
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
  showBio?: boolean;
  // Additional field visibility toggles
  showHeadline?: boolean;
  showCompany?: boolean;
  showFirstName?: boolean;
  showLastName?: boolean;
  showPronouns?: boolean;
  // Company contact fields
  companyEmail?: string;
  companyPhone?: string;
  showCompanyEmail?: boolean;
  showCompanyPhone?: boolean;
  // Personal address fields
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  showAddressLine1?: boolean;
  showAddressLine2?: boolean;
  showAddressCity?: boolean;
  showAddressState?: boolean;
  showAddressPostalCode?: boolean;
  showAddressCountry?: boolean;
  // Company address fields
  companyAddressLine1?: string;
  companyAddressLine2?: string;
  companyAddressCity?: string;
  companyAddressState?: string;
  companyAddressPostalCode?: string;
  companyAddressCountry?: string;
  showCompanyAddressLine1?: boolean;
  showCompanyAddressLine2?: boolean;
  showCompanyAddressCity?: boolean;
  showCompanyAddressState?: boolean;
  showCompanyAddressPostalCode?: boolean;
  showCompanyAddressCountry?: boolean;
}

interface UsernameCheckResponse {
  available: boolean;
  username: string;
  suggestions?: string[];
}

interface PublicProfileResponse {
  id: number; // T140: Added for share tracking
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  logoUrl?: string;
  headline?: string;
  company?: string;
  bio?: string;
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
  pronouns?: string;
  // Contact visibility toggles (personal)
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
  showBio?: boolean;
  // Additional field visibility toggles
  showHeadline?: boolean;
  showCompany?: boolean;
  showFirstName?: boolean;
  showLastName?: boolean;
  showPronouns?: boolean;
  // Company contact fields
  companyEmail?: string;
  companyPhone?: string;
  showCompanyEmail?: boolean;
  showCompanyPhone?: boolean;
  // Personal address fields
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
  addressCountry?: string;
  showAddressLine1?: boolean;
  showAddressLine2?: boolean;
  showAddressCity?: boolean;
  showAddressState?: boolean;
  showAddressPostalCode?: boolean;
  showAddressCountry?: boolean;
  // Company address fields
  companyAddressLine1?: string;
  companyAddressLine2?: string;
  companyAddressCity?: string;
  companyAddressState?: string;
  companyAddressPostalCode?: string;
  companyAddressCountry?: string;
  showCompanyAddressLine1?: boolean;
  showCompanyAddressLine2?: boolean;
  showCompanyAddressCity?: boolean;
  showCompanyAddressState?: boolean;
  showCompanyAddressPostalCode?: boolean;
  showCompanyAddressCountry?: boolean;
  socialProfiles?: Array<{
    id: number;
    platform: string | null;
    url: string;
    displayLabel: string | null;
    customLogo: string | null;
    isFeatured: boolean;
    displayOrder: number;
  }>;
  customLinks?: Array<{
    id: number;
    linkTitle: string;
    linkUrl: string;
    customLogoUrl: string | null;
    displayOrder: number;
  }>;
  theme?: any;
  appearance?: AppearanceSettings | null;
}

// Appearance settings interface for public profile rendering
interface AppearanceSettings {
  buttonStyle: 'solid' | 'glass' | 'outline';
  cornerRadius: number;
  shadowStyle: 'none' | 'subtle' | 'strong' | 'hard';
  buttonColor: string;
  shadowColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  headerStyle: 'simple' | 'banner' | 'avatar-top' | 'minimal' | 'hero-photo';
  headerColor: string;
  headerBackground?: {
    useProfilePhoto: boolean;
    height: string;
    overlayColor: string;
    overlayOpacity: number;
    blur: number;
    gradientOverlay?: string;
    fallbackGradient: string;
  };
  bannerSettings?: {
    mode: 'color' | 'image';
    color: string;
    image?: string;
    derivedFromWallpaper: boolean;
  };
  wallpaper: string;
  wallpaperOpacity: number;
  footerText: string;
  showPoweredBy: boolean;
  themeId: string;
}

class ProfileService {
  private baseUrl: string;

  constructor() {
    // Use relative path for Vite proxy in development
    this.baseUrl = '';
  }

  /**
   * Get standard headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authenticated user's profile (T030)
   */
  async getMyProfile(): Promise<ProfileData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (response.status === 404) {
        return null; // Profile doesn't exist yet
      }

      if (response.status === 401) {
        throw new Error('Please login to view your profile');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformProfile(data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Create new profile (T029)
   */
  async createProfile(profileData: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify(this.transformForApi(profileData)),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      const data = await response.json();
      return this.transformProfile(data.profile);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Update profile (T031)
   */
  async updateProfile(profileData: Partial<ProfileData>): Promise<ProfileData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify(this.transformForApi(profileData)),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const data = await response.json();
      return this.transformProfile(data.profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Delete profile (T032)
   */
  async deleteProfile(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me`, {
        method: 'DELETE',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete profile');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }

  /**
   * Toggle profile publish status (T033)
   */
  async togglePublish(published: boolean): Promise<ProfileData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me/publish`, {
        method: 'PATCH',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify({ published }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle publish status');
      }

      const data = await response.json();
      return this.transformProfile(data.profile);
    } catch (error) {
      console.error('Error toggling publish:', error);
      throw error;
    }
  }

  /**
   * Check username availability (T034)
   */
  async checkUsername(username: string): Promise<UsernameCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me/username-check`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check username');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  }

  /**
   * Get public profile by username (T035)
   */
  async getPublicProfile(username: string): Promise<PublicProfileResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/public/profile/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch public profile: ${response.statusText}`);
      }

      const data = await response.json();
      
      // T140: Map API response to include id and flatten profile object
      // Only include data that the backend has marked as visible
      return {
        id: data.id,
        username: data.profile.username,
        displayName: data.profile.displayName,
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        avatar: data.profile.avatarUrl,
        logoUrl: data.profile.logoUrl,
        headline: data.profile.headline,
        company: data.profile.company,
        bio: data.profile.bio,
        publicEmail: data.profile.publicEmail,
        publicPhone: data.profile.publicPhone,
        website: data.profile.website,
        pronouns: data.profile.pronouns,
        // Contact visibility toggles (personal)
        showEmail: data.profile.showEmail,
        showPhone: data.profile.showPhone,
        showWebsite: data.profile.showWebsite,
        showBio: data.profile.showBio,
        // Additional field visibility toggles
        showHeadline: data.profile.showHeadline,
        showCompany: data.profile.showCompany,
        showFirstName: data.profile.showFirstName,
        showLastName: data.profile.showLastName,
        showPronouns: data.profile.showPronouns,
        // Company contact fields
        companyEmail: data.profile.companyEmail,
        companyPhone: data.profile.companyPhone,
        showCompanyEmail: data.profile.showCompanyEmail,
        showCompanyPhone: data.profile.showCompanyPhone,
        // Personal address fields
        addressLine1: data.profile.addressLine1,
        addressLine2: data.profile.addressLine2,
        addressCity: data.profile.addressCity,
        addressState: data.profile.addressState,
        addressPostalCode: data.profile.addressPostalCode,
        addressCountry: data.profile.addressCountry,
        showAddressLine1: data.profile.showAddressLine1,
        showAddressLine2: data.profile.showAddressLine2,
        showAddressCity: data.profile.showAddressCity,
        showAddressState: data.profile.showAddressState,
        showAddressPostalCode: data.profile.showAddressPostalCode,
        showAddressCountry: data.profile.showAddressCountry,
        // Company address fields
        companyAddressLine1: data.profile.companyAddressLine1,
        companyAddressLine2: data.profile.companyAddressLine2,
        companyAddressCity: data.profile.companyAddressCity,
        companyAddressState: data.profile.companyAddressState,
        companyAddressPostalCode: data.profile.companyAddressPostalCode,
        companyAddressCountry: data.profile.companyAddressCountry,
        showCompanyAddressLine1: data.profile.showCompanyAddressLine1,
        showCompanyAddressLine2: data.profile.showCompanyAddressLine2,
        showCompanyAddressCity: data.profile.showCompanyAddressCity,
        showCompanyAddressState: data.profile.showCompanyAddressState,
        showCompanyAddressPostalCode: data.profile.showCompanyAddressPostalCode,
        showCompanyAddressCountry: data.profile.showCompanyAddressCountry,
        socialProfiles: data.socialProfiles,
        customLinks: data.customLinks,
        theme: data.theme,
        appearance: data.appearance || null, // Include appearance settings for public profile
      };
    } catch (error) {
      console.error('Error fetching public profile:', error);
      throw error;
    }
  }

  /**
   * Track a profile view (T254)
   * Called when a public profile is loaded
   */
  async trackProfileView(username: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/public/profile/${username}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Silently fail - analytics tracking shouldn't break the user experience
      console.error('Error tracking profile view:', error);
    }
  }

  /**
   * Track a share event (T140)
   * Called when a profile is shared
   */
  async trackShareEvent(profileId: number, shareMethod: string, platform?: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/profiles/share-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profileId,
          share_method: shareMethod,
          platform: platform || null,
        }),
      });
    } catch (error) {
      // Silently fail - analytics tracking shouldn't break the user experience
      console.error('Error tracking share event:', error);
    }
  }

  /**
   * Get analytics for the current user's profile
   */
  async getMyAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/profiles/me/analytics${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time analytics for current day
   */
  async getRealtimeAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me/analytics/realtime`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch realtime analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching realtime analytics:', error);
      throw error;
    }
  }

  /**
   * Get share channel breakdown analytics
   */
  async getShareAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/profiles/me/analytics/shares${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch share analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching share analytics:', error);
      throw error;
    }
  }

  /**
   * Get device breakdown analytics
   */
  async getDeviceAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/profiles/me/analytics/devices${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch device analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching device analytics:', error);
      throw error;
    }
  }

  /**
   * Get referrer breakdown analytics
   */
  async getReferrerAnalytics(startDate?: string, endDate?: string): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const queryString = params.toString();
      const url = `${this.baseUrl}/api/profiles/me/analytics/referrers${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referrer analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching referrer analytics:', error);
      throw error;
    }
  }

  /**
   * Get trend comparisons (week-over-week)
   */
  async getTrendAnalytics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me/analytics/trends`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trend analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trend analytics:', error);
      throw error;
    }
  }

  /**
   * Transform API response to ProfileData (backend returns camelCase)
   */
  private transformProfile(data: any): ProfileData {
    return {
      id: data.id, // T140: Added for share tracking
      username: data.username,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      avatar: data.avatarUrl,
      logo: data.logoUrl,
      headline: data.headline,
      company: data.company,
      bio: data.bio,
      publicEmail: data.publicEmail,
      publicPhone: data.publicPhone,
      website: data.website,
      pronouns: data.pronouns,
      published: Boolean(data.published),
      indexingOptIn: Boolean(data.indexingOptIn),
      // Contact visibility toggles (personal)
      showEmail: data.showEmail,
      showPhone: data.showPhone,
      showWebsite: data.showWebsite,
      showBio: data.showBio,
      // Additional field visibility toggles
      showHeadline: data.showHeadline,
      showCompany: data.showCompany,
      showFirstName: data.showFirstName,
      showLastName: data.showLastName,
      showPronouns: data.showPronouns,
      // Company contact fields
      companyEmail: data.companyEmail,
      companyPhone: data.companyPhone,
      showCompanyEmail: data.showCompanyEmail,
      showCompanyPhone: data.showCompanyPhone,
      // Personal address fields
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      addressCity: data.addressCity,
      addressState: data.addressState,
      addressPostalCode: data.addressPostalCode,
      addressCountry: data.addressCountry,
      showAddressLine1: data.showAddressLine1,
      showAddressLine2: data.showAddressLine2,
      showAddressCity: data.showAddressCity,
      showAddressState: data.showAddressState,
      showAddressPostalCode: data.showAddressPostalCode,
      showAddressCountry: data.showAddressCountry,
      // Company address fields
      companyAddressLine1: data.companyAddressLine1,
      companyAddressLine2: data.companyAddressLine2,
      companyAddressCity: data.companyAddressCity,
      companyAddressState: data.companyAddressState,
      companyAddressPostalCode: data.companyAddressPostalCode,
      companyAddressCountry: data.companyAddressCountry,
      showCompanyAddressLine1: data.showCompanyAddressLine1,
      showCompanyAddressLine2: data.showCompanyAddressLine2,
      showCompanyAddressCity: data.showCompanyAddressCity,
      showCompanyAddressState: data.showCompanyAddressState,
      showCompanyAddressPostalCode: data.showCompanyAddressPostalCode,
      showCompanyAddressCountry: data.showCompanyAddressCountry,
    };
  }

  /**
   * Transform data for API (keep camelCase as backend expects it)
   */
  private transformForApi(data: Partial<ProfileData>): any {
    const result: any = {};
    
    if (data.username !== undefined) result.username = data.username;
    if (data.displayName !== undefined) result.displayName = data.displayName;
    if (data.firstName !== undefined) result.firstName = data.firstName;
    if (data.lastName !== undefined) result.lastName = data.lastName;
    if (data.avatar !== undefined) result.avatarUrl = data.avatar;
    if (data.logo !== undefined) result.logoUrl = data.logo;
    if (data.headline !== undefined) result.headline = data.headline;
    if (data.company !== undefined) result.company = data.company;
    if (data.bio !== undefined) result.bio = data.bio;
    if (data.publicEmail !== undefined) result.publicEmail = data.publicEmail;
    if (data.publicPhone !== undefined) result.publicPhone = data.publicPhone;
    if (data.website !== undefined) result.website = data.website;
    if (data.pronouns !== undefined) result.pronouns = data.pronouns;
    if (data.published !== undefined) result.published = data.published;
    if (data.indexingOptIn !== undefined) result.indexingOptIn = data.indexingOptIn;
    // Contact visibility toggles (personal)
    if (data.showEmail !== undefined) result.showEmail = data.showEmail;
    if (data.showPhone !== undefined) result.showPhone = data.showPhone;
    if (data.showWebsite !== undefined) result.showWebsite = data.showWebsite;
    if (data.showBio !== undefined) result.showBio = data.showBio;
    // Additional field visibility toggles
    if (data.showHeadline !== undefined) result.showHeadline = data.showHeadline;
    if (data.showCompany !== undefined) result.showCompany = data.showCompany;
    if (data.showFirstName !== undefined) result.showFirstName = data.showFirstName;
    if (data.showLastName !== undefined) result.showLastName = data.showLastName;
    if (data.showPronouns !== undefined) result.showPronouns = data.showPronouns;
    // Company contact fields
    if (data.companyEmail !== undefined) result.companyEmail = data.companyEmail;
    if (data.companyPhone !== undefined) result.companyPhone = data.companyPhone;
    if (data.showCompanyEmail !== undefined) result.showCompanyEmail = data.showCompanyEmail;
    if (data.showCompanyPhone !== undefined) result.showCompanyPhone = data.showCompanyPhone;
    // Personal address fields
    if (data.addressLine1 !== undefined) result.addressLine1 = data.addressLine1;
    if (data.addressLine2 !== undefined) result.addressLine2 = data.addressLine2;
    if (data.addressCity !== undefined) result.addressCity = data.addressCity;
    if (data.addressState !== undefined) result.addressState = data.addressState;
    if (data.addressPostalCode !== undefined) result.addressPostalCode = data.addressPostalCode;
    if (data.addressCountry !== undefined) result.addressCountry = data.addressCountry;
    if (data.showAddressLine1 !== undefined) result.showAddressLine1 = data.showAddressLine1;
    if (data.showAddressLine2 !== undefined) result.showAddressLine2 = data.showAddressLine2;
    if (data.showAddressCity !== undefined) result.showAddressCity = data.showAddressCity;
    if (data.showAddressState !== undefined) result.showAddressState = data.showAddressState;
    if (data.showAddressPostalCode !== undefined) result.showAddressPostalCode = data.showAddressPostalCode;
    if (data.showAddressCountry !== undefined) result.showAddressCountry = data.showAddressCountry;
    // Company address fields
    if (data.companyAddressLine1 !== undefined) result.companyAddressLine1 = data.companyAddressLine1;
    if (data.companyAddressLine2 !== undefined) result.companyAddressLine2 = data.companyAddressLine2;
    if (data.companyAddressCity !== undefined) result.companyAddressCity = data.companyAddressCity;
    if (data.companyAddressState !== undefined) result.companyAddressState = data.companyAddressState;
    if (data.companyAddressPostalCode !== undefined) result.companyAddressPostalCode = data.companyAddressPostalCode;
    if (data.companyAddressCountry !== undefined) result.companyAddressCountry = data.companyAddressCountry;
    if (data.showCompanyAddressLine1 !== undefined) result.showCompanyAddressLine1 = data.showCompanyAddressLine1;
    if (data.showCompanyAddressLine2 !== undefined) result.showCompanyAddressLine2 = data.showCompanyAddressLine2;
    if (data.showCompanyAddressCity !== undefined) result.showCompanyAddressCity = data.showCompanyAddressCity;
    if (data.showCompanyAddressState !== undefined) result.showCompanyAddressState = data.showCompanyAddressState;
    if (data.showCompanyAddressPostalCode !== undefined) result.showCompanyAddressPostalCode = data.showCompanyAddressPostalCode;
    if (data.showCompanyAddressCountry !== undefined) result.showCompanyAddressCountry = data.showCompanyAddressCountry;
    
    return result;
  }
}

export const profileService = new ProfileService();
export type { ProfileData, UsernameCheckResponse, PublicProfileResponse };
