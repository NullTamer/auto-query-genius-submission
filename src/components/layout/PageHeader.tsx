
import React from "react";
import { RefreshCw, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  updateCount: number;
  lastScrapeTime: string | null;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  updateCount, 
  lastScrapeTime 
}) => {
  const formattedTime = lastScrapeTime 
    ? new Date(lastScrapeTime).toLocaleString()
    : null;

  return (
    <div className="space-y-2">
      <h1 className="text-3xl md:text-4xl font-bold neon-glow text-primary tracking-tighter mb-2 inline-flex items-center">
        <ScanSearch className="mr-2 h-8 w-8" />
        Auto Query Genius
      </h1>
      
      <div className="text-muted-foreground text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center">
            <RefreshCw className={cn(
              "mr-2 h-3 w-3", 
              updateCount > 0 ? "animate-spin text-primary" : ""
            )} /> 
            Model updates: <span className="font-medium ml-1">{updateCount}</span>
          </span>
          
          {formattedTime && (
            <span className="hidden md:inline-flex items-center">
              <span className="mx-2 text-primary/50">•</span>
              Last updated: <span className="font-medium ml-1">{formattedTime}</span>
            </span>
          )}
        </div>
        
        <p className="data-stream">
          Generate optimized Boolean search queries to find the perfect candidates based on job descriptions.
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
