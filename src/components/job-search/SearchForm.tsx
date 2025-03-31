
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, UserSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SearchProvider, JobBoardSelection } from "./types";
import { toast } from "sonner";

interface SearchFormProps {
  searchTerm: string;
  isSearching: boolean;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  navigateToSearch?: boolean;
  searchProvider?: SearchProvider;
  selectedBoards?: JobBoardSelection;
  onClear?: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  isSearching,
  onSearchTermChange,
  onSearch,
  navigateToSearch = false,
  searchProvider = 'github',
  selectedBoards,
  onClear
}) => {
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    if (navigateToSearch) {
      // Get selected boards to pass in URL
      const selectedBoardsParam = selectedBoards ? 
        Object.entries(selectedBoards)
          .filter(([_, selected]) => selected)
          .map(([board]) => board)
          .join(',') : 
        '';
      
      // If no boards are selected, show an error
      if (!selectedBoardsParam) {
        toast.error("Please select at least one profile site");
        return;
      }
      
      console.log("Navigating to search with params:", {
        searchTerm,
        searchProvider,
        selectedBoardsParam
      });
      
      navigate(`/search?q=${encodeURIComponent(searchTerm)}&provider=${searchProvider}&boards=${selectedBoardsParam}`);
      return;
    }
    
    onSearch();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    onSearchTermChange("");
    
    if (onClear) {
      onClear();
    }
    
    toast.success("Search cleared");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  };

  return (
    <div className="flex w-full items-center space-x-2">
      <div className="relative flex-grow">
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Enter search term or use generated query"
          className="w-full py-5 pl-10 pr-12 bg-background/50 border-primary/20 text-base rounded-full"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive"
            aria-label="Clear search"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <Button
        onClick={handleSearch}
        className="cyber-card hover:neon-glow transition-all h-10 px-4 rounded-full"
        disabled={isSearching}
      >
        {isSearching ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching
          </>
        ) : (
          <>
            <UserSearch className="mr-2 h-4 w-4" />
            Find Candidates
          </>
        )}
      </Button>
    </div>
  );
};

export default SearchForm;
