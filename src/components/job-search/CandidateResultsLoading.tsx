
import React from "react";
import { Loader2 } from "lucide-react";

const CandidateResultsLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Searching for candidate profiles...</p>
    </div>
  );
};

export default CandidateResultsLoading;
