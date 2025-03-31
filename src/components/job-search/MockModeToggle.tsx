
import React, { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleMockMode, isMockModeEnabled } from "./utils/mockDataGenerator";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MockModeToggleProps {
  className?: string;
  variant?: "default" | "prominent";
  onMockModeChange?: (enabled: boolean) => void;
}

const MockModeToggle: React.FC<MockModeToggleProps> = ({ 
  className,
  variant = "default",
  onMockModeChange 
}) => {
  const [enabled, setEnabled] = React.useState(isMockModeEnabled());
  
  // Effect to synchronize the toggle state with actual mock mode state
  useEffect(() => {
    const currentMockMode = isMockModeEnabled();
    if (enabled !== currentMockMode) {
      setEnabled(currentMockMode);
    }
  }, []);
  
  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    toggleMockMode(checked);
    
    // Notify parent components about the change
    if (onMockModeChange) {
      onMockModeChange(checked);
    }
    
    // Show feedback to the user
    toast.info(`Mock mode ${checked ? 'enabled' : 'disabled'}`);
  };
  
  if (variant === "prominent") {
    return (
      <div className={`flex flex-col items-center p-3 border rounded-md ${enabled ? 'border-primary/40 bg-primary/5' : 'border-muted'} ${className}`}>
        <div className="flex items-center gap-3 mb-2">
          <Database className={`h-5 w-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className={`font-medium ${enabled ? 'text-primary' : 'text-muted-foreground'}`}>
            Mock Data Mode
          </span>
          {enabled && (
            <Badge variant="outline" className="bg-primary/20 text-xs">
              Active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2 mb-1">
          <Switch 
            id="mock-mode-prominent" 
            checked={enabled}
            onCheckedChange={handleToggle}
            className={enabled ? "bg-primary" : ""}
          />
          <Label htmlFor="mock-mode-prominent" className="text-sm cursor-pointer">
            {enabled ? "Using mock data" : "Use real data"}
          </Label>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-1">
          {enabled ? 
            "Using generated data instead of API calls" : 
            "Using real API calls for search results"}
        </p>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch 
        id="mock-mode" 
        checked={enabled} 
        onCheckedChange={handleToggle} 
      />
      <Label htmlFor="mock-mode" className="text-sm cursor-pointer">
        Mock Mode
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>
              Enable Mock Mode to use generated candidate data instead of real API calls.
              This is useful for testing and demos without using API quota.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default MockModeToggle;
