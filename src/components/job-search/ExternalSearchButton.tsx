
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getSearchUrl } from "./utils/searchUrlUtils";
import { SearchProvider, JobBoardSelection } from "./types";

interface ExternalSearchButtonProps {
  searchTerm: string;
  query: string;
  searchProvider: SearchProvider;
  selectedBoards: JobBoardSelection;
}

const ExternalSearchButton: React.FC<ExternalSearchButtonProps> = ({
  searchTerm,
  query,
  searchProvider,
  selectedBoards
}) => {
  // Use the searchTerm if it's not empty, otherwise fall back to query
  const effectiveQuery = searchTerm.trim() || query;
  
  // Add logging when props change
  useEffect(() => {
    console.log('ExternalSearchButton - props updated:', {
      searchTerm,
      query,
      searchProvider,
      selectedBoards,
      effectiveQuery
    });
  }, [searchTerm, query, searchProvider, selectedBoards, effectiveQuery]);
  
  // Only show button if we have a query
  if (!effectiveQuery) {
    return null;
  }
  
  // Check if any boards are selected
  const anyBoardSelected = Object.values(selectedBoards).some(value => value);
  console.log('ExternalSearchButton - anyBoardSelected:', anyBoardSelected);
  
  // Determine which URL to use based on selected boards
  const getExternalSearchUrl = () => {
    // If no boards are selected, use the current provider
    if (!anyBoardSelected) {
      console.log('ExternalSearchButton - no boards selected, using current provider:', searchProvider);
      return getSearchUrl(searchProvider, effectiveQuery);
    }
    
    // Find the first selected board
    const firstSelectedBoard = Object.entries(selectedBoards)
      .find(([_, selected]) => selected)?.[0] as SearchProvider | undefined;
    
    console.log('ExternalSearchButton - firstSelectedBoard:', firstSelectedBoard);
    
    // If we found a selected board, use it, otherwise fall back to the current provider
    const providerToUse = firstSelectedBoard || searchProvider;
    console.log('ExternalSearchButton - using provider:', providerToUse);
    return getSearchUrl(providerToUse, effectiveQuery);
  };

  return (
    <Button
      variant="outline"
      className="w-full text-sm"
      onClick={() => window.open(getExternalSearchUrl(), '_blank')}
    >
      <ExternalLink className="mr-2 h-4 w-4" />
      Open Search in Browser
    </Button>
  );
};

export default ExternalSearchButton;
