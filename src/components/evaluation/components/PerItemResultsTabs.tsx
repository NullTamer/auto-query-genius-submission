
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ItemDetails from "./ItemDetails";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface PerItemResultsTabsProps {
  validPerItemResults: Array<{
    id: string | number;
    metrics: any;
    groundTruth: any[];
    extractedKeywords: any[];
    error?: string | null;
  }>;
}

const PerItemResultsTabs: React.FC<PerItemResultsTabsProps> = ({ validPerItemResults }) => {
  if (validPerItemResults.length === 0) {
    return (
      <div className="mt-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No detailed item results available for analysis. Overall metrics are still available above.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Validate that we have actual content in the item results
  const hasContentfulItems = validPerItemResults.some(item => 
    (item.groundTruth && item.groundTruth.length > 0) || 
    (item.extractedKeywords && item.extractedKeywords.length > 0)
  );

  if (!hasContentfulItems) {
    return (
      <div className="mt-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Per-item analysis is available, but the items don't contain enough data for meaningful display.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Tabs defaultValue={validPerItemResults[0]?.id?.toString() || "item0"}>
      <h3 className="text-lg font-medium mb-4">Per-Item Results</h3>
      <TabsList className="mb-4 overflow-x-auto flex w-full">
        {validPerItemResults.map((item, index) => (
          <TabsTrigger key={index} value={item.id?.toString() || `item${index}`}>
            Item {index + 1}
          </TabsTrigger>
        ))}
      </TabsList>

      {validPerItemResults.map((item, index) => (
        <TabsContent key={index} value={item.id?.toString() || `item${index}`}>
          <ItemDetails 
            metrics={item.metrics || { precision: 0, recall: 0, f1Score: 0 }}
            groundTruth={item.groundTruth || []}
            extractedKeywords={item.extractedKeywords || []}
            error={item.error}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default PerItemResultsTabs;
