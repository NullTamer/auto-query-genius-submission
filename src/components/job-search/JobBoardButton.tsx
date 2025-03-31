
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchProvider } from "./types";
import { getProviderDisplayName, getSearchUrl } from "./utils/searchUrlUtils";

interface JobBoardButtonProps {
  provider: string;
  searchTerm: string;
  currentProvider: SearchProvider;
  isDisabled?: boolean;
}

const JobBoardButton: React.FC<JobBoardButtonProps> = ({
  provider,
  searchTerm,
  currentProvider,
  isDisabled = false
}) => {
  const handleClick = () => {
    window.open(getSearchUrl(provider as SearchProvider, searchTerm), "_blank");
  };

  const displayName = getProviderDisplayName(provider);
  const isActive = provider === currentProvider;
  
  return (
    <Button
      onClick={handleClick}
      variant={isActive ? "default" : "outline"}
      size="sm"
      disabled={isDisabled}
      className={cn(
        "transition-all whitespace-nowrap rounded-full", 
        isActive 
          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
          : "bg-secondary/80 text-muted-foreground hover:bg-secondary/90 hover:text-foreground",
        isDisabled && "opacity-50"
      )}
      title={`Search profiles on ${displayName}`}
    >
      {displayName}
    </Button>
  );
};

export default JobBoardButton;
