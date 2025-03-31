
import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import { categorizeKeywords } from "@/utils/keywordCategorizer";

export interface Keyword {
  keyword: string;
  category?: string;
  frequency: number;
}

export const useKeywords = () => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [updateCount, setUpdateCount] = useState(0);
  const lastFetchedJobId = useRef<number | null>(null);
  const fetchInProgress = useRef(false);
  const channelRef = useRef<any>(null);
  const retryCount = useRef(0);
  const maxRetries = 10;

  const setupRealtimeSubscription = useCallback((jobId: number) => {
    if (channelRef.current) {
      console.log('Cleaning up existing subscription');
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
    }

    console.log('Setting up realtime subscription for job ID:', jobId);
    
    channelRef.current = supabase
      .channel(`keywords-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extracted_keywords',
          filter: `job_posting_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Received keywords update:', payload);
          fetchKeywords(jobId);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          fetchKeywords(jobId);
        }
      });
  }, []);

  const fetchKeywords = async (jobId: number) => {
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping');
      return;
    }

    try {
      fetchInProgress.current = true;
      console.log('Fetching keywords for job ID:', jobId);
      
      // Only select columns that exist in the database
      const { data: keywordsData, error } = await supabase
        .from('extracted_keywords')
        .select('keyword, frequency')
        .eq('job_posting_id', jobId)
        .order('frequency', { ascending: false });

      if (error) {
        console.error('Error fetching keywords:', error);
        throw error;
      }

      console.log('Raw keywords data:', keywordsData);

      if (keywordsData && keywordsData.length > 0) {
        retryCount.current = 0;
        const formattedKeywords = keywordsData.map(k => ({
          keyword: k.keyword,
          frequency: k.frequency || 1
        }));
        
        // Apply categorization before setting keywords
        const categorizedKeywords = categorizeKeywords(formattedKeywords);
        
        console.log('Setting categorized keywords:', categorizedKeywords);
        setKeywords(categorizedKeywords);
        setUpdateCount(prev => prev + 1);
        lastFetchedJobId.current = jobId;
      } else if (retryCount.current < maxRetries) {
        retryCount.current++;
        console.log(`No keywords found, retry attempt ${retryCount.current} of ${maxRetries}`);
        setTimeout(() => fetchKeywords(jobId), 2000);
      } else {
        console.log('Max retries reached, stopping fetch attempts');
        retryCount.current = 0;
      }
    } catch (error) {
      console.error('Error fetching keywords:', error);
      toast.error('Failed to fetch keywords');
    } finally {
      fetchInProgress.current = false;
    }
  };

  const handleRemoveKeyword = useCallback((keywordToRemove: string) => {
    setKeywords(prev => prev.filter(k => k.keyword !== keywordToRemove));
    // Update counter when a keyword is removed
    setUpdateCount(prev => prev + 1);
  }, []);

  const resetKeywords = useCallback(() => {
    setKeywords([]);
    // Don't reset the counter to 0 anymore, let it increment
    lastFetchedJobId.current = null;
    fetchInProgress.current = false;
    retryCount.current = 0;
    
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  // Update our useKeywords hook to also handle direct keyword data from the edge function response
  const setKeywordsFromEdgeFunction = useCallback((edgeFunctionKeywords: Array<{keyword: string, frequency: number}>) => {
    if (edgeFunctionKeywords && edgeFunctionKeywords.length > 0) {
      console.log('Setting keywords directly from edge function response:', edgeFunctionKeywords);
      
      // Apply categorization before setting keywords
      const categorizedKeywords = categorizeKeywords(edgeFunctionKeywords);
      
      setKeywords(categorizedKeywords);
      setUpdateCount(prev => prev + 1);
    }
  }, []);

  // Creating a debounced version of fetchKeywords using the previously defined fetchKeywords function
  const debouncedFetchKeywords = useCallback(
    debounce((jobId: number) => {
      setupRealtimeSubscription(jobId);
      fetchKeywords(jobId);
    }, 300),
    [setupRealtimeSubscription, fetchKeywords]
  );

  return {
    keywords,
    updateCount,
    debouncedFetchKeywords,
    handleRemoveKeyword,
    resetKeywords,
    setKeywordsFromEdgeFunction
  };
};
