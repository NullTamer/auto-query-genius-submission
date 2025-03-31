
import { useState, useEffect, useRef } from 'react';

/**
 * Performance metrics interface
 */
interface PerformanceMetrics {
  componentRenderTime: number;
  dataFetchTime: number;
  interactionDelay: number;
}

/**
 * Hook for monitoring component performance
 * 
 * @param componentName - Name of the component being monitored
 * @returns Performance monitoring utilities
 */
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    componentRenderTime: 0,
    dataFetchTime: 0,
    interactionDelay: 0
  });
  
  const renderStartTime = useRef<number>(0);
  const fetchStartTime = useRef<number>(0);
  const interactionStartTime = useRef<number>(0);
  
  // Start monitoring component render
  useEffect(() => {
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      if (renderTime > 100) { // Only log slow renders
        console.log(`[Performance] ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
      }
      
      setMetrics(prev => ({
        ...prev,
        componentRenderTime: renderTime
      }));
    };
  }, [componentName]);
  
  // Track data fetching
  const trackFetch = (callback: () => Promise<any>) => {
    fetchStartTime.current = performance.now();
    
    return callback().finally(() => {
      const fetchTime = performance.now() - fetchStartTime.current;
      if (fetchTime > 300) { // Only log slow fetches
        console.log(`[Performance] ${componentName} data fetch took ${fetchTime.toFixed(2)}ms`);
      }
      
      setMetrics(prev => ({
        ...prev,
        dataFetchTime: fetchTime
      }));
    });
  };
  
  // Track user interaction response
  const trackInteraction = (callback: () => void) => {
    interactionStartTime.current = performance.now();
    
    callback();
    
    const interactionTime = performance.now() - interactionStartTime.current;
    if (interactionTime > 50) { // Only log slow interactions
      console.log(`[Performance] ${componentName} interaction took ${interactionTime.toFixed(2)}ms`);
    }
    
    setMetrics(prev => ({
      ...prev,
      interactionDelay: interactionTime
    }));
  };
  
  return {
    metrics,
    trackFetch,
    trackInteraction
  };
};
