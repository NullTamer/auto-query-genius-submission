
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SearchProvider, JobBoardSelection } from "../types";

interface UseSearchNavigationProps {
  searchTerm: string;
  searchProvider: SearchProvider;
  isSearchPage: boolean;
  selectedBoards?: JobBoardSelection;
}

export const useSearchNavigation = ({ 
  searchTerm, 
  searchProvider,
  isSearchPage,
  selectedBoards = {
    google: false,
    linkedin: false,
    indeed: false,
    github: false,
    stackoverflow: false,
    twitter: false,
    wellfound: false
  }
}: UseSearchNavigationProps) => {
  const navigate = useNavigate();

  const navigateToSearch = useCallback(() => {
    if (!searchTerm.trim()) return;
    
    // Build the URL params
    const params = new URLSearchParams();
    params.set("q", searchTerm.trim());
    params.set("provider", searchProvider);
    
    // Add selected boards to URL params
    if (selectedBoards) {
      // Get all boards that are selected (true)
      const selectedBoardsList = Object.entries(selectedBoards)
        .filter(([_, isSelected]) => isSelected)
        .map(([board]) => board);
      
      if (selectedBoardsList.length > 0) {
        params.set("boards", selectedBoardsList.join(','));
      }
    }
    
    // Navigate to search page with params
    const searchPath = `/search?${params.toString()}`;
    console.log('Navigating to:', searchPath);
    
    if (isSearchPage) {
      // If already on search page, replace the current URL (don't add to history)
      navigate(searchPath, { replace: true });
    } else {
      // Otherwise, navigate normally
      navigate(searchPath);
    }
  }, [searchTerm, searchProvider, navigate, isSearchPage, selectedBoards]);

  return { navigateToSearch };
};
