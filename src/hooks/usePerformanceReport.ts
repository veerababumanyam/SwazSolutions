/**
 * usePerformanceReport - Generate comprehensive performance reports
 *
 * Measures and aggregates performance metrics:
 * - Bundle size metrics
 * - Runtime performance
 * - Memory usage
 * - Network timing
 * - User experience metrics
 *
 * Usage:
 * ```typescript
 * const report = usePerformanceReport();
 * report.generateReport();
 * report.exportJSON();
 * ```
 */

import { useCallback, useRef } from 'react';

interface BundleMetrics {
  mainBundle: number;
  cssBundle: number;
  lazySplits: Map<string, number>;
  totalBundleSize: number;
  gzipEstimate: number;
}

interface RuntimeMetrics {
  initialLoadTime: number;
  tabSwitchTime: Map<string, number[]>;
  previewRenderTime: number[];
  averageFrameTime: number;
  jankFrames: number;
}

interface MemoryMetrics {
  heapUsed: number;
  heapLimit: number;
  externalMemoryUsed: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

interface NetworkMetrics {
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
}

interface PerformanceReport {
  timestamp: string;
  environment: 'development' | 'production';
  bundleMetrics: BundleMetrics;
  runtimeMetrics: RuntimeMetrics;
  memoryMetrics: MemoryMetrics | null;
  networkMetrics: Partial<NetworkMetrics>;
  recommendations: string[];
}

/**
 * Hook for generating comprehensive performance reports
 */
export function usePerformanceReport() {
  const reportRef = useRef<PerformanceReport>({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV as 'development' | 'production',
    bundleMetrics: {
      mainBundle: 0,
      cssBundle: 0,
      lazySplits: new Map(),
      totalBundleSize: 0,
      gzipEstimate: 0,
    },
    runtimeMetrics: {
      initialLoadTime: 0,
      tabSwitchTime: new Map(),
      previewRenderTime: [],
      averageFrameTime: 0,
      jankFrames: 0,
    },
    memoryMetrics: null,
    networkMetrics: {},
    recommendations: [],
  });

  /**
   * Measure current memory usage (Chrome DevTools Protocol)
   */
  const measureMemory = useCallback(async (): Promise<MemoryMetrics | null> => {
    if (!('memory' in performance) && !(performance as any).memory) {
      return null;
    }

    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    const memoryPressure = used / limit > 0.9 ? 'high' : used / limit > 0.7 ? 'medium' : 'low';

    return {
      heapUsed: Math.round(used / 1024 / 1024), // MB
      heapLimit: Math.round(limit / 1024 / 1024), // MB
      externalMemoryUsed: Math.round(memory.externalMemoryUsage / 1024 / 1024), // MB
      memoryPressure,
    };
  }, []);

  /**
   * Extract bundle metrics from performance entries
   */
  const extractBundleMetrics = useCallback((): BundleMetrics => {
    const entries = performance.getEntriesByType('resource');

    let mainBundle = 0;
    let cssBundle = 0;
    const lazySplits = new Map<string, number>();

    entries.forEach((entry) => {
      const name = entry.name.toLowerCase();
      const size = (entry as PerformanceResourceTiming).transferSize || 0;

      if (name.includes('main') && name.endsWith('.js')) {
        mainBundle = size;
      } else if (name.endsWith('.css')) {
        cssBundle += size;
      } else if (name.includes('lazy') && name.endsWith('.js')) {
        lazySplits.set(name, size);
      }
    });

    const totalBundleSize = mainBundle + cssBundle + Array.from(lazySplits.values()).reduce((a, b) => a + b, 0);
    // Estimate gzip compression at ~65% reduction
    const gzipEstimate = Math.round(totalBundleSize * 0.35);

    return {
      mainBundle,
      cssBundle,
      lazySplits,
      totalBundleSize,
      gzipEstimate,
    };
  }, []);

  /**
   * Extract network timing metrics
   */
  const extractNetworkMetrics = useCallback((): Partial<NetworkMetrics> => {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!navigationTiming) return {};

    return {
      ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
      fcp: navigationTiming.duration,
    };
  }, []);

  /**
   * Calculate average frame time and detect jank
   */
  const analyzeFramePerformance = useCallback((): [number, number] => {
    const entries = performance.getEntriesByType('measure').filter((e) => e.name.includes('render'));

    if (entries.length === 0) {
      return [0, 0];
    }

    const frameTimes = entries.map((e) => e.duration);
    const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;

    // Jank is frames that take longer than 16.67ms (60fps) * 1.5
    const jankThreshold = 25; // ~25ms indicates jank
    const jankFrames = frameTimes.filter((t) => t > jankThreshold).length;

    return [avgFrameTime, jankFrames];
  }, []);

