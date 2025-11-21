// API Base URL - automatically detects if running through backend or Vite dev server
const API_BASE_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/api`
    : (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api');

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Helper function to make authenticated requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = getAuthToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error ${response.status}`);
    }

    return response.json();
}

// Authentication API
export const authAPI = {
    async register(username: string, password: string, email?: string) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, email }),
        });

        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    async login(username: string, password: string) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        if (data.token) {
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return data;
    },

    async getMe() {
        return apiRequest('/auth/me');
    },

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated(): boolean {
        return !!getAuthToken();
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

    // Get song URL for audio player
    getSongUrl(filePath: string): string {
        const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
        return `${baseUrl}${filePath}`;
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
