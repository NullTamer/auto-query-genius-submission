
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SearchProvider } from "../types";

interface UseUrlParamsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (termOverride?: string, providerOverride?: SearchProvider) => void;
  results: any[];
}

export const useUrlParams = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  results
}: UseUrlParamsProps) => {
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";

  // Extract URL parameters on component mount or URL change
  useEffect(() => {
    if (isSearchPage) {
      const searchParams = new URLSearchParams(location.search);
      const urlQuery = searchParams.get("q");
      const urlProvider = searchParams.get("provider") as SearchProvider | null;
      
      // Update search term if it's in the URL and different from current
      if (urlQuery && urlQuery !== searchTerm) {
        setSearchTerm(urlQuery);
      }
      
      // Perform search if URL has query and we don't have results yet
      if (urlQuery && !results.length) {
        handleSearch(urlQuery, urlProvider || undefined);
      }
    }
  }, [isSearchPage, location.search, searchTerm, setSearchTerm, handleSearch, results.length]);

  // Build URL parameter string
  const buildUrlParams = (query: string, provider: SearchProvider, selectedBoards?: Record<string, boolean>): string => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (provider) params.set("provider", provider);
    
    // Add selected boards to URL params
    if (selectedBoards) {
      const selectedBoardsList = Object.entries(selectedBoards)
        .filter(([_, isSelected]) => isSelected)
        .map(([board]) => board);
      
      if (selectedBoardsList.length > 0) {
        params.set("boards", selectedBoardsList.join(','));
      }
    }
    
    return params.toString();
  };

  return { 
    isSearchPage,
    buildUrlParams
  };
};
