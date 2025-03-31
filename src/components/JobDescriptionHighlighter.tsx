
import React, { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JobDescriptionHighlighterProps {
  jobDescription: string;
  keywords: Array<{
    keyword: string;
    category?: string;
    frequency: number;
  }>;
}

// Create color mapping for different categories with improved contrast
const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
  "technical skill": { bg: "bg-blue-600", text: "text-white", border: "border-blue-400" },
  "soft skill": { bg: "bg-green-600", text: "text-white", border: "border-green-400" },
  "role": { bg: "bg-purple-600", text: "text-white", border: "border-purple-400" },
  "qualification": { bg: "bg-yellow-600", text: "text-white", border: "border-yellow-400" },
  "domain": { bg: "bg-teal-600", text: "text-white", border: "border-teal-400" },
  "experience": { bg: "bg-orange-600", text: "text-white", border: "border-orange-400" },
  "related term": { bg: "bg-pink-600", text: "text-white", border: "border-pink-400" },
  "other": { bg: "bg-gray-600", text: "text-white", border: "border-gray-400" },
  // Default for any unmatched category
  "default": { bg: "bg-gray-600", text: "text-white", border: "border-gray-400" }
};

// Category labels that match the dots in the original design
const categoryLabels: Record<string, string> = {
  "technical skill": "Programming Languages",
  "soft skill": "Skills",
  "role": "Roles",
  "domain": "Domains",
  "qualification": "Methodologies",
  "experience": "Frameworks",
  "related term": "Tools",
  "other": "Other"
};

