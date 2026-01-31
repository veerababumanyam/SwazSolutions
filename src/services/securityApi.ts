/**
 * Security API Service
 * Handles all API calls for security, privacy, and GDPR features
 */

import {
  SecurityActivity,
  SecurityActivityResponse,
  PrivacySettings,
  UpdatePrivacySettingsRequest,
  DataExportResponse,
  ExportRequestsResponse,
  SecurityStatusResponse,
} from '../types/security';

const API_BASE = '/api/security';

/**
 * Get security activity log
 */
export async function getSecurityActivity(
  limit: number = 50,
  offset: number = 0,
  eventType?: string
): Promise<SecurityActivityResponse> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (eventType) {
      params.append('eventType', eventType);
    }

    const response = await fetch(`${API_BASE}/activity?${params}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch security activity: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching security activity:', error);
    throw error;
  }
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings(): Promise<PrivacySettings> {
  try {
    const response = await fetch(`${API_BASE}/privacy-settings`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch privacy settings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    throw error;
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(
  settings: UpdatePrivacySettingsRequest
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE}/privacy-settings`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update privacy settings: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    throw error;
  }
}

/**
 * Request data export (GDPR)
 */
export async function requestDataExport(format: 'json' | 'csv'): Promise<DataExportResponse> {
  try {
    const response = await fetch(`${API_BASE}/export-data`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format }),
    });

    if (!response.ok) {
      throw new Error(`Failed to request data export: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting data export:', error);
    throw error;
  }
}

/**
 * Get list of export requests
 */
export async function getExportRequests(): Promise<ExportRequestsResponse> {
  try {
    const response = await fetch(`${API_BASE}/export-requests`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch export requests: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching export requests:', error);
    throw error;
  }
}

/**
 * Get security status overview
 */
export async function getSecurityStatus(): Promise<SecurityStatusResponse> {
  try {
    const response = await fetch(`${API_BASE}/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch security status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching security status:', error);
    throw error;
  }
}

/**
 * Log a security event (internal use)
 */
export async function logSecurityActivity(
  eventType: string,
  eventDescription: string,
  metadata?: any
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API_BASE}/activity`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventType,
        eventDescription,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to log security activity: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error logging security activity:', error);
    throw error;
  }
}
