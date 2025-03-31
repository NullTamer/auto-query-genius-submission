
import React, { useState, useEffect } from "react";

// Components
import AuthButton from "@/components/auth/AuthButton";
import PageHeader from "@/components/layout/PageHeader";
import KeywordSection from "@/components/job/KeywordSection";
import QueryPreview from "@/components/QueryPreview";
import CandidateSearchModule from "@/components/CandidateSearchModule";
import NavigationPane from "@/components/layout/NavigationPane";
import UserGuide from "@/components/guide/UserGuide";
import { Keyword } from "@/hooks/useKeywords";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface PageLayoutProps {
  session: any;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  isProcessing: boolean;
  isRefreshing: boolean;
  justRefreshed: boolean;
  hasError: boolean;
  lastScrapeTime: string | null;
  pdfUploaded: boolean;
  currentJobId: number | null;
  currentPdfPath: string | null;
  keywords: Keyword[];
  updateCount: number;
  booleanQuery: string;
  handleGenerateQuery: () => void;
  handlePdfUpload: (file: File) => Promise<void>;
  handleRefresh: () => void;
  handleRemoveKeyword: (keyword: string) => void;
  useTransformer?: boolean;
  setUseTransformer?: (value: boolean) => void;
}

const USER_GUIDE_PREF_KEY = "hideUserGuide";

const PageLayout: React.FC<PageLayoutProps> = ({
  session,
  jobDescription,
  setJobDescription,
  isProcessing,
  isRefreshing,
  justRefreshed,
  hasError,
  lastScrapeTime,
  pdfUploaded,
  currentJobId,
  keywords,
  updateCount,
  booleanQuery,
  handleGenerateQuery,
  handlePdfUpload,
  handleRefresh,
  handleRemoveKeyword,
  useTransformer = false,
  setUseTransformer = () => {},
}) => {
  const [guideOpen, setGuideOpen] = useState(true);
  const [hideGuide, setHideGuide] = useState(false);
  const hasNoContent = !jobDescription && keywords.length === 0;
  const [setBooleanQuery] = useState<(value: string) => void>(() => (value: string) => {});

  // Load user preference for hiding guide
  useEffect(() => {
    const savedPref = localStorage.getItem(USER_GUIDE_PREF_KEY);
    if (savedPref === "true") {
      setHideGuide(true);
    }
  }, []);

  // Save user preference when changed
  const toggleHideGuide = () => {
    const newValue = !hideGuide;
    setHideGuide(newValue);
    localStorage.setItem(USER_GUIDE_PREF_KEY, newValue.toString());
  };

  // Add debug logging for CandidateSearchModule props
  useEffect(() => {
    console.log('PageLayout - CandidateSearchModule props updated:', {
      booleanQuery,
      keywordsCount: keywords.length,
      useTransformer
    });
  }, [booleanQuery, keywords, useTransformer]);

  return (
    <div className="min-h-screen matrix-bg p-4 md:p-8 font-mono">
      <NavigationPane />
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 ml-16">
        <div className="flex justify-between items-center">
          <AuthButton session={session} />
        </div>
        
        <PageHeader updateCount={updateCount} lastScrapeTime={lastScrapeTime} />

        {hasNoContent && !hideGuide && (
          <div className="relative">
            <UserGuide />
            <div className="absolute top-4 right-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleHideGuide}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Hide guide permanently</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {(!hasNoContent && !hideGuide) && (
          <Collapsible open={guideOpen} onOpenChange={setGuideOpen} className="mb-6 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg text-primary font-medium">Guide</h3>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={toggleHideGuide}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Hide guide permanently</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {guideOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <UserGuide />
            </CollapsibleContent>
          </Collapsible>
        )}

        {hideGuide && hasNoContent && (
          <div className="text-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleHideGuide}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show User Guide
            </Button>
          </div>
        )}

        <KeywordSection
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onSubmit={handleGenerateQuery}
          isProcessing={isProcessing}
          isRefreshing={isRefreshing}
          hasError={hasError}
          lastScrapeTime={lastScrapeTime}
          keywords={keywords}
          onRemoveKeyword={handleRemoveKeyword}
          onRefresh={handleRefresh}
          booleanQuery={booleanQuery}
          setBooleanQuery={setBooleanQuery}
          justRefreshed={justRefreshed}
          useTransformer={useTransformer}
          setUseTransformer={setUseTransformer}
        />

        <QueryPreview 
          query={booleanQuery} 
          timestamp={lastScrapeTime}
          onRefresh={handleRefresh}
          isLoading={isRefreshing}
          justRefreshed={justRefreshed}
        />
        
        {booleanQuery && (
          <>
            {console.log('PageLayout - Rendering CandidateSearchModule with booleanQuery:', booleanQuery)}
            <CandidateSearchModule query={booleanQuery} keywords={keywords} />
          </>
        )}
      </div>
    </div>
  );
};

export default PageLayout;
