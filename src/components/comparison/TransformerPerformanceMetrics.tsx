
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Zap, Target, CheckCircle, ArrowUpRight, AlertCircle } from "lucide-react";

interface PerformanceMetrics {
  transformer: {
    precision: number;
    recall: number;
    f1Score: number;
    processingTime: number;
    keywordCount: number;
    uniqueKeywords: number;
  };
  baseline: {
    precision: number;
    recall: number;
    f1Score: number;
    processingTime: number;
    keywordCount: number;
    uniqueKeywords: number;
  };
}

interface TransformerPerformanceMetricsProps {
  metrics: PerformanceMetrics;
}

const TransformerPerformanceMetrics: React.FC<TransformerPerformanceMetricsProps> = ({
  metrics
}) => {
  // Calculate improvement percentages
  const calculateImprovement = (transformerValue: number, baselineValue: number): number => {
    if (baselineValue === 0) return 0;
    return ((transformerValue - baselineValue) / baselineValue) * 100;
  };

  const precisionImprovement = calculateImprovement(metrics.transformer.precision, metrics.baseline.precision);
  const recallImprovement = calculateImprovement(metrics.transformer.recall, metrics.baseline.recall);
  const f1Improvement = calculateImprovement(metrics.transformer.f1Score, metrics.baseline.f1Score);
  
  // Format percentage with + sign for positive values
  const formatPercentage = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Format time in milliseconds to a readable format
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <Card className="cyber-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Accuracy Metrics */}
          <div className="border rounded-lg p-4 bg-muted/10">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Target className="h-4 w-4 mr-1 text-primary" />
              Accuracy Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Precision:</span>
                <div className="flex items-center">
                  <span className="font-medium">{(metrics.transformer.precision * 100).toFixed(1)}%</span>
                  <span className={`text-xs ml-1 ${precisionImprovement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(precisionImprovement)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Recall:</span>
                <div className="flex items-center">
                  <span className="font-medium">{(metrics.transformer.recall * 100).toFixed(1)}%</span>
                  <span className={`text-xs ml-1 ${recallImprovement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(recallImprovement)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">F1 Score:</span>
                <div className="flex items-center">
                  <span className="font-medium">{(metrics.transformer.f1Score * 100).toFixed(1)}%</span>
                  <span className={`text-xs ml-1 ${f1Improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(f1Improvement)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="border rounded-lg p-4 bg-muted/10">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Zap className="h-4 w-4 mr-1 text-primary" />
              Performance Metrics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Processing Time:</span>
                <span className="font-medium">{formatTime(metrics.transformer.processingTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Keywords Found:</span>
                <span className="font-medium">{metrics.transformer.keywordCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Unique Keywords:</span>
                <span className="font-medium">{metrics.transformer.uniqueKeywords}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground border-t pt-3">
          <p className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
            Transformer extraction provides higher accuracy with more comprehensive keyword identification
          </p>
          <p className="flex items-center mt-1">
            <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
            Requires more processing time than the baseline TF-IDF approach
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransformerPerformanceMetrics;
