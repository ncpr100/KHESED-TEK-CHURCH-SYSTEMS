
// Performance monitoring and optimization utilities

// Debounce function for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events, etc.
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy loading hook
import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting] as const;
}

// Performance measurement
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Keep only last 100 measurements
      const measurements = this.metrics.get(label)!;
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  getStats(label: string) {
    const measurements = this.metrics.get(label) || [];
    if (measurements.length === 0) {
      return null;
    }

    const sorted = measurements.slice().sort((a, b) => a - b);
    const avg = measurements.reduce((a, b) => a + b) / measurements.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    return {
      count: measurements.length,
      avg: parseFloat(avg.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      p95: parseFloat(p95.toFixed(2)),
      min: parseFloat(sorted[0].toFixed(2)),
      max: parseFloat(sorted[sorted.length - 1].toFixed(2))
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [label] of this.metrics) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }

  clear(label?: string) {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(label: string) {
  useEffect(() => {
    const endTimer = performanceMonitor.startTimer(label);
    return endTimer;
  }, [label]);
}

// Image optimization utilities
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return '';
  
  // If it's already optimized or external, return as-is
  if (url.startsWith('http') || url.includes('/_next/image')) {
    return url;
  }

  // Build Next.js image optimization URL
  const params = new URLSearchParams();
  params.set('url', url);
  params.set('q', quality.toString());
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());

  return `/_next/image?${params.toString()}`;
}

// Bundle size analyzer (development only)
export function logBundleInfo() {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return;
  }

  // Log performance timing
  window.addEventListener('load', () => {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
    const firstPaint = performance.getEntriesByType('paint')[0]?.startTime || 0;

    console.group('🚀 Performance Metrics');
    console.log(`Page Load Time: ${loadTime}ms`);
    console.log(`DOM Ready: ${domReady}ms`);
    console.log(`First Paint: ${firstPaint.toFixed(2)}ms`);
    
    // Check for large resources
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const largeResources = resources
      .filter(resource => resource.transferSize > 100000) // > 100KB
      .sort((a, b) => b.transferSize - a.transferSize)
      .slice(0, 5);

    if (largeResources.length > 0) {
      console.warn('Large Resources (>100KB):');
      largeResources.forEach(resource => {
        console.log(`${resource.name}: ${(resource.transferSize / 1024).toFixed(1)}KB`);
      });
    }
    
    console.groupEnd();
  });
}

// Memory usage monitoring
export function logMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) {
    return;
  }

  const memory = (performance as any).memory;
  
  console.group('💾 Memory Usage');
  console.log(`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
  console.groupEnd();
}

// Resource hints for critical resources
export function addResourceHints() {
  if (typeof document === 'undefined') return;

  const hints = [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'dns-prefetch', href: '//api.instagram.com' },
    { rel: 'dns-prefetch', href: '//graph.facebook.com' },
    { rel: 'dns-prefetch', href: '//api.twitter.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    Object.assign(link, hint);
    document.head.appendChild(link);
  });
}

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  logBundleInfo();
  
  // Log memory usage every 30 seconds
  setInterval(logMemoryUsage, 30000);
  
  // Add resource hints
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addResourceHints);
  } else {
    addResourceHints();
  }
}
