
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Terminal, RefreshCw } from "lucide-react";
import JobInputSection from "@/components/job/JobInputSection";
import KeywordDisplay from "@/components/KeywordDisplay";
import { Keyword } from "@/hooks/useKeywords";
import { initializeTransformerPipeline } from "@/utils/transformerExtraction";
import TransformerStatusIndicator from "@/components/comparison/TransformerStatusIndicator";

interface KeywordSectionProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  isRefreshing: boolean;
  justRefreshed: boolean;
  hasError: boolean;
  lastScrapeTime: string | null;
  keywords: Keyword[];
  onRemoveKeyword: (keyword: string) => void;
  onRefresh: () => void;
  booleanQuery: string;
  setBooleanQuery: (value: string) => void;
  useTransformer?: boolean;
  setUseTransformer?: (value: boolean) => void;
}

const KeywordSection: React.FC<KeywordSectionProps> = ({
  jobDescription,
  setJobDescription,
  onSubmit,
  isProcessing,
  isRefreshing,
  justRefreshed,
  hasError,
  lastScrapeTime,
  keywords,
  onRemoveKeyword,
  onRefresh,
  booleanQuery,
  setBooleanQuery,
  useTransformer = false,
  setUseTransformer = () => {},
}) => {
  // Pre-load transformer model when component mounts
  React.useEffect(() => {
    if (useTransformer) {
      initializeTransformerPipeline();
    }
  }, [useTransformer]);

  const handleToggleTransformer = (checked: boolean) => {
    setUseTransformer(checked);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="col-span-1 md:col-span-7">
        <JobInputSection
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          onSubmit={onSubmit}
          isProcessing={isProcessing}
          hasError={hasError}
          keywords={keywords}
        />
      </div>
      <div className="col-span-1 md:col-span-5">
        <Card className="cyber-card bg-[#111927] border-primary/20 overflow-hidden flex flex-col h-full">
          <CardHeader className="p-4 md:p-6 border-b border-gray-800 flex justify-between">
            <div className="flex flex-col space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow flex items-center">
                <Terminal className="inline mr-2 h-5 w-5" />
                Extracted Keywords
              </h2>
              {lastScrapeTime && (
                <p className="text-xs text-muted-foreground">
                  Last processed: {new Date(lastScrapeTime).toLocaleString()}
                  {isRefreshing && <span className="ml-2 animate-pulse">Refreshing...</span>}
                  {justRefreshed && <span className="ml-2 text-green-400">⟳ Updated!</span>}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 text-sm">
                <Switch
                  id="use-transformer"
                  checked={useTransformer}
                  onCheckedChange={handleToggleTransformer}
                />
                <Label htmlFor="use-transformer" className="text-xs sm:text-sm cursor-pointer">
                  Use AI Model
                </Label>
              </div>
              {keywords.length > 0 && (
                <button 
                  className="ml-2 p-1 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  title="Refresh keywords"
                >
                  <RefreshCw className={`h-4 w-4 text-gray-200 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </CardHeader>

          {useTransformer && (
            <div className="px-4 py-2 border-b border-gray-800 bg-gray-900/50">
              <TransformerStatusIndicator />
            </div>
          )}
          
          <CardContent className="p-0 flex-grow overflow-y-auto">
            <KeywordDisplay 
              keywords={keywords} 
              onRemoveKeyword={onRemoveKeyword}
              isLoading={isProcessing || isRefreshing} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeywordSection;
