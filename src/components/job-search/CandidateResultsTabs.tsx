
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchResult } from "./types";
import CandidateResultsView from "./CandidateResultsView";
import CandidateResultsEmpty from "./CandidateResultsEmpty";
import { getProviderDisplayName } from "./utils/searchUrlUtils";

interface CandidateResultsTabsProps {
  resultsBySource: Record<string, SearchResult[]>;
  savedJobs: Record<number, boolean>;
  savingJobs: Record<number, boolean>;
  onSaveJob: (result: SearchResult, index: number) => void;
}

const CandidateResultsTabs = ({
  resultsBySource,
  savedJobs,
  savingJobs,
  onSaveJob
}: CandidateResultsTabsProps) => {
  const sources = Object.keys(resultsBySource);
  const [activeTab, setActiveTab] = useState<string>(sources.length > 0 ? sources[0] : "all");
  
  if (sources.length === 0) {
    return <CandidateResultsEmpty />;
  }
  
  // Create a flattened results array with indexes for saving functionality
  const allResults = Object.values(resultsBySource).flat();
  
  // Add the "All" tab if we have multiple sources
  const showAllTab = sources.length > 1;
  
  return (
    <Tabs 
      defaultValue={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-full flex overflow-x-auto justify-start mb-4">
        {showAllTab && (
          <TabsTrigger value="all" className="flex-shrink-0">
            All ({allResults.length})
          </TabsTrigger>
        )}
        {sources.map(source => {
          const count = resultsBySource[source].length;
          return (
            <TabsTrigger key={source} value={source} className="flex-shrink-0">
              {getProviderDisplayName(source)} ({count})
            </TabsTrigger>
          );
        })}
      </TabsList>
      
      {showAllTab && (
        <TabsContent value="all" className="mt-0">
          <CandidateResultsView
            results={allResults}
            savedJobs={savedJobs}
            savingJobs={savingJobs}
            onSaveJob={onSaveJob}
          />
        </TabsContent>
      )}
      
      {sources.map(source => (
        <TabsContent key={source} value={source} className="mt-0">
          <CandidateResultsView
            results={resultsBySource[source]}
            savedJobs={savedJobs}
            savingJobs={savingJobs}
            onSaveJob={onSaveJob}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CandidateResultsTabs;
