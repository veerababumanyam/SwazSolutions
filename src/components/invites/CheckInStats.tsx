/**
 * Check-In Stats Component
 * Displays check-in statistics and recent check-ins for event management
 */

import { useState, useEffect } from 'react';
import { checkInApi } from '../../services/inviteApi';
import { formatDistanceToNow } from 'date-fns';

interface CheckInStatsProps {
  inviteId: string;
  onUpdate?: () => void;
}

export function CheckInStats({ inviteId, onUpdate }: CheckInStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [inviteId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await checkInApi.getCheckInStats(inviteId);
      if (response.success) {
        setStats(response.data);
        onUpdate?.();
      } else {
        setError('Failed to load check-in stats');
      }
    } catch (err) {
      setError('Error loading check-in stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400">{error || 'Failed to load check-in stats'}</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Guests', value: stats.totalGuests, color: 'bg-blue-500' },
    { label: 'Checked In', value: stats.totalCheckedIn, color: 'bg-green-500' },
    { label: 'Pending', value: stats.totalGuests - stats.totalCheckedIn, color: 'bg-yellow-500' },
    { label: 'Check-in Rate', value: `${stats.checkInRate}%`, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-full opacity-20`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Check-ins */}
      {stats.recentCheckIns && stats.recentCheckIns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Check-ins</h3>
            <button
              onClick={loadStats}
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentCheckIns.map((checkIn: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{checkIn.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {checkIn.category} • by {checkIn.checked_in_by_name}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(checkIn.checked_in_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {stats.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Check-ins by Category</h3>
          <div className="space-y-3">
            {stats.categoryBreakdown.map((cat: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">{cat.category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(cat.count / stats.totalCheckedIn) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                    {cat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
