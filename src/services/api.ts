// API Base URL - use relative paths for Vite proxy in development
const API_BASE_URL = '/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Custom error class for aborted requests
export class AbortError extends Error {
    constructor(message = 'Request was aborted') {
        super(message);
        this.name = 'AbortError';
    }
}

// Helper function to make authenticated requests with AbortController support
async function apiRequest(endpoint: string, options: RequestInit = {}, signal?: AbortSignal) {
    // #region agent log
    const token = getAuthToken();
    fetch('http://127.0.0.1:7244/ingest/6fb2892c-1108-4dd2-a04b-3b1b4843d9e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:19',message:'apiRequest called',data:{endpoint,hasToken:!!token,tokenLength:token?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/6fb2892c-1108-4dd2-a04b-3b1b4843d9e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:30',message:'Making fetch request',data:{endpoint,hasAuthHeader:!!headers['Authorization']},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal, // Pass the abort signal to fetch
    });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/6fb2892c-1108-4dd2-a04b-3b1b4843d9e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:36',message:'Response received',data:{endpoint,status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/6fb2892c-1108-4dd2-a04b-3b1b4843d9e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:38',message:'Response not ok, throwing error',data:{endpoint,status:response.status,error:error.error||'Request failed'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
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
