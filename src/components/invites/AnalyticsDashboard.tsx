import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  Filter
} from 'lucide-react';
import { inviteApi } from '../../services/inviteApi';
import { DigitalInvite, Analytics as AnalyticsType, Guest } from '../../types/invite.types';

// Local alias to avoid conflict with component name
type Analytics = AnalyticsType;

interface AnalyticsDashboardProps {
  inviteId: string;
  onBack: () => void;
}

interface TimeSeriesData {
  date: string;
  views: number;
  clicks: number;
  responses: number;
}

interface DeviceStats {
  mobile: number;
  desktop: number;
  tablet: number;
}

interface GeoData {
  city: string;
  country: string;
  count: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ inviteId, onBack }) => {
  const [invite, setInvite] = useState<DigitalInvite | null>(null);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({ mobile: 0, desktop: 0, tablet: 0 });
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [inviteId, dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load invite details
      const inviteData = await inviteApi.getInvite(inviteId);
      setInvite(inviteData);

      // Load analytics
      const analyticsData = await inviteApi.getAnalytics(inviteId);
      setAnalytics(analyticsData);

      // Load guests
      const guestsData = await inviteApi.listGuests(inviteId);
      setGuests(guestsData);

      // Process time series data
      const processed = processTimeSeriesData(analyticsData, dateRange);
      setTimeSeriesData(processed);

      // Calculate device stats
      const devices = calculateDeviceStats(analyticsData);
      setDeviceStats(devices);

      // Process geographic data
      const geo = processGeoData(analyticsData);
      setGeoData(geo);

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTimeSeriesData = (data: Analytics[], range: string): TimeSeriesData[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const result: TimeSeriesData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = data.filter(a => a.date.startsWith(dateStr));

      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: dayData.filter(a => a.eventType === 'view').length,
        clicks: dayData.filter(a => a.eventType === 'click').length,
        responses: dayData.filter(a => a.eventType === 'rsvp_response').length
      });
    }

    return result;
  };

  const calculateDeviceStats = (data: Analytics[]): DeviceStats => {
    return data.reduce((acc, item) => {
      if (item.deviceType === 'mobile') acc.mobile++;
      else if (item.deviceType === 'desktop') acc.desktop++;
      else if (item.deviceType === 'tablet') acc.tablet++;
      return acc;
    }, { mobile: 0, desktop: 0, tablet: 0 });
  };

  const processGeoData = (data: Analytics[]): GeoData[] => {
    const geoMap = new Map<string, GeoData>();

    data.forEach(item => {
      if (item.city && item.country) {
        const key = `${item.city}, ${item.country}`;
        const existing = geoMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          geoMap.set(key, { city: item.city, country: item.country, count: 1 });
        }
      }
    });

    return Array.from(geoMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const calculateStats = () => {
    const totalViews = analytics.filter(a => a.eventType === 'view').length;
    const totalClicks = analytics.filter(a => a.eventType === 'click').length;
    const uniqueVisitors = new Set(analytics.map(a => a.ipAddress)).size;
    const rsvps = guests.filter(g => g.status !== 'Pending').length;
    const accepted = guests.filter(g => g.status === 'Accepted').length;
    const declined = guests.filter(g => g.status === 'Declined').length;

    return {
      totalViews,
      totalClicks,
      uniqueVisitors,
      rsvps,
      accepted,
      declined,
      clickRate: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0',
      responseRate: guests.length > 0 ? ((rsvps / guests.length) * 100).toFixed(1) : '0',
      acceptanceRate: rsvps > 0 ? ((accepted / rsvps) * 100).toFixed(1) : '0'
    };
  };

  const handleExportReport = async () => {
    const stats = calculateStats();

    const report = {
      invite: {
        title: invite?.hostName,
        eventType: invite?.eventType,
        date: invite?.date,
        venue: invite?.venue
      },
      statistics: stats,
      guests: {
        total: guests.length,
        accepted: stats.accepted,
        declined: stats.declined,
        pending: guests.length - stats.accepted - stats.declined
      },
      deviceBreakdown: deviceStats,
      topLocations: geoData.slice(0, 5),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invite?.slug || inviteId}-analytics.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = calculateStats();
  const totalDevices = deviceStats.mobile + deviceStats.desktop + deviceStats.tablet;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            {invite?.hostName} - {invite?.eventType} invitation
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {stats.clickRate}% CTR
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalViews}</p>
            <p className="text-sm text-gray-600">Total Views</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {stats.clickRate}%
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalClicks}</p>
            <p className="text-sm text-gray-600">Total Clicks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {stats.responseRate}% response
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.rsvps}</p>
            <p className="text-sm text-gray-600">RSVPs Received</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                {stats.acceptanceRate}% yes
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.accepted}</p>
            <p className="text-sm text-gray-600">Accepted</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Engagement Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Engagement Timeline</h3>
            <div className="space-y-4">
              {timeSeriesData.slice(-7).map((item, index) => {
                const maxViews = Math.max(...timeSeriesData.map(d => d.views));
                const viewsHeight = (item.views / maxViews) * 100;

                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-600">{item.date}</div>
                    <div className="flex-1 h-16 bg-gray-50 rounded-lg relative overflow-hidden flex items-end gap-1 p-2">
                      <div
                        className="bg-blue-500 rounded-t transition-all"
                        style={{ height: `${viewsHeight}%`, width: '33%' }}
                        title={`${item.views} views`}
                      />
                      <div
                        className="bg-green-500 rounded-t transition-all"
                        style={{ height: `${(item.clicks / maxViews) * 100}%`, width: '33%' }}
                        title={`${item.clicks} clicks`}
                      />
                      <div
                        className="bg-purple-500 rounded-t transition-all"
                        style={{ height: `${(item.responses / maxViews) * 100}%`, width: '33%' }}
                        title={`${item.responses} responses`}
                      />
                    </div>
                    <div className="w-24 text-right text-sm">
                      <div className="text-blue-600">{item.views}v</div>
                      <div className="text-green-600">{item.clicks}c</div>
                      <div className="text-purple-600">{item.responses}r</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-gray-600">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span className="text-gray-600">Clicks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span className="text-gray-600">Responses</span>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Device Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Mobile</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(deviceStats.mobile / totalDevices) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                    {totalDevices > 0 ? Math.round((deviceStats.mobile / totalDevices) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Desktop</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(deviceStats.desktop / totalDevices) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                    {totalDevices > 0 ? Math.round((deviceStats.desktop / totalDevices) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Tablet className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Tablet</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${(deviceStats.tablet / totalDevices) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 w-12 text-right">
                    {totalDevices > 0 ? Math.round((deviceStats.tablet / totalDevices) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geographic Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Locations */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">Top Locations</h3>
            </div>
            {geoData.length > 0 ? (
              <div className="space-y-3">
                {geoData.map((location, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-800">{location.city}</div>
                      <div className="text-sm text-gray-600">{location.country}</div>
                    </div>
                    <div className="text-sm font-semibold text-purple-600">{location.count} views</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No location data available</p>
            )}
          </div>

          {/* RSVP Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-800">RSVP Breakdown</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Guests</span>
                <span className="text-2xl font-bold text-gray-800">{guests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-600">Accepted</span>
                <span className="text-2xl font-bold text-green-600">{stats.accepted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600">Declined</span>
                <span className="text-2xl font-bold text-red-600">{stats.declined}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-600">Pending</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {guests.length - stats.accepted - stats.declined}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Plus-Ones</span>
                  <span className="text-xl font-semibold text-gray-800">
                    {guests.reduce((sum, g) => sum + (g.plusOnes || 0), 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
