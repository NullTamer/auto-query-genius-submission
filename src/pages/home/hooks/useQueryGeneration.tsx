import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseQueryGenerationProps {
  jobDescription: string;
  setIsProcessing: (value: boolean) => void;
  setHasError: (value: boolean) => void;
  resetKeywords: () => void;
  setCurrentJobId: (value: number | null) => void;
  setLastScrapeTime: (value: string | null) => void;
  setKeywordsFromEdgeFunction: (keywords: Array<{ keyword: string, frequency: number }>) => void;
  debouncedFetchKeywords: (jobId: number) => Promise<void>;
  setBooleanQuery: (value: string) => void;
  useTransformer?: boolean;
}

export const useQueryGeneration = ({
  jobDescription,
  setIsProcessing,
  setHasError,
  resetKeywords,
  setCurrentJobId,
  setLastScrapeTime,
  setKeywordsFromEdgeFunction,
  debouncedFetchKeywords,
  setBooleanQuery,
  useTransformer = false
}: UseQueryGenerationProps) => {
  const handleGenerateQuery = useCallback(async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsProcessing(true);
    setHasError(false);
    resetKeywords();
    setBooleanQuery('');
    
    try {
      console.log('Invoking edge function to process job description');
      
      // Get user ID if authenticated
      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user?.id;
      
      // Invoke the edge function
      const { data, error } = await supabase.functions.invoke('scrape-job-posting', {
        body: { 
          jobDescription,
          userId,
          useTransformer
        }
      });
      
      if (error) {
        console.error('Error invoking edge function:', error);
        throw error;
      }
      
      console.log('Edge function response:', data);
      
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to process job description');
      }
      
      // Update state
      const jobId = parseInt(data.jobId, 10);
      setCurrentJobId(jobId);
      
      // If keywords were returned directly, use them
      if (data.keywords && Array.isArray(data.keywords)) {
        console.log('Setting keywords from edge function:', data.keywords);
        setKeywordsFromEdgeFunction(data.keywords);
      } else {
        // Otherwise fetch them
        console.log('Fetching keywords for job ID:', jobId);
        await debouncedFetchKeywords(jobId);
      }
      
      // If boolean query was returned, use it
      if (data.booleanQuery) {
        setBooleanQuery(data.booleanQuery);
      }
      
      setLastScrapeTime(new Date().toISOString());
      toast.success('Job description processed');
      
    } catch (error: any) {
      console.error('Error processing job description:', error);
      toast.error(error.message || 'Failed to process job description');
      setHasError(true);
    } finally {
      setIsProcessing(false);
    }
  }, [
    jobDescription,
    setIsProcessing,
    setHasError,
    resetKeywords,
    setCurrentJobId,
    setLastScrapeTime,
    setKeywordsFromEdgeFunction,
    debouncedFetchKeywords,
    setBooleanQuery,
    useTransformer
  ]);
  
  return {
    handleGenerateQuery
  };
};
