
import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Components
import PageLayout from "./components/PageLayout";
import { useResumeProcessing } from "./hooks/useResumeProcessing";
import { useSessionManagement } from "./hooks/useSessionManagement";

const IndexPage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [booleanQuery, setBooleanQuery] = useState("");
  const location = useLocation();
  const resumeContentProcessed = useRef(false);
  
  const { session } = useSessionManagement();
  
  const {
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
  } = useResumeProcessing({ 
    jobDescription, 
    setJobDescription,
    setBooleanQuery
  });

  // Process resume content from navigation state
  useEffect(() => {
    const processResumeContent = async () => {
      const state = location.state as { resumeContent?: string } | null;
      
      if (state?.resumeContent && !resumeContentProcessed.current) {
        setJobDescription(state.resumeContent);
        resumeContentProcessed.current = true;
        
        toast.info("Processing resume content...");
      }
    };
    
    processResumeContent();
  }, [location]);

  // Update booleanQuery when keywords change
  useEffect(() => {
    const generateBooleanQuery = async () => {
      if (keywords.length > 0) {
        try {
          const { generateBooleanQuery } = await import('@/utils/queryUtils');
          const query = await generateBooleanQuery(keywords);
          setBooleanQuery(query);
        } catch (error) {
          console.error("Error generating boolean query:", error);
          setBooleanQuery("");
        }
      } else {
        setBooleanQuery("");
      }
    };
    
    generateBooleanQuery();
  }, [keywords]);

  return (
    <PageLayout
      session={session}
      jobDescription={jobDescription}
      setJobDescription={setJobDescription}
      isProcessing={isProcessing}
      isRefreshing={isRefreshing}
      justRefreshed={justRefreshed}
      hasError={hasError}
      lastScrapeTime={lastScrapeTime}
      pdfUploaded={pdfUploaded}
      currentJobId={currentJobId}
      currentPdfPath={currentPdfPath}
      keywords={keywords}
      updateCount={updateCount}
      booleanQuery={booleanQuery}
      handleGenerateQuery={handleGenerateQuery}
      handlePdfUpload={handlePdfUpload}
      handleRefresh={handleRefresh}
      handleRemoveKeyword={handleRemoveKeyword}
      useTransformer={useTransformer}
      setUseTransformer={setUseTransformer}
    />
  );
};

export default IndexPage;
