// ProfileAnalytics Page (T269)
// Enhanced analytics dashboard with interactive charts, filters, and detailed breakdowns

import React, { useEffect, useState, useCallback } from 'react';
import { profileService } from '../services/profileService';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ============================================================================
// Types
// ============================================================================
interface RealtimeStats {
  views: number;
  uniqueVisitors: number;
  downloads: number;
  shares: number;
}

interface AnalyticsTotals {
  totalViews: number;
  totalUniqueVisitors: number;
  totalDownloads: number;
  totalShares: number;
  conversionRate: number;
}

interface TimeSeriesData {
  date: string;
  views: number;
  uniqueVisitors: number;
  downloads: number;
  shares: number;
}

interface AnalyticsData {
  totals: AnalyticsTotals;
  timeSeries: TimeSeriesData[];
  lastUpdated: string | null;
}

interface ShareBreakdown {
  channel: string;
  count: number;
  percentage: string;
}

interface DeviceBreakdown {
  device: string;
  count: number;
  percentage: number;
}

interface ReferrerBreakdown {
  source: string;
  count: number;
  percentage: number;
}

interface TrendData {
  current: number;
  previous: number;
  change: number;
}

interface Trends {
  views: TrendData;
  visitors: TrendData;
  downloads: TrendData;
  shares: TrendData;
}

type DateRange = '7d' | '30d' | '90d' | 'custom';
type ChartMetric = 'views' | 'uniqueVisitors' | 'downloads' | 'shares';

// ============================================================================
// Chart Colors
// ============================================================================
const CHART_COLORS = {
  views: '#3B82F6',
  uniqueVisitors: '#10B981',
  downloads: '#8B5CF6',
  shares: '#F59E0B'
};

const PIE_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

