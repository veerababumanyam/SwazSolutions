import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Clock,
  BarChart3,
  Download,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  Bell,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import * as securityApi from '../services/securityApi';
import {
  SecurityStatusResponse,
  SecurityActivityResponse,
  PrivacySettings,
  DataExportRequest,
} from '../types/security';
import { Footer } from '../components/Footer';

type TabType = 'overview' | 'activity' | 'privacy' | 'data';

export const PrivacySecurityPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatusResponse | null>(null);
  const [activities, setActivities] = useState<SecurityActivityResponse | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);

  // Load data on mount and when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overview') {
        const status = await securityApi.getSecurityStatus();
        setSecurityStatus(status);
      } else if (activeTab === 'activity') {
        const activityData = await securityApi.getSecurityActivity(50, 0);
        setActivities(activityData);
      } else if (activeTab === 'privacy') {
        const privacy = await securityApi.getPrivacySettings();
        setPrivacySettings(privacy);
      } else if (activeTab === 'data') {
        const exports = await securityApi.getExportRequests();
        setExportRequests(exports.requests);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load security data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySettingChange = async (key: keyof PrivacySettings, value: any) => {
    if (!privacySettings) return;

    try {
      const updated = { ...privacySettings, [key]: value };
      await securityApi.updatePrivacySettings(updated);
      setPrivacySettings(updated);
      showToast('Privacy setting updated', 'success');
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
      showToast('Failed to update privacy setting', 'error');
    }
  };

  const handleDataExport = async (format: 'json' | 'csv') => {
    try {
      const result = await securityApi.requestDataExport(format);
      showToast(`Data export requested (${format.toUpperCase()})`, 'success');
      // Reload export requests
      const exports = await securityApi.getExportRequests();
      setExportRequests(exports.requests);
    } catch (error) {
      console.error('Failed to request data export:', error);
      showToast('Failed to request data export', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Privacy & Security</h1>
        <p className="text-secondary">Manage your security settings and privacy preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 -mb-px">
            <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
              <Shield className="w-4 h-4" />
              Overview
            </TabButton>
            <TabButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
              <Clock className="w-4 h-4" />
              Activity Log
            </TabButton>
            <TabButton active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}>
              <Lock className="w-4 h-4" />
              Privacy
            </TabButton>
            <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')}>
              <Download className="w-4 h-4" />
              Data Export
            </TabButton>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && securityStatus && (
              <OverviewTab status={securityStatus} navigate={navigate} />
            )}
            {activeTab === 'activity' && activities && <ActivityTab activities={activities} />}
            {activeTab === 'privacy' && privacySettings && (
              <PrivacyTab
                settings={privacySettings}
                onSettingChange={handlePrivacySettingChange}
              />
            )}
            {activeTab === 'data' && (
              <DataExportTab
                requests={exportRequests}
                onRequestExport={handleDataExport}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

// ========================================
// TAB NAVIGATION BUTTON
// ========================================

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors border-b-2 ${
      active
        ? 'text-accent border-accent'
        : 'text-secondary border-transparent hover:text-primary'
    }`}
  >
    {children}
  </button>
);

// ========================================
// TAB CONTENT COMPONENTS
// ========================================

interface OverviewTabProps {
  status: SecurityStatusResponse;
  navigate: (path: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ status, navigate }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-primary">Password Security</h3>
          </div>
          <p className="text-sm text-secondary mb-2">Last changed:</p>
          <p className="text-lg font-semibold text-primary">
            {formatDate(status.passwordChangedAt)}
          </p>
          <a
            href="/settings/account"
            className="text-accent text-sm hover:underline mt-4 inline-block"
          >
            Change Password →
          </a>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-primary">Active Sessions</h3>
          </div>
          <p className="text-sm text-secondary mb-2">Devices logged in:</p>
          <p className="text-lg font-semibold text-primary">{status.activeSessions}</p>
          <a
            href="/settings/account"
            className="text-accent text-sm hover:underline mt-4 inline-block"
          >
            Manage Sessions →
          </a>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Security Events
        </h3>
        {status.recentEvents.length > 0 ? (
          <div className="space-y-3">
            {status.recentEvents.slice(0, 5).map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className={`w-2 h-2 rounded-full mt-1 ${
                  event.success ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{event.eventDescription}</p>
                  <p className="text-xs text-muted">{new Date(event.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">No recent events</p>
        )}
      </div>

      {/* Security Info Box */}
      <div className="glass-card p-6 border-l-4 border-accent">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary mb-2">Enhance Your Security</h4>
            <p className="text-sm text-secondary mb-3">
              Two-Factor Authentication adds an extra layer of protection to your account. Phase 2 of our security
              updates will include this feature.
            </p>
            <a
              href="/settings/account"
              className="text-accent text-sm hover:underline"
            >
              View all account settings →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActivityTabProps {
  activities: SecurityActivityResponse;
}

const ActivityTab: React.FC<ActivityTabProps> = ({ activities }) => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const paginatedActivities = activities.activities.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-semibold text-primary mb-4">Security Activity Timeline</h3>

        {activities.activities.length > 0 ? (
          <>
            <div className="space-y-3">
              {paginatedActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0"
                >
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                    activity.success ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-primary">{activity.eventDescription}</p>
                    <p className="text-sm text-secondary mt-1">
                      {activity.deviceInfo || 'Unknown device'}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.success
                      ? 'bg-green-100/20 text-green-600'
                      : 'bg-red-100/20 text-red-600'
                  }`}>
                    {activity.success ? 'Success' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {activities.total > itemsPerPage && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted">
                  Showing {page * itemsPerPage + 1}-
                  {Math.min((page + 1) * itemsPerPage, activities.total)} of{' '}
                  {activities.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage(Math.min(Math.ceil(activities.total / itemsPerPage) - 1, page + 1))
                    }
                    disabled={!activities.hasMore}
                    className="px-3 py-1 text-sm bg-surface border border-border rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-secondary">No security events yet</p>
        )}
      </div>
    </div>
  );
};

interface PrivacyTabProps {
  settings: PrivacySettings;
  onSettingChange: (key: keyof PrivacySettings, value: any) => Promise<void>;
}

const PrivacyTab: React.FC<PrivacyTabProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 space-y-6">
        <h3 className="font-semibold text-primary">Privacy Controls</h3>

        {/* Analytics */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-primary">Analytics Tracking</h4>
            <p className="text-xs text-secondary mt-1">
              Allow us to collect usage analytics to improve your experience
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.analyticsEnabled}
            onChange={(e) => onSettingChange('analyticsEnabled', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Profile Indexing */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-primary">Search Engine Indexing</h4>
            <p className="text-xs text-secondary mt-1">
              Allow your profile to appear in search engine results
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.profileIndexing}
            onChange={(e) => onSettingChange('profileIndexing', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Online Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-primary">Show Online Status</h4>
            <p className="text-xs text-secondary mt-1">
              Let others see when you're online
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.showOnlineStatus}
            onChange={(e) => onSettingChange('showOnlineStatus', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Login Alerts */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-primary">Login Alerts</h4>
            <p className="text-xs text-secondary mt-1">
              Get notified of login attempts from new devices
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.loginAlerts}
            onChange={(e) => onSettingChange('loginAlerts', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Marketing Emails */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
          <div>
            <h4 className="font-medium text-primary">Marketing Emails</h4>
            <p className="text-xs text-secondary mt-1">
              Receive updates about new features and promotions
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.marketingEmails}
            onChange={(e) => onSettingChange('marketingEmails', e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
        </div>

        {/* Data Retention */}
        <div className="p-4 bg-white/5 rounded-lg">
          <h4 className="font-medium text-primary mb-2">Data Retention Period</h4>
          <p className="text-xs text-secondary mb-3">
            How long to keep your activity logs and analytics data
          </p>
          <select
            value={settings.dataRetentionDays}
            onChange={(e) => onSettingChange('dataRetentionDays', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={180}>6 months</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface DataExportTabProps {
  requests: DataExportRequest[];
  onRequestExport: (format: 'json' | 'csv') => Promise<void>;
}

const DataExportTab: React.FC<DataExportTabProps> = ({ requests, onRequestExport }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setExporting(true);
      await onRequestExport(format);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Request Box */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Request Your Data
        </h3>
        <p className="text-sm text-secondary mb-6">
          Download a copy of all your personal data in compliance with GDPR. We'll prepare your data
          and send you a download link within 24 hours.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className="w-full px-6 py-3 bg-brand-gradient text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export as JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="w-full px-6 py-3 bg-surface border border-border text-primary font-medium rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export as CSV
          </button>
        </div>
      </div>

      {/* Export History */}
      {requests.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-primary mb-4">Export History</h3>
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="font-medium text-primary capitalize">{request.fileFormat} Export</p>
                  <p className="text-xs text-secondary mt-1">
                    Requested: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      request.status === 'completed'
                        ? 'bg-green-100/20 text-green-600'
                        : request.status === 'processing'
                        ? 'bg-blue-100/20 text-blue-600'
                        : 'bg-gray-100/20 text-gray-600'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.downloadUrl && request.status === 'completed' && (
                    <a
                      href={request.downloadUrl}
                      className="text-accent text-sm hover:underline"
                    >
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
