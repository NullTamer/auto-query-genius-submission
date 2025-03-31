import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, X, SlidersHorizontal, Filter, ListFilter, ArrowDown, ArrowUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

interface KeywordDisplayProps {
  keywords: Array<{
    keyword: string;
    category?: string;
    frequency: number;
  }>;
  onRemoveKeyword: (keyword: string) => void;
  isLoading?: boolean;
}

const KeywordDisplay: React.FC<KeywordDisplayProps> = ({
  keywords,
  onRemoveKeyword,
  isLoading = false,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("relevance");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"list" | "category">("list");
  
  const categories = [
    { id: "all", label: "All" },
    { id: "technical skill", label: "Technical Skills" },
    { id: "soft skill", label: "Soft Skills" },
    { id: "role", label: "Roles" },
    { id: "qualification", label: "Qualifications" },
    { id: "domain", label: "Domain" },
    { id: "experience", label: "Experience" },
    { id: "related term", label: "Related Terms" },
    { id: "other", label: "Other" },
  ];
  
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
  };
  
  const filteredKeywords = keywords.filter(keyword => {
    if (categoryFilter === "all") return true;
    
    const category = keyword.category?.toLowerCase() || "";
    return category === categoryFilter.toLowerCase();
  });
  
  const sortedKeywords = [...filteredKeywords].sort((a, b) => {
    if (sortOption === "relevance") {
      const comparison = b.frequency - a.frequency;
      return sortOrder === "asc" ? -comparison : comparison;
    } else if (sortOption === "a-z") {
      const comparison = a.keyword.localeCompare(b.keyword);
      return sortOrder === "asc" ? comparison : -comparison;
    }
    return 0;
  });
  
  const maxFrequency = Math.max(...keywords.map(k => k.frequency), 1);
  
  const keywordsByCategory = sortedKeywords.reduce((acc: Record<string, typeof keywords>, keyword) => {
    const category = keyword.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(keyword);
    return acc;
  }, {});

  const maxCategoryCount = Object.values(keywordsByCategory).reduce(
    (max, keywords) => Math.max(max, keywords.length),
    0
  );
  
  return (
    <Card className="cyber-card p-4 md:p-6 bg-[#1A1F2C] border-primary/20">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow flex items-center">
            <Terminal className="inline mr-2 h-5 w-5" />
            Keywords ({keywords.length})
          </h2>
        </div>
        
        <div className="flex justify-between items-center flex-wrap gap-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-teal-400" />
            <div className="flex flex-wrap gap-1.5">
              {categories.map(category => (
                <Button 
                  key={category.id}
                  variant={categoryFilter === category.id ? "default" : "outline"}
                  size="sm" 
                  className={`h-7 text-xs ${
                    categoryFilter === category.id ? "bg-[#F97316] text-white" : 
                    "bg-transparent border-[#4B5563] hover:bg-[#4B5563]/20"
                  } px-4 py-1 rounded-md`}
                  onClick={() => setCategoryFilter(category.id)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Button 
                variant={sortOption === "relevance" ? "default" : "outline"}
                size="sm" 
                className={`h-7 text-xs ${
                  sortOption === "relevance" ? "bg-[#F97316] text-white" : 
                  "bg-transparent border-[#4B5563] hover:bg-[#4B5563]/20"
                } px-4 py-1 rounded-md`}
                onClick={() => setSortOption("relevance")}
              >
                Relevance
              </Button>
              <Button 
                variant={sortOption === "a-z" ? "default" : "outline"}
                size="sm" 
                className={`h-7 text-xs ${
                  sortOption === "a-z" ? "bg-[#F97316] text-white" : 
                  "bg-transparent border-[#4B5563] hover:bg-[#4B5563]/20"
                } px-4 py-1 rounded-md`}
                onClick={() => setSortOption("a-z")}
              >
                A-Z
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0 bg-transparent border-[#4B5563] hover:bg-[#4B5563]/20 rounded-md"
                onClick={toggleSortOrder}
                aria-label={`Sort ${sortOrder === "asc" ? "ascending" : "descending"}`}
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={(value) => value && setViewMode(value as "list" | "category")}
            className="bg-[#21252E] rounded-full p-1 border border-[#4B5563]"
          >
            <ToggleGroupItem 
              value="list" 
              aria-label="List View"
              className={`text-xs py-1 px-4 rounded-full ${viewMode === "list" ? "bg-white text-black" : "text-white hover:bg-[#4B5563]/20"}`}
            >
              List View
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="category" 
              aria-label="Category View"
              className={`text-xs py-1 px-4 rounded-full ${viewMode === "category" ? "bg-teal-400 text-black" : "text-white hover:bg-[#4B5563]/20"}`}
            >
              Category View
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] pr-4 mt-4 matrix-loader">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-muted-foreground">Loading keywords...</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {sortedKeywords.length === 0 ? (
              <div className="text-muted-foreground italic text-center p-4">
                No keywords found with the selected filter
              </div>
            ) : (
              sortedKeywords.map((keywordObj, index) => {
                const confidencePercent = Math.round((keywordObj.frequency / maxFrequency) * 100);
                
                return (
                  <div 
                    key={`${keywordObj.keyword}-${index}`}
                    className="p-4 bg-[#21252E] rounded-md border border-primary/10 hover:border-primary/30 transition-all data-stream"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-lg font-medium text-white">{keywordObj.keyword}</h3>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/20 text-primary/90 border-primary/20 px-2 py-0.5"
                        >
                          {keywordObj.category || "Uncategorized"}
                        </Badge>
                        <button 
                          onClick={() => onRemoveKeyword(keywordObj.keyword)}
                          className="text-muted-foreground hover:text-white transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Progress value={confidencePercent} className="h-2 bg-primary/10" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Confidence</span>
                        <span>{confidencePercent}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(keywordsByCategory).length === 0 ? (
              <div className="text-muted-foreground italic text-center p-4">
                No keywords found with the selected filter
              </div>
            ) : (
              Object.entries(keywordsByCategory).map(([category, categoryKeywords]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-md font-medium text-teal-400/90 bg-[#21252E]/80 p-2 rounded border-l-4 border-teal-400/40">
                      {category}
                    </h3>
                    <Badge className="bg-blue-900/30 text-blue-300 border-blue-800">
                      ({categoryKeywords.length})
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryKeywords.map((keywordObj, index) => {
                      const confidencePercent = Math.round((keywordObj.frequency / maxFrequency) * 100);
                      
                      return (
                        <div 
                          key={`${keywordObj.keyword}-${index}`}
                          className="flex items-center p-2 bg-[#333946] rounded-full border border-teal-400/20 gap-2"
                        >
                          <span className="text-white font-mono font-medium flex-1 pl-2">{keywordObj.keyword}</span>
                          <span className="text-xs text-teal-400 font-mono whitespace-nowrap">{confidencePercent}%</span>
                          <button 
                            onClick={() => onRemoveKeyword(keywordObj.keyword)}
                            className="text-muted-foreground hover:text-white transition-colors bg-[#1A1F2C] rounded-full p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default KeywordDisplay;