// ============================================================================
// Component
// ============================================================================
export const ProfileAnalytics: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [shareBreakdown, setShareBreakdown] = useState<ShareBreakdown[]>([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[]>([]);
  const [referrerBreakdown, setReferrerBreakdown] = useState<ReferrerBreakdown[]>([]);
  const [trends, setTrends] = useState<Trends | null>(null);

  // Filter state
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<ChartMetric[]>(['views', 'uniqueVisitors']);
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'sources'>('overview');

  // Calculate date range
  const getDateRange = useCallback(() => {
    const end = new Date();
    let start = new Date();

    switch (dateRange) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            startDate: customStartDate,
            endDate: customEndDate
          };
        }
        start.setDate(end.getDate() - 30);
        break;
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, [dateRange, customStartDate, customEndDate]);

  // Fetch all analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();

      // Fetch all data in parallel
      const [
        realtimeResponse,
        historicalResponse,
        shareResponse,
        deviceResponse,
        referrerResponse,
        trendResponse
      ] = await Promise.all([
        profileService.getRealtimeAnalytics(),
        profileService.getMyAnalytics(startDate, endDate),
        profileService.getShareAnalytics(startDate, endDate),
        profileService.getDeviceAnalytics(startDate, endDate),
        profileService.getReferrerAnalytics(startDate, endDate),
        profileService.getTrendAnalytics()
      ]);

      setRealtimeStats(realtimeResponse.today);
      setAnalyticsData(historicalResponse);
      setShareBreakdown(shareResponse.breakdown || []);
      setDeviceBreakdown(deviceResponse.breakdown || []);
      setReferrerBreakdown(referrerResponse.breakdown || []);
      setTrends(trendResponse.trends || null);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchAnalytics();

    // Refresh realtime stats every 30 seconds
    const interval = setInterval(async () => {
      try {
        const realtimeResponse = await profileService.getRealtimeAnalytics();
        setRealtimeStats(realtimeResponse.today);
      } catch (err) {
        console.error('Failed to refresh realtime stats:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Refetch when date range changes
  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [dateRange, customStartDate, customEndDate]);

  // Calculate combined totals (historical + today's realtime)
  const combinedTotals = {
    totalViews: (analyticsData?.totals?.totalViews || 0) + (realtimeStats?.views || 0),
    totalUniqueVisitors: (analyticsData?.totals?.totalUniqueVisitors || 0) + (realtimeStats?.uniqueVisitors || 0),
    totalDownloads: (analyticsData?.totals?.totalDownloads || 0) + (realtimeStats?.downloads || 0),
    totalShares: (analyticsData?.totals?.totalShares || 0) + (realtimeStats?.shares || 0),
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Toggle metric selection
  const toggleMetric = (metric: ChartMetric) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      }
      return [...prev, metric];
    });
  };

  // Render trend indicator
  const TrendIndicator: React.FC<{ change: number }> = ({ change }) => {
    if (change === 0) {
      return <span className="text-gray-500 text-sm">No change</span>;
    }
    const isPositive = change > 0;
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Make sure you have a published profile to view analytics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stat cards configuration
  const stats = [
    {
      label: 'Total Views',
      value: formatNumber(combinedTotals.totalViews),
      todayValue: realtimeStats?.views || 0,
      trend: trends?.views,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      label: 'Unique Visitors',
      value: formatNumber(combinedTotals.totalUniqueVisitors),
      todayValue: realtimeStats?.uniqueVisitors || 0,
      trend: trends?.visitors,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'green'
    },
    {
      label: 'vCard Downloads',
      value: formatNumber(combinedTotals.totalDownloads),
      todayValue: realtimeStats?.downloads || 0,
      trend: trends?.downloads,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      color: 'purple'
    },
    {
      label: 'Profile Shares',
      value: formatNumber(combinedTotals.totalShares),
      todayValue: realtimeStats?.shares || 0,
      trend: trends?.shares,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      ),
      color: 'orange'
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' }
  };

  // Prepare chart data
  const chartData = analyticsData?.timeSeries
    ?.slice()
    .reverse()
    .map(day => ({
      ...day,
      name: formatDate(day.date)
    })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your profile performance and engagement</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
                { value: '90d', label: 'Last 90 Days' },
                { value: 'custom', label: 'Custom' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateRange(option.value as DateRange)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateRange === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Today's Stats Banner */}
        {realtimeStats && (realtimeStats.views > 0 || realtimeStats.uniqueVisitors > 0) && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-4 mb-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Today's Activity</h3>
                <p className="text-sm opacity-90">Real-time stats updated every 30 seconds</p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold">{realtimeStats.views}</div>
                  <div className="text-xs opacity-75">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{realtimeStats.uniqueVisitors}</div>
                  <div className="text-xs opacity-75">Visitors</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{realtimeStats.downloads}</div>
                  <div className="text-xs opacity-75">Downloads</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{realtimeStats.shares}</div>
                  <div className="text-xs opacity-75">Shares</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const colors = colorClasses[stat.color];
            return (
              <div
                key={index}
                className={`${colors.bg} ${colors.border} border rounded-lg p-6 transition-transform hover:scale-105`}
              >
                <div className={`${colors.text} mb-3`}>{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                <div className="flex items-center justify-between mt-2">
                  {stat.todayValue > 0 && (
                    <span className={`text-xs ${colors.text}`}>+{stat.todayValue} today</span>
                  )}
                  {stat.trend && <TrendIndicator change={stat.trend.change} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-4">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'engagement', label: 'Engagement' },
              { id: 'sources', label: 'Traffic Sources' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Conversion Rate Card */}
            {analyticsData?.totals?.conversionRate !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Conversion Rate</h2>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {analyticsData.totals.conversionRate.toFixed(1)}%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    <p>of visitors downloaded your vCard</p>
                    <p className="text-sm">Higher is better - aim for 5%+</p>
                  </div>
                </div>
              </div>
            )}

            {/* Time Series Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Over Time</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'views', label: 'Views', color: CHART_COLORS.views },
                    { key: 'uniqueVisitors', label: 'Visitors', color: CHART_COLORS.uniqueVisitors },
                    { key: 'downloads', label: 'Downloads', color: CHART_COLORS.downloads },
                    { key: 'shares', label: 'Shares', color: CHART_COLORS.shares }
                  ].map(metric => (
                    <button
                      key={metric.key}
                      onClick={() => toggleMetric(metric.key as ChartMetric)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        selectedMetrics.includes(metric.key as ChartMetric)
                          ? 'text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                      style={{
                        backgroundColor: selectedMetrics.includes(metric.key as ChartMetric) ? metric.color : undefined
                      }}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        {selectedMetrics.map(metric => (
                          <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS[metric]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={CHART_COLORS[metric]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#374151' }}
                      />
                      <YAxis
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#374151' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                      />
                      <Legend />
                      {selectedMetrics.includes('views') && (
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke={CHART_COLORS.views}
                          fill={`url(#gradient-views)`}
                          strokeWidth={2}
                          name="Views"
                        />
                      )}
                      {selectedMetrics.includes('uniqueVisitors') && (
                        <Area
                          type="monotone"
                          dataKey="uniqueVisitors"
                          stroke={CHART_COLORS.uniqueVisitors}
                          fill={`url(#gradient-uniqueVisitors)`}
                          strokeWidth={2}
                          name="Unique Visitors"
                        />
                      )}
                      {selectedMetrics.includes('downloads') && (
                        <Area
                          type="monotone"
                          dataKey="downloads"
                          stroke={CHART_COLORS.downloads}
                          fill={`url(#gradient-downloads)`}
                          strokeWidth={2}
                          name="Downloads"
                        />
                      )}
                      {selectedMetrics.includes('shares') && (
                        <Area
                          type="monotone"
                          dataKey="shares"
                          stroke={CHART_COLORS.shares}
                          fill={`url(#gradient-shares)`}
                          strokeWidth={2}
                          name="Shares"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No historical data yet</p>
                    <p className="text-sm">Check back after your profile gets more views</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity Table */}
            {analyticsData?.timeSeries && analyticsData.timeSeries.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recent Activity</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Date</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Views</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Visitors</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Downloads</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Shares</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.timeSeries.slice(0, 10).map((day, index) => (
                        <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-2 px-3 text-gray-900 dark:text-white">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{day.views}</td>
                          <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{day.uniqueVisitors}</td>
                          <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{day.downloads}</td>
                          <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{day.shares}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Engagement Tab */}
        {activeTab === 'engagement' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Share Channel Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Share Channels</h2>
              {shareBreakdown.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={shareBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="channel"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {shareBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {shareBreakdown.map((item, index) => (
                      <div key={item.channel} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{item.channel}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>No share data available</p>
                </div>
              )}
            </div>

            {/* Device Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Device Types</h2>
              {deviceBreakdown.length > 0 ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={deviceBreakdown} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                        <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis
                          type="category"
                          dataKey="device"
                          tick={{ fill: '#9CA3AF', fontSize: 12 }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                          }}
                          formatter={(value: number, name: string) => [value, 'Visits']}
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {deviceBreakdown.map((item) => (
                      <div key={item.device} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{item.device}</span>
                        <span className="text-sm text-gray-500">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <p>No device data available</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Traffic Sources Tab */}
        {activeTab === 'sources' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Traffic Sources</h2>
            {referrerBreakdown.length > 0 ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={referrerBreakdown} margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                      <XAxis
                        dataKey="source"
                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: number) => [value, 'Visits']}
                      />
                      <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Source</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Visits</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrerBreakdown.map((item, index) => (
                        <tr key={index} className="border-b dark:border-gray-700">
                          <td className="py-2 px-3 text-gray-900 dark:text-white">{item.source}</td>
                          <td className="text-right py-2 px-3 text-gray-700 dark:text-gray-300">{item.count}</td>
                          <td className="text-right py-2 px-3 text-gray-500">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No referrer data available</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Historical analytics are aggregated daily at 2-4 AM UTC</p>
          {analyticsData?.lastUpdated && (
            <p>Last updated: {new Date(analyticsData.lastUpdated).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};
