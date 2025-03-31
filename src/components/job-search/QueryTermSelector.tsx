
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryTermSelectorProps {
  term: string;
  isSelected: boolean;
  onToggle: () => void;
  frequency?: number;
}

const QueryTermSelector: React.FC<QueryTermSelectorProps> = ({
  term,
  isSelected,
  onToggle,
  frequency
}) => {
  return (
    <Button
      size="sm"
      variant={isSelected ? "default" : "outline"}
      className={cn(
        "flex items-center transition-all rounded-full",
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : "bg-secondary/80 text-muted-foreground hover:bg-secondary/90 hover:text-foreground"
      )}
      onClick={onToggle}
    >
      <span>{term}</span>
      {frequency && <span className="ml-1 text-xs opacity-70">({frequency})</span>}
      {isSelected ? (
        <X className="ml-1 h-3 w-3" />
      ) : (
        <Plus className="ml-1 h-3 w-3" />
      )}
    </Button>
  );
};

export default QueryTermSelector;
