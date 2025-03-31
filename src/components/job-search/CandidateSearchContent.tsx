
import React from "react";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CandidateResultsList from "./CandidateResultsList";
import SearchSection from "./SearchSection";
import TermSelector from "./TermSelector";
import { SearchResult } from "./types";
import { Keyword } from "@/hooks/useKeywords";
import { useLocation } from "react-router-dom";

interface CandidateSearchContentProps {
  query: string;
  keywords: Keyword[];
  searchTerm: string;
  selectedTerms: string[];
  isSearching: boolean;
  results: SearchResult[];
  resultsBySource: Record<string, SearchResult[]>;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSearchTermChange: (value: string) => void;
  onTermToggle: (term: string) => void;
  onSelectAll?: (terms: string[]) => void;
  onSelectCombination: (terms: string[]) => void;
  onSearch: () => void;
  onClearSearch?: () => void;
  onSyncTerms?: () => void;
}

const CandidateSearchContent: React.FC<CandidateSearchContentProps> = ({
  query,
  keywords,
  searchTerm,
  selectedTerms,
  isSearching,
  results,
  resultsBySource,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  onSearchTermChange,
  onTermToggle,
  onSelectAll,
  onSelectCombination,
  onSearch,
  onClearSearch,
  onSyncTerms
}) => {
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";

  return (
    <Card className="cyber-card p-4 md:p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow">
          <Search className="inline mr-2 h-5 w-5" />
          Candidate Search
        </h2>
      </div>
      
      <div className="space-y-6">
        <TermSelector 
          query={query}
          selectedTerms={selectedTerms}
          keywords={keywords}
          onTermToggle={onTermToggle}
          onSelectAll={onSelectAll}
          onSelectCombination={onSelectCombination}
          isSearchPage={isSearchPage}
          onSyncTerms={onSyncTerms}
        />
        
        <SearchSection 
          searchTerm={searchTerm}
          isSearching={isSearching}
          query={query}
          onSearchTermChange={onSearchTermChange}
          onSearch={onSearch}
          isSearchPage={isSearchPage}
          onClear={onClearSearch}
        />
        
        <Separator className="my-4" />
        
        <CandidateResultsList
          results={results}
          resultsBySource={resultsBySource}
          isSearching={isSearching}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </Card>
  );
};

export default CandidateSearchContent;
