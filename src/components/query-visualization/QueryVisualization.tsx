
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Code, Network, Sparkles, ListFilter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CategoryBadge from "./CategoryBadge";
import TermRelationshipView from "./TermRelationshipView";
import TermRelationshipMap from "./TermRelationshipMap";
import { parseBooleanQuery } from "./utils/queryParser";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";

interface KeywordWithMetadata {
  keyword: string;
  category?: string;
  frequency: number;
}

interface QueryVisualizationProps {
  keywords: KeywordWithMetadata[];
  booleanQuery: string;
}

const QueryVisualization: React.FC<QueryVisualizationProps> = ({
  keywords,
  booleanQuery
}) => {
  const [activeTab, setActiveTab] = useState("categories");
  const [viewMode, setViewMode] = useState<"list" | "category">("category");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Parse the boolean query to extract terms and their relationships
  const { terms, requiredTerms, optionalTerms, exclusions, expansions } = parseBooleanQuery(booleanQuery);
  
  // Group keywords by category for better visualization
  const keywordsByCategory = keywords.reduce((acc: Record<string, KeywordWithMetadata[]>, keyword) => {
    const category = keyword.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(keyword);
    return acc;
  }, {});
  
  // Get all unique categories
  const allCategories = Object.keys(keywordsByCategory).sort((a, b) => {
    // Define priority order for categories
    const priority: Record<string, number> = {
      "Role": 1,
      "Technical Skill": 2,
      "Skill": 3,
      "Qualification": 4,
      "Related Term": 5,
      "Uncategorized": 6
    };
    
    return (priority[a] || 99) - (priority[b] || 99);
  });
  
  // Filter keywords based on selected category
  const filteredCategories = categoryFilter === "all" 
    ? allCategories 
    : allCategories.filter(cat => 
        cat.toLowerCase() === categoryFilter.toLowerCase() ||
        (categoryFilter === "tech" && (
          cat.toLowerCase().includes("technical") || 
          cat.toLowerCase().includes("technology")
        ))
      );
  
  // Get all keywords flattened for list view
  const allKeywords = keywords.sort((a, b) => b.frequency - a.frequency);
  
  // Filter keywords for list view based on category filter
  const filteredKeywords = categoryFilter === "all"
    ? allKeywords
    : allKeywords.filter(kw => {
        const cat = kw.category?.toLowerCase() || "uncategorized";
        return cat === categoryFilter.toLowerCase() ||
          (categoryFilter === "tech" && (
            cat.includes("technical") || 
            cat.includes("technology")
          ));
      });
  
  return (
    <Card className="p-4 shadow-md border-primary/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-medium flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          Boolean Query Analysis
        </h3>
        <span className="text-xs text-muted-foreground">Interactive visualization</span>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="categories">
            <Code className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <Network className="h-4 w-4 mr-2" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="map">
            <Network className="h-4 w-4 mr-2" />
            Relationship Map
          </TabsTrigger>
          <TabsTrigger value="expansion">
            <Sparkles className="h-4 w-4 mr-2" />
            Term Expansion
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          {/* Category filters and view toggles */}
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2">
            <div className="flex flex-wrap gap-1">
              <Button 
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm" 
                onClick={() => setCategoryFilter("all")}
                className="text-xs py-1 h-7"
              >
                All
              </Button>
              <Button 
                variant={categoryFilter === "tech" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("tech")}
                className="text-xs py-1 h-7"
              >
                Tech
              </Button>
              <Button 
                variant={categoryFilter === "role" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("role")}
                className="text-xs py-1 h-7"
              >
                Roles
              </Button>
              <Button 
                variant={categoryFilter === "skill" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("skill")}
                className="text-xs py-1 h-7"
              >
                Skills
              </Button>
              <Button 
                variant={categoryFilter === "qualification" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("qualification")}
                className="text-xs py-1 h-7"
              >
                Quals
              </Button>
            </div>
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "list" | "category")}>
              <ToggleGroupItem value="list" size="sm" className="text-xs h-7 px-2">
                List View
              </ToggleGroupItem>
              <ToggleGroupItem value="category" size="sm" className="text-xs h-7 px-2">
                Category View
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {/* List View */}
          {viewMode === "list" && (
            <div className="flex flex-wrap gap-2">
              {filteredKeywords.length > 0 ? (
                filteredKeywords.map((keyword, idx) => (
                  <CategoryBadge 
                    key={`${keyword.keyword}-${idx}`}
                    term={keyword.keyword}
                    category={keyword.category || "Uncategorized"}
                    frequency={keyword.frequency}
                    isRequired={requiredTerms.includes(keyword.keyword)}
                  />
                ))
              ) : (
                <div className="w-full text-center text-muted-foreground py-4">
                  No keywords found for this category
                </div>
              )}
            </div>
          )}
          
          {/* Category View */}
          {viewMode === "category" && (
            <>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {keywordsByCategory[category].map((keyword, idx) => (
                        <CategoryBadge 
                          key={`${keyword.keyword}-${idx}`}
                          term={keyword.keyword}
                          category={category}
                          frequency={keyword.frequency}
                          isRequired={requiredTerms.includes(keyword.keyword)}
                        />
                      ))}
                    </div>
                    {category !== filteredCategories[filteredCategories.length - 1] && (
                      <Separator className="my-3" />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No categories match the current filter
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="relationships">
          <TermRelationshipView 
            requiredTerms={requiredTerms}
            optionalTerms={optionalTerms}
            exclusions={exclusions}
            query={booleanQuery}
          />
        </TabsContent>
        
        <TabsContent value="map">
          <TermRelationshipMap keywords={keywords} />
        </TabsContent>
        
        <TabsContent value="expansion">
          <div className="space-y-4">
            <div className="bg-muted/30 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Term Expansions in Query
              </h4>
              
              {expansions.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto space-y-3">
                  {expansions.map(([originalTerm, expandedTerms], idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge 
                          term={originalTerm}
                          category="Role"
                          isRequired={requiredTerms.includes(originalTerm)}
                        />
                        <span className="text-muted-foreground">expands to:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {expandedTerms.map((term, termIdx) => (
                            <CategoryBadge 
                              key={termIdx}
                              term={term}
                              category="Related Term"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No term expansions found in the query.
                </p>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>
                Term expansion enhances search queries by including related terms, ensuring the search captures candidates 
                with varied terminologies for the same skills or qualifications.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default QueryVisualization;
