
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { KeywordItem } from "../types";

interface QueryGenerationProps {
  keywords: KeywordItem[];
  baselineKeywords: KeywordItem[];
}

const QueryGeneration: React.FC<QueryGenerationProps> = ({
  keywords,
  baselineKeywords
}) => {
  const [showBaseline, setShowBaseline] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  
  // Generate a Boolean query string from keywords
  const generateBooleanQuery = (keywordList: KeywordItem[]): string => {
    if (!keywordList || keywordList.length === 0) {
      return "No keywords available to generate query";
    }
    
    // Group keywords by category (if available)
    const keywordsByCategory: Record<string, string[]> = {};
    
    keywordList.slice(0, 15).forEach(item => {
      const category = item.category || 'general';
      if (!keywordsByCategory[category]) {
        keywordsByCategory[category] = [];
      }
      keywordsByCategory[category].push(item.keyword);
    });
    
    // Build query with parentheses for each category
    const queryParts: string[] = [];
    
    Object.entries(keywordsByCategory).forEach(([category, terms]) => {
      if (terms.length > 0) {
        // For single terms, don't need OR
        if (terms.length === 1) {
          queryParts.push(`"${terms[0]}"`);
        } else {
          // For multiple terms, group with OR and parentheses
          const categoryTerms = terms.map(term => `"${term}"`).join(" OR ");
          queryParts.push(`(${categoryTerms})`);
        }
      }
    });
    
    // Join all category groups with AND
    return queryParts.join(" AND ");
  };
  
  const currentQuery = generateBooleanQuery(showBaseline ? baselineKeywords : keywords);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Generated Boolean Query</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBaseline(!showBaseline)}
            className="h-7 px-2 text-xs"
          >
            {showBaseline ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Show Transformer
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Show Baseline
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 w-7 p-0"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap max-h-32 border text-foreground">
          {currentQuery}
        </pre>
        <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground">
          {showBaseline ? 'Baseline TF-IDF Query' : 'Transformer Query'}
        </div>
      </div>
    </div>
  );
};

export default QueryGeneration;
