
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, HelpCircle, FileSearch } from "lucide-react";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import JobDescriptionHighlighter from "@/components/JobDescriptionHighlighter";
import { Keyword } from "@/hooks/useKeywords";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobInputSectionProps {
  jobDescription: string;
  setJobDescription: (value: string) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  hasError: boolean;
  isMobile?: boolean;
  keywords: Keyword[];
  // Add props used in PageLayout
  currentJobId?: number | null;
  handleGenerateQuery?: () => void;
  handlePdfUpload?: (file: File) => Promise<void>;
  handleRefresh?: () => void;
  isRefreshing?: boolean;
  pdfUploaded?: boolean;
}

const JobInputSection: React.FC<JobInputSectionProps> = ({
  jobDescription,
  setJobDescription,
  onSubmit,
  isProcessing,
  hasError,
  isMobile = false,
  keywords,
  handleGenerateQuery,
  handlePdfUpload,
  handleRefresh,
  isRefreshing,
  pdfUploaded,
  currentJobId
}) => {
  const [activeTab, setActiveTab] = useState("input");

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Use the provided onSubmit or handleGenerateQuery function
  const handleSubmit = () => {
    if (handleGenerateQuery) {
      handleGenerateQuery();
    } else {
      onSubmit();
    }
  };

  return (
    <Card className="cyber-card bg-[#111927] border-primary/20 p-0 overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800">
        <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow flex items-center">
          <Terminal className="inline mr-2 h-5 w-5" />
          Job Description / CV
        </h2>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex-grow flex flex-col">
        <TabsList className="w-full grid grid-cols-2 rounded-none bg-[#1A1F2C] p-0 h-auto">
          <TabsTrigger 
            value="input" 
            className="py-3 data-[state=active]:bg-[#111927] data-[state=active]:text-teal-400 data-[state=active]:shadow-none rounded-none border-r border-gray-800"
          >
            Input
          </TabsTrigger>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="analysis" 
                  className="py-3 data-[state=active]:bg-[#111927] data-[state=active]:text-teal-400 data-[state=active]:shadow-none rounded-none flex items-center gap-1.5"
                >
                  <FileSearch className="h-4 w-4" />
                  Highlighted View
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>View your job description with identified keywords highlighted for easier review.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TabsList>
        
        <TabsContent value="input" className="mt-0 p-0 flex-grow">
          <JobDescriptionInput
            value={jobDescription}
            onChange={setJobDescription}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            error={hasError}
            onFileUpload={handlePdfUpload}
            uploadedFileName={pdfUploaded ? "Uploaded PDF" : null}
          />
        </TabsContent>
        
        <TabsContent value="analysis" className="mt-0 p-0 flex-grow">
          <JobDescriptionHighlighter 
            jobDescription={jobDescription}
            keywords={keywords}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default JobInputSection;
