/**
 * Security & Privacy Types
 * Defines interfaces for Privacy & Security Page features
 */

export interface SecurityActivity {
  eventType: string;
  eventDescription: string;
  ipHash: string;
  deviceInfo: string;
  success: boolean;
  createdAt: string;
}

export interface SecurityActivityResponse {
  activities: SecurityActivity[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface TwoFactorSettings {
  enabled: boolean;
  method: 'totp' | 'sms' | null;
  lastUsed: string | null;
  enabledAt: string | null;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  profileIndexing: boolean;
  showOnlineStatus: boolean;
  loginAlerts: boolean;
  marketingEmails: boolean;
  dataRetentionDays: number;
}

export interface UpdatePrivacySettingsRequest {
  analyticsEnabled?: boolean;
  profileIndexing?: boolean;
  showOnlineStatus?: boolean;
  loginAlerts?: boolean;
  marketingEmails?: boolean;
  dataRetentionDays?: number;
}

export interface DataExportRequest {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileFormat: 'json' | 'csv';
  downloadUrl: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface DataExportResponse {
  requestId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'json' | 'csv';
  expiresAt: string;
  message: string;
}

export interface ExportRequestsResponse {
  requests: DataExportRequest[];
}

export interface SecurityStatusResponse {
  passwordChangedAt: string | null;
  activeSessions: number;
  recentEvents: SecurityActivity[];
  twoFactorEnabled: boolean;
}

/**
 * Component state types
 */
export interface ActivityLogFilters {
  eventType?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}
