
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Search, Zap, Settings, HelpCircle, Upload, Save, ListOrdered, EyeOff, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const UserGuide = () => {
  const [isHidden, setIsHidden] = useState(false);

  // Load preference from localStorage on mount
  useEffect(() => {
    const hidden = localStorage.getItem('hideUserGuide') === 'true';
    setIsHidden(hidden);
  }, []);

  // Toggle guide visibility and save preference
  const toggleGuide = () => {
    const newState = !isHidden;
    setIsHidden(newState);
    localStorage.setItem('hideUserGuide', newState ? 'true' : 'false');
  };

  if (isHidden) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4 flex items-center gap-2 cyber-card"
        onClick={toggleGuide}
      >
        <Eye className="h-4 w-4" />
        Show User Guide
      </Button>
    );
  }

  return (
    <Card className="cyber-card p-4 md:p-6 animate-fade-in help-content">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-primary mb-0 dark:neon-glow flex items-center">
          <ListOrdered className="inline mr-2 h-5 w-5" />
          How to Use Auto Query Genius
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={toggleGuide} className="text-muted-foreground">
                <EyeOff className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Hide user guide (can be shown again later)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-2 text-left">Follow these steps to generate effective Boolean search queries for recruiting:</p>
        
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="cyber-card p-3 flex items-start gap-3 data-stream"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-primary/20 p-2 rounded-full shrink-0 flex items-center justify-center min-w-10">
                <span className="text-primary font-bold">{index + 1}</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-primary text-sm">{feature.title}</h3>
                  {feature.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="text-xs">{feature.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-left text-xs text-muted-foreground pt-2">
          <p>Need more help? Visit the <a href="/help" className="text-primary hover:underline">Help Center</a></p>
        </div>
      </div>
    </Card>
  );
};

const features = [
  {
    icon: <FileText className="h-4 w-4 text-primary" />,
    title: "Enter Job Description",
    description: "Paste a job description or upload a PDF/DOC file",
    tooltip: "The system works best with detailed job descriptions that include skills, qualifications, and experience requirements."
  },
  {
    icon: <Zap className="h-4 w-4 text-primary" />,
    title: "Extract Keywords",
    description: "Generate a Boolean query from job requirements",
    tooltip: "Our NLP model analyzes the job description to identify and prioritize the most relevant skills and qualifications."
  },
  {
    icon: <Search className="h-4 w-4 text-primary" />,
    title: "Select Profile Sources",
    description: "Choose which professional networks to search",
    tooltip: "Select the profile sources before running your search - this determines where candidates will be found."
  },
  {
    icon: <Settings className="h-4 w-4 text-primary" />,
    title: "Customize Results",
    description: "Refine search by adding or removing keywords",
    tooltip: "Fine-tune your search by modifying the query terms to better match your specific requirements."
  },
  {
    icon: <Save className="h-4 w-4 text-primary" />,
    title: "Save & Share",
    description: "Save searches and candidate profiles to your account",
    tooltip: "Saved searches can be easily accessed later and shared with your recruitment team."
  },
  {
    icon: <HelpCircle className="h-4 w-4 text-primary" />,
    title: "Get Support",
    description: "Access guides and documentation for advanced use",
    tooltip: "Our detailed documentation covers advanced Boolean search techniques and recruitment best practices."
  }
];

export default UserGuide;
