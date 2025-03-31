
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { isUsingRealTransformer, getTransformerStatus } from "@/utils/transformerExtraction";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";

interface TransformerStatusIndicatorProps {
  className?: string;
}

const TransformerStatusIndicator: React.FC<TransformerStatusIndicatorProps> = ({ 
  className 
}) => {
  const [status, setStatus] = useState({
    isEnabled: false,
    isRealModel: false,
    modelId: "",
    statusMessage: "Checking transformer status..."
  });

  useEffect(() => {
    // Get initial status
    setStatus(getTransformerStatus());
    
    // Check status every 5 seconds
    const interval = setInterval(() => {
      setStatus(getTransformerStatus());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex gap-2 items-center ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status.isRealModel ? "default" : "outline"}
              className={status.isRealModel 
                ? "bg-green-500/20 text-green-500 border-green-500/50 cursor-help" 
                : "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 cursor-help"
              }
            >
              {status.isRealModel 
                ? "✓ Using Real AI Model" 
                : "⚠ Using Fallback Mode"
              }
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-80">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">{status.isRealModel ? "Active AI Model" : "Fallback Mode Active"}</p>
                <p className="text-sm text-muted-foreground">{status.statusMessage}</p>
                {!status.isRealModel && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Using simpler extraction methods. Toggle AI Model again or refresh to retry.
                  </p>
                )}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-xs text-muted-foreground hidden md:inline">
        {status.statusMessage}
      </span>
    </div>
  );
};

export default TransformerStatusIndicator;
