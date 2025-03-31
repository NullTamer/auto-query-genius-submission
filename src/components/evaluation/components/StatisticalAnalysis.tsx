
import React from "react";
import { MetricsResult } from "../types";

interface StatisticalAnalysisProps {
  overall: MetricsResult;
  baseline: MetricsResult;
  improvement: {
    precision: number;
    recall: number;
    f1Score: number;
  };
}

const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({
  overall,
  baseline,
  improvement
}) => {
  // Helper for displaying percentages with correct formatting
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };
  
  // Helper for displaying improvement percentages
  const formatImprovement = (value: number): string => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${(value * 100).toFixed(1)}%`;
  };
  
  // Determine significance level based on improvement percentage
  const getSignificanceLevel = (improvementValue: number): string => {
    if (improvementValue >= 0.15) return 'High';
    if (improvementValue >= 0.05) return 'Medium';
    return 'Low';
  };
  
  // Determine significance color based on level
  const getSignificanceColor = (level: string): string => {
    switch (level) {
      case 'High': return 'text-green-500';
      case 'Medium': return 'text-amber-500';
      case 'Low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  const metrics = [
    {
      name: 'Precision',
      transformer: overall.precision,
      baseline: baseline.precision,
      improvement: improvement.precision,
      significance: getSignificanceLevel(improvement.precision)
    },
    {
      name: 'Recall',
      transformer: overall.recall,
      baseline: baseline.recall,
      improvement: improvement.recall,
      significance: getSignificanceLevel(improvement.recall)
    },
    {
      name: 'F1 Score',
      transformer: overall.f1Score,
      baseline: baseline.f1Score,
      improvement: improvement.f1Score,
      significance: getSignificanceLevel(improvement.f1Score)
    }
  ];
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3">Metric</th>
            <th className="text-right py-2 px-3">Transformer</th>
            <th className="text-right py-2 px-3">Baseline</th>
            <th className="text-right py-2 px-3">Improvement</th>
            <th className="text-right py-2 px-3">Significance</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => {
            const significanceColor = getSignificanceColor(metric.significance);
            
            return (
              <tr key={metric.name} className="border-b border-muted">
                <td className="py-2 px-3 font-medium">{metric.name}</td>
                <td className="text-right py-2 px-3">{formatPercentage(metric.transformer)}</td>
                <td className="text-right py-2 px-3">{formatPercentage(metric.baseline)}</td>
                <td className="text-right py-2 px-3 font-medium">
                  {formatImprovement(metric.improvement)}
                </td>
                <td className={`text-right py-2 px-3 ${significanceColor}`}>
                  {metric.significance}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          <span className="font-medium">Significance Levels:</span> Low (&lt;5%), Medium (5-15%), High (&gt;15%)
        </p>
      </div>
    </div>
  );
};

export default StatisticalAnalysis;
