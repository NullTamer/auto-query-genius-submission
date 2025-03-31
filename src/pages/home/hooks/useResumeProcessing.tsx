
import { useState, useCallback } from "react";
import { useJobProcessing } from "@/hooks/useJobProcessing";
import { useKeywords } from "@/hooks/useKeywords";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { usePdfUpload } from "./usePdfUpload";
import { useQueryGeneration } from "./useQueryGeneration";
import { useResumeRefresh } from "./useResumeRefresh";
import { toast } from "sonner";

interface UseResumeProcessingProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  setBooleanQuery: (value: string) => void;
}

export const useResumeProcessing = ({ 
  jobDescription, 
  setJobDescription,
  setBooleanQuery 
}: UseResumeProcessingProps) => {
  const [useTransformer, setUseTransformer] = useState(false);
  
  const {
    isProcessing,
    setIsProcessing,
    hasError,
    setHasError,
    lastScrapeTime,
    setLastScrapeTime,
    currentJobId,
    setCurrentJobId,
  } = useJobProcessing();

  const {
    keywords,
    updateCount,
    debouncedFetchKeywords,
    handleRemoveKeyword,
    resetKeywords,
    setKeywordsFromEdgeFunction
  } = useKeywords();

  // Handle processed and failed callbacks
  const handleProcessed = useCallback(async (jobId: number, processedAt: string) => {
    try {
      console.log('Job processed, fetching keywords for ID:', jobId);
      await debouncedFetchKeywords(jobId);
      setLastScrapeTime(processedAt);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error handling processed job:', error);
      setHasError(true);
      setIsProcessing(false);
    }
  }, [debouncedFetchKeywords, setLastScrapeTime, setIsProcessing, setHasError]);

  const handleFailed = useCallback((description?: string) => {
    setHasError(true);
    setIsProcessing(false);
    resetKeywords();
    if (description) {
      toast.error(`Processing failed: ${description}`);
    }
  }, [setHasError, setIsProcessing, resetKeywords]);

  // Set up realtime updates - ensure we're using the callback functions defined above
  useRealtimeUpdates({
    currentJobId,
    onProcessed: handleProcessed,
    onFailed: handleFailed
  });

  // Compose more focused hooks
  const { pdfUploaded, currentPdfPath, handlePdfUpload } = usePdfUpload({
    setIsProcessing,
    setHasError,
    resetKeywords,
    setCurrentJobId,
    setLastScrapeTime,
    setKeywordsFromEdgeFunction,
    setBooleanQuery,
    useTransformer // Passing this properly now that the interface has been updated
  });

  const { handleGenerateQuery } = useQueryGeneration({
    jobDescription,
    setIsProcessing,
    setHasError,
    resetKeywords,
    setCurrentJobId,
    setLastScrapeTime,
    setKeywordsFromEdgeFunction,
    debouncedFetchKeywords,
    setBooleanQuery,
    useTransformer // Passing this properly
  });

  const { isRefreshing, justRefreshed, handleRefresh } = useResumeRefresh({
    currentJobId,
    debouncedFetchKeywords,
    setHasError,
    useTransformer // Passing this properly now that the interface has been updated
  });

  return {
    isProcessing,
    isRefreshing,
    justRefreshed,
    hasError,
    lastScrapeTime,
    pdfUploaded,
    currentJobId,
    currentPdfPath,
    keywords,
    updateCount,
    useTransformer,
    setUseTransformer,
    handleGenerateQuery,
    handlePdfUpload,
    handleRefresh,
    handleRemoveKeyword,
    resetKeywords
  };
};
