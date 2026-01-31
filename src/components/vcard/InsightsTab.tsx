/**
 * InsightsTab - Analytics and metrics display
 * Embeds ProfileAnalytics component for read-only analytics
 */

import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';
import { SectionHeader } from './shared';

interface InsightsTabProps {
  profileId: string;
}

/**
 * Lazy load ProfileAnalytics to optimize bundle
 * Falls back to placeholder if component not found
 */
const ProfileAnalytics = lazy(() =>
  import('@/components/ProfileAnalytics').catch(() => ({
    default: () => (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-sm">ProfileAnalytics component not found</p>
      </div>
    ),
  }))
);

/**
 * Loading skeleton for analytics
 */
const AnalyticsLoadingSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-20 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse"
      />
    ))}
  </div>
);

/**
 * Error fallback component
 */
const AnalyticsError = ({ error }: { error: Error }) => (
  <div className="rounded-xl border-2 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5 p-6 text-center">
    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-3">
      <BarChart3 size={24} className="text-red-600 dark:text-red-400" />
    </div>
    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
      Unable to Load Analytics
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
      {error.message || 'There was an error loading your analytics data'}
    </p>
  </div>
);

const InsightsTab: React.FC<InsightsTabProps> = ({ profileId }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex items-center gap-2 text-gray-900 dark:text-white pb-4 border-b border-gray-200 dark:border-white/5">
        <BarChart3 size={18} className="text-blue-500" />
        <div className="flex flex-col">
          <h3 className="font-bold text-sm uppercase tracking-wide">Analytics</h3>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            Profile performance metrics
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          icon={TrendingUp}
          label="Total Views"
          value="--"
          trend="Loading..."
        />
        <StatsCard
          icon={TrendingUp}
          label="Downloads"
          value="--"
          trend="Loading..."
        />
        <StatsCard
          icon={TrendingUp}
          label="Shares"
          value="--"
          trend="Loading..."
        />
      </div>

      {/* Analytics Component with Suspense */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
        <ErrorBoundary fallback={<AnalyticsError error={new Error('Unknown error')} />}>
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <ProfileAnalytics profileId={profileId} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Info message */}
      <div className="rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/30 p-4">
        <p className="text-xs text-blue-900 dark:text-blue-300">
          <strong>Info:</strong> Analytics data is updated in real-time as visitors interact with your profile.
          Share your profile link to start tracking engagement.
        </p>
      </div>
    </motion.div>
  );
};

/**
 * Stats Card Component
 */
interface StatsCardProps {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  value: string | number;
  trend: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon: Icon, label, value, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-white to-gray-50 dark:from-white/10 dark:to-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
        <Icon size={18} className="text-blue-500" />
      </div>
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
      {label}
    </p>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
      {value}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{trend}</p>
  </motion.div>
);

/**
 * Error Boundary Component
 * Catches errors in child components
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Analytics error:', error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <AnalyticsError error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default InsightsTab;
