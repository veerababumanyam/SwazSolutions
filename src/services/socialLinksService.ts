// Social Links Service
// API wrapper for social links management

import { detectPlatformFromUrl, DEFAULT_LOGO } from '../constants/platforms';

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  displayLabel: string | null;
  customLogo: string | null;
  isFeatured: boolean;
  displayOrder: number;
}

export interface SocialLinksResponse {
  featured: SocialLink[];
  custom: SocialLink[];
  total: number;
  featuredCount: number;
  customCount: number;
}

export interface CreateSocialLinkData {
  platform?: string;
  url: string;
  displayLabel?: string;
  customLogo?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface UpdateSocialLinkData {
  platform?: string;
  url?: string;
  displayLabel?: string;
  customLogo?: string;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface DetectLogoResponse {
  detected: boolean;
  platform: string | null;
  logoPath: string;
}

class SocialLinksService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '';
  }

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
   * Get all social links for the authenticated user
   */
  async getSocialLinks(): Promise<SocialLinksResponse> {
    const response = await fetch(`${this.baseUrl}/api/profiles/me/social-links`, {
      method: 'GET',
      credentials: 'include',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch social links');
    }

    return await response.json();
  }

  /**
   * Create a new social link
   */
  async createSocialLink(data: CreateSocialLinkData): Promise<SocialLink> {
    // Auto-detect platform and logo if not provided
    const detected = detectPlatformFromUrl(data.url);
    const linkData = {
      platform: data.platform || detected?.name || 'Custom',
      url: data.url,
      displayLabel: data.displayLabel || detected?.name || 'Link',
      customLogo: data.customLogo || detected?.logo || DEFAULT_LOGO,
      isFeatured: data.isFeatured ?? false,
      displayOrder: data.displayOrder,
    };

    const response = await fetch(`${this.baseUrl}/api/profiles/me/social-links`, {
      method: 'POST',
      credentials: 'include',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create social link');
    }

    const result = await response.json();
    return result.link;
  }

  /**
   * Update an existing social link
   */
  async updateSocialLink(id: number, data: UpdateSocialLinkData): Promise<SocialLink> {
    // Auto-detect platform and logo if URL is being updated
    let updateData = { ...data };
    if (data.url) {
      const detected = detectPlatformFromUrl(data.url);
      if (detected && !data.platform) {
        updateData.platform = detected.name;
      }
      if (detected && !data.customLogo) {
        updateData.customLogo = detected.logo;
      }
    }

    const response = await fetch(`${this.baseUrl}/api/profiles/me/social-links/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update social link');
    }

    const result = await response.json();
    return result.link;
  }

  /**
   * Delete a social link
   */
  async deleteSocialLink(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/profiles/me/social-links/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete social link');
    }
  }

  /**
   * Reorder social links
   */
  async reorderSocialLinks(linkIds: number[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/profiles/me/social-links/reorder`, {
      method: 'POST',
      credentials: 'include',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ linkIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reorder social links');
    }
  }

  /**
   * Detect platform from URL (server-side detection)
   */
  async detectLogo(url: string): Promise<DetectLogoResponse> {
    const response = await fetch(`${this.baseUrl}/api/profiles/me/social-links/detect-logo`, {
      method: 'POST',
      credentials: 'include',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to detect logo');
    }

    return await response.json();
  }
}

export const socialLinksService = new SocialLinksService();
