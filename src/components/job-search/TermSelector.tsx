
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, PlusCircle, CheckCircle2, Dice3, ArrowUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import QueryTermSelector from "./QueryTermSelector";
import { Keyword } from "@/hooks/useKeywords";
import { toast } from "sonner";

interface TermSelectorProps {
  query: string;
  selectedTerms: string[];
  keywords: Keyword[];
  onTermToggle: (term: string) => void;
  onSelectAll?: (terms: string[]) => void;
  onSelectCombination: (terms: string[]) => void;
  isSearchPage?: boolean;
  onSyncTerms?: () => void;
}

const TermSelector: React.FC<TermSelectorProps> = ({
  query,
  selectedTerms,
  keywords,
  onTermToggle,
  onSelectAll,
  onSelectCombination,
  isSearchPage = false,
  onSyncTerms
}) => {
  const [justApplied, setJustApplied] = useState(false);
  const [justRandom, setJustRandom] = useState(false);
  
  // Get terms from query if it's search page and we don't have keywords
  const terms = isSearchPage && keywords.length === 0
    ? query.split(/\s+/).filter(Boolean).map(term => ({ keyword: term, frequency: 1 }))
    : keywords;
    
  // Get the top terms for quick selection - explicitly using top 3 to match StatisticsModule
  const topTerms = [...terms]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3)
    .map(k => k.keyword);
    
  const handleSelectTopTerms = () => {
    if (onSelectAll) {
      onSelectAll(topTerms);
      toast.success(`Selected top ${topTerms.length} terms`);
    }
  };
  
  const handleRandomCombination = () => {
    // Get all available terms
    const availableTerms = terms.map(k => k.keyword);
    
    // Select a random number of terms (between 3 and 5)
    const numTerms = Math.floor(Math.random() * 3) + 3;
    
    // Shuffle array and take the first numTerms
    const shuffled = [...availableTerms].sort(() => 0.5 - Math.random());
    const selectedCombination = shuffled.slice(0, Math.min(numTerms, availableTerms.length));
    
    onSelectCombination(selectedCombination);
    setJustRandom(true);
    setTimeout(() => setJustRandom(false), 2000);
    toast.success(`Selected ${selectedCombination.length} random terms`);
  };
  
  const handleApplyTerms = () => {
    if (onSyncTerms && selectedTerms.length > 0) {
      onSyncTerms();
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 2000);
      toast.success(`Applied ${selectedTerms.length} terms to search`);
    } else if (selectedTerms.length === 0) {
      toast.error("No terms selected to apply");
    }
  };
  
  // Show appropriate UI based on terms availability
  if (terms.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>No search terms available. Try processing a job description first.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Search Terms</h3>
        <div className="flex gap-2">
          {onSelectAll && (
            <Button 
              variant="outline" 
              size="sm" 
              className="cyber-card text-xs"
              onClick={handleSelectTopTerms}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Top Terms
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className={`cyber-card text-xs ${justRandom ? 'bg-purple-800/20 text-purple-400 border-purple-700/50' : ''}`}
            onClick={handleRandomCombination}
          >
            <Dice3 className={`h-3 w-3 mr-1 ${justRandom ? 'text-purple-400' : ''}`} />
            {justRandom ? "Randomized!" : "Random"}
          </Button>
          {onSyncTerms && (
            <Button 
              variant="outline" 
              size="sm" 
              className={`cyber-card text-xs ${justApplied ? 'bg-green-800/20 text-green-400 border-green-700/50' : selectedTerms.length > 0 ? "bg-primary/20" : ""}`}
              onClick={handleApplyTerms}
              disabled={selectedTerms.length === 0}
            >
              <ArrowUp className={`h-3 w-3 mr-1 ${justApplied ? 'text-green-400' : ''}`} />
              {justApplied ? "Applied!" : "Apply Terms"}
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[120px] rounded-md border p-2">
        <div className="flex flex-wrap gap-1.5">
          {terms.map((term) => (
            <QueryTermSelector
              key={term.keyword}
              term={term.keyword}
              isSelected={selectedTerms.includes(term.keyword)}
              onToggle={() => onTermToggle(term.keyword)}
              frequency={term.frequency}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          {selectedTerms.length > 0 ? (
            <span>{selectedTerms.length} terms selected</span>
          ) : (
            <span>Click terms above to include them in your search</span>
          )}
        </div>
        {selectedTerms.length > 0 && (
          <Button 
            variant="link" 
            size="sm" 
            className="p-0 h-auto text-xs"
            onClick={() => {
              onSelectCombination([]);
              toast.info("Selection cleared");
            }}
          >
            Clear selection
          </Button>
        )}
      </div>
    </div>
  );
};

export default TermSelector;
