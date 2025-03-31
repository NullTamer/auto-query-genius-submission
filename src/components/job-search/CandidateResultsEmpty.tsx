
import React from "react";

const CandidateResultsEmpty = () => {
  return (
    <div className="text-center p-6 text-muted-foreground">
      <p>Select query terms above and click "Search" to find matching candidate profiles.</p>
      <p className="mt-2 text-sm">Or click "External" to search for candidates on professional networks directly.</p>
    </div>
  );
};

export default CandidateResultsEmpty;
