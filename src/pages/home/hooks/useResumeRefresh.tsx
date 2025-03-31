
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface UseResumeRefreshProps {
  currentJobId: number | null;
  debouncedFetchKeywords: (jobId: number) => Promise<void>;
  setHasError: (value: boolean) => void;
  useTransformer?: boolean; // Add the useTransformer prop
}

export const useResumeRefresh = ({
  currentJobId,
  debouncedFetchKeywords,
  setHasError,
  useTransformer = false // Add default value
}: UseResumeRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!currentJobId || isRefreshing) return;
    setIsRefreshing(true);
    setHasError(false);
    
    try {
      console.log('Refreshing data for job ID:', currentJobId);
      await debouncedFetchKeywords(currentJobId);
      toast.success('Keywords refreshed successfully');
      setJustRefreshed(true);
      
      // Reset the animation after a delay
      setTimeout(() => {
        setJustRefreshed(false);
      }, 2000);
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh keywords');
      setHasError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentJobId, isRefreshing, debouncedFetchKeywords, setHasError]);

  // Clear justRefreshed state when unmounting
  useEffect(() => {
    return () => {
      setJustRefreshed(false);
    };
  }, []);

  return {
    isRefreshing,
    justRefreshed,
    handleRefresh
  };
};
