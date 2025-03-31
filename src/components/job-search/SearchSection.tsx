
import React from "react";
import SearchForm from "./SearchForm";
import { useSearchProvider } from "./SearchProvider";
import JobBoardSelector from "./JobBoardSelector";
import { Separator } from "@/components/ui/separator";
import ExternalSearchButton from "./ExternalSearchButton";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchSectionProps {
  searchTerm: string;
  isSearching: boolean;
  query: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  isSearchPage?: boolean;
  onClear?: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  searchTerm,
  isSearching,
  query,
  onSearchTermChange,
  onSearch,
  isSearchPage = false,
  onClear
}) => {
  const { searchProvider, selectedBoards, handleProviderChange, handleBoardSelectionChange } = useSearchProvider();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">1. Select Profile Sources:</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-80">
                <p className="text-sm">Choose which professional networks to search for candidate profiles. Select at least one source before running your search.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {/* Removed MockModeToggle from here */}
      </div>
      
      <JobBoardSelector 
        selectedBoards={selectedBoards}
        onBoardSelectionChange={(board, selected) => handleBoardSelectionChange(board, selected)}
        currentProvider={searchProvider}
        onProviderChange={handleProviderChange}
      />
      
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium">2. Run Your Search:</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-80">
                <p className="text-sm">Enter your search query or use the generated Boolean query to find relevant candidate profiles across selected networks.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <SearchForm 
          searchTerm={searchTerm}
          isSearching={isSearching}
          onSearchTermChange={onSearchTermChange}
          onSearch={onSearch}
          navigateToSearch={!isSearchPage}
          searchProvider={searchProvider}
          selectedBoards={selectedBoards}
          onClear={onClear}
        />
      </div>
      
      <ExternalSearchButton 
        searchTerm={searchTerm}
        query={query}
        searchProvider={searchProvider}
        selectedBoards={selectedBoards}
      />
      
      <Separator className="my-3" />
    </div>
  );
};

export default SearchSection;
