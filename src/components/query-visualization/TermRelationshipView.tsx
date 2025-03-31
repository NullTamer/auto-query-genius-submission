
import React from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CategoryBadge from "./CategoryBadge";

interface TermRelationshipViewProps {
  requiredTerms: string[];
  optionalTerms: string[];
  exclusions: string[];
  query: string;
}

const TermRelationshipView: React.FC<TermRelationshipViewProps> = ({
  requiredTerms,
  optionalTerms,
  exclusions,
  query
}) => {
  const hasTerms = requiredTerms.length > 0 || optionalTerms.length > 0 || exclusions.length > 0;
  
  return (
    <div className="space-y-4">
      {!hasTerms && (
        <div className="text-center text-muted-foreground py-6">
          No term relationships detected in the query
        </div>
      )}
      
      {requiredTerms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <span className="inline-block rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 p-1 mr-2">
              AND
            </span>
            Required Terms 
          </h4>
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {requiredTerms.map((term, idx) => (
                <CategoryBadge 
                  key={idx}
                  term={term}
                  category="Role"
                  isRequired={true}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These terms must all be present in candidate profiles (connected with AND operator)
            </p>
          </div>
        </div>
      )}
      
      {optionalTerms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <span className="inline-block rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 p-1 mr-2">
              OR
            </span>
            Optional Terms
          </h4>
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {optionalTerms.map((term, idx) => (
                <CategoryBadge 
                  key={idx}
                  term={term}
                  category="Skill"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              At least one of these terms should be present in candidate profiles (connected with OR operator)
            </p>
          </div>
        </div>
      )}
      
      {exclusions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <span className="inline-block rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 p-1 mr-2">
              NOT
            </span>
            Excluded Terms
          </h4>
          <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {exclusions.map((term, idx) => (
                <Badge 
                  key={idx} 
                  className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center"
                >
                  <X className="h-3 w-3 mr-1" /> {term}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These terms should not appear in candidate profiles (excluded with NOT operator)
            </p>
          </div>
        </div>
      )}
      
      {hasTerms && (
        <div className="mt-4">
          <Separator className="my-2" />
          <h4 className="text-sm font-medium mb-2">Raw Query Structure</h4>
          <ScrollArea className="h-[80px]">
            <div className="bg-muted/30 p-2 rounded-md font-mono text-xs whitespace-pre-wrap break-words">
              {query}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default TermRelationshipView;
