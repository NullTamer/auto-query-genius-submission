
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchResult } from "./types";
import CandidateResultItem from "./CandidateResultItem";

interface CandidateResultsViewProps {
  results: SearchResult[];
  savedJobs: Record<number, boolean>;
  savingJobs: Record<number, boolean>;
  onSaveJob: (result: SearchResult, index: number) => void;
}

const CandidateResultsView = ({
  results,
  savedJobs,
  savingJobs,
  onSaveJob
}: CandidateResultsViewProps) => {
  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-4 p-1">
        {/* Only render visible items for better performance */}
        {results.slice(0, Math.min(100, results.length)).map((result, index) => {
          const isSaved = savedJobs[index];
          const isSaving = savingJobs[index];
          
          return (
            <CandidateResultItem
              key={index}
              result={result}
              index={index}
              isSaved={isSaved}
              isSaving={isSaving}
              onSave={onSaveJob}
            />
          );
        })}
        
        {results.length > 100 && (
          <div className="text-center p-4 text-muted-foreground">
            <p>Showing first 100 results of {results.length} total.</p>
            <p>Refine your search to see more relevant results.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default CandidateResultsView;
