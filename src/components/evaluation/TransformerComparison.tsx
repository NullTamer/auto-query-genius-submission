
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpDown, Beaker, Brain, ChevronDown, ChevronUp, Filter, Info, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KeywordItem, MetricsResult } from "./types";
import { baselineExtraction } from "./utils/baselineAlgorithm";
import { transformerExtraction } from "@/utils/transformerExtraction";
import { calculateMetrics } from "./utils/metricsCalculation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface TransformerComparisonProps {
  jobDescription: string;
}

const TransformerComparison: React.FC<TransformerComparisonProps> = ({ jobDescription }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState("metrics");
  const [useAIMethod, setUseAIMethod] = useState(true);
  const [groundTruth, setGroundTruth] = useState<KeywordItem[]>([]);
  const [baselineKeywords, setBaselineKeywords] = useState<KeywordItem[]>([]);
  const [transformerKeywords, setTransformerKeywords] = useState<KeywordItem[]>([]);
  const [baselineMetrics, setBaselineMetrics] = useState<MetricsResult | null>(null);
  const [transformerMetrics, setTransformerMetrics] = useState<MetricsResult | null>(null);
  const [comparisonReady, setComparisonReady] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runComparison = async () => {
    if (!jobDescription || jobDescription.trim().length < 50) {
      toast.error("Please enter a valid job description with at least 50 characters");
      return;
    }

    setIsProcessing(true);
    try {
      // Extract baseline keywords
      const baseline = baselineExtraction(jobDescription);
      setBaselineKeywords(baseline);

      // Extract keywords using transformer
      const transformer = await transformerExtraction(jobDescription);
      setTransformerKeywords(transformer);

      // For evaluation purposes, combine both methods to create a "ground truth"
      // In a real evaluation, you would have human-labeled ground truth
      const combinedKeywords = [...baseline, ...transformer]
        .filter((kw, index, self) => 
          index === self.findIndex(k => k.keyword === kw.keyword))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 15);
      
      setGroundTruth(combinedKeywords);

      // Calculate metrics
      const baseMetrics = calculateMetrics(combinedKeywords, baseline);
      const transformerMetrics = calculateMetrics(combinedKeywords, transformer);

      setBaselineMetrics(baseMetrics);
      setTransformerMetrics(transformerMetrics);
      setComparisonReady(true);
      
      toast.success("Comparison completed successfully");
    } catch (error) {
      console.error("Comparison error:", error);
      toast.error("Error during comparison: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidFile = ['txt', 'doc', 'docx', 'pdf'].includes(fileExtension || '');
    
    if (!isValidFile) {
      toast.error("Unsupported file format. Please upload .txt, .doc, .docx, or .pdf files.");
      return;
    }

    setUploadedFileName(file.name);
    setIsProcessing(true);

    try {
      let content = '';
      
      if (fileExtension === 'txt') {
        // Process text files
        const reader = new FileReader();
        content = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else if (fileExtension === 'docx') {
        // Process docx files using mammoth
        try {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
        } catch (mammothError) {
          console.error("Mammoth error:", mammothError);
          toast.error("Error processing DOCX file. Falling back to text extraction.");
          
          // Fallback to text extraction if mammoth fails
          const reader = new FileReader();
          content = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string || '');
            reader.onerror = reject;
            reader.readAsText(file);
          });
        }
      } else if (fileExtension === 'pdf') {
        try {
          // Try loading PDF.js
          toast.info("Processing PDF file...");
          
          // Set the worker source path to CDN
          const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf');
          const PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
          
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          
          console.log("PDF loading task created");
          
          const pdf = await loadingTask.promise;
          console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
          
          let fullText = '';
          // Process all pages
          const maxPages = Math.min(pdf.numPages, 20); // Limit to 20 pages for performance
          for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => 'str' in item ? item.str : '')
              .join(' ');
            fullText += pageText + ' ';
            
            // Log progress for debugging
            console.log(`Processed page ${pageNum}/${maxPages}`);
          }
          
          content = fullText.trim();
          console.log("PDF text extraction complete, extracted length:", content.length);
          
          if (!content || content.length < 50) {
            throw new Error("Extracted content too short or empty");
          }
        } catch (pdfError) {
          console.error("PDF.js processing error:", pdfError);
          toast.warning("Using fallback method for PDF processing");
          
          // Fallback to simple text extraction
          try {
            const textReader = new FileReader();
            content = await new Promise<string>((resolve, reject) => {
              textReader.onload = (e) => resolve(e.target?.result as string || '');
              textReader.onerror = reject;
              textReader.readAsText(file);
            });
            
            if (!content || content.trim() === '') {
              throw new Error("No text content could be extracted");
            }
            
            console.log("Fallback text extraction complete, extracted length:", content.length);
          } catch (textError) {
            console.error("Fallback text extraction failed:", textError);
            toast.error("Could not process PDF file");
            setIsProcessing(false);
            return;
          }
        }
      }

      if (!content || content.trim() === '') {
        toast.error("No text content could be extracted from the file");
        setIsProcessing(false);
        return;
      }
      
      console.log("Final extracted content length:", content.length);
      toast.success(`File processed successfully: ${file.name}`);

      // Run the comparison with extracted content
      try {
        // Extract baseline keywords
        const baseline = baselineExtraction(content);
        setBaselineKeywords(baseline);
        console.log("Baseline extraction complete:", baseline.length, "keywords");

        // Extract keywords using transformer
        const transformer = await transformerExtraction(content);
        setTransformerKeywords(transformer);
        console.log("Transformer extraction complete:", transformer.length, "keywords");

        // Create combined ground truth
        const combinedKeywords = [...baseline, ...transformer]
          .filter((kw, index, self) => 
            index === self.findIndex(k => k.keyword.toLowerCase() === kw.keyword.toLowerCase()))
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 15);
        
        setGroundTruth(combinedKeywords);

        // Calculate metrics
        const baseMetrics = calculateMetrics(combinedKeywords, baseline);
        const transformerMetrics = calculateMetrics(combinedKeywords, transformer);

        setBaselineMetrics(baseMetrics);
        setTransformerMetrics(transformerMetrics);
        setComparisonReady(true);
        
        toast.success(`Comparison completed for ${file.name}`);
      } catch (comparisonError) {
        console.error("Comparison error:", comparisonError);
        toast.error(`Error during comparison: ${(comparisonError as Error).message}`);
      }
    } catch (error) {
      console.error("File processing error:", error);
      toast.error(`Error processing file: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
      
      // Clear the file input to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const renderMetricsChart = () => {
    if (!baselineMetrics || !transformerMetrics) return null;

    const data = [
      {
        name: "Precision",
        Baseline: Math.round(baselineMetrics.precision * 100),
        Transformer: Math.round(transformerMetrics.precision * 100),
      },
      {
        name: "Recall",
        Baseline: Math.round(baselineMetrics.recall * 100),
        Transformer: Math.round(transformerMetrics.recall * 100),
      },
      {
        name: "F1 Score",
        Baseline: Math.round(baselineMetrics.f1Score * 100),
        Transformer: Math.round(transformerMetrics.f1Score * 100),
      }
    ];

    return (
      <div className="w-full h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
            <RechartsTooltip formatter={(value) => [`${value}%`, '']} />
            <Legend />
            <Bar dataKey="Baseline" fill="#8884d8" name="TF-IDF (Baseline)" />
            <Bar dataKey="Transformer" fill="#82ca9d" name="Transformer-based" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderKeywordComparison = () => {
    if (!baselineKeywords.length || !transformerKeywords.length) return null;

    // Create sets for easier comparison
    const baselineSet = new Set(baselineKeywords.map(kw => kw.keyword.toLowerCase()));
    const transformerSet = new Set(transformerKeywords.map(kw => kw.keyword.toLowerCase()));
    
    // Find common and unique keywords
    const commonKeywords = baselineKeywords
      .filter(kw => transformerSet.has(kw.keyword.toLowerCase()))
      .map(kw => kw.keyword);
    
    const baselineOnly = baselineKeywords
      .filter(kw => !transformerSet.has(kw.keyword.toLowerCase()))
      .map(kw => kw.keyword);
    
    const transformerOnly = transformerKeywords
      .filter(kw => !baselineSet.has(kw.keyword.toLowerCase()))
      .map(kw => kw.keyword);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" /> TF-IDF Keywords ({baselineKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="max-h-[200px] overflow-y-auto">
              <ul className="space-y-1">
                {baselineKeywords.map((kw, idx) => (
                  <li key={idx} className="text-sm flex items-center justify-between">
                    <span className={transformerSet.has(kw.keyword.toLowerCase()) ? "font-medium" : ""}>
                      {kw.keyword}
                    </span>
                    <span className="text-muted-foreground">{kw.frequency}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Brain className="h-4 w-4 mr-2" /> Transformer Keywords ({transformerKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="max-h-[200px] overflow-y-auto">
              <ul className="space-y-1">
                {transformerKeywords.map((kw, idx) => (
                  <li key={idx} className="text-sm flex items-center justify-between">
                    <span className={baselineSet.has(kw.keyword.toLowerCase()) ? "font-medium" : ""}>
                      {kw.keyword}
                    </span>
                    <span className="text-muted-foreground">{kw.frequency}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="py-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ArrowUpDown className="h-4 w-4 mr-2" /> Comparison Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Common Keywords ({commonKeywords.length})</h4>
                <div className="max-h-[150px] overflow-y-auto">
                  <ul className="text-xs space-y-1">
                    {commonKeywords.map((keyword, idx) => (
                      <li key={idx} className="text-emerald-600 dark:text-emerald-400">{keyword}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">TF-IDF Only ({baselineOnly.length})</h4>
                <div className="max-h-[150px] overflow-y-auto">
                  <ul className="text-xs space-y-1">
                    {baselineOnly.map((keyword, idx) => (
                      <li key={idx} className="text-blue-600 dark:text-blue-400">{keyword}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Transformer Only ({transformerOnly.length})</h4>
                <div className="max-h-[150px] overflow-y-auto">
                  <ul className="text-xs space-y-1">
                    {transformerOnly.map((keyword, idx) => (
                      <li key={idx} className="text-purple-600 dark:text-purple-400">{keyword}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Beaker className="h-5 w-5 mr-2" />
            Extraction Algorithm Comparison
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Compare the performance of TF-IDF baseline extraction with transformer-based methods.
                  Upload a document or enter a job description directly.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Label htmlFor="use-ai-method">Use AI-based extraction</Label>
              <Switch
                id="use-ai-method"
                checked={useAIMethod}
                onCheckedChange={setUseAIMethod}
                disabled={isProcessing}
              />
            </div>
            
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Document
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.doc,.docx,.pdf"
                  className="hidden"
                />
              </Button>
              
              <Button 
                onClick={runComparison} 
                disabled={isProcessing || (!jobDescription && !uploadedFileName)}
              >
                {isProcessing ? "Processing..." : "Run Comparison"}
              </Button>
            </div>
          </div>
          
          {uploadedFileName && (
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded text-sm">
              <FileText className="h-4 w-4" />
              <span className="truncate">Using file: {uploadedFileName}</span>
            </div>
          )}
          
          {comparisonReady && (
            <Collapsible open={isComparisonOpen} onOpenChange={setIsComparisonOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center justify-between w-full">
                  <span>Comparison Results</span>
                  {isComparisonOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Tabs value={currentTab} onValueChange={setCurrentTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="metrics">Metrics Comparison</TabsTrigger>
                    <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="metrics" className="space-y-4">
                    {renderMetricsChart()}
                    
                    {baselineMetrics && transformerMetrics && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">TF-IDF (Baseline) Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt>Precision:</dt>
                                <dd className="font-medium">{(baselineMetrics.precision * 100).toFixed(1)}%</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt>Recall:</dt>
                                <dd className="font-medium">{(baselineMetrics.recall * 100).toFixed(1)}%</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt>F1 Score:</dt>
                                <dd className="font-medium">{(baselineMetrics.f1Score * 100).toFixed(1)}%</dd>
                              </div>
                            </dl>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">Transformer Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <dl className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <dt>Precision:</dt>
                                <dd className="font-medium">{(transformerMetrics.precision * 100).toFixed(1)}%</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt>Recall:</dt>
                                <dd className="font-medium">{(transformerMetrics.recall * 100).toFixed(1)}%</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt>F1 Score:</dt>
                                <dd className="font-medium">{(transformerMetrics.f1Score * 100).toFixed(1)}%</dd>
                              </div>
                            </dl>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="keywords">
                    {renderKeywordComparison()}
                  </TabsContent>
                </Tabs>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransformerComparison;
