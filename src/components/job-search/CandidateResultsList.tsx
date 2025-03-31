
import React, { useState, useEffect } from "react";
import { SearchResult } from "./types";
import CandidateResultsView from "./CandidateResultsView";
import CandidateResultsEmpty from "./CandidateResultsEmpty";
import CandidateResultsLoading from "./CandidateResultsLoading";
import CandidateResultsTabs from "./CandidateResultsTabs";
import CandidateResultsPagination from "./CandidateResultsPagination";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface CandidateResultsListProps {
  results: SearchResult[];
  resultsBySource: Record<string, SearchResult[]>;
  isSearching: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const CandidateResultsList: React.FC<CandidateResultsListProps> = ({
  results,
  resultsBySource,
  isSearching,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {}
}) => {
  // Add state for saved jobs and saving state
  const [savedJobs, setSavedJobs] = useState<Record<number, boolean>>({});
  const [savingJobs, setSavingJobs] = useState<Record<number, boolean>>({});
  
  // Handle saving a job
  const handleSaveJob = (result: SearchResult, index: number) => {
    setSavingJobs(prev => ({ ...prev, [index]: true }));
    
    // Simulate API call with timeout
    setTimeout(() => {
      setSavedJobs(prev => ({ ...prev, [index]: true }));
      setSavingJobs(prev => ({ ...prev, [index]: false }));
      toast.success("Profile saved successfully");
    }, 500);
  };
  
  // Add a check for long-running search
  useEffect(() => {
    let timeoutId: number | null = null;
    
    if (isSearching) {
      timeoutId = window.setTimeout(() => {
        toast.info("Search is taking longer than expected. You may want to refine your search terms for faster results.");
      }, 10000); // Show message after 10 seconds of searching
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSearching]);

  // Determine what to render based on state
  const renderContent = () => {
    if (isSearching && results.length === 0) {
      return <CandidateResultsLoading />;
    }
    
    if (!results.length && !isSearching) {
      return <CandidateResultsEmpty />;
    }
    
    // Determine how to group the results
    const sourceKeys = Object.keys(resultsBySource);
    if (sourceKeys.length > 1) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.length} candidate profiles across {sourceKeys.length} sources
            {isSearching && " (loading more...)"}
          </p>
          <CandidateResultsTabs 
            resultsBySource={resultsBySource} 
            savedJobs={savedJobs}
            savingJobs={savingJobs}
            onSaveJob={handleSaveJob}
          />
          <CandidateResultsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isLoading={isSearching}
          />
        </div>
      );
    }
    
    // Default single-source view
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Found {results.length} candidate profiles
          {isSearching && " (loading more...)"}
        </p>
        <CandidateResultsView 
          results={results} 
          savedJobs={savedJobs}
          savingJobs={savingJobs}
          onSaveJob={handleSaveJob}
        />
        <CandidateResultsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isSearching}
        />
      </div>
    );
  };
  
  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold mb-4">Search Results</h3>
      <Separator className="mb-4" />
      {renderContent()}
    </div>
  );
};

export default CandidateResultsList;
