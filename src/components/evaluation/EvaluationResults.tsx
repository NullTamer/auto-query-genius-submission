
import React from "react";
import { Card } from "@/components/ui/card";
import { EvaluationResult } from "./types";
import AdvancedMetricsDisplay from "./components/AdvancedMetricsDisplay";
import OverallPerformanceCard from "./components/OverallPerformanceCard";
import PerItemResultsTabs from "./components/PerItemResultsTabs";
import NoItemResults from "./components/NoItemResults";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EvaluationResultsProps {
  results: EvaluationResult;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ results }) => {
  // Comprehensive validation of results data
  const isValidResults = results && 
    typeof results === 'object' &&
    results.overall && 
    typeof results.overall === 'object';

  if (!isValidResults) {
    return (
      <Card className="p-4 md:p-6 cyber-card">
        <p className="text-center text-muted-foreground">
          No valid evaluation results to display
        </p>
      </Card>
    );
  }

  // Ensure baseline data exists with fallbacks
  const baseline = results.baseline || { precision: 0, recall: 0, f1Score: 0 };
  
  // Ensure overall metrics exist with fallbacks
  const overall = results.overall || { precision: 0, recall: 0, f1Score: 0 };

  // Filter out any invalid perItem entries with comprehensive validation
  const validPerItemResults = Array.isArray(results.perItem) 
    ? results.perItem.filter(item => 
        item && 
        typeof item === 'object' &&
        (item.id !== undefined && item.id !== null) &&
        item.metrics && 
        typeof item.metrics === 'object' &&
        Array.isArray(item.groundTruth) && 
        Array.isArray(item.extractedKeywords)
      )
    : [];

  // Check if advanced metrics are available
  const hasAdvancedMetrics = !!(results.advanced && 
    typeof results.advanced === 'object' &&
    results.advanced.mean && 
    results.advanced.median && 
    results.advanced.stdDev);

  // Calculate improvement percentage for metrics display
  const calculateImprovement = (current: number, baseline: number): number => {
    if (baseline === 0) return current > 0 ? 100 : 0;
    return ((current - baseline) / baseline) * 100;
  };

  const improvementMetrics = {
    precision: calculateImprovement(overall.precision, baseline.precision),
    recall: calculateImprovement(overall.recall, baseline.recall),
    f1Score: calculateImprovement(overall.f1Score, baseline.f1Score),
  };

  // Get sample keywords for query generation
  const sampleKeywords = {
    keywords: validPerItemResults.length > 0 ? validPerItemResults[0]?.extractedKeywords || [] : [],
    baselineKeywords: validPerItemResults.length > 0 ? validPerItemResults[0]?.baselineKeywords || [] : []
  };

  // If there are no valid per-item results but we have overall results, show a fallback
  if (validPerItemResults.length === 0) {
    return (
      <NoItemResults 
        overall={overall}
        baseline={baseline}
        improvementMetrics={improvementMetrics}
        results={results}
        hasAdvancedMetrics={hasAdvancedMetrics}
        advancedMetrics={results.advanced}
      />
    );
  }

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
        <AdvancedMetricsDisplay advancedMetrics={results.advanced!} />
      )}

      <PerItemResultsTabs validPerItemResults={validPerItemResults} />
    </div>
  );
};

export default EvaluationResults;
