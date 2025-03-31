
import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Keyword } from "@/hooks/useKeywords";
import { PieChart, BarChart2, Zap, Award } from "lucide-react";

interface StatisticsModuleProps {
  keywords: Keyword[];
}

const StatisticsModule: React.FC<StatisticsModuleProps> = ({ keywords }) => {
  const stats = useMemo(() => {
    if (!keywords.length) return null;

    // Get top 3 keywords with weights - explicitly set to 3 to match TermSelector
    const topKeywords = [...keywords]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3)
      .map(k => ({ keyword: k.keyword, weight: k.frequency }));

    // Calculate average frequency
    const avgFrequency = 
      keywords.reduce((sum, k) => sum + k.frequency, 0) / keywords.length;

    // Count frequencies by level
    const frequencyDistribution = {
      high: keywords.filter(k => k.frequency >= 4).length,
      medium: keywords.filter(k => k.frequency >= 2 && k.frequency < 4).length,
      low: keywords.filter(k => k.frequency < 2).length,
    };

    // Identify potential categories based on keywords
    const categoryMap = {
      technical: ['python', 'javascript', 'react', 'node', 'postgresql', 'supabase', 'sql', 'api', 'aws', 'docker', 'kubernetes', 'java', 'c#', 'typescript', 'git'],
      softSkills: ['communication', 'teamwork', 'leadership', 'problem-solving', 'collaboration', 'agile', 'management', 'organization', 'detail-oriented'],
      tools: ['jira', 'confluence', 'github', 'gitlab', 'bitbucket', 'figma', 'sketch', 'adobe', 'jenkins', 'travis', 'azure', 'slack'],
      frameworks: ['angular', 'vue', 'express', 'django', 'flask', 'spring', 'laravel', 'rails'],
    };
    
    const categoryCounts = {
      technical: 0,
      softSkills: 0,
      tools: 0,
      frameworks: 0,
      other: 0
    };
    
    keywords.forEach(k => {
      const lowerKeyword = k.keyword.toLowerCase();
      let found = false;
      
      for (const [category, terms] of Object.entries(categoryMap)) {
        if (terms.some(term => lowerKeyword.includes(term))) {
          categoryCounts[category as keyof typeof categoryCounts]++;
          found = true;
          break;
        }
      }
      
      if (!found) {
        categoryCounts.other++;
      }
    });

    return {
      topKeywords,
      avgFrequency,
      frequencyDistribution,
      categoryCounts
    };
  }, [keywords]);

  if (!stats) {
    return (
      <Card className="cyber-card p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow mb-4">
          <BarChart2 className="inline mr-2 h-5 w-5" />
          Keyword Statistics
        </h2>
        <div className="text-muted-foreground italic">
          No statistics available yet...
        </div>
      </Card>
    );
  }

  return (
    <Card className="cyber-card p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow mb-4">
        <BarChart2 className="inline mr-2 h-5 w-5" />
        Keyword Statistics
      </h2>
      
      <div className="space-y-4">
        <div className="border-b border-border pb-2">
          <h3 className="text-md font-medium flex items-center gap-2">
            <Award className="h-4 w-4" /> Top Keywords by Weight
          </h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {stats?.topKeywords.map((keyword, index) => (
              <span key={index} className="text-primary neon-text px-2 py-1 bg-primary/10 rounded-md flex items-center gap-1">
                {keyword.keyword}
                <span className="text-xs opacity-70 ml-1">({keyword.weight})</span>
              </span>
            ))}
          </div>
        </div>
        
        <div className="border-b border-border pb-2">
          <h3 className="text-md font-medium flex items-center gap-2">
            <PieChart className="h-4 w-4" /> Keyword Distribution
          </h3>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-500">{stats.frequencyDistribution.high}</div>
              <div className="text-xs text-muted-foreground">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-500">{stats.frequencyDistribution.medium}</div>
              <div className="text-xs text-muted-foreground">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-500">{stats.frequencyDistribution.low}</div>
              <div className="text-xs text-muted-foreground">Low Priority</div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-md font-medium flex items-center gap-2">
            <Zap className="h-4 w-4" /> Skill Category Breakdown
          </h3>
          <div className="grid grid-cols-5 gap-2 mt-1">
            <div className="text-center">
              <div className="text-lg font-semibold text-cyan-500">{stats.categoryCounts.technical}</div>
              <div className="text-xs text-muted-foreground">Technical</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-500">{stats.categoryCounts.softSkills}</div>
              <div className="text-xs text-muted-foreground">Soft Skills</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-500">{stats.categoryCounts.tools}</div>
              <div className="text-xs text-muted-foreground">Tools</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-indigo-500">{stats.categoryCounts.frameworks}</div>
              <div className="text-xs text-muted-foreground">Frameworks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-500">{stats.categoryCounts.other}</div>
              <div className="text-xs text-muted-foreground">Other</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatisticsModule;