const JobDescriptionHighlighter: React.FC<JobDescriptionHighlighterProps> = ({ 
  jobDescription,
  keywords
}) => {
  const [viewMode, setViewMode] = useState<"highlighted" | "original">("highlighted");
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({
    "technical skill": true,
    "soft skill": true,
    "role": true,
    "qualification": true,
    "domain": true,
    "experience": true,
    "related term": true,
    "other": true
  });

  // Toggle category visibility
  const toggleCategory = (category: string) => {
    setVisibleCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Create a lookup map for faster keyword matching
  const keywordMap = useMemo(() => {
    const map: Record<string, { category: string, frequency: number }> = {};
    
    // Sort keywords by length (longest first) to handle overlapping terms
    const sortedKeywords = [...keywords].sort((a, b) => 
      b.keyword.length - a.keyword.length
    );
    
    sortedKeywords.forEach(keyword => {
      const term = keyword.keyword.toLowerCase();
      map[term] = { 
        category: keyword.category || "other", 
        frequency: keyword.frequency 
      };
    });
    
    return map;
  }, [keywords]);

  // Highlight job description with keywords
  const highlightedJobDescription = useMemo(() => {
    if (viewMode === "original" || !jobDescription) {
      return jobDescription;
    }

    // We'll tokenize the text while preserving spaces and punctuation
    const tokens: Array<{ text: string, isKeyword: boolean, category?: string, frequency?: number }> = [];
    let currentText = jobDescription;

    // Get all unique keywords sorted by length (longest first)
    const uniqueKeywords = Object.keys(keywordMap)
      .sort((a, b) => b.length - a.length);

    // Find and mark all keyword occurrences
    for (const keyword of uniqueKeywords) {
      // Skip processing if this category is not visible
      const keywordInfo = keywordMap[keyword];
      if (!visibleCategories[keywordInfo.category]) {
        continue;
      }

      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      let match;
      let lastIndex = 0;
      let tempText = '';
      let positions: Array<{ start: number, end: number }> = [];

      // Find all match positions first
      while ((match = regex.exec(currentText)) !== null) {
        positions.push({
          start: match.index,
          end: match.index + match[0].length
        });
      }

      // If no matches, continue to next keyword
      if (positions.length === 0) continue;

      // Process matches from the end to start to avoid index shifting
      positions.sort((a, b) => b.start - a.start);

      // Process text and replace matched portions with placeholders
      tempText = currentText;
      for (const pos of positions) {
        const matchedText = tempText.substring(pos.start, pos.end);
        // Generate a unique placeholder
        const placeholder = `__KEYWORD_${tokens.length}__`;
        // Add the matched keyword to tokens
        tokens.push({
          text: matchedText,
          isKeyword: true,
          category: keywordInfo.category,
          frequency: keywordInfo.frequency
        });
        // Replace the matched portion with the placeholder
        tempText = tempText.substring(0, pos.start) + placeholder + tempText.substring(pos.end);
      }

      currentText = tempText;
    }

    // Process remaining text and placeholders
    const placeholderRegex = /__KEYWORD_(\d+)__/g;
    let remainingText = currentText;
    const finalTokens: Array<{ text: string, isKeyword: boolean, category?: string, frequency?: number }> = [];
    let lastMatchEnd = 0;

    let match;
    while ((match = placeholderRegex.exec(remainingText)) !== null) {
      // Add text before the match
      if (match.index > lastMatchEnd) {
        finalTokens.push({
          text: remainingText.substring(lastMatchEnd, match.index),
          isKeyword: false
        });
      }

      // Add the keyword
      const keywordIndex = parseInt(match[1]);
      finalTokens.push(tokens[keywordIndex]);

      lastMatchEnd = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastMatchEnd < remainingText.length) {
      finalTokens.push({
        text: remainingText.substring(lastMatchEnd),
        isKeyword: false
      });
    }

    // If no keywords were found or all categories are hidden, return original text
    if (finalTokens.length === 0) {
      return jobDescription;
    }

    // Render tokens with appropriate styling
    return (
      <div className="whitespace-pre-wrap text-left text-lg">
        {finalTokens.map((token, index) => {
          if (!token.isKeyword) {
            return token.text;
          }
          
          const category = token.category || "other";
          const colorScheme = categoryColors[category] || categoryColors.default;
          
          return (
            <TooltipProvider key={`${token.text}-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span 
                    className={`${colorScheme.bg} px-2 py-1 rounded-md my-1 mx-0.5 inline-flex ${colorScheme.text} font-medium`}
                  >
                    {token.text}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-popover border-primary/20">
                  <div className="space-y-1">
                    <p className="font-medium">{token.text}</p>
                    <p className="text-xs text-muted-foreground">
                      Category: <span className="text-primary">{categoryLabels[category] || category}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Relevance: <span className="text-primary">{token.frequency}</span>
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    );
  }, [jobDescription, keywordMap, viewMode, visibleCategories]);

  // Get unique categories from keywords for the legend
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    keywords.forEach(keyword => {
      if (keyword.category) {
        categories.add(keyword.category);
      } else {
        categories.add("other");
      }
    });
    return Array.from(categories);
  }, [keywords]);

  return (
    <div className="cyber-card p-6 bg-[#111927] border-primary/20 rounded-lg h-full flex flex-col">
      <div className="flex flex-col gap-6 flex-grow">
        <div className="flex flex-col gap-4 flex-grow">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary neon-glow flex items-center">
              <FileText className="inline mr-2 h-5 w-5" />
              Term Extraction
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Highlighted terms are extracted from the job description. Hover over keywords to see their categories.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex rounded-md overflow-hidden border border-gray-600">
              <button
                onClick={() => setViewMode("highlighted")}
                className={`py-2 px-4 text-sm ${viewMode === "highlighted" ? "bg-gray-800 text-white" : "bg-gray-700 text-gray-300"}`}
              >
                Highlighted View
              </button>
              <button
                onClick={() => setViewMode("original")}
                className={`py-2 px-4 text-sm ${viewMode === "original" ? "bg-gray-800 text-white" : "bg-gray-700 text-gray-300"}`}
              >
                Original Text
              </button>
            </div>
          </div>
          
          {/* Category Legend - Styled like the circular labels in image */}
          {viewMode === "highlighted" && uniqueCategories.length > 0 && (
            <div className="flex flex-wrap gap-3 my-3 justify-center">
              {uniqueCategories.map(category => {
                const colorScheme = categoryColors[category] || categoryColors.default;
                const isVisible = visibleCategories[category];
                
                return (
                  <button 
                    key={category}
                    className={`${isVisible ? colorScheme.bg : 'bg-gray-800'} 
                               ${isVisible ? colorScheme.text : 'text-gray-400'} 
                               py-1 px-3 rounded-full text-sm font-medium flex items-center 
                               transition-all hover:opacity-80 cursor-pointer`}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className={`h-2 w-2 rounded-full ${isVisible ? 'bg-white' : 'bg-gray-500'} mr-2`}></span>
                    {categoryLabels[category] || category}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Job Description Content with increased spacing */}
          <ScrollArea className="flex-grow pr-4 mt-2 rounded-md bg-[#0D1424] border border-gray-800">
            <div className="text-white/90 leading-relaxed p-5">
              {jobDescription ? (
                highlightedJobDescription
              ) : (
                <div className="text-center text-muted-foreground italic">
                  No job description available
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionHighlighter;
