
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Info } from "lucide-react";
import { Keyword } from "@/hooks/useKeywords";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecommendedSearchModuleProps {
  keywords: Keyword[];
  selectedTerms: string[];
  onSelectCombination: (terms: string[]) => void;
}

const RecommendedSearchModule: React.FC<RecommendedSearchModuleProps> = ({
  keywords,
  selectedTerms,
  onSelectCombination,
}) => {
  const [hoveredCombo, setHoveredCombo] = useState<string[]>([]);

  // Generate recommended combinations of keywords
  const generateRecommendations = () => {
    // If we have fewer than 3 keywords, just return them all
    if (keywords.length <= 3) {
      return [keywords.map(k => k.keyword)];
    }

    // Sort by frequency
    const sortedKeywords = [...keywords].sort((a, b) => b.frequency - a.frequency);
    const topKeywords = sortedKeywords.slice(0, 3).map(k => k.keyword);
    
    // Generate skill-focused combinations
    const technicalKeywords = keywords
      .filter(k => 
        k.category === 'Technical Skill' || 
        ['python', 'javascript', 'react', 'aws', 'sql'].some(tech => 
          k.keyword.toLowerCase().includes(tech)
        )
      )
      .map(k => k.keyword)
      .slice(0, 3);
      
    // Generate role-focused combinations
    const roleKeywords = keywords
      .filter(k => 
        k.category === 'Role' || 
        ['engineer', 'developer', 'manager', 'analyst'].some(role => 
          k.keyword.toLowerCase().includes(role)
        )
      )
      .map(k => k.keyword)
      .slice(0, 3);
    
    const combinations = [
      topKeywords,
    ];
    
    if (technicalKeywords.length > 0) {
      combinations.push(technicalKeywords);
    }
    
    if (roleKeywords.length > 0) {
      combinations.push(roleKeywords);
    }
    
    return combinations.filter(combo => combo.length > 0);
  };

  const recommendations = generateRecommendations();
  
  if (!recommendations.length) {
    return null;
  }

  const handleSelectCombination = (e: React.MouseEvent, terms: string[]) => {
    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
    
    // Use the callback to completely replace the current terms
    onSelectCombination(terms);
    toast.success(`Applied ${terms.length} search terms`);
  };
  
  const handleMouseEnter = (combo: string[]) => {
    setHoveredCombo(combo);
  };
  
  const handleMouseLeave = () => {
    setHoveredCombo([]);
  };

  return (
    <Card className="p-4 bg-secondary/40 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          Recommended Search Combinations
        </h3>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs max-w-[250px]">
                Click any combination to replace your current search terms with these optimized selections.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {recommendations.map((combo, index) => (
          <Button 
            key={index}
            variant="outline"
            size="sm"
            className="cyber-card text-xs relative"
            onClick={(e) => handleSelectCombination(e, combo)}
            onMouseEnter={() => handleMouseEnter(combo)}
            onMouseLeave={handleMouseLeave}
          >
            {index === 0 ? "Top Keywords" : 
              index === 1 ? "Technical Focus" : "Role Focus"}
            <span className="ml-1 text-muted-foreground">({combo.length})</span>
          </Button>
        ))}
      </div>
      
      {hoveredCombo.length > 0 && (
        <div className="mt-2 text-xs">
          <p className="text-muted-foreground mb-1">Preview:</p>
          <div className="flex flex-wrap gap-1">
            {hoveredCombo.map((term, i) => (
              <Badge 
                key={i} 
                variant="outline" 
                className="text-xs bg-primary/10"
              >
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-2">
        Click any combination to replace your current search terms with these optimized selections.
      </p>
    </Card>
  );
};

export default RecommendedSearchModule;
