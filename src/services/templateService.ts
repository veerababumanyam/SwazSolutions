/**
 * Template Service - API client for template operations
 * Handles fetching, previewing, and applying templates
 */

import {
  VCardTemplate,
  TemplateFilterOptions,
  TemplateUsage,
  TemplateCategory
} from '@/types/modernProfile.types';

const API_BASE_URL = '/api';

class TemplateService {
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Fetch all available templates with optional filtering
   */
  async getTemplates(filters?: TemplateFilterOptions): Promise<{
    templates: VCardTemplate[];
    total: number;
    pages: number;
  }> {
    try {
      const params = new URLSearchParams();

      if (filters?.category) params.append('category', filters.category);
      if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
      if (filters?.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured));
      if (filters?.searchQuery) params.append('search', filters.searchQuery);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters?.offset !== undefined) params.append('offset', String(filters.offset));
      if (filters?.limit !== undefined) params.append('limit', String(filters.limit));

      const queryString = params.toString();
      const url = queryString ? `${API_BASE_URL}/templates?${queryString}` : `${API_BASE_URL}/templates`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(templateId: string): Promise<VCardTemplate> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  /**
   * Fetch templates by category
   */
  async getTemplatesByCategory(category: TemplateCategory): Promise<VCardTemplate[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/templates?category=${encodeURIComponent(category)}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit?: number): Promise<VCardTemplate[]> {
    try {
      const url = limit
        ? `${API_BASE_URL}/templates?isFeatured=true&limit=${limit}`
        : `${API_BASE_URL}/templates?isFeatured=true`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch featured templates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('Error fetching featured templates:', error);
      throw error;
    }
  }

  /**
   * Apply a template to the user's profile
   */
  async applyTemplate(
    templateId: string,
    mode: 'replace' | 'merge' | 'theme-only',
    options?: {
      keepExistingBlocks?: boolean;
      keepSocialProfiles?: boolean;
    }
  ): Promise<{ message: string; appliedAt: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}/apply`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          mode,
          ...options
        })
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Please log in to apply a template');
      }

      if (response.status === 404) {
        throw new Error('Template not found');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to apply template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }

  /**
   * Track template usage
   */
  async trackTemplateUsage(templateId: string): Promise<TemplateUsage> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}/usage`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to track usage: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking template usage:', error);
      throw error;
    }
  }

  /**
   * Rate a template
   */
  async rateTemplate(templateId: string, rating: number): Promise<{ message: string; rating: number }> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const response = await fetch(`${API_BASE_URL}/templates/${templateId}/rate`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ rating })
      });

      if (!response.ok) {
        throw new Error(`Failed to rate template: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error rating template:', error);
      throw error;
    }
  }

  /**
   * Get user's applied templates
   */
  async getAppliedTemplates(): Promise<{
    templates: VCardTemplate[];
    total: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/me/applied`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (response.status === 401 || response.status === 403) {
        return { templates: [], total: 0 };
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch applied templates: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching applied templates:', error);
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/categories`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching template categories:', error);
      // Return default categories if API fails
      return [
        'personal',
        'business',
        'portfolio',
        'event',
        'restaurant',
        'real-estate',
        'healthcare',
        'education',
        'nonprofit',
        'entertainment'
      ];
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: string, limit?: number): Promise<VCardTemplate[]> {
    try {
      const url = limit
        ? `${API_BASE_URL}/templates?search=${encodeURIComponent(query)}&limit=${limit}`
        : `${API_BASE_URL}/templates?search=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to search templates: ${response.statusText}`);
      }

      const data = await response.json();
      return data.templates || [];
    } catch (error) {
      console.error('Error searching templates:', error);
      throw error;
    }
  }
}

export const templateService = new TemplateService();
export default templateService;
