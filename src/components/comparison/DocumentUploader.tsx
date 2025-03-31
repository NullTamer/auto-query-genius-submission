
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { transformerExtraction } from "@/utils/transformerExtraction";
import { extractBaselineKeywords } from "@/components/evaluation/utils/baselineAlgorithm";
import { KeywordItem } from "@/components/evaluation/types";
import { toast } from "sonner";

interface DocumentUploaderProps {
  onComparisonResult: (results: { 
    transformer: KeywordItem[];
    baseline: KeywordItem[];
  }) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onComparisonResult }) => {
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const runExtraction = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description to analyze");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Run both extraction methods
      const transformerResults = await transformerExtraction(jobDescription);
      const baselineResults = extractBaselineKeywords(jobDescription);
      
      onComparisonResult({
        transformer: transformerResults,
        baseline: baselineResults
      });
      
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast.error("Failed to analyze the job description");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Example job descriptions for quick testing
  const loadExampleDescription = () => {
    const examples = [
      `Senior Full Stack Developer needed for a fintech startup. Responsibilities include building RESTful APIs with Node.js, developing responsive UIs with React, and implementing database solutions using MongoDB and PostgreSQL. Requirements: 5+ years of experience with JavaScript, TypeScript, and popular frameworks. Experience with cloud services (AWS, Azure) and CI/CD pipelines. Strong understanding of security practices and performance optimization.`,
      `Data Scientist with experience in NLP and machine learning required. You will develop algorithms for text processing, sentiment analysis, and information extraction. Must have experience with Python, PyTorch or TensorFlow, and NLP libraries like spaCy or NLTK. Knowledge of transformer models (BERT, GPT) is essential. Ph.D. or Master's degree in Computer Science, Machine Learning or related field preferred.`,
      `UX/UI Designer for healthcare application. Design intuitive and accessible interfaces for patients and healthcare providers. Create wireframes, prototypes, and visual designs. Requirements: 3+ years of experience with design tools (Figma, Adobe XD), understanding of design systems, and experience in healthcare or similar regulated industries. Portfolio must demonstrate user-centered design process.`
    ];
    
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setJobDescription(randomExample);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <Textarea
          placeholder="Paste a job description to compare keyword extraction methods..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="h-32 md:h-40"
          disabled={isProcessing}
        />
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadExampleDescription}
            disabled={isProcessing}
          >
            Load Example
          </Button>
          <Button 
            onClick={runExtraction} 
            disabled={isProcessing || !jobDescription.trim()}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>
      
      {isProcessing && (
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">
            Analyzing job description with both extraction methods...
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
