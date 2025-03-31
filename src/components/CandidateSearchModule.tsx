
import React, { memo, useCallback, useState, useEffect } from "react";
import { Keyword } from "@/hooks/useKeywords";
import { SearchProvider, JobBoardSelection } from "./job-search/types";
import { SearchProviderProvider, useSearchProvider } from "./job-search/SearchProvider";
import { useSearch } from "./job-search/useSearch";
import CandidateSearchContent from "./job-search/CandidateSearchContent";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { deepCompare } from "@/utils/memoization";
import { toast } from "sonner";
import MockModeToggle from "./job-search/MockModeToggle";
import { useLocation } from "react-router-dom";

interface CandidateSearchModuleProps {
  query: string;
  keywords: Keyword[];
  initialProvider?: SearchProvider;
  initialSelectedBoards?: Record<string, boolean>;
}

const CandidateSearchModule: React.FC<CandidateSearchModuleProps> = ({ 
  query, 
  keywords,
  initialProvider,
  initialSelectedBoards
}) => {
  console.log('CandidateSearchModule - render with props:', { query, initialProvider, initialSelectedBoards });
  
  return (
    <div className="space-y-6">
      <SearchProviderProvider 
        initialProvider={initialProvider}
        initialSelectedBoards={initialSelectedBoards}
      >
        <CandidateSearchModuleContent query={query} keywords={keywords} />
      </SearchProviderProvider>
    </div>
  );
};

// Inner component with access to the SearchProvider context
const CandidateSearchModuleContent: React.FC<{ query: string; keywords: Keyword[] }> = memo(({
  query,
  keywords
}) => {
  const { searchProvider, selectedBoards } = useSearchProvider();
  const performance = usePerformanceMonitor("CandidateSearchModuleContent");
  const location = useLocation();
  
  // Check if we're on the dedicated search page
  const isSearchPage = location.pathname === "/search";
  
  console.log('CandidateSearchModuleContent - render with context state:', { 
    searchProvider, 
    selectedBoards
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3); // Default to 3 pages for now
  
  const {
    searchTerm,
    setSearchTerm,
    selectedTerms,
    setSelectedTerms,
    isSearching,
    results,
    resultsBySource,
    handleTermToggle,
    handleSelectAll,
    handleSelectCombination,
    handleSearch,
    clearSearch,
    updateSearchTermWithSelectedTerms
  } = useSearch({
    initialQuery: query,
    searchProvider,
    selectedBoards,
    page: currentPage, // Pass current page to the search hook
    autoSelectTerms: false // Set to false to prevent auto-selection of terms
  });

  // Reset to page 1 when search parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchProvider, selectedBoards]);

  // Update total pages when results change
  useEffect(() => {
    // This is a simple estimation of total pages
    // In a real API, this would come from the response
    const estimatedTotalResults = results.length > 0 ? results.length * 3 : 30;
    const calculatedTotalPages = Math.ceil(estimatedTotalResults / 10);
    setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
  }, [results]);

  // Handle mock mode changes - trigger a new search if results are already showing
  const handleMockModeChange = useCallback((enabled: boolean) => {
    console.log('Mock mode changed to:', enabled);
    
    // If we already have results showing, clear them and show a message
    if (results.length > 0) {
      clearSearch();
      toast.info(`Switched to ${enabled ? 'mock' : 'real'} mode - please search again`);
    }
  }, [results.length, clearSearch]);

  // Wrap callback functions in performance monitoring
  const handleSearch_ = useCallback(() => {
    console.log('CandidateSearchModuleContent - handleSearch_ called with:', { 
      searchTerm, 
      selectedTerms, 
      currentPage,
      selectedBoards 
    });
    performance.trackInteraction(() => handleSearch(currentPage));
  }, [handleSearch, performance, currentPage, searchTerm, selectedTerms, selectedBoards]);

  const handleTermToggle_ = useCallback((term: string) => {
    performance.trackInteraction(() => handleTermToggle(term));
  }, [handleTermToggle, performance]);

  const handleSelectAll_ = useCallback((terms: string[]) => {
    performance.trackInteraction(() => handleSelectAll(terms));
  }, [handleSelectAll, performance]);

  const handleClearSearch_ = useCallback(() => {
    // Reset pagination when clearing search
    setCurrentPage(1);
    performance.trackInteraction(() => clearSearch());
  }, [clearSearch, performance]);

  const handleSearchTermChange = useCallback((value: string) => {
    performance.trackInteraction(() => setSearchTerm(value));
  }, [setSearchTerm, performance]);

  const handleSyncTerms = useCallback(() => {
    performance.trackInteraction(() => updateSearchTermWithSelectedTerms());
  }, [updateSearchTermWithSelectedTerms, performance]);

  // Handle pagination - now actually performs a search with the new page
  const handlePageChange = useCallback((page: number) => {
    if (page === currentPage || isSearching) return;
    
    setCurrentPage(page);
    
    // Show loading status
    if (!isSearching) {
      toast.info(`Loading page ${page}...`);
    }
    
    // Perform the search with the new page number
    performance.trackInteraction(() => handleSearch(page));
    
    console.log(`Page changed to: ${page}`);
  }, [currentPage, isSearching, performance, handleSearch]);

  return (
    <>
      {/* Only show the MockModeToggle if we're not on the search page */}
      {!isSearchPage && (
        <div className="flex justify-end mb-2">
          <MockModeToggle onMockModeChange={handleMockModeChange} />
        </div>
      )}
      
      <CandidateSearchContent
        query={query}
        keywords={keywords}
        searchTerm={searchTerm}
        selectedTerms={selectedTerms}
        isSearching={isSearching}
        results={results}
        resultsBySource={resultsBySource}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearchTermChange={handleSearchTermChange}
        onTermToggle={handleTermToggle_}
        onSelectAll={handleSelectAll_}
        onSelectCombination={handleSelectCombination}
        onSearch={handleSearch_}
        onClearSearch={handleClearSearch_}
        onSyncTerms={handleSyncTerms}
      />
    </>
  );
}, deepCompare);

export default CandidateSearchModule;
