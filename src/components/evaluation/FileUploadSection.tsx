
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { EvaluationDataItem } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { parseCSV, parseJSON } from "./utils/csvParser";

interface FileUploadSectionProps {
  onDataLoaded: (data: EvaluationDataItem[]) => void;
  isProcessing: boolean;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onDataLoaded,
  isProcessing
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [datasetSize, setDatasetSize] = useState<number>(0);
  const [isHuggingFaceDataset, setIsHuggingFaceDataset] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (!content) {
          throw new Error("Could not read file content");
        }
        
        let parsed: EvaluationDataItem[];

        // Process based on file extension
        if (file.name.toLowerCase().endsWith('.csv')) {
          parsed = parseCSV(content);
          
          // Check if this might be the Hugging Face dataset
          const isHuggingFace = content.includes('job posting') && content.includes('company_name');
          setIsHuggingFaceDataset(isHuggingFace);
          
          if (isHuggingFace) {
            toast.info("Detected Hugging Face job descriptions dataset format", {
              duration: 5000
            });
            console.log("HuggingFace dataset detected");
          }
        } else if (file.name.toLowerCase().endsWith('.json')) {
          parsed = parseJSON(content);
          setIsHuggingFaceDataset(false);
        } else {
          throw new Error("Unsupported file format. Please upload a .json or .csv file.");
        }

        // Ensure we have valid data
        if (!parsed || parsed.length === 0) {
          throw new Error("No valid evaluation items found in the file.");
        }

        // Debug the parsed data
        console.log("Parsed dataset:", {
          itemCount: parsed.length,
          firstItem: parsed[0],
          sampleGroundTruth: parsed[0]?.groundTruth || []
        });

        setDatasetSize(parsed.length);
        
        // Warn if dataset is large
        if (parsed.length > 50) {
          toast.warning(`Large dataset (${parsed.length} items) detected. Evaluation may use baseline algorithm for some items to conserve API quota.`, {
            duration: 7000
          });
        } else {
          toast.success(`Successfully loaded dataset with ${parsed.length} items`);
        }
        
        onDataLoaded(parsed);
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error(`Failed to parse dataset: ${(error as Error).message}`);
        setFileName(null);
        setDatasetSize(0);
        setIsHuggingFaceDataset(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <Card className="cyber-card p-4 border border-dashed border-primary/30 hover:border-primary/50 transition-all">
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <Upload className="h-12 w-12 text-primary/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Evaluation Dataset</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Upload a JSON or CSV file containing job descriptions and manually annotated keywords.
          See documentation for the required format.
        </p>
        
        {isHuggingFaceDataset && (
          <Alert className="mb-4 bg-blue-500/10 border-blue-600/30 text-left">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              Hugging Face job descriptions dataset detected. Since this dataset doesn't contain ground truth keywords, 
              synthetic keywords will be generated for evaluation purposes.
            </AlertDescription>
          </Alert>
        )}
        
        {datasetSize > 25 && (
          <Alert className="mb-4 bg-yellow-500/10 border-yellow-600/30 text-left">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-xs">
              Due to API quota limitations, evaluation of large datasets will use a mix of AI and baseline algorithms.
              Some items may be processed using only the baseline algorithm.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="cyber-card"
        >
          <FileText className="mr-2 h-4 w-4" />
          Choose File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={handleFileUpload}
        />
        {fileName && (
          <p className="mt-2 text-xs text-primary">
            {fileName}
          </p>
        )}
      </div>
    </Card>
  );
};

export default FileUploadSection;
