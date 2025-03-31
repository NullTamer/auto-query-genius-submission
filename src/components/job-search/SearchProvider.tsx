
import React, { createContext, useContext, useState, useEffect } from "react";
import { SearchProvider, JobBoardSelection } from "./types";

// Default job board selection - nothing selected by default
const defaultJobBoardSelection: JobBoardSelection = {
  google: false,
  linkedin: false,
  indeed: false,
  github: false,
  stackoverflow: false,
  twitter: false,
  wellfound: false
};

// Context for search provider
interface SearchProviderContextType {
  searchProvider: SearchProvider;
  selectedBoards: JobBoardSelection;
  handleProviderChange: (provider: SearchProvider) => void;
  handleBoardSelectionChange: (board: keyof JobBoardSelection, selected: boolean) => void;
  toggleAllBoards: (selected: boolean) => void;
}

const SearchProviderContext = createContext<SearchProviderContextType | undefined>(undefined);

// Provider component
interface SearchProviderProviderProps {
  children: React.ReactNode;
  initialProvider?: SearchProvider;
  initialSelectedBoards?: Record<string, boolean>;
}

export const SearchProviderProvider: React.FC<SearchProviderProviderProps> = ({ 
  children, 
  initialProvider = 'github',
  initialSelectedBoards
}) => {
  // State for search provider
  const [searchProvider, setSearchProvider] = useState<SearchProvider>(initialProvider);
  
  // State for selected job boards - initialize with default (all false)
  const [selectedBoards, setSelectedBoards] = useState<JobBoardSelection>(() => {
    console.log('SearchProviderProvider - initializing selectedBoards', { initialSelectedBoards });
    
    // Start with all boards set to false
    const newBoardSelection = { ...defaultJobBoardSelection };
    
    if (initialSelectedBoards) {
      // Only set boards to true that are explicitly true in initialSelectedBoards
      // and exist in our schema
      Object.keys(initialSelectedBoards).forEach(key => {
        if (key in newBoardSelection && initialSelectedBoards[key] === true) {
          newBoardSelection[key as keyof JobBoardSelection] = true;
        }
      });
    }
    // Removed the auto-selection of initialProvider when initialSelectedBoards is not provided
    
    console.log('SearchProviderProvider - initialized boards:', newBoardSelection);
    return newBoardSelection;
  });

  // Update provider when initialProvider changes
  useEffect(() => {
    if (initialProvider) {
      console.log('SearchProviderProvider - initialProvider changed:', initialProvider);
      setSearchProvider(initialProvider);
    }
  }, [initialProvider]);

  // Update selected boards when initialSelectedBoards changes
  useEffect(() => {
    console.log('SearchProviderProvider - initialSelectedBoards effect triggered', { initialSelectedBoards });
    
    if (initialSelectedBoards) {
      // Create a new board selection object starting with all false
      const newBoardSelection = { ...defaultJobBoardSelection };
      
      // Only set boards to true that are explicitly true in initialSelectedBoards
      Object.keys(initialSelectedBoards).forEach(key => {
        if (key in newBoardSelection && initialSelectedBoards[key] === true) {
          newBoardSelection[key as keyof JobBoardSelection] = true;
        }
      });
      
      console.log('SearchProviderProvider - updating selectedBoards:', { newBoardSelection });
      setSelectedBoards(newBoardSelection);
    }
  }, [initialSelectedBoards]);

  // Handle selecting a different provider
  const handleProviderChange = (provider: SearchProvider) => {
    console.log('SearchProviderProvider - provider changed:', provider);
    setSearchProvider(provider);
  };

  // Handle selecting/deselecting a job board
  const handleBoardSelectionChange = (board: keyof JobBoardSelection, selected: boolean) => {
    console.log('SearchProviderProvider - board selection changed:', { board, selected });
    setSelectedBoards(prev => {
      const updated = {
        ...prev,
        [board]: selected
      };
      console.log('SearchProviderProvider - updated boards:', updated);
      return updated;
    });
  };

  // Handle selecting/deselecting all job boards
  const toggleAllBoards = (selected: boolean) => {
    console.log('SearchProviderProvider - toggle all boards:', selected);
    const updatedBoards = Object.keys(selectedBoards).reduce((acc, key) => {
      acc[key as keyof JobBoardSelection] = selected;
      return acc;
    }, { ...defaultJobBoardSelection });
    
    console.log('SearchProviderProvider - updated all boards:', updatedBoards);
    setSelectedBoards(updatedBoards);
  };

  return (
    <SearchProviderContext.Provider
      value={{
        searchProvider,
        selectedBoards,
        handleProviderChange,
        handleBoardSelectionChange,
        toggleAllBoards
      }}
    >
      {children}
    </SearchProviderContext.Provider>
  );
};

// Custom hook to use search provider context
export const useSearchProvider = () => {
  const context = useContext(SearchProviderContext);
  
  if (!context) {
    throw new Error('useSearchProvider must be used within a SearchProviderProvider');
  }
  
  return context;
};
