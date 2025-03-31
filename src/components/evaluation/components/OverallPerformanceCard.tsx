
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, BarChart } from "lucide-react";
import { MetricsResult } from "../types";
import MetricsChart from "./MetricsChart";
import MetricsDisplay from "./MetricsDisplay";
import StatisticalAnalysis from "./StatisticalAnalysis";
import ExportResults from "./ExportResults";
import QueryGeneration from "./QueryGeneration";

interface OverallPerformanceCardProps {
  overall: MetricsResult;
  baseline: MetricsResult;
  improvementMetrics: {
    precision: number;
    recall: number;
    f1Score: number;
  };
  results: any; // For export functionality
  sampleKeywords: {
    keywords: any[];
    baselineKeywords: any[];
  };
}

const OverallPerformanceCard: React.FC<OverallPerformanceCardProps> = ({
  overall,
  baseline,
  improvementMetrics,
  results,
  sampleKeywords
}) => {
  const [visualizationType, setVisualizationType] = useState<"chart" | "stats">("chart");
  
  return (
    <Card className="p-4 md:p-6 cyber-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Overall Performance Metrics</h3>
        <ExportResults results={results} />
      </div>
      
      <div className="flex justify-end mb-4 gap-2">
        <Button 
          variant={visualizationType === "chart" ? "default" : "outline"} 
          size="sm"
          onClick={() => setVisualizationType("chart")}
        >
          <PieChart className="h-4 w-4 mr-1" />
          Chart View
        </Button>
        <Button 
          variant={visualizationType === "stats" ? "default" : "outline"} 
          size="sm"
          onClick={() => setVisualizationType("stats")}
        >
          <BarChart className="h-4 w-4 mr-1" />
          Statistical View
        </Button>
      </div>
      
      {visualizationType === "chart" ? (
        <div className="mb-4">
          <MetricsChart overall={overall} baseline={baseline} />
          {/* Removed academic figure reference that was carried over from project report */}
        </div>
      ) : (
        <div className="mb-4">
          <StatisticalAnalysis 
            overall={overall} 
            baseline={baseline} 
            improvement={improvementMetrics}
          />
          {/* Removed academic figure reference that was carried over from project report */}
        </div>
      )}
      
      <MetricsDisplay metrics={overall} />
      
      {/* Generated Boolean Query Example */}
      <div className="mt-6 border-t pt-4">
        <QueryGeneration 
          keywords={sampleKeywords.keywords}
          baselineKeywords={sampleKeywords.baselineKeywords}
        />
        {/* Removed academic figure reference that was carried over from project report */}
      </div>
    </Card>
  );
};

export default OverallPerformanceCard;
