/**
 * usePerformanceMonitor - Track performance metrics for vCard editor
 *
 * Monitors:
 * - Tab switch latency
 * - Initial load time
 * - Preview render duration
 * - Bundle size metrics
 * - Memory usage
 * - Core Web Vitals
 *
 * Usage:
 * ```typescript
 * const perf = usePerformanceMonitor('VCardPanel');
 * perf.markTabSwitch('portfolio');
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  componentName: string;
  initialLoadTime: number | null;
  tabSwitchTimes: Map<string, number[]>;
  previewRenderDurations: number[];
  lastMeasurement: Date | null;
}

interface WebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

/**
 * Hook for monitoring vCard panel performance
 *
 * @param componentName - Name of component being monitored
 * @returns Performance tracking methods
 */
export function usePerformanceMonitor(componentName: string) {
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    initialLoadTime: null,
    tabSwitchTimes: new Map(),
    previewRenderDurations: [],
    lastMeasurement: new Date(),
  });

  const timersRef = useRef<Map<string, number>>(new Map());
  const webVitalsRef = useRef<WebVitals>({});

  // Measure initial load time on mount
  useEffect(() => {
    const navigationStart = performance.timing.navigationStart;
    const pageLoadTime = performance.now();
    metricsRef.current.initialLoadTime = pageLoadTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} initial load: ${pageLoadTime.toFixed(2)}ms`
      );
    }
  }, [componentName]);

  // Collect Web Vitals using PerformanceObserver
  useEffect(() => {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        webVitalsRef.current.LCP = lastEntry.renderTime || lastEntry.loadTime;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] LCP: ${webVitalsRef.current.LCP?.toFixed(2)}ms`);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FCP Observer
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        webVitalsRef.current.FCP = entries[0].startTime;

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] FCP: ${webVitalsRef.current.FCP?.toFixed(2)}ms`);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // CLS Observer
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            webVitalsRef.current.CLS = (webVitalsRef.current.CLS ?? 0) + entry.value;
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] CLS: ${webVitalsRef.current.CLS?.toFixed(4)}`);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        fcpObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch (error) {
      console.warn('[Performance] Failed to observe Web Vitals:', error);
    }
  }, []);

  /**
   * Mark the start of a tab switch operation
   */
  const markTabSwitchStart = useCallback((tabName: string) => {
    const startTime = performance.now();
    timersRef.current.set(`tab-switch-${tabName}`, startTime);
  }, []);

  /**
   * Mark the end of a tab switch operation and record duration
   */
  const markTabSwitchEnd = useCallback((tabName: string) => {
    const startTime = timersRef.current.get(`tab-switch-${tabName}`);
    if (!startTime) return;

    const endTime = performance.now();
    const duration = endTime - startTime;

    const tabTimes = metricsRef.current.tabSwitchTimes;
    if (!tabTimes.has(tabName)) {
      tabTimes.set(tabName, []);
    }
    tabTimes.get(tabName)!.push(duration);

    timersRef.current.delete(`tab-switch-${tabName}`);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Tab switch "${tabName}": ${duration.toFixed(2)}ms`);
    }
  }, []);

  /**
   * Measure a complete tab switch operation
   */
  const measureTabSwitch = useCallback((tabName: string, operation: () => void) => {
    markTabSwitchStart(tabName);
    operation();
    markTabSwitchEnd(tabName);
  }, [markTabSwitchStart, markTabSwitchEnd]);

  /**
   * Record preview render duration
   */
  const recordPreviewRender = useCallback((durationMs: number) => {
    metricsRef.current.previewRenderDurations.push(durationMs);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Preview render: ${durationMs.toFixed(2)}ms`);
    }
  }, []);

  /**
   * Get all collected metrics
   */
  const getMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    const tabSwitchStats = new Map<
      string,
      { avg: number; min: number; max: number; count: number }
    >();

    // Calculate tab switch statistics
    metrics.tabSwitchTimes.forEach((times, tabName) => {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      tabSwitchStats.set(tabName, {
        avg,
        min,
        max,
        count: times.length,
      });
    });

    // Calculate preview render statistics
    const previewStats = {
      count: metrics.previewRenderDurations.length,
      avg:
        metrics.previewRenderDurations.length > 0
          ? metrics.previewRenderDurations.reduce((a, b) => a + b, 0) /
            metrics.previewRenderDurations.length
          : 0,
      min:
        metrics.previewRenderDurations.length > 0
          ? Math.min(...metrics.previewRenderDurations)
          : 0,
      max:
        metrics.previewRenderDurations.length > 0
          ? Math.max(...metrics.previewRenderDurations)
          : 0,
    };

    return {
      componentName: metrics.componentName,
      initialLoadTime: metrics.initialLoadTime,
      tabSwitchStats: Object.fromEntries(tabSwitchStats),
      previewRenderStats: previewStats,
      webVitals: webVitalsRef.current,
      totalMeasurements: {
        tabSwitches: metrics.tabSwitchTimes.size,
        previewRenders: metrics.previewRenderDurations.length,
      },
    };
  }, []);

  /**
   * Log performance report to console
   */
  const logReport = useCallback(() => {
    const metrics = getMetrics();

    console.group(`[Performance Report] ${metrics.componentName}`);
    console.log(`Initial Load Time: ${metrics.initialLoadTime?.toFixed(2)}ms`);
    console.log('Web Vitals:', metrics.webVitals);
    console.log('Tab Switch Stats:', metrics.tabSwitchStats);
    console.log('Preview Render Stats:', metrics.previewRenderStats);
    console.log('Total Measurements:', metrics.totalMeasurements);
    console.groupEnd();

    return metrics;
  }, [getMetrics]);

  /**
   * Send metrics to analytics service
   */
  const sendToAnalytics = useCallback((endpoint?: string) => {
    const metrics = getMetrics();
    const analyticsData = {
      timestamp: new Date().toISOString(),
      ...metrics,
    };

    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData),
      }).catch((error) => {
        console.warn('[Performance] Failed to send metrics:', error);
      });
    }

    return analyticsData;
  }, [getMetrics]);

  return {
    markTabSwitchStart,
    markTabSwitchEnd,
    measureTabSwitch,
    recordPreviewRender,
    getMetrics,
    logReport,
    sendToAnalytics,
  };
}

/**
 * Helper to measure render duration using performance.measure
 *
 * Usage:
 * ```typescript
 * const perf = usePerformanceMonitor('Component');
 * measureComponentRender('MyComponent', () => {
 *   // component code
 * });
 * ```
 */
export function measureComponentRender(componentName: string, renderFn: () => void) {
  const measureName = `${componentName}-render`;
  performance.mark(`${measureName}-start`);

  renderFn();

  performance.mark(`${measureName}-end`);
  performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);

  const measure = performance.getEntriesByName(measureName)[0];
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} render: ${measure.duration.toFixed(2)}ms`);
  }

  return measure.duration;
}
