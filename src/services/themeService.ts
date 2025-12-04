// Theme Service - API Client for Theme Operations

import {
    Theme,
    ThemeSystemResponse,
    ThemeUserResponse,
    ThemeCreateRequest,
    ThemeUpdateRequest,
    ThemeApplyResponse
} from '../types/theme.types';

// Use relative URL for Vite proxy to work correctly in development
const API_BASE_URL = '/api';

class ThemeService {
    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Fetch all system themes
     */
    async getSystemThemes(): Promise<ThemeSystemResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/themes/system`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch system themes: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching system themes:', error);
            throw error;
        }
    }

    /**
     * Fetch user's custom themes (requires authentication)
     * Returns empty array if user is not authenticated
     */
    async getUserThemes(): Promise<ThemeUserResponse> {
        // Check if user has a token before making the request
        const token = localStorage.getItem('auth_token');
        if (!token) {
            // User not authenticated, return empty response silently
            return { themes: [], total: 0 };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/themes/me`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            // Handle 401/403 gracefully - user session may have expired
            if (response.status === 401 || response.status === 403 || response.status === 404) {
                return { themes: [], total: 0 };
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch user themes: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching user themes:', error);
            throw error;
        }
    }

    /**
     * Create a new custom theme
     */
    async createTheme(themeData: ThemeCreateRequest): Promise<{ message: string; theme: Theme }> {
        try {
            const response = await fetch(`${API_BASE_URL}/themes`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(themeData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create theme');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating theme:', error);
            throw error;
        }
    }

    /**
     * Update an existing custom theme
     */
    async updateTheme(id: number, updates: ThemeUpdateRequest): Promise<{ message: string; theme: Theme }> {
        try {
            const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update theme');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating theme:', error);
            throw error;
        }
    }

    /**
     * Delete a custom theme
     */
    async deleteTheme(id: number): Promise<{ message: string; deletedId: number }> {
        try {
            const response = await fetch(`${API_BASE_URL}/themes/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete theme');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting theme:', error);
            throw error;
        }
    }

    /**
     * Apply a theme to the user's profile
     * Requires authentication and an existing profile
     */
    async applyTheme(id: number): Promise<ThemeApplyResponse> {
        // Check if user has a token before making the request
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('Please log in to apply a theme to your profile');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/themes/${id}/apply`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                credentials: 'include'
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error('Please log in to apply a theme to your profile');
            }

            if (response.status === 404) {
                throw new Error('Please create a profile first before applying a theme');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to apply theme');
            }

            return await response.json();
        } catch (error) {
            console.error('Error applying theme:', error);
            throw error;
        }
    }

    /**
     * Get all themes (system + user custom) combined
     */
    async getAllThemes(): Promise<{ system: Theme[]; custom: Theme[]; all: Theme[] }> {
        try {
            const [systemResponse, userResponse] = await Promise.all([
                this.getSystemThemes(),
                this.getUserThemes().catch(() => ({ themes: [], total: 0 })) // Handle case when user not logged in
            ]);

            return {
                system: systemResponse.themes,
                custom: userResponse.themes,
                all: [...systemResponse.themes, ...userResponse.themes]
            };
        } catch (error) {
            console.error('Error fetching all themes:', error);
            throw error;
        }
    }
}

export const themeService = new ThemeService();
export default themeService;
