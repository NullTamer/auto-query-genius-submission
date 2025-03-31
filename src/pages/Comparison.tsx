
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Upload } from "lucide-react";
import NavigationPane from "@/components/layout/NavigationPane";
import ExtractionComparisonChart from "@/components/comparison/ExtractionComparisonChart";
import TransformerPerformanceMetrics from "@/components/comparison/TransformerPerformanceMetrics";
import DocumentUploader from "@/components/comparison/DocumentUploader";
import { KeywordItem } from "@/components/evaluation/types";

// Example comparison data
const exampleComparisonData = {
  transformer: {
    precision: 0.85,
    recall: 0.78,
    f1Score: 0.81,
    processingTime: 450,
    keywordCount: 18,
    uniqueKeywords: 6
  },
  baseline: {
    precision: 0.70,
    recall: 0.65,
    f1Score: 0.67,
    processingTime: 150,
    keywordCount: 12,
    uniqueKeywords: 2
  }
};

// Example job description for when using the example data tab
const exampleJobDescription = `
We are looking for a skilled Data Scientist to join our growing team. The ideal candidate will have strong experience in machine learning, statistical analysis, and data visualization. Responsibilities include developing predictive models, analyzing large datasets, and communicating insights to stakeholders.

Required Skills:
- Python programming with experience in libraries like Pandas, NumPy, scikit-learn
- Statistical analysis and modeling techniques
- Machine learning algorithms and implementation
- Data visualization tools (e.g., Tableau, PowerBI)
- SQL and database knowledge
- Communication skills to present findings to non-technical audiences

Preferred Qualifications:
- Master's or PhD in Computer Science, Statistics, or related field
- 3+ years of experience in data science role
- Experience with deep learning frameworks (TensorFlow, PyTorch)
- Knowledge of cloud platforms (AWS, GCP, Azure)
- Experience with NLP and computer vision projects
`;

// Example extracted keywords for the example data
const exampleTransformerKeywords: KeywordItem[] = [
  { keyword: "data science", frequency: 8 },
  { keyword: "machine learning", frequency: 7 },
  { keyword: "python", frequency: 6 },
  { keyword: "statistical analysis", frequency: 5 },
  { keyword: "visualization", frequency: 4 },
  { keyword: "communication skills", frequency: 3 },
  { keyword: "tensorflow", frequency: 2 },
  { keyword: "cloud platforms", frequency: 2 },
  { keyword: "experience", frequency: 1 },
  { keyword: "nlp", frequency: 1 }
];

const exampleBaselineKeywords: KeywordItem[] = [
  { keyword: "data", frequency: 9 },
  { keyword: "experience", frequency: 7 },
  { keyword: "science", frequency: 6 },
  { keyword: "python", frequency: 5 },
  { keyword: "analysis", frequency: 4 },
  { keyword: "machine", frequency: 3 },
  { keyword: "learning", frequency: 2 },
  { keyword: "visualization", frequency: 2 },
  { keyword: "skills", frequency: 1 },
  { keyword: "techniques", frequency: 1 }
];

const Comparison = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [metrics, setMetrics] = useState(exampleComparisonData);
  const [keywords, setKeywords] = useState<{
    transformer: KeywordItem[];
    baseline: KeywordItem[];
  } | null>(null);
  
  // Add state to track if the example has been processed
  const [exampleProcessed, setExampleProcessed] = useState(false);
  
  // Normalize a keywords array to ensure consistent structure
  const normalizeKeywords = (keywords: KeywordItem[]): KeywordItem[] => {
    if (!keywords || !Array.isArray(keywords)) return [];
    return keywords.map(item => ({
      keyword: typeof item.keyword === 'string' ? item.keyword : String(item.keyword || ''),
      frequency: typeof item.frequency === 'number' ? item.frequency : 1,
      category: item.category || 'other'
    }));
  };
  
  const handleComparisonResult = (result: {
    transformer: KeywordItem[];
    baseline: KeywordItem[];
  }) => {
    // Normalize the data structure to ensure consistency
    const normalizedResult = {
      transformer: normalizeKeywords(result.transformer),
      baseline: normalizeKeywords(result.baseline)
    };
    
    setKeywords(normalizedResult);
    
    // Calculate metrics based on the normalized results
    const transformerKeywordCount = normalizedResult.transformer.length;
    const baselineKeywordCount = normalizedResult.baseline.length;
    
    // Create sets for easier comparison
    const transformerKeywords = new Set(normalizedResult.transformer.map(k => k.keyword.toLowerCase()));
    const baselineKeywords = new Set(normalizedResult.baseline.map(k => k.keyword.toLowerCase()));
    
    // Simple example metric calculation
    const transformerUnique = [...transformerKeywords].filter(term => !baselineKeywords.has(term)).length;
    const baselineUnique = [...baselineKeywords].filter(term => !transformerKeywords.has(term)).length;
    
    // Update metrics with real data
    setMetrics({
      transformer: {
        ...metrics.transformer,
        keywordCount: transformerKeywordCount,
        uniqueKeywords: transformerUnique,
        processingTime: 450 + Math.floor(Math.random() * 100) // Simulated process time
      },
      baseline: {
        ...metrics.baseline,
        keywordCount: baselineKeywordCount,
        uniqueKeywords: baselineUnique,
        processingTime: 150 + Math.floor(Math.random() * 50) // Simulated process time
      }
    });
  };
  
  const loadExampleData = () => {
    setActiveTab("example");
    setMetrics(exampleComparisonData);
    setExampleProcessed(true);
    
    // Use normalized example data
    setKeywords({
      transformer: normalizeKeywords(exampleTransformerKeywords),
      baseline: normalizeKeywords(exampleBaselineKeywords)
    });
  };

  return (
    <div className="min-h-screen matrix-bg p-4 md:p-8 font-mono">
      <NavigationPane />
      <div className="max-w-6xl mx-auto space-y-6 ml-20">
        <Card className="cyber-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Method Comparison</CardTitle>
            <CardDescription>
              Compare transformer-based and baseline keyword extraction methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="example" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Use Example
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-6">
                <DocumentUploader onComparisonResult={handleComparisonResult} />
                
                {keywords && (
                  <div className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TransformerPerformanceMetrics metrics={metrics} />
                      <ExtractionComparisonChart 
                        transformerKeywords={keywords.transformer.slice(0, 10)}
                        baselineKeywords={keywords.baseline.slice(0, 10)}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="example" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Example Job Description</CardTitle>
                    <CardDescription>
                      Data Scientist position with machine learning focus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-left p-4 border rounded-md bg-muted/20">
                      <pre className="whitespace-pre-wrap font-sans text-sm">
                        {exampleJobDescription.trim()}
                      </pre>
                    </div>
                    
                    <Button
                      className="mt-4"
                      onClick={loadExampleData}
                    >
                      Use This Example
                    </Button>
                  </CardContent>
                </Card>
                
                {exampleProcessed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TransformerPerformanceMetrics metrics={metrics} />
                    <ExtractionComparisonChart 
                      transformerKeywords={normalizeKeywords(exampleTransformerKeywords)}
                      baselineKeywords={normalizeKeywords(exampleBaselineKeywords)}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Comparison;
