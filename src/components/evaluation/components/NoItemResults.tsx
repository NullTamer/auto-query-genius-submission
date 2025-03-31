
import React from "react";
import { Card } from "@/components/ui/card";
import { MetricsResult } from "../types";
import MetricsDisplay from "./MetricsDisplay";
import ExportResults from "./ExportResults";
import OverallPerformanceCard from "./OverallPerformanceCard";
import AdvancedMetricsDisplay from "./AdvancedMetricsDisplay";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface NoItemResultsProps {
  overall: MetricsResult;
  baseline: MetricsResult;
  improvementMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
  };
  results: any;
  hasAdvancedMetrics: boolean;
  advancedMetrics?: any;
}

const NoItemResults: React.FC<NoItemResultsProps> = ({
  overall,
  baseline,
  improvementMetrics,
  results,
  hasAdvancedMetrics,
  advancedMetrics
}) => {
  // Create empty sample keywords for the query generation component
  const sampleKeywords = {
    keywords: [],
    baselineKeywords: []
  };

  return (
    <div className="space-y-6">
      <OverallPerformanceCard 
        overall={overall}
        baseline={baseline}
        improvementMetrics={improvementMetrics}
        results={results}
        sampleKeywords={sampleKeywords}
      />
      
      {hasAdvancedMetrics && (
        <div className="mt-6">
          <AdvancedMetricsDisplay advancedMetrics={advancedMetrics!} />
        </div>
      )}
      
      <Card className="p-4 md:p-6 cyber-card">
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            Individual item results are not available for detailed analysis. This could be because:
            <ul className="list-disc pl-6 mt-2">
              <li>Only overall metrics were processed from the evaluation</li>
              <li>The individual items didn't contain enough data for detailed analysis</li>
              <li>The process is still running in the background and will update soon</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 text-center space-y-2">
          <p className="text-muted-foreground">
            You can still view and analyze the overall performance metrics above.
          </p>
          <p className="text-sm text-muted-foreground">
            Try with a different dataset if you need per-item analysis.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default NoItemResults;
