
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeywordItem } from "@/components/evaluation/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface ExtractionComparisonChartProps {
  transformerKeywords: KeywordItem[];
  baselineKeywords: KeywordItem[];
}

const ExtractionComparisonChart: React.FC<ExtractionComparisonChartProps> = ({
  transformerKeywords,
  baselineKeywords
}) => {
  // Normalize keywords to ensure consistent structure
  const normalizeKeywords = (keywords: KeywordItem[]): KeywordItem[] => {
    if (!keywords || !Array.isArray(keywords)) return [];
    return keywords.map(item => ({
      keyword: typeof item.keyword === 'string' ? item.keyword : String(item.keyword || ''),
      frequency: typeof item.frequency === 'number' ? item.frequency : 1,
      category: item.category || 'other'
    }));
  };

  // Normalize input data
  const normalizedTransformer = normalizeKeywords(transformerKeywords);
  const normalizedBaseline = normalizeKeywords(baselineKeywords);

  // Create merged data for better comparison
  const prepareChartData = () => {
    // Take top keywords from transformer method (if available)
    const topTransformerKeywords = normalizedTransformer.slice(0, 8);
    
    if (topTransformerKeywords.length === 0) {
      // Fallback to baseline keywords if transformer keywords are empty
      return normalizedBaseline.slice(0, 8).map(bk => ({
        keyword: bk.keyword,
        transformer: 0,
        baseline: bk.frequency
      }));
    }
    
    // Create chart data by matching baseline keywords
    return topTransformerKeywords.map((tk) => {
      // Find matching baseline keyword if it exists
      const matchingBaselineKeyword = normalizedBaseline.find(
        bk => bk.keyword.toLowerCase() === tk.keyword.toLowerCase()
      );
      
      return {
        keyword: tk.keyword,
        transformer: tk.frequency,
        baseline: matchingBaselineKeyword ? matchingBaselineKeyword.frequency : 0,
      };
    });
  };

  const chartData = prepareChartData();

  // Handle empty data case
  if (chartData.length === 0) {
    return (
      <Card className="cyber-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Keyword Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No comparison data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Colors for the bars
  const transformerColor = "#8b5cf6"; // Purple
  const baselineColor = "#0ea5e9"; // Blue

  return (
    <Card className="cyber-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Keyword Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                type="category" 
                dataKey="keyword" 
                tick={{ fontSize: 12 }}
                width={90}
                tickFormatter={(value) => {
                  // Limit long keywords for better display
                  return value && typeof value === 'string' && value.length > 15 
                    ? value.substring(0, 15) + '...' 
                    : String(value || '');
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  value, 
                  name === "transformer" ? "Transformer" : "TF-IDF (Baseline)"
                ]}
                labelFormatter={(label) => `Keyword: ${label}`}
              />
              <Legend 
                verticalAlign="top" 
                formatter={(value) => value === "transformer" ? "Transformer" : "TF-IDF (Baseline)"}
              />
              <Bar 
                dataKey="baseline" 
                fill={baselineColor} 
                name="baseline"
                radius={[0, 4, 4, 0]}
              />
              <Bar 
                dataKey="transformer" 
                fill={transformerColor} 
                name="transformer"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Removed academic figure reference that was carried over from project report */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          <p>
            Comparing frequency of top keywords found by each extraction method
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractionComparisonChart;
