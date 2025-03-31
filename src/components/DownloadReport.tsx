
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DownloadReportProps {
  filename?: string;
  variant?: "default" | "outline" | "template" | "full";
  buttonText?: string;
}

const DownloadReport: React.FC<DownloadReportProps> = ({ 
  filename = "project-report.md",
  variant = "default",
  buttonText
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const getTemplate = async () => {
    try {
      // Fetch the report markdown file
      const response = await fetch(`/src/assets/${filename}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error("Error loading template:", error);
      toast.error("Failed to load report template");
      return null;
    }
  };
  
  const handleDownload = async () => {
    setIsLoading(true);
    
    try {
      const markdown = await getTemplate();
      
      if (!markdown) {
        setIsLoading(false);
        return;
      }
      
      // Create a blob and download it
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine button text based on variant
  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (variant) {
      case "template":
        return "Download Basic Template";
      case "full":
        return "Download Full Report";
      case "outline":
        return "Download Report Outline";
      default:
        return "Download Report";
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleDownload}
            className="flex items-center gap-2"
            variant={variant === "outline" ? "outline" : "default"}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : variant === "full" || variant === "template" ? (
              <FileText className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {getButtonText()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download the {variant === "full" ? "complete" : ""} project report</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DownloadReport;
