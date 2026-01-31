// API Base URL - use relative paths for Vite proxy in development
const API_BASE_URL = '/api';

// Custom error class for aborted requests
export class AbortError extends Error {
    constructor(message = 'Request was aborted') {
        super(message);
        this.name = 'AbortError';
    }
}

// Helper function to make authenticated requests with AbortController support
async function apiRequest(endpoint: string, options: RequestInit = {}, signal?: AbortSignal) {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Send httpOnly cookies automatically
        signal, // Pass the abort signal to fetch
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error ${response.status}`);
    }

    return response.json();
}

/**
 * Create an abortable API request helper
 * Returns a function that can be used to make requests with automatic cleanup
 * @returns A function that takes endpoint and options, and returns the request with abort controller
 */
export function createAbortableRequest() {
    let controller: AbortController | null = null;

    const request = async (endpoint: string, options: RequestInit = {}) => {
        // Abort any existing request
        if (controller) {
            controller.abort();
        }

        // Create new controller for this request
        controller = new AbortController();

        try {
            return await apiRequest(endpoint, options, controller.signal);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new AbortError('Request was cancelled');
            }
            throw error;
        }
    };

    // Cleanup function to abort ongoing request
    const abort = () => {
        if (controller) {
            controller.abort();
            controller = null;
        }
    };

    return { request, abort };
}

// Authentication API
export const authAPI = {
    async register(username: string, password: string, email?: string) {
        // Backend sets httpOnly cookies - no token storage needed
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, email }),
        });
    },

    async login(username: string, password: string) {
        // Backend sets httpOnly cookies - no token storage needed
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    async getMe() {
        return apiRequest('/auth/me');
    },

    async logout() {
        // Call backend logout to clear httpOnly cookies
        return apiRequest('/auth/logout', { method: 'POST' });
    },

    async forgotPassword(email: string) {
        return apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    async verifyResetToken(token: string) {
        return apiRequest(`/auth/verify-reset-token/${token}`);
    },

    async resetPassword(token: string, newPassword: string) {
        return apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword }),
        });
    },
};

// Songs API
export const songsAPI = {
    async list(params?: { page?: number; limit?: number; album?: string; artist?: string; search?: string }) {
        const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return apiRequest(`/songs${queryString}`);
    },

    async get(id: number) {
        return apiRequest(`/songs/${id}`);
    },

    async scan() {
        return apiRequest('/songs/scan', { method: 'POST' });
    },

    async trackPlay(id: number) {
        return apiRequest(`/songs/${id}/play`, { method: 'POST' });
    },

    async getAlbums() {
        return apiRequest('/songs/albums/list');
    },

    async search(query: string) {
        return apiRequest(`/songs/search/query?q=${encodeURIComponent(query)}`);
    },

    async getPresignedUrl(id: number) {
        return apiRequest(`/songs/${id}/presigned-url`);
    },

    // Get song URL for audio player
    getSongUrl(filePath: string): string {
        // Use relative path for Vite proxy
        return filePath;
    },
};

// Playlists API
export const playlistsAPI = {
    async list() {
        return apiRequest('/playlists');
    },

    async get(id: number) {
        return apiRequest(`/playlists/${id}`);
    },

    async create(name: string, description?: string, isPublic?: boolean) {
        return apiRequest('/playlists', {
            method: 'POST',
            body: JSON.stringify({ name, description, is_public: isPublic }),
        });
    },

    async update(id: number, data: { name?: string; description?: string; is_public?: boolean }) {
        return apiRequest(`/playlists/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: number) {
        return apiRequest(`/playlists/${id}`, { method: 'DELETE' });
    },

    async addSong(playlistId: number, songId: number) {
        return apiRequest(`/playlists/${playlistId}/songs`, {
            method: 'POST',
            body: JSON.stringify({ song_id: songId }),
        });
    },

    async removeSong(playlistId: number, songId: number) {
        return apiRequest(`/playlists/${playlistId}/songs/${songId}`, {
            method: 'DELETE',
        });
    },
};

// Health check
export const healthAPI = {
    async check() {
        return apiRequest('/health');
    },
};

// Export all APIs
export const api = {
    auth: authAPI,
    songs: songsAPI,
    playlists: playlistsAPI,
    health: healthAPI,
};

export default api;
