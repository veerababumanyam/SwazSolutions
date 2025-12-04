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
}

class ProfileService {
  private baseUrl: string;

  constructor() {
    // Use relative path for Vite proxy in development
    this.baseUrl = '';
  }

  /**
   * Get auth headers with token from localStorage
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Get authenticated user's profile (T030)
   */
  async getMyProfile(): Promise<ProfileData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/me`, {
        method: 'GET',
        credentials: 'include',
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
        socialProfiles: data.socialProfiles,
        customLinks: data.customLinks,
        theme: data.theme
      };
    } catch (error) {
      console.error('Error fetching public profile:', error);
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
    
    return result;
  }
}

export const profileService = new ProfileService();
export type { ProfileData, UsernameCheckResponse, PublicProfileResponse };
