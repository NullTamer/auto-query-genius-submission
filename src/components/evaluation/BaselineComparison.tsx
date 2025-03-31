
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationResult, KeywordItem } from "./types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface BaselineComparisonProps {
  results: EvaluationResult;
}

const BaselineComparison: React.FC<BaselineComparisonProps> = ({ results }) => {
  // Comprehensive validation of results data including baseline data
  const isValidResults = results && 
    typeof results === 'object' &&
    results.overall && 
    typeof results.overall === 'object';

  const hasBaselineData = results && 
    typeof results === 'object' &&
    results.baseline &&
    typeof results.baseline === 'object';

  if (!isValidResults) {
    return (
      <Card className="p-4 md:p-6 cyber-card">
        <p className="text-center text-muted-foreground">
          No valid comparison data to display. Results data may be missing.
        </p>
      </Card>
    );
  }

  // If we don't have baseline data, show a fallback message
  if (!hasBaselineData) {
    return (
      <Card className="p-4 md:p-6 cyber-card">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Baseline comparison is not available. This may be because:
            <ul className="list-disc pl-6 mt-2">
              <li>The baseline algorithm was not run during evaluation</li>
              <li>The evaluation process is still running in the background</li>
              <li>The dataset doesn't support baseline comparison</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <p className="text-muted-foreground">
            Try running the evaluation again with a different dataset that includes baseline comparisons.
          </p>
        </div>
      </Card>
    );
  }

  // Ensure we have safe baseline data with fallbacks
  const baseline = results.baseline || { precision: 0, recall: 0, f1Score: 0 };
  const overall = results.overall || { precision: 0, recall: 0, f1Score: 0 };

  // Prepare improvement metrics with safe calculations
  const improvementMetrics = [
    {
      name: "Precision",
      value: parseFloat((((overall.precision || 0) - (baseline.precision || 0)) * 100).toFixed(2)),
    },
    {
      name: "Recall",
      value: parseFloat((((overall.recall || 0) - (baseline.recall || 0)) * 100).toFixed(2)),
    },
    {
      name: "F1 Score",
      value: parseFloat((((overall.f1Score || 0) - (baseline.f1Score || 0)) * 100).toFixed(2)),
    },
  ];

  // Prepare radar chart data
  const radarData = [
    {
      metric: "Precision",
      AI: parseFloat(((overall.precision || 0) * 100).toFixed(2)),
      Baseline: parseFloat(((baseline.precision || 0) * 100).toFixed(2)),
    },
    {
      metric: "Recall",
      AI: parseFloat(((overall.recall || 0) * 100).toFixed(2)),
      Baseline: parseFloat(((baseline.recall || 0) * 100).toFixed(2)),
    },
    {
      metric: "F1 Score",
      AI: parseFloat(((overall.f1Score || 0) * 100).toFixed(2)),
      Baseline: parseFloat(((baseline.f1Score || 0) * 100).toFixed(2)),
    },
  ];

  const renderKeywordList = (keywords: KeywordItem[]) => {
    // Ensure keywords is an array and filter out invalid items
    const safeKeywords = Array.isArray(keywords) 
      ? keywords.filter(k => 
          k && 
          typeof k === 'object' && 
          typeof k.keyword === 'string' &&
          (typeof k.frequency === 'number' || k.frequency === undefined)
        )
      : [];
    
    if (safeKeywords.length === 0) {
      return (
        <p className="text-xs text-muted-foreground p-2">No keywords available</p>
      );
    }
    
    return (
      <ScrollArea className="h-[200px]">
        <div className="flex flex-wrap gap-2 p-2">
          {safeKeywords.map((keyword, index) => (
            <Badge
              key={index}
              variant="outline"
              className="px-3 py-1 text-sm flex items-center gap-2"
            >
              {keyword.keyword || ""}
              <span className="text-xs opacity-50">({keyword.frequency || 0})</span>
            </Badge>
          ))}
        </div>
      </ScrollArea>
    );
  };

  // Filter out any invalid perItem entries with comprehensive validation
  const validPerItemResults = (results.perItem || []).filter(item => 
    item && 
    typeof item === 'object' &&
    (item.id !== undefined && item.id !== null) &&
    item.metrics && 
    typeof item.metrics === 'object' &&
    Array.isArray(item.extractedKeywords)
  );

  // Check if we have baselineKeywords in at least one item
  const hasItemBaselineData = validPerItemResults.some(item => 
    Array.isArray(item.baselineKeywords) && item.baselineKeywords.length > 0
  );

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 cyber-card">
        <h3 className="text-lg font-medium mb-4">AI vs Baseline Comparison</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <h4 className="text-sm font-medium mb-2 text-center">Improvement over Baseline</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={improvementMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'Improvement']} />
                <Bar dataKey="value" fill="#22c55e" name="Improvement %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-[300px]">
            <h4 className="text-sm font-medium mb-2 text-center">Performance Comparison</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="AI Algorithm"
                  dataKey="AI"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Baseline"
                  dataKey="Baseline"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center mt-4">
          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Precision Improvement</p>
            <p className="text-xl font-semibold">
              {(((overall.precision || 0) - (baseline.precision || 0)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Recall Improvement</p>
            <p className="text-xl font-semibold">
              {(((overall.recall || 0) - (baseline.recall || 0)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">F1 Score Improvement</p>
            <p className="text-xl font-semibold">
              {(((overall.f1Score || 0) - (baseline.f1Score || 0)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>

      {validPerItemResults.length > 0 && hasItemBaselineData ? (
        <Tabs defaultValue={validPerItemResults[0]?.id?.toString() || "item0"}>
          <h3 className="text-lg font-medium mb-4">Per-Item Comparisons</h3>
          <TabsList className="mb-4 overflow-x-auto flex w-full">
            {validPerItemResults.map((item, index) => (
              <TabsTrigger key={index} value={item.id?.toString() || `item${index}`}>
                Item {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {validPerItemResults.map((item, index) => (
            <TabsContent key={index} value={item.id?.toString() || `item${index}`}>
              <Card className="p-4 md:p-6 cyber-card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">AI Extracted Keywords ({Array.isArray(item.extractedKeywords) ? item.extractedKeywords.length : 0})</h4>
                    {renderKeywordList(item.extractedKeywords || [])}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Baseline Keywords ({Array.isArray(item.baselineKeywords) ? item.baselineKeywords.length : 0})</h4>
                    {renderKeywordList(item.baselineKeywords || [])}
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card className="p-4 md:p-6 cyber-card">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Per-item baseline comparisons are not available. However, you can still see the overall comparison metrics above.
            </AlertDescription>
          </Alert>
        </Card>
      )}
    </div>
  );
};

export default BaselineComparison;
