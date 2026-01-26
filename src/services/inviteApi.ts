/**
 * Digital Invitations API Service
 * API client for digital invitation features
 */

import type {
  DigitalInvite,
  Guest,
  GuestGroup,
  SavedTemplate,
  InviteAnalytics,
  CheckIn,
  ApiResponse,
  Analytics as AnalyticsType
} from '../types/invite.types';

// API Base URL - use relative paths for Vite proxy in development
const API_BASE_URL = '/api';

// Helper function to make authenticated requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies automatically
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// INVITATION API
// ============================================================================

export const inviteApi = {
  // List all invitations
  listInvites: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiRequest(`/invites${queryString}`);
    return response.data;
  },

  // Get single invitation
  getInvite: async (id: string) => {
    const response = await apiRequest(`/invites/${id}`);
    return response.data;
  },

  // Create invitation
  createInvite: async (data: Partial<DigitalInvite>) => {
    const response = await apiRequest('/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update invitation
  updateInvite: async (id: string, data: Partial<DigitalInvite>) => {
    const response = await apiRequest(`/invites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete invitation
  deleteInvite: async (id: string) => {
    const response = await apiRequest(`/invites/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Publish invitation
  publishInvite: async (id: string) => {
    const response = await apiRequest(`/invites/${id}/publish`, {
      method: 'POST',
    });
    return response.data;
  },

  // Get public invitation by slug
  getPublicInvite: async (slug: string) => {
    const response = await apiRequest(`/invites/slug/${slug}`);
    return response.data;
  },

  // Generate AI text
  generateAiText: async (id: string, options: { tone: string; venueDetails: string; culturalContext?: string }) => {
    const response = await apiRequest(`/invites/${id}/ai-generate`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return response.data;
  },

  // Duplicate invitation
  duplicateInvite: async (id: string) => {
    const response = await apiRequest(`/invites/${id}/duplicate`, {
      method: 'POST',
    });
    return response.data;
  },

  // Get statistics
  getStats: async () => {
    const response = await apiRequest('/invites/stats/overview');
    return response.data;
  },

  // Get QR code URL (helper for frontend)
  getQRCodeUrl: (slug: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/invite/${slug}`)}`;
  },

  // Get analytics for an invite (returns array)
  getAnalytics: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/analytics/all`);
    return response.data;
  },

  // List templates (user's saved templates)
  listTemplates: async () => {
    const response = await apiRequest('/invites/templates/my');
    return response.data;
  },

  // List guests
  listGuests: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/guests`);
    return response.data;
  }
};

// ============================================================================
// GUEST API
// ============================================================================

export const guestApi = {
  // List guests for invitation
  listGuests: async (inviteId: string, params?: {
    category?: string;
    status?: string;
    invited?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiRequest(`/invites/${inviteId}/guests${queryString}`);
    return response.data;
  },

  // Add guest
  addGuest: async (inviteId: string, data: Partial<Guest>) => {
    const response = await apiRequest(`/invites/${inviteId}/guests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update guest
  updateGuest: async (inviteId: string, guestId: string, data: Partial<Guest>) => {
    const response = await apiRequest(`/invites/${inviteId}/guests/${guestId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete guest
  deleteGuest: async (inviteId: string, guestId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/guests/${guestId}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Bulk operations
  bulkOperation: async (inviteId: string, operation: string, guestIds: string[], data?: any) => {
    const response = await apiRequest(`/invites/${inviteId}/guests/bulk`, {
      method: 'POST',
      body: JSON.stringify({ operation, guestIds, data }),
    });
    return response.data;
  },

  // Import guests
  importGuests: async (inviteId: string, guests: any[]) => {
    const response = await apiRequest(`/invites/${inviteId}/guests/import`, {
      method: 'POST',
      body: JSON.stringify({ guests }),
    });
    return response.data;
  },

  // Export guests
  exportGuests: async (inviteId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/guests/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `guests_${inviteId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  },

  // Send invitations
  sendInvites: async (inviteId: string, guestIds: string[], message?: string) => {
    const response = await apiRequest(`/invites/${inviteId}/guests/send-invites`, {
      method: 'POST',
      body: JSON.stringify({ guestIds, message }),
    });
    return response.data;
  }
};

// ============================================================================
// GUEST GROUPS API
// ============================================================================

export const guestGroupApi = {
  // List all groups
  listGroups: async () => {
    const response = await apiRequest('/invites/guest-groups');
    return response.data;
  },

  // Get single group
  getGroup: async (id: string) => {
    const response = await apiRequest(`/invites/guest-groups/${id}`);
    return response.data;
  },

  // Create group
  createGroup: async (data: { name: string; description?: string; color?: string }) => {
    const response = await apiRequest('/invites/guest-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update group
  updateGroup: async (id: string, data: { name?: string; description?: string; color?: string }) => {
    const response = await apiRequest(`/invites/guest-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete group
  deleteGroup: async (id: string) => {
    const response = await apiRequest(`/invites/guest-groups/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Add guests to group
  addGuestsToGroup: async (id: string, guestIds: string[]) => {
    const response = await apiRequest(`/invites/guest-groups/${id}/guests`, {
      method: 'POST',
      body: JSON.stringify({ guestIds }),
    });
    return response.data;
  },

  // Remove guest from group
  removeGuestFromGroup: async (id: string, guestId: string) => {
    const response = await apiRequest(`/invites/guest-groups/${id}/guests/${guestId}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Bulk assign guests from group
  bulkAssignFromGroup: async (id: string, data: { category?: string; status?: string; inviteId?: string }) => {
    const response = await apiRequest(`/invites/guest-groups/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }
};

// ============================================================================
// TEMPLATE API
// ============================================================================

export const templateApi = {
  // Get marketplace templates
  getMarketplace: async (params?: { category?: string; search?: string; sort?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiRequest(`/invites/templates${queryString}`);
    return response.data;
  },

  // Get my templates
  getMyTemplates: async () => {
    const response = await apiRequest('/invites/templates/my');
    return response.data;
  },

  // Get single template
  getTemplate: async (id: string) => {
    const response = await apiRequest(`/invites/templates/${id}`);
    return response.data;
  },

  // Save template
  saveTemplate: async (data: Partial<SavedTemplate>) => {
    const response = await apiRequest('/invites/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update template
  updateTemplate: async (id: string, data: Partial<SavedTemplate>) => {
    const response = await apiRequest(`/invites/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    const response = await apiRequest(`/invites/templates/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Use template (increments download count)
  useTemplate: async (id: string) => {
    const response = await apiRequest(`/invites/templates/${id}/use`, {
      method: 'POST',
    });
    return response.data;
  },

  // Rate template
  rateTemplate: async (id: string, rating: number) => {
    const response = await apiRequest(`/invites/templates/${id}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating }),
    });
    return response.data;
  },

  // Get template ratings
  getTemplateRatings: async (id: string, limit?: number) => {
    const queryString = limit ? `?limit=${limit}` : '';
    const response = await apiRequest(`/invites/templates/${id}/ratings${queryString}`);
    return response.data;
  }
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
  // Get invitation analytics
  getAnalytics: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/analytics`);
    return response.data;
  },

  // Get guest activity
  getGuestActivity: async (inviteId: string, params?: { status?: string; search?: string }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiRequest(`/invites/${inviteId}/analytics/guests${queryString}`);
    return response.data;
  },

  // Get geographic data
  getGeoData: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/analytics/geo`);
    return response.data;
  },

  // Get device breakdown
  getDeviceBreakdown: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/analytics/devices`);
    return response.data;
  },

  // Get timeline data
  getTimeline: async (inviteId: string, days?: number) => {
    const queryString = days ? `?days=${days}` : '';
    const response = await apiRequest(`/invites/${inviteId}/analytics/timeline${queryString}`);
    return response.data;
  },

  // Track analytics event (public)
  trackEvent: async (inviteId: string, eventType: string, guestId?: string, metadata?: any) => {
    await apiRequest(`/invites/${inviteId}/analytics/track`, {
      method: 'POST',
      body: JSON.stringify({ eventType, guestId, metadata }),
    });
    return { success: true };
  },

  // Export analytics
  exportAnalytics: async (inviteId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/analytics/export`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `analytics_${inviteId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    return { success: true };
  }
};

// ============================================================================
// CHECK-IN API
// ============================================================================

export const checkInApi = {
  // Check in guest
  checkInGuest: async (inviteId: string, guestId?: string, qrData?: string) => {
    const response = await apiRequest(`/invites/${inviteId}/checkin`, {
      method: 'POST',
      body: JSON.stringify({ guestId, qrData }),
    });
    return response.data;
  },

  // Get check-ins list
  getCheckIns: async (inviteId: string, params?: { limit?: number; offset?: number }) => {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await apiRequest(`/invites/${inviteId}/checkin${queryString}`);
    return response.data;
  },

  // Get check-in stats
  getCheckInStats: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/checkin/stats`);
    return response.data;
  },

  // Verify guest QR code
  verifyGuest: async (inviteId: string, guestId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/checkin/verify/${guestId}`);
    return response.data;
  },

  // Undo check-in (admin)
  undoCheckIn: async (inviteId: string, checkInId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/checkin/${checkInId}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Search guests for manual check-in
  searchGuests: async (inviteId: string, query: string) => {
    const response = await apiRequest(`/invites/${inviteId}/checkin/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get pending guests (not checked in)
  getPendingGuests: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/checkin/pending`);
    return response.data;
  }
};

// ============================================================================
// RSVP API
// ============================================================================

export const rsvpApi = {
  // Submit RSVP (public)
  submitRSVP: async (slug: string, data: {
    guestId?: string;
    name: string;
    email: string;
    response: 'Accepted' | 'Declined';
    plusOnes: number;
    dietary?: string;
    message?: string;
  }) => {
    const response = await apiRequest(`/invites/${slug}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Get RSVPs for invitation
  getRSVPs: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/rsvps`);
    return response.data;
  }
};

// ============================================================================
// SHARING API
// ============================================================================

export const sharingApi = {
  // Generate QR code
  generateQR: async (inviteId: string, type: 'main' | 'rsvp' | 'map' = 'main') => {
    const response = await apiRequest(`/invites/${inviteId}/qr?type=${type}`);
    return response.data;
  },

  // Get all share links
  getShareLinks: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/share/links`);
    return response.data;
  },

  // WhatsApp share (generate links)
  shareWhatsApp: async (inviteId: string, phoneNumbers: string[], message?: string) => {
    const response = await apiRequest(`/invites/${inviteId}/share/whatsapp`, {
      method: 'POST',
      body: JSON.stringify({ phoneNumbers, message }),
    });
    return response.data;
  },

  // Instagram story generation
  generateInstagramStory: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/share/instagram`, {
      method: 'POST',
    });
    return response.data;
  },

  // Bulk email
  sendBulkEmail: async (inviteId: string, guestIds: string[], subject: string, message: string) => {
    const response = await apiRequest(`/invites/${inviteId}/share/email`, {
      method: 'POST',
      body: JSON.stringify({ guestIds, subject, message }),
    });
    return response.data;
  },

  // Track share event (public)
  trackShare: async (inviteId: string, channel: string) => {
    await apiRequest(`/invites/${inviteId}/share/track`, {
      method: 'POST',
      body: JSON.stringify({ channel }),
    });
    return { success: true };
  }
};

// ============================================================================
// GALLERY API
// ============================================================================

export const galleryApi = {
  // Get gallery photos
  getGallery: async (inviteId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/gallery`);
    return response.data;
  },

  // Upload photo (requires FormData)
  uploadPhoto: async (inviteId: string, file: File, caption?: string) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('photo', file);
    if (caption) formData.append('caption', caption);

    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return response.json();
  },

  // Update photo
  updatePhoto: async (inviteId: string, photoId: string, data: { caption?: string; isCover?: boolean }) => {
    const response = await apiRequest(`/invites/${inviteId}/gallery/${photoId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete photo
  deletePhoto: async (inviteId: string, photoId: string) => {
    const response = await apiRequest(`/invites/${inviteId}/gallery/${photoId}`, {
      method: 'DELETE',
    });
    return response.data;
  },

  // Reorder photos
  reorderPhotos: async (inviteId: string, photoIds: string[]) => {
    const response = await apiRequest(`/invites/${inviteId}/gallery/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ photoIds }),
    });
    return response.data;
  },

  // Batch upload photos
  batchUpload: async (inviteId: string, files: File[]) => {
    const token = getAuthToken();
    const formData = new FormData();
    files.forEach(file => formData.append('photos', file));

    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/gallery/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return response.json();
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Generate invitation URL
export const getInviteUrl = (slug: string, baseUrl: string = window.location.origin) => {
  return `${baseUrl}/invite/${slug}`;
};

// Generate QR code URL
export const getQRCodeUrl = (data: string, size: number = 200) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
};

// Format guest data for CSV import
export const formatGuestCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split('\n');
  const guests = [];

  for (const line of lines) {
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 2 && parts[0]) {
      guests.push({
        name: parts[0],
        email: parts[1],
        phone: parts[2] || '',
        category: ['Family', 'Friends', 'Work', 'VIP', 'Other'].includes(parts[3]) ? parts[3] : 'Other'
      });
    }
  }

  return guests;
};

// Download file helper
export const downloadFile = (data: Blob, filename: string) => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default {
  inviteApi,
  guestApi,
  guestGroupApi,
  templateApi,
  analyticsApi,
  checkInApi,
  rsvpApi,
  sharingApi,
  galleryApi
};
