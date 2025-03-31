
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { JobBoardSelection, SearchProvider } from "./types";
import JobBoardGroup from "./JobBoardGroup";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface JobBoardSelectorProps {
  selectedBoards: JobBoardSelection;
  onBoardSelectionChange: (board: keyof JobBoardSelection, selected: boolean) => void;
  currentProvider: SearchProvider;
  onProviderChange: (provider: SearchProvider) => void;
}

const JobBoardSelector: React.FC<JobBoardSelectorProps> = ({
  selectedBoards,
  onBoardSelectionChange,
  currentProvider,
  onProviderChange,
}) => {
  // Add logging to track props changes
  useEffect(() => {
    console.log('JobBoardSelector - props updated:', { 
      selectedBoards,
      currentProvider
    });
  }, [selectedBoards, currentProvider]);

  // Define the board groups for candidate profiles
  const boardGroups = {
    "Professional": ["linkedin", "indeed", "wellfound"],
    "Technical": ["github", "stackoverflow"],
    "General": ["google", "twitter"]
  };
  
  // Check if any boards are selected
  const anyBoardSelected = Object.values(selectedBoards).some(value => value);
  console.log('JobBoardSelector - anyBoardSelected:', anyBoardSelected);
  
  const toggleBoard = (board: keyof JobBoardSelection) => {
    // Calculate the new selection state
    const newSelectionState = !selectedBoards[board];
    console.log('JobBoardSelector - toggleBoard:', { board, newSelectionState });
    
    // First, apply the change to the selection
    onBoardSelectionChange(board, newSelectionState);
    
    // Then handle provider changes based on the selection we're making
    if (newSelectionState) {
      // If this board is being selected, make it the current provider regardless
      console.log('JobBoardSelector - setting current provider to:', board);
      onProviderChange(board as SearchProvider);
    } else {
      // If this board is being unselected and it was the current provider,
      // select another provider from the remaining selected boards
      if (board === currentProvider) {
        // Get all the boards except the one being toggled
        const potentialBoards = Object.keys(selectedBoards) as Array<keyof JobBoardSelection>;
        
        // Filter to only include boards that will still be selected after this toggle
        const remainingSelectedBoards = potentialBoards
          .filter(key => key !== board && selectedBoards[key]);
        
        console.log('JobBoardSelector - remainingSelectedBoards:', remainingSelectedBoards);
        
        if (remainingSelectedBoards.length > 0) {
          console.log('JobBoardSelector - changing provider to:', remainingSelectedBoards[0]);
          onProviderChange(remainingSelectedBoards[0] as SearchProvider);
        }
      }
    }
  };
  
  const clearSelections = () => {
    console.log('JobBoardSelector - clearing all selections');
    // Reset all boards to false
    Object.keys(selectedBoards).forEach(board => {
      const boardKey = board as keyof JobBoardSelection;
      onBoardSelectionChange(boardKey, false);
    });
    
    // Default to github as provider when cleared
    console.log('JobBoardSelector - resetting provider to github');
    onProviderChange("github" as SearchProvider);
    toast.success("Cleared all selections");
  };

  return (
    <Card className="cyber-card p-4 bg-secondary/40">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium">Select profile sites to include in search:</div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={clearSelections}
          disabled={!anyBoardSelected}
        >
          <X className="mr-1 h-3 w-3" /> Clear
        </Button>
      </div>
      
      {Object.entries(boardGroups).map(([groupName, boards]) => (
        <JobBoardGroup
          key={groupName}
          groupName={groupName}
          boards={boards}
          selectedBoards={selectedBoards}
          currentProvider={currentProvider}
          onToggleBoard={toggleBoard}
        />
      ))}
    </Card>
  );
};

export default JobBoardSelector;