  /**
   * Generate performance recommendations
   */
  const generateRecommendations = useCallback(
    (report: PerformanceReport): string[] => {
      const recs: string[] = [];

      // Bundle size recommendations
      if (report.bundleMetrics.totalBundleSize > 500 * 1024) {
        recs.push(
          'Main bundle exceeds 500KB. Consider further code splitting or lazy loading modules.'
        );
      }

      if (report.bundleMetrics.mainBundle > 200 * 1024) {
        recs.push(
          'Main bundle is over 200KB. Analyze for unused dependencies and tree-shake unused code.'
        );
      }

      // Runtime recommendations
      const tabSwitchTimes = Array.from(report.runtimeMetrics.tabSwitchTime.values()).flat();
      if (tabSwitchTimes.length > 0) {
        const avgTabSwitch = tabSwitchTimes.reduce((a, b) => a + b, 0) / tabSwitchTimes.length;
        if (avgTabSwitch > 200) {
          recs.push(
            `Average tab switch latency is ${avgTabSwitch.toFixed(0)}ms. Consider optimizing tab content rendering.`
          );
        }
      }

      // Memory recommendations
      if (report.memoryMetrics && report.memoryMetrics.memoryPressure === 'high') {
        recs.push(
          'Memory usage is high (>90% of limit). Look for memory leaks or optimize component lifecycles.'
        );
      }

      // Frame performance
      if (report.runtimeMetrics.jankFrames > 5) {
        recs.push(
          `Detected ${report.runtimeMetrics.jankFrames} jank frames. Optimize render performance and reduce animation complexity.`
        );
      }

      return recs;
    },
    []
  );

  /**
   * Generate comprehensive performance report
   */
  const generateReport = useCallback(async (): Promise<PerformanceReport> => {
    const bundleMetrics = extractBundleMetrics();
    const networkMetrics = extractNetworkMetrics();
    const memoryMetrics = await measureMemory();
    const [avgFrameTime, jankFrames] = analyzeFramePerformance();

    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV as 'development' | 'production',
      bundleMetrics,
      runtimeMetrics: {
        initialLoadTime: performance.now(),
        tabSwitchTime: reportRef.current.runtimeMetrics.tabSwitchTime,
        previewRenderTime: reportRef.current.runtimeMetrics.previewRenderTime,
        averageFrameTime: avgFrameTime,
        jankFrames,
      },
      memoryMetrics,
      networkMetrics,
      recommendations: [],
    };

    report.recommendations = generateRecommendations(report);
    reportRef.current = report;

    return report;
  }, [extractBundleMetrics, extractNetworkMetrics, measureMemory, analyzeFramePerformance, generateRecommendations]);

  /**
   * Log report to console in formatted style
   */
  const logReport = useCallback(
    async (detailed = false) => {
      const report = await generateReport();

      console.group(
        '%c⚡ Swaz Solutions Performance Report',
        'color: #8B5CF6; font-size: 14px; font-weight: bold;'
      );

      console.log(`📅 Generated: ${report.timestamp}`);
      console.log(`🔧 Environment: ${report.environment}`);

      console.group('📦 Bundle Metrics');
      console.table({
        'Main Bundle': `${(report.bundleMetrics.mainBundle / 1024).toFixed(1)}KB`,
        'CSS Bundle': `${(report.bundleMetrics.cssBundle / 1024).toFixed(1)}KB`,
        'Total Size': `${(report.bundleMetrics.totalBundleSize / 1024).toFixed(1)}KB`,
        'Gzip Estimate': `${(report.bundleMetrics.gzipEstimate / 1024).toFixed(1)}KB`,
      });
      console.groupEnd();

      console.group('⚙️ Runtime Metrics');
      console.log(`Initial Load: ${report.runtimeMetrics.initialLoadTime.toFixed(2)}ms`);
      console.log(`Avg Frame Time: ${report.runtimeMetrics.averageFrameTime.toFixed(2)}ms`);
      console.log(`Jank Frames: ${report.runtimeMetrics.jankFrames}`);
      console.groupEnd();

      if (report.memoryMetrics) {
        console.group('💾 Memory Metrics');
        console.table({
          'Heap Used': `${report.memoryMetrics.heapUsed}MB`,
          'Heap Limit': `${report.memoryMetrics.heapLimit}MB`,
          'External Memory': `${report.memoryMetrics.externalMemoryUsed}MB`,
          'Pressure': report.memoryMetrics.memoryPressure,
        });
        console.groupEnd();
      }

      console.group('💡 Recommendations');
      if (report.recommendations.length > 0) {
        report.recommendations.forEach((rec, i) => {
          console.log(`${i + 1}. ${rec}`);
        });
      } else {
        console.log('✓ No immediate recommendations. Performance looks good!');
      }
      console.groupEnd();

      console.groupEnd();

      return report;
    },
    [generateReport]
  );

  /**
   * Export report as JSON for external analysis
   */
  const exportJSON = useCallback(
    async (filename = 'performance-report.json') => {
      const report = await generateReport();
      const json = JSON.stringify(report, null, 2);

      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [generateReport]
  );

  /**
   * Send report to analytics endpoint
   */
  const sendToAnalytics = useCallback(
    async (endpoint: string) => {
      const report = await generateReport();

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });

        if (!response.ok) {
          throw new Error(`Failed to send metrics: ${response.statusText}`);
        }

        console.log('✓ Performance metrics sent to analytics');
        return report;
      } catch (error) {
        console.error('Failed to send performance metrics:', error);
        throw error;
      }
    },
    [generateReport]
  );

  return {
    generateReport,
    logReport,
    exportJSON,
    sendToAnalytics,
    getRef: () => reportRef.current,
  };
}
