
import React, { useState } from "react";
import { toast } from "sonner";
import { EvaluationDataItem, EvaluationResult } from "./types";
import { runEvaluation } from "./evaluationService";
import FileUploadSection from "./FileUploadSection";
import DatasetPreview from "./DatasetPreview";
import FormatDocumentation from "./FormatDocumentation";
import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EvaluationUploaderProps {
  onDataLoaded: (data: EvaluationDataItem[]) => void;
  onProcessingStart: () => void;
  onProcessingComplete: (results: EvaluationResult) => void;
  isProcessing: boolean;
  dataItems: EvaluationDataItem[];
}

const EvaluationUploader: React.FC<EvaluationUploaderProps> = ({
  onDataLoaded,
  onProcessingStart,
  onProcessingComplete,
  isProcessing,
  dataItems
}) => {
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [isHuggingFaceDataset, setIsHuggingFaceDataset] = useState<boolean>(false);
  const [useAI, setUseAI] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [progressStats, setProgressStats] = useState<{processed: number, total: number}>({
    processed: 0,
    total: 0
  });

  // Check if this might be the Hugging Face dataset
  React.useEffect(() => {
    if (dataItems.length > 0) {
      // Check for Hugging Face dataset structure
      const hasHuggingFaceStructure = dataItems.some(item => 
        item.description?.includes("job posting") || 
        (item.groundTruth?.some(k => k.term !== undefined)) ||
        !item.groundTruth || 
        item.groundTruth.length === 0
      );
      
      setIsHuggingFaceDataset(hasHuggingFaceStructure);
    }
  }, [dataItems]);

  // Progress callback for evaluation
  const handleProgressUpdate = (processed: number, total: number) => {
    setProgressStats({ processed, total });
    // Update toast with progress
    if (total > 10 && processed % 5 === 0) {
      toast.info(`Processing: ${processed}/${total} items (${Math.round(processed/total*100)}%)`, {
        id: 'evaluation-progress'
      });
    }
  };

  const handleRunEvaluation = async () => {
    if (dataItems.length === 0) {
      toast.error("Please upload a dataset first");
      return;
    }

    // Check if API key is provided when AI is enabled
    if (useAI && !apiKey) {
      toast.error("Please provide a Gemini API key to use AI extraction");
      return;
    }

    setEvaluationError(null);
    setProgressStats({ processed: 0, total: dataItems.length });
    onProcessingStart();
    
    try {
      // Show a warning if dataset is large
      if (dataItems.length > 10) {
        toast.info(`Processing ${dataItems.length} items. This may take some time and might use fallback methods for some items.`);
      }
      
      // Show additional guidance for Hugging Face dataset
      if (isHuggingFaceDataset) {
        toast.info("Working with Hugging Face dataset. Using AI extraction and synthetic ground truth for evaluation.", {
          duration: 5000
        });
      }
      
      if (useAI) {
        toast.info("Using AI-powered extraction. This may take longer but could produce better results.", {
          duration: 5000
        });
      }
      
      const results = await runEvaluation(
        dataItems, 
        handleProgressUpdate, 
        useAI, 
        useAI ? apiKey : undefined
      );
      
      onProcessingComplete(results);
      toast.success("Evaluation completed successfully");
    } catch (error) {
      console.error("Evaluation error:", error);
      setEvaluationError((error as Error).message || "Error during evaluation process");
      toast.error("Error during evaluation process");
    }
  };

  return (
    <div className="space-y-6">
      <FileUploadSection 
        onDataLoaded={onDataLoaded}
        isProcessing={isProcessing}
      />

      {/* AI Extraction Options */}
      <div className="border rounded-md p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-extraction" className="text-base">AI-Powered Extraction</Label>
            <p className="text-sm text-muted-foreground">
              Use Gemini AI for enhanced keyword extraction (requires API key)
            </p>
          </div>
          <Switch 
            id="ai-extraction" 
            checked={useAI}
            onCheckedChange={setUseAI}
            disabled={isProcessing}
          />
        </div>
        
        {useAI && (
          <div className="space-y-2">
            <Label htmlFor="gemini-key">Gemini API Key</Label>
            <Input 
              id="gemini-key"
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isProcessing || !useAI}
            />
            <p className="text-xs text-muted-foreground">
              Your API key is used only for this evaluation and is not stored.
            </p>
          </div>
        )}
      </div>

      {isHuggingFaceDataset && !isProcessing && dataItems.length > 0 && (
        <Alert className="bg-blue-500/10 border-blue-600/30">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Hugging Face job descriptions dataset detected. For best results with this dataset:
            <ul className="list-disc pl-5 mt-1 text-sm">
              <li>The evaluation will generate synthetic keywords as ground truth</li>
              <li>Better results will be achieved using the AI extraction method</li>
              <li>Evaluation metrics will show how well the algorithms find meaningful keywords</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {evaluationError && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {evaluationError}
          </AlertDescription>
        </Alert>
      )}

      <DatasetPreview 
        dataItems={dataItems}
        isProcessing={isProcessing}
        onRunEvaluation={handleRunEvaluation}
      />

      <FormatDocumentation />
    </div>
  );
};

export default EvaluationUploader;
