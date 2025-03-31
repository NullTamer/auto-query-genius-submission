
import { useState, useCallback, useEffect } from "react";
import { SearchResult, SearchProvider, JobBoardSelection } from "../types";
import { isMockModeEnabled, searchMockProfiles } from "../utils/mockDataGenerator";
import { toast } from "sonner";

interface UseSearchAPIProps {
  searchProvider: SearchProvider;
  selectedBoards: JobBoardSelection;
}

export const useSearchAPI = ({ searchProvider, selectedBoards }: UseSearchAPIProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [resultsBySource, setResultsBySource] = useState<Record<string, SearchResult[]>>({});
  
  // Track if mock mode was used for the last search
  const [lastSearchWasMock, setLastSearchWasMock] = useState<boolean | null>(null);
  
  // Perform search
  const performSearch = useCallback(async (
    query: string, 
    provider: SearchProvider = searchProvider,
    options: { page?: number } = {}
  ) => {
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }
    
    setIsSearching(true);
    console.log("Performing search with:", { query, provider, selectedBoards, options });
    
    try {
      // Get selected boards as an array
      const selectedBoardsArray = Object.entries(selectedBoards)
        .filter(([_, selected]) => selected)
        .map(([board]) => board);
      
      if (selectedBoardsArray.length === 0) {
        toast.error("Please select at least one profile source");
        setIsSearching(false);
        return;
      }
      
      // Check if we should use mock data
      const useMockData = isMockModeEnabled();
      setLastSearchWasMock(useMockData);
      
      if (useMockData) {
        console.log("Using mock data for search");
        
        // Simulate network delay for realistic testing
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Get mock results
        const { results: mockResults, resultsBySource: mockResultsBySource } = 
          searchMockProfiles(query, provider, selectedBoardsArray, options.page);
        
        setResults(mockResults);
        setResultsBySource(mockResultsBySource);
      } else {
        // Implement actual API search here
        console.log("Would perform real API search, but not implemented yet");
        
        // For now, just return empty results for real API calls
        setResults([]);
        setResultsBySource({});
        
        // Show a message to the user
        toast.info("Real API search not implemented yet - use Mock Mode to see results");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  }, [searchProvider, selectedBoards]);
  
  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setResultsBySource({});
  }, []);
  
  // Effect to handle changes in mock mode
  useEffect(() => {
    const currentMockMode = isMockModeEnabled();
    
    // If we have results and mock mode has changed since last search
    if (results.length > 0 && lastSearchWasMock !== null && lastSearchWasMock !== currentMockMode) {
      // Clear results when switching between real and mock mode
      clearResults();
      
      // Notify the user
      toast.info(`Switched to ${currentMockMode ? 'mock' : 'real'} mode - please search again`);
    }
  }, [results.length, lastSearchWasMock, clearResults]);
  
  return {
    isSearching,
    results,
    resultsBySource,
    performSearch,
    clearResults
  };
};
