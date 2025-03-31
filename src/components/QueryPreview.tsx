
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Copy, RefreshCw, Check, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface QueryPreviewProps {
  query: string;
  setQuery?: (value: string) => void;
  canEdit?: boolean;
  isLoading?: boolean;
  timestamp?: string | null;
  onRefresh?: () => void;
  justRefreshed?: boolean;
}

const QueryPreview: React.FC<QueryPreviewProps> = ({ 
  query, 
  setQuery,
  canEdit = false, 
  isLoading = false,
  timestamp,
  onRefresh,
  justRefreshed = false
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(query);
      setCopied(true);
      toast.success("Query copied to clipboard");
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast.error("Failed to copy query");
    }
  };

  return (
    <Card className="cyber-card p-0 overflow-hidden border-primary/20">
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-xl md:text-2xl font-semibold text-primary neon-glow">
            <Terminal className="inline mr-2 h-5 w-5" />
            Boolean Query
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-80">
                <p className="text-sm">This Boolean query is optimized for candidate searches. It uses AND operators for essential skills and OR operators for related terms.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              className={`cyber-card flex items-center gap-2 transition-all ${
                justRefreshed 
                  ? "bg-green-900/50 hover:bg-green-800/50 border-green-700/50 text-green-400" 
                  : "bg-secondary hover:bg-secondary/80 border-border hover:neon-glow"
              }`}
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw 
                size={16} 
                className={isLoading ? "animate-spin" : justRefreshed ? "text-green-400" : ""} 
              />
              {isLoading ? "Refreshing..." : justRefreshed ? "Refreshed!" : "Refresh"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={`cyber-card flex items-center gap-2 transition-all ${
              copied 
                ? "bg-green-900/50 hover:bg-green-800/50 border-green-700/50" 
                : "bg-secondary hover:bg-secondary/80 border-border hover:neon-glow"
            }`}
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check size={16} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      {timestamp && (
        <div className="text-xs text-muted-foreground px-6 py-2 border-b border-border">
          Last updated: {timestamp}
        </div>
      )}
      <div className="p-4 md:p-6">
        <ScrollArea className="h-[200px] w-full matrix-loader">
          {canEdit ? (
            <textarea
              className="w-full h-full text-sm font-mono bg-secondary/80 p-4 rounded-md whitespace-pre-wrap border border-border resize-none text-foreground"
              value={query}
              onChange={(e) => setQuery?.(e.target.value)}
              disabled={isLoading}
            />
          ) : (
            <pre className="text-sm font-mono bg-secondary/80 p-4 rounded-md whitespace-pre-wrap border border-border text-foreground">
              {query}
            </pre>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
};

export default QueryPreview;
