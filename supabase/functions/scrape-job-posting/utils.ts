
/**
 * Utility functions for the job scraping edge function
 */

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function for sleeping/delaying execution
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function with exponential backoff
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add throttling - wait at least 2 seconds between API calls
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
        await sleep(delay);
      } else {
        await sleep(2000); // Default throttle
      }
      
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error as Error;
      
      // Check for specific HTTP errors
      if (error instanceof Response) {
        const status = error.status;
        
        // Don't retry on client errors, except for rate limits
        if (status !== 429 && status >= 400 && status < 500) {
          throw error;
        }
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

// Helper for sleep/delay
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
