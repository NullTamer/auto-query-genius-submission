
/**
 * Creates a cached version of a function that remembers results
 * 
 * @param fn - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Deep comparison utility for React.memo
 */
export function deepCompare(prevProps: any, nextProps: any): boolean {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}
