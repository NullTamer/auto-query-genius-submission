
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsePdfUploadProps {
  setIsProcessing: (value: boolean) => void;
  setHasError: (value: boolean) => void;
  resetKeywords: () => void;
  setCurrentJobId: (value: number | null) => void;
  setLastScrapeTime: (value: string | null) => void;
  setKeywordsFromEdgeFunction: (keywords: Array<{keyword: string, frequency: number}>) => void;
  setBooleanQuery: (value: string) => void;
  useTransformer?: boolean; // Add the useTransformer prop
}

export const usePdfUpload = ({
  setIsProcessing,
  setHasError,
  resetKeywords,
  setCurrentJobId,
  setLastScrapeTime,
  setKeywordsFromEdgeFunction,
  setBooleanQuery,
  useTransformer = false // Add default value
}: UsePdfUploadProps) => {
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [currentPdfPath, setCurrentPdfPath] = useState<string | null>(null);
  
  const handlePdfUpload = useCallback(async (file: File) => {
    if (!file) {
      toast.error('No file selected');
      return;
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported for this upload');
      return;
    }
    
    try {
      setIsProcessing(true);
      setHasError(false);
      resetKeywords();
      setBooleanQuery('');
      
      console.log('Uploading PDF file:', file.name);
      
      // Create a unique file path
      const timestamp = new Date().getTime();
      const filePath = `job-pdfs/${timestamp}-${file.name}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job-descriptions')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        throw new Error(uploadError.message);
      }
      
      console.log('PDF uploaded successfully:', uploadData);
      setCurrentPdfPath(filePath);
      setPdfUploaded(true);
      
      // Process the PDF with an edge function
      console.log('Processing PDF with edge function');
      const { data, error } = await supabase.functions.invoke('process-pdf', {
        body: { 
          filePath,
          userId: (await supabase.auth.getSession()).data.session?.user?.id,
          useTransformer // Pass the useTransformer flag to the edge function
        }
      });
      
      if (error) {
        console.error('Error processing PDF:', error);
        throw error;
      }
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to process PDF');
      }
      
      console.log('PDF processing result:', data);
      
      // Update state with the results
      if (data.jobId) {
        const jobId = typeof data.jobId === 'string' ? parseInt(data.jobId, 10) : data.jobId;
        setCurrentJobId(jobId);
      }
      
      if (data.keywords && Array.isArray(data.keywords)) {
        setKeywordsFromEdgeFunction(data.keywords);
      }
      
      if (data.booleanQuery) {
        setBooleanQuery(data.booleanQuery);
      }
      
      setLastScrapeTime(new Date().toISOString());
      toast.success('PDF processed successfully');
      
    } catch (error: any) {
      console.error('Error in PDF upload process:', error);
      toast.error(error.message || 'Failed to process PDF');
      setHasError(true);
    } finally {
      setIsProcessing(false);
    }
  }, [
    setIsProcessing, 
    setHasError, 
    resetKeywords, 
    setCurrentJobId, 
    setLastScrapeTime, 
    setKeywordsFromEdgeFunction, 
    setBooleanQuery,
    useTransformer // Include useTransformer in the dependency array
  ]);
  
  return {
    pdfUploaded,
    currentPdfPath,
    handlePdfUpload
  };
};
