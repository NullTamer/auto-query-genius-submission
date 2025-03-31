
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchProvider, JobBoardSelection } from "./types";
import { useSearchTerms } from "./hooks/useSearchTerms";
import { useSearchAPI } from "./hooks/useSearchAPI";
import { useUrlParams } from "./hooks/useUrlParams";
import { useSearchNavigation } from "./hooks/useSearchNavigation";
import { validateSearchTerm } from "./utils/queryHelpers";

interface UseSearchProps {
  initialQuery: string;
  searchProvider: SearchProvider;
  selectedBoards: JobBoardSelection;
  page?: number;
  autoSelectTerms?: boolean;
}

export const useSearch = ({ 
  initialQuery, 
  searchProvider, 
  selectedBoards, 
  page = 1,
  autoSelectTerms = false
}: UseSearchProps) => {
  // Track if initial setup has been done
  const [initialized, setInitialized] = useState(false);

  // Get search term management functionality
  const {
    searchTerm,
    setSearchTerm,
    selectedTerms,
    setSelectedTerms,
    handleTermToggle,
    handleSelectAll,
    handleSelectCombination,
    clearSearchTerm,
    applySelectedTermsToSearch,
    extractedTerms
  } = useSearchTerms({ 
    initialQuery,
    autoSelectTerms
  });

  // Get search API functionality
  const {
    isSearching,
    results,
    resultsBySource,
    performSearch,
    clearResults
  } = useSearchAPI({ searchProvider, selectedBoards });

  // Get URL parameters functionality
  const { isSearchPage, buildUrlParams } = useUrlParams({
    searchTerm,
    setSearchTerm,
    handleSearch: performSearch,
    results
  });

  // Mark as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Handle navigation updates
  const { navigateToSearch } = useSearchNavigation({ 
    searchTerm, 
    searchProvider, 
    isSearchPage,
    selectedBoards
  });

  // Custom search handler that wraps the performSearch function
  const handleSearch = useCallback((currentPage = 1) => {
    console.log("handleSearch called", { 
      searchTerm, 
      selectedTerms, 
      currentPage,
      searchProvider,
      selectedBoards
    });
    
    // Check if any boards are selected
    const anyBoardSelected = Object.values(selectedBoards).some(value => value);
    if (!anyBoardSelected) {
      toast.error("Please select at least one profile source");
      return;
    }
    
    // If we have a search term, prioritize it
    if (searchTerm.trim()) {
      console.log("Performing search with searchTerm:", searchTerm.trim(), "page:", currentPage);
      performSearch(searchTerm.trim(), searchProvider, { page: currentPage });
      return;
    }
    
    // If we only have selected terms but no search term
    if (selectedTerms.length > 0) {
      // Apply selected terms to search term
      const combinedTerms = applySelectedTermsToSearch();
      console.log("Performing search with combinedTerms:", combinedTerms, "page:", currentPage);
      performSearch(combinedTerms, searchProvider, { page: currentPage });
      return;
    }
    
    // Nothing to search with
    toast.error("Please enter a search term or select keywords");
  }, [searchTerm, selectedTerms, performSearch, applySelectedTermsToSearch, searchProvider, selectedBoards]);

  // Handle clearing the search
  const clearSearch = useCallback(() => {
    clearSearchTerm();
    setSelectedTerms([]);
    clearResults();
  }, [clearSearchTerm, setSelectedTerms, clearResults]);

  // Function to update search term with selected terms - should be called explicitly by UI
  const updateSearchTermWithSelectedTerms = useCallback(() => {
    return applySelectedTermsToSearch();
  }, [applySelectedTermsToSearch]);

  // Term toggle without affecting search field
  const handleTermToggleManual = useCallback((term: string) => {
    handleTermToggle(term);
    // Do NOT automatically update search field
  }, [handleTermToggle]);

  // Handle select all without affecting search field
  const handleSelectAllManual = useCallback((terms: string[]) => {
    handleSelectAll(terms);
    // Do NOT automatically update search field
  }, [handleSelectAll]);

  // Handle select combination without affecting search field
  const handleSelectCombinationManual = useCallback((terms: string[]) => {
    handleSelectCombination(terms);
    // Do NOT automatically update search field
  }, [handleSelectCombination]);

  // If on the search page with a query, perform search automatically
  useEffect(() => {
    // Make sure at least one board is selected before searching
    const anyBoardSelected = Object.values(selectedBoards).some(value => value);
    
    if (isSearchPage && initialQuery && !results.length && !isSearching && initialized && anyBoardSelected) {
      console.log("Auto-performing search on search page with initialQuery:", initialQuery);
      performSearch(initialQuery);
    }
  }, [isSearchPage, initialQuery, results.length, isSearching, performSearch, initialized, selectedBoards]);

  return {
    searchTerm,
    setSearchTerm,
    selectedTerms,
    setSelectedTerms,
    isSearching,
    results,
    resultsBySource,
    handleTermToggle: handleTermToggleManual,
    handleSelectAll: handleSelectAllManual,
    handleSelectCombination: handleSelectCombinationManual,
    handleSearch,
    clearSearchTerm,
    clearSearch,
    isSearchPage,
    navigateToSearch,
    extractedTerms,
    updateSearchTermWithSelectedTerms
  };
};
